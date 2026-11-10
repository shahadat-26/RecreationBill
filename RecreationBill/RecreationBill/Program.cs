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



if (app.Environment.IsDevelopment())
{
    app.MapGet("/api/diagnostics/all-data", async (
        IConfiguration configuration) =>
    {
        var connectionString =
            configuration.GetConnectionString("OracleDbConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return Results.Problem(
                "Oracle connection string is missing.");
        }

        try
        {
            await using var connection =
                new OracleConnection(connectionString);

            await connection.OpenAsync();

            var employees = await ReadAllRowsAsync(
                connection,
                "SELECT * FROM BUETIIS.EMPLOYEE");

            var recreationBills = await ReadAllRowsAsync(
                connection,
                "SELECT * FROM MONI.REC_RESULT");

            return Results.Ok(new
            {
                status = "Data retrieved successfully",
                employeeCount = employees.Count,
                employees,
                recreationBillCount = recreationBills.Count,
                recreationBills
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Data retrieval failed",
                detail: ex.Message,
                statusCode: 500);
        }
    });
}

static async Task<List<Dictionary<string, object?>>> ReadAllRowsAsync(
    OracleConnection connection,
    string sql)
{
    var rows = new List<Dictionary<string, object?>>();

    await using var command = connection.CreateCommand();
    command.CommandText = sql;
    command.CommandTimeout = 60;

    await using var reader = await command.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        var row = new Dictionary<string, object?>();

        for (int i = 0; i < reader.FieldCount; i++)
        {
            row[reader.GetName(i)] =
                reader.IsDBNull(i) ? null : reader.GetValue(i);
        }

        rows.Add(row);
    }

    return rows;
}


app.Run();
