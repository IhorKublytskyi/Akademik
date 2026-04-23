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
using Akademik.Middleware;
using FluentValidation;
using Akademik.Validators;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); ;
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

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AkademikDbContext>();
    if (app.Environment.IsDevelopment())
    {
        await DbInitializer.InitializeAsync(context);
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
    IUserService userService,
    IJwtService jwtService,
    CancellationToken cancellationToken) =>
{
    var user = await userService.GetByEmailAsync(request.Email, cancellationToken);
    if (user is null || BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash) is false)
    {
        return Results.BadRequest("Invalid email or password");
    }
    if (user.Status == UserStatus.Blocked) return Results.Forbid();
    var tokens = await jwtService.GenerateTokensAsync(user, cancellationToken);
    return Results.Ok(new LoginResponse { User = UserModel.FromUser(user), Token = tokens });
});

app.MapPost("/api/core/auth/register", async (
    [FromBody] RegisterRequest request,
    IUserService userService,
    IValidator<RegisterRequest> validator,
    CancellationToken cancellationToken) =>
{
    var validationResult = await validator.ValidateAsync(request, cancellationToken);
    if (!validationResult.IsValid) return Results.ValidationProblem(validationResult.ToDictionary());

    var existingUser = await userService.GetByEmailAsync(request.Email, cancellationToken);
    if (existingUser is not null) return Results.BadRequest("User already exists");

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
    var newTokens = await jwtService.RotateTokensAsync(request.RefreshToken, cancellationToken);
    return Results.Ok(newTokens);
}).RequireAuthorization();

app.MapPost("/api/core/rooms-get", async (
    [FromBody] RoomsListRequest request,
    IRoomService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.GetAllAsync(request.Pagination, cancellationToken);
    return Results.Ok(result);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/rooms-add", async (
    [FromBody] CreateRoomRequest request,
    IRoomService service,
    CancellationToken cancellationToken) =>
{
    var room = new Room
    {
        Number = request.Number,
        Floor = request.Floor,
        Capacity = request.Capacity,
        Status = RoomStatus.Available
    };
    var createdRoom = await service.CreateAsync(room, cancellationToken);
    return Results.Ok(createdRoom);
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/rooms-edit", async (
    [FromBody] UpdateRoomRequest request,
    IRoomService service,
    CancellationToken cancellationToken) =>
{
    var room = new Room
    {
        Id = request.Id,
        Number = request.Number,
        Floor = request.Floor,
        Capacity = request.Capacity,
        Status = request.Status
    };
    var updatedRoom = await service.UpdateAsync(room, cancellationToken);
    return Results.Ok(updatedRoom);
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
    IValidator<CreateAssignmentRequest> validator,
    CancellationToken cancellationToken) =>
{
    var validationResult = await validator.ValidateAsync(request, cancellationToken);
    if (!validationResult.IsValid) return Results.ValidationProblem(validationResult.ToDictionary());

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

app.MapGet("/api/core/assignments/roommates", async (
    HttpContext context,
    IJwtService jwtService,
    IAssignmentService service,
    CancellationToken cancellationToken) =>
{
    string? authString = context.Request.Headers["Authorization"];
    string? token = authString?.Split(' ').Last();
    if (string.IsNullOrEmpty(token)) return Results.Unauthorized();
    var idClaim = jwtService.ExtractClaim(token, "sub");
    if (idClaim is null) return Results.Unauthorized();
    var roommates = await service.GetRoommatesAsync(int.Parse(idClaim.Value), cancellationToken);
    return Results.Ok(roommates.Select(r => UserModel.FromUser(r)));
}).RequireAuthorization();

app.MapPost("/api/core/users-get", async (
    [FromBody] UsersListRequest request,
    IUserService service,
    CancellationToken cancellationToken) =>
{
    var users = await service.GetAllAsync(request.Pagination, cancellationToken);
    return Results.Ok(new PagedResult<UserModel>() { Items = users.Items.Select(U => UserModel.FromUser(U)), Count = users.Count });
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/core/users-edit", async (
    [FromBody] UpdateUserRequest request,
    IUserService service,
    CancellationToken cancellationToken) =>
{
    var user = new User { Id = request.Id, FirstName = request.FirstName, LastName = request.LastName, PhoneNumber = request.PhoneNumber, Email = request.Email, Status = Enum.Parse<UserStatus>(request.Status) };
    var updatedUser = await service.UpdateAsync(user, cancellationToken);
    return Results.Ok(UserModel.FromUser(updatedUser));
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/core/me", async (
    HttpContext context,
    IJwtService jwtService,
    IUserService service,
    CancellationToken cancellationToken) =>
{
    string? authString = context.Request.Headers["Authorization"];
    string? token = authString?.Split(' ').Last();
    if (string.IsNullOrEmpty(token)) return Results.Unauthorized();
    var idClaim = jwtService.ExtractClaim(token, "sub");
    if (idClaim is null) return Results.Unauthorized();
    var user = await service.GetByIdAsync(int.Parse(idClaim.Value), cancellationToken);
    if (user is null) return Results.NotFound();
    return Results.Ok(UserModel.FromUser(user));
}).RequireAuthorization();

app.MapGet("/api/core/users-get/{id:int}", async (int id, IUserService service, CancellationToken cancellationToken) =>
{
    var user = await service.GetByIdAsync(id, cancellationToken);
    if (user is null) return Results.NotFound();
    return Results.Ok(UserModel.FromUser(user));
}).RequireAuthorization("AdminOnly");

app.Run();
