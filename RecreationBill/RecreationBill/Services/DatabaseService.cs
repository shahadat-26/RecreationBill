
using Oracle.ManagedDataAccess.Client;

namespace RecreationBill.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDbConnection")
                ?? throw new InvalidOperationException("Oracle database connection string is missing.");
        }

        // Create a new Oracle connection
        public OracleConnection CreateConnection()
        {
            return new OracleConnection(_connectionString);
        }

        // Get Oracle database system date
        public DateTime GetSystemDate()
        {
            using var conn = CreateConnection();
            conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT SYSDATE FROM DUAL";

            return Convert.ToDateTime(cmd.ExecuteScalar());
        }
    }
}
