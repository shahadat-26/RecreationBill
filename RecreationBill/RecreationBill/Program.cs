using RecreationBill.Repositories;
using RecreationBill.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<DatabaseService>();
builder.Services.AddScoped<RecreationRepository>();

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
