using RecreationBill.Repositories;
using RecreationBill.Services;
using Oracle.ManagedDataAccess.Client;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<DatabaseService>();
builder.Services.AddScoped<RecreationRepository>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

OracleConfiguration.TnsAdmin = @"D:\app\User\product\11.2.0\dbhome_1\NETWORK\ADMIN";

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
