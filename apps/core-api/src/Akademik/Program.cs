using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Akademik.DataProvider;
using Akademik.DataProvider.Models;
using Akademik.DataProvider.Repositories;
using Akademik.Middleware;
using Akademik.Models;
using Akademik.Services.Assignments;
using Akademik.Services.Auth;
using Akademik.Services.JwtAuthorization;
using Akademik.Services.Models;
using Akademik.Services.Rooms;
using Akademik.Services.Security;
using Akademik.Services.Users;
using Akademik.Validators;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateAssignmentRequestValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<PaginationValidator>();

builder.Services.AddDbContext<AkademikDbContext>(options =>
{
	options.UseNpgsql(builder.Configuration.GetConnectionString("AkademikConnectionString"));
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
	options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IAssignmentRepository, AssignmentRepository>();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
	options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
	{
		Name = "Authorization",
		Type = SecuritySchemeType.Http,
		Scheme = "Bearer",
		BearerFormat = "JWT",
		In = ParameterLocation.Header,
		Description = "Enter JWT token."
	});

	options.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference
				{
					Type = ReferenceType.SecurityScheme,
					Id = "Bearer"
				}
			},
			new List<string>()
		}
	});
});

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
	{
		policy.WithOrigins("http://localhost:3000")
			.AllowAnyHeader()
			.AllowAnyMethod()
			.AllowCredentials();

		;
	});
});

builder.Services
	.AddAuthentication(options =>
	{
		options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
		options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
	})
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateLifetime = true,
			ClockSkew = TimeSpan.Zero,
			ValidateIssuerSigningKey = true,
			ValidIssuer = builder.Configuration["Jwt:Issuer"],
			ValidAudience = builder.Configuration["Jwt:Audience"],
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
		};
	});

builder.Services.AddAuthorization(options =>
{
	options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
	options.AddPolicy("ResidentOnly", policy => policy.RequireRole("Resident"));
});

WebApplication app = builder.Build();

using (IServiceScope scope = app.Services.CreateScope())
{
	IServiceProvider services = scope.ServiceProvider;

	try
	{
		AkademikDbContext context = services.GetRequiredService<AkademikDbContext>();

		await context.Database.MigrateAsync();

		if (app.Environment.IsDevelopment())
		{
			await DbInitializer.InitializeAsync(context);
		}
	}
	catch (Exception ex)
	{
		ILogger<Program> logger = services.GetRequiredService<ILogger<Program>>();
		logger.LogError(ex, "An error occurred while migrating or initializing the database.");
	}
}

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();

	app.UseSwaggerUI(options =>
	{
		options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
		options.RoutePrefix = string.Empty;
	});
}

app.UseCors("AllowFrontend");
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/api/core/auth/login", async (
	[FromBody] LoginRequest request,
	IAuthService authService,
	CancellationToken cancellationToken) =>
{
	try
	{
		(User user, TokenModel tokens) =
			await authService.LoginAsync(request.Email, request.Password, cancellationToken);

		return Results.Ok(new LoginResponse
		{
			User = UserModel.FromUser(user),
			Token = tokens
		});
	}
	catch (UnauthorizedAccessException)
	{
		return Results.BadRequest("Invalid email or password");
	}
});

app.MapPost("/api/core/auth/register", async (
	[FromBody] RegisterRequest request,
	IAuthService authService,
	IValidator<RegisterRequest> validator,
	CancellationToken cancellationToken) =>
{
	ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);

	if (!validationResult.IsValid)
	{
		return Results.ValidationProblem(validationResult.ToDictionary());
	}

	try
	{
		User newUser = new()
		{
			Email = request.Email,
			FirstName = request.FirstName,
			LastName = request.LastName,
			Role = Enum.Parse<UserRole>(request.Role),
			PhoneNumber = request.PhoneNumber
		};

		User registeredUser = await authService.RegisterAsync(newUser, request.Password, cancellationToken);

		return Results.Ok(UserModel.FromUser(registeredUser));
	}
	catch (InvalidOperationException ex)
	{
		return Results.BadRequest(ex.Message);
	}
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/auth/refresh", async (
	[FromBody] RefreshRequest request,
	IJwtService jwtService,
	CancellationToken cancellationToken) =>
{
	TokenModel newTokens = await jwtService.RotateTokensAsync(request.RefreshToken, cancellationToken);

	return Results.Ok(newTokens);
}).RequireAuthorization();

