using Akademik.Services.JwtAuthorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Akademik.DataProvider.Models;
using Akademik.Models;
using Akademik.Services.Users;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

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

    return Results.Ok(tokens);
});

app.MapPost("/api/core/auth/register", async (
    [FromBody] RegisterRequest request,
    IUserService userService,
    IJwtService jwtService,
    CancellationToken cancellationToken) =>
{ 
    //TODO: Add validation and error handlings

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
        Role = request.Role,
        PhoneNumber = request.Phone,
        Status = UserStatus.Active,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        CreatedAt = DateTime.UtcNow
    };
    
    await userService.CreateAsync(newUser, cancellationToken);

    return Results.Ok(newUser);
}).RequireAuthorization("AdminOnly"); 

app.MapPost("/api/core/auth/refresh", async ([FromBody] string refreshToken, IJwtService jwtService, CancellationToken cancellationToken = default) =>
{
    try
    {
        var token = await jwtService.GetByBodyAsync(refreshToken, cancellationToken);

        token.Revoked = DateTime.UtcNow;
        
        var newTokens = await jwtService.GenerateTokensAsync(token.User,  cancellationToken);

        return Results.Ok(newTokens);
    }
    catch(Exception ex)
    {
        return Results.Problem(ex.Message);        
    }

}).RequireAuthorization();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.Run();
