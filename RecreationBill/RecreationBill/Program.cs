
using RecreationBill.Repositories;
using RecreationBill.Repositories.Interfaces;
using RecreationBill.Services;
using RecreationBill.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<DatabaseService>();

builder.Services.AddScoped<IRecreationRepository, RecreationRepository>();
builder.Services.AddScoped<IRecreationService, RecreationService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
