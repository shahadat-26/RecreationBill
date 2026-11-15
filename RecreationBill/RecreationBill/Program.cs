
using RecreationBill.Repositories;
using RecreationBill.Repositories.Interfaces;
using RecreationBill.Services;
using RecreationBill.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<DatabaseService>();

builder.Services.AddScoped<IRecreationRepository, RecreationRepository>();
builder.Services.AddScoped<IRecreationService, RecreationService>();

// Allow the React frontend to access the API.
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
