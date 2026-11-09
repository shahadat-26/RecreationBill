using Oracle.ManagedDataAccess.Client;
using RecreationBill.Models;
using RecreationBill.Services;

namespace RecreationBill.Repositories
{
    public class RecreationRepository
    {
        private readonly DatabaseService _dbService;

        public RecreationRepository(DatabaseService dbService)
        {
            _dbService = dbService;
        }

        public EmployeeProfile? GetEmployeeData(long legacyEmpId)
        {
            using var conn = _dbService.CreateConnection();
            conn?.Open();

            // 1. Check if record exists within the last 200 days
            string checkQuery = @"SELECT * FROM rec_result 
                              WHERE employeeid = :empId 
                              AND ddate BETWEEN SYSDATE - 200 AND SYSDATE";

            using (var cmd = new OracleCommand(checkQuery, conn))
            {
                cmd.Parameters.Add(new OracleParameter("empId", legacyEmpId));
                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    return new EmployeeProfile
                    {
                        IsAlreadyRecorded = true,
                        BillNo = reader["bill_no"]?.ToString() ?? "",
                        EmployeeId = reader["employee_id"]?.ToString() ?? "",
                        EmployeeName = reader["employee_Name"]?.ToString() ?? "",
                        Designation = reader["Designation"]?.ToString() ?? "",
                        Office = reader["Office"]?.ToString() ?? "",
                        Category = reader["category"]?.ToString() ?? "",
                        BankAccountNo = reader["Bank_Account_No"]?.ToString() ?? "",
                        BasicPay = Convert.ToDecimal(reader["BasicPay"])
                    };
                }
            }

            string masterQuery = "SELECT * FROM employee WHERE employeeID = :empId";
            using (var cmd = new OracleCommand(masterQuery, conn))
            {
                cmd.Parameters.Add(new OracleParameter("empId", legacyEmpId));
                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    return new EmployeeProfile
                    {
                        IsAlreadyRecorded = false,
                        EmployeeId = reader["Employee_ID"]?.ToString() ?? "",
                        EmployeeName = reader["Employee_Name"]?.ToString() ?? "",
                        Designation = reader["Designation"]?.ToString() ?? "",
                        Office = reader["Office"]?.ToString() ?? "",
                        Category = reader["category"]?.ToString() ?? "",
                        BankAccountNo = reader["Bank_Account_No"]?.ToString() ?? "",
                        BasicPay = Convert.ToDecimal(reader["Prev_Scale_Basic"]) 
                    };
                }
            }

            return null;
        }


        public void SaveRecreationBill(RecreationBillRequest model)
        {
            using var conn = _dbService.CreateConnection();
            conn.Open();

            using var transaction = conn.BeginTransaction();

            try
            {
                // STEP 1: Delete an existing record for the same
                // employee and bill number (same as original VB6 logic).

                string deleteSql = @"
            DELETE FROM rec_result
            WHERE employeeid = :empId
            AND bill_no = :billNo";

                using (var cmd = new OracleCommand(deleteSql, conn))
                {
                    cmd.Transaction = transaction;
                    cmd.BindByName = true;

                    cmd.Parameters.Add("empId", OracleDbType.Int64)
                        .Value = model.LegacyEmployeeId;

                    cmd.Parameters.Add("billNo", OracleDbType.Varchar2)
                        .Value = model.BillNo;

                    cmd.ExecuteNonQuery();
                }


                // STEP 2: Insert the new recreation bill record.

                string insertSql = @"
            INSERT INTO rec_result
            (
                employeeid,
                employee_id,
                category,
                employee_Name,
                Designation,
                Office,
                Bank_Account_No,
                Stamp,
                BasicPay,
                Bill_No,
                DDate
            )
            VALUES
            (
                :legacyId,
                :empId,
                :cat,
                :name,
                :desig,
                :office,
                :bank,
                :stamp,
                :basic,
                :billNo,
                :ddate
            )";

                using (var cmd = new OracleCommand(insertSql, conn))
                {
                    cmd.Transaction = transaction;
                    cmd.BindByName = true;

                    cmd.Parameters.Add("legacyId", OracleDbType.Int64)
                        .Value = model.LegacyEmployeeId;

                    cmd.Parameters.Add("empId", OracleDbType.Varchar2)
                        .Value = model.EmployeeId;

                    cmd.Parameters.Add("cat", OracleDbType.Varchar2)
                        .Value = model.Category;

                    cmd.Parameters.Add("name", OracleDbType.Varchar2)
                        .Value = model.EmployeeName;

                    cmd.Parameters.Add("desig", OracleDbType.Varchar2)
                        .Value = model.Designation;

                    cmd.Parameters.Add("office", OracleDbType.Varchar2)
                        .Value = model.Office;

                    cmd.Parameters.Add("bank", OracleDbType.Varchar2)
                        .Value = model.BankAccountNo;

                    cmd.Parameters.Add("stamp", OracleDbType.Decimal)
                        .Value = model.Stamp;

                    cmd.Parameters.Add("basic", OracleDbType.Decimal)
                        .Value = model.BasicPay;

                    cmd.Parameters.Add("billNo", OracleDbType.Varchar2)
                        .Value = model.BillNo;

                    cmd.Parameters.Add("ddate", OracleDbType.Date)
                        .Value = model.DDate;

                    cmd.ExecuteNonQuery();
                }


                // STEP 3: Commit transaction if everything succeeds.

                transaction.Commit();
            }
            catch
            {
                // STEP 4: Rollback if any database operation fails.

                try
                {
                    transaction.Rollback();
                }
                catch
                {
                    // Preserve the original database exception.
                }

                throw;
            }
        }


        // Ported from: Command1_Click (Update Action for Docket No)
        public bool UpdateDocketNumber(string billNo, string docketNo)
        {
            using var conn = _dbService.CreateConnection() as OracleConnection;
            conn?.Open();

            string updateSql = "UPDATE MONI.REC_RESULT SET DOC_NO = :docketNo WHERE BILL_NO = :billNo";
            using var cmd = new OracleCommand(updateSql, conn);
            cmd.Parameters.Add(new OracleParameter("docketNo", docketNo));
            cmd.Parameters.Add(new OracleParameter("billNo", billNo));

            int rowsAffected = cmd.ExecuteNonQuery();
            return rowsAffected > 0;
        }
    }
}
