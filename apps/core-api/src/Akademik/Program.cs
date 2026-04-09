using Akademik.Services.JwtAuthorization;
using System.Text;
using Akademik.DataProvider.Models;
using Akademik.Models;
using Akademik.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Akademik.DataProvider;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Akademik.Services.Assignments;
using Akademik.Services.Rooms;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AkademikDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("AkademikConnectionString"));
});

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IAssignmentRepository, AssignmentRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();;
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

builder.Services.AddAuthorization(options => {
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ResidentOnly", policy => policy.RequireRole("Resident"));
});

var app = builder.Build();

app.UseCors("AllowFrontend"); 

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/api/core/auth/login", async (
    [FromBody] LoginRequest request,
    IUserService userService,
    IJwtService jwtService,
    CancellationToken cancellationToken) =>
{
    var user = await userService.GetByEmailAsync(request.Email, cancellationToken);

    if (user is null || BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash) is false)
    {
        return Results.BadRequest("Invalid email or password");
    }

    if (user.Status == UserStatus.Blocked)
    {
        return Results.Forbid();
    }
    
    var tokens = await jwtService.GenerateTokensAsync(user, cancellationToken);

    var response = new
    {
        user = UserModel.FromUser(user),
        token = tokens
    };

    return Results.Json(response);
});

app.MapPost("/api/core/auth/register", async (
    [FromBody] RegisterRequest request,
    IUserService userService,
    IJwtService jwtService,
    CancellationToken cancellationToken) =>
{
    //TODO: Add validation and error handling

    var user = await userService.GetByEmailAsync(request.Email, cancellationToken);

    if (user is not null)
    {
        return Results.BadRequest("User already exists");
    }

    User newUser = new()
    {
        Email = request.Email,
        FirstName = request.FirstName,
        LastName = request.LastName,
        Role = Enum.Parse<UserRole>(request.Role),
        PhoneNumber = request.PhoneNumber,
        Status = UserStatus.Active,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        CreatedAt = DateTime.UtcNow
    };

    await userService.CreateAsync(newUser, cancellationToken);

    return Results.Ok(UserModel.FromUser(newUser));
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/auth/refresh", async (
    [FromBody] RefreshRequest request, 
    IJwtService jwtService, 
    CancellationToken cancellationToken) =>
{
    try
    {
        var token = await jwtService.GetByBodyAsync(request.RefreshToken, cancellationToken);

        token.Revoked = DateTime.UtcNow;
        
        var newTokens = await jwtService.GenerateTokensAsync(token.User,  cancellationToken);

        Console.WriteLine($"Access Token: {newTokens.AccessToken}");
        Console.WriteLine($"Refresh Token: {newTokens.RefreshToken}");

        return Results.Ok(newTokens);
    }
    catch(Exception ex)
    {
        return Results.Problem(ex.Message);        
    }

});

app.MapPost("/api/core/rooms-get", async(
    [FromBody] RoomsListRequest request,
    IRoomService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetAllAsync(request.Pagination, cancellationToken);

    return Results.Ok(result);    
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/assignments-get", async (
    [FromBody] ResidentsListRequest request,
    IAssignmentService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetAllAsync(request.Pagination, cancellationToken);
    
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/assignments-add", async (
    [FromBody] CreateAssignmentRequest request,
    IAssignmentService service,
    CancellationToken cancellationToken) =>
{
    var assignment = new Assignment()
    {
        UserId = request.UserId,
        RoomId = request.RoomId,
        StartDate = DateOnly.FromDateTime(request.StartDate),
        IsActive = true
    };
    
    await service.CreateAsync(assignment, cancellationToken);
    
    return Results.Ok(assignment);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/users-get", async (
    [FromBody] UsersListRequest request,
    IUserService service,
    CancellationToken cancellationToken) =>
{
    var users =  await service.GetAllAsync(request.Pagination, cancellationToken);
    
    return Results.Ok(users);
});

app.MapPost("/api/core/users-edit", async (
    [FromBody]UpdateUserRequest request,
    IUserService service,
    CancellationToken cancellationToken) =>
{
    var user = new User
    {
        Id = request.Id,
        FirstName = request.FirstName,
        LastName = request.LastName,
        PhoneNumber = request.PhoneNumber,
        Email = request.Email,
        Status = Enum.Parse<UserStatus>(request.Status)
    };
    
    return await service.UpdateAsync(user, cancellationToken);
});

app.MapGet("/api/core/me", async (
    HttpContext context,
    IJwtService jwtService,
    IUserService service,
    CancellationToken cancellationToken) =>
{
    try
    {
        string? authString = context.Request.Headers["Authorization"];
        string? token = authString?.Split(' ').Last();
        
        var id = jwtService.ExtractClaim(token, "sub").Value;

        var user = await service.GetByIdAsync(int.Parse(id), cancellationToken);

        return Results.Ok(UserModel.FromUser(user));
    }
    catch
    {
        return Results.BadRequest("Invalid token");
    }

}).RequireAuthorization();

app.MapGet("/api/core/users-get/{id:int}", async (
    [FromQuery] int id,
    IUserService service,
    CancellationToken cancellationToken) =>
{
    try
    {
        var user = await service.GetByIdAsync(id, cancellationToken);

        return Results.Ok(user);
    }
    catch
    {
        return Results.BadRequest("Invalid token");
    }
}).RequireAuthorization("AdminOnly");

app.Run();