app.MapPost("/api/core/rooms-get", async (
	[FromBody] RoomsListRequest request,
	IRoomService service,
	IValidator<Pagination> validator,
	CancellationToken cancellationToken) =>
{
	var validationResult = await validator.ValidateAsync(request.Pagination, cancellationToken);

	if (validationResult.IsValid is false)
	{
		return Results.BadRequest(validationResult);
	}
	
	PagedResult<Room> result = await service.GetAllAsync(request.Pagination, cancellationToken);

	return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/rooms-add", async (
	[FromBody] CreateRoomRequest request,
	IRoomService service,
	CancellationToken cancellationToken) =>
{
	Room room = new()
	{
		Number = request.Number,
		Floor = request.Floor,
		Capacity = request.Capacity,
		Status = RoomStatus.Available
	};

	Room createdRoom = await service.CreateAsync(room, cancellationToken);

	return Results.Ok(createdRoom);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/rooms-edit", async (
	[FromBody] UpdateRoomRequest request,
	IRoomService service,
	CancellationToken cancellationToken) =>
{
	Room room = new()
	{
		Id = request.Id,
		Number = request.Number,
		Floor = request.Floor,
		Capacity = request.Capacity,
		Status = request.Status
	};

	Room updatedRoom = await service.UpdateAsync(room, cancellationToken);

	return Results.Ok(updatedRoom);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/assignments-get", async (
	[FromBody] ResidentsListRequest request,
	IAssignmentService service,
	IValidator<Pagination> validator,
	CancellationToken cancellationToken) =>
{
	var validationResult = await validator.ValidateAsync(request.Pagination, cancellationToken);

	if (validationResult.IsValid is false)
	{
		return Results.BadRequest(validationResult);
	}

	PagedResult<Assignment> assignments = await service
		.GetAllAsync(request.Pagination, cancellationToken);
	
	var result = assignments.Items
		.Select(a => new AssignmentModel(
			UserModel.FromUser(a.User), 
			RoomModel.FromRoom(a.Room)));

	return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/assignments-add", async (
	[FromBody] CreateAssignmentRequest request,
	IAssignmentService service,
	IValidator<CreateAssignmentRequest> validator,
	CancellationToken cancellationToken) =>
{
	ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);

	if (validationResult.IsValid is false)
	{
		return Results.ValidationProblem(validationResult.ToDictionary());
	}

	Assignment assignment = new()
	{
		UserId = request.UserId,
		RoomId = request.RoomId,
		StartDate = DateOnly.FromDateTime(request.StartDate),
		IsActive = true
	};

	await service.CreateAsync(assignment, cancellationToken);

	return Results.Ok(assignment);
}).RequireAuthorization("AdminOnly");

app.MapDelete("/api/core/assignments/{id:int}", async (
	int id,
	IAssignmentService service,
	CancellationToken cancellationToken) =>
{
	if (id <= 0)
	{
		return Results.BadRequest("Invalid id.");
	}

	await service.DeleteAsync(id, cancellationToken);

	return Results.Ok();
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/core/assignments/roommates", async (
	HttpContext context,
	IJwtService jwtService,
	IAssignmentService service,
	CancellationToken cancellationToken) =>
{
	string? authString = context.Request.Headers["Authorization"];
	string? token = authString?.Split(' ').Last();

	if (string.IsNullOrEmpty(token))
	{
		return Results.Unauthorized();
	}

	Claim? idClaim = jwtService.ExtractClaim(token, "sub");

	if (idClaim is null)
	{
		return Results.Unauthorized();
	}

	RoommatesModel model = await service.GetRoommatesAsync(int.Parse(idClaim.Value), cancellationToken);

	RoommatesResponse result = new()
	{
		RoomNumber = model.RoomNumber,
		Roommates = model.Assignments.Select(a => new UserDto
		{
			Id = a.UserId,
			Email = a.User.Email,
			FirstName = a.User.FirstName,
			LastName = a.User.LastName
		}).ToList()
	};

	return Results.Ok(result);
});

app.MapPost("/api/core/users-get", async (
	[FromBody] UsersListRequest request,
	IUserService service,
	IValidator<Pagination> validator,
	CancellationToken cancellationToken) =>
{
	var validationResult = await validator.ValidateAsync(request.Pagination, cancellationToken);

	if (validationResult.IsValid is false)
	{
		return Results.BadRequest(validationResult);
	}
	
	PagedResult<User> users = await service.GetAllAsync(request.Pagination, cancellationToken);

	return Results.Ok(new PagedResult<UserModel>
	{
		Items = users.Items.Select(U => UserModel.FromUser(U)),
		Count = users.Count
	});
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/users-edit", async (
	[FromBody] UpdateUserRequest request,
	IUserService service,
	CancellationToken cancellationToken) =>
{
	User user = new()
	{
		Id = request.Id,
		FirstName = request.FirstName,
		LastName = request.LastName,
		PhoneNumber = request.PhoneNumber,
		Email = request.Email,
		Status = Enum.Parse<UserStatus>(request.Status)
	};

	User? updatedUser = await service.UpdateAsync(user, cancellationToken);

	return updatedUser is null ? Results.NotFound() : Results.Ok(UserModel.FromUser(updatedUser));
}).RequireAuthorization("AdminOnly");

app.MapDelete("/api/core/users/{id:int}", async (
	[FromRoute] int id,
	IUserService service,
	CancellationToken cancellationToken) =>
{
	if (id <= 0)
	{
		return Results.BadRequest("Invalid id.");
	}

	await service.DeleteAsync(id, cancellationToken);

	return Results.Ok();
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/core/me", async (
	HttpContext context,
	IJwtService jwtService,
	IUserService service,
	CancellationToken cancellationToken) =>
{
	string? authString = context.Request.Headers["Authorization"];
	string? token = authString?.Split(' ').Last();

	if (string.IsNullOrEmpty(token))
	{
		return Results.Unauthorized();
	}

	Claim? idClaim = jwtService.ExtractClaim(token, "sub");

	if (idClaim is null)
	{
		return Results.Unauthorized();
	}

	User? user = await service.GetByIdAsync(int.Parse(idClaim.Value), cancellationToken);

	if (user is null)
	{
		return Results.NotFound();
	}

	return Results.Ok(UserModel.FromUser(user));
}).RequireAuthorization();

app.MapGet("/api/core/users-get/{id:int}", async (int id,
	IUserService service,
	CancellationToken cancellationToken) =>
{
	User? user = await service.GetByIdAsync(id, cancellationToken);

	if (user is null)
	{
		return Results.NotFound();
	}

	return Results.Ok(UserModel.FromUser(user));
}).RequireAuthorization("AdminOnly");

app.Run();