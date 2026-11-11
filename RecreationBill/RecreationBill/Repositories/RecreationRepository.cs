
using Oracle.ManagedDataAccess.Client;
using RecreationBill.Models;
using RecreationBill.Repositories.Interfaces;
using RecreationBill.Services;

namespace RecreationBill.Repositories
{
    public class RecreationRepository : IRecreationRepository
    {
        private readonly DatabaseService _dbService;

        public RecreationRepository(DatabaseService dbService)
        {
            _dbService = dbService;
        }

        // 1. EMPLOYEE LOOKUP
        // Salary ID = EMPLOYEE.EMPLOYEEID

        public EmployeeProfile? GetEmployeeData(long legacyEmpId)
        {
            using var conn = _dbService.CreateConnection();
            conn.Open();

            // First check whether a recreation bill exists for this employee within the previous 200 days.

            string checkQuery = @"
                SELECT
                    EMPLOYEEID,
                    EMPLOYEE_ID,
                    EMPLOYEE_NAME,
                    DESIGNATION,
                    OFFICE,
                    CATEGORY,
                    BANK_ACCOUNT_NO,
                    BASICPAY,
                    BILL_NO
                FROM MONI.REC_RESULT
                WHERE EMPLOYEEID = :empId
                  AND DDATE BETWEEN SYSDATE - 200 AND SYSDATE
                ORDER BY DDATE DESC";

            using (var cmd = new OracleCommand(checkQuery, conn))
            {
                cmd.BindByName = true;
                cmd.Parameters.Add("empId", OracleDbType.Int64).Value = legacyEmpId;

                using var reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return new EmployeeProfile
                    {
                        LegacyEmployeeId = legacyEmpId,
                        IsAlreadyRecorded = true,
                        BillNo = reader["BILL_NO"]?.ToString() ?? "",
                        EmployeeId = reader["EMPLOYEE_ID"]?.ToString() ?? "",
                        EmployeeName = reader["EMPLOYEE_NAME"]?.ToString() ?? "",
                        Designation = reader["DESIGNATION"]?.ToString() ?? "",
                        Office = reader["OFFICE"]?.ToString() ?? "",
                        Category = reader["CATEGORY"]?.ToString() ?? "",
                        BankAccountNo = reader["BANK_ACCOUNT_NO"]?.ToString() ?? "",
                        BasicPay = Convert.ToDecimal(reader["BASICPAY"])
                    };
                }
            }

            // No recent recreation bill found. Retrieve employee information from the master table.

            string masterQuery = @"
                SELECT
                    EMPLOYEEID,
                    EMPLOYEE_ID,
                    EMPLOYEE_NAME,
                    DESIGNATION,
                    OFFICE,
                    CATEGORY,
                    BANK_ACCOUNT_NO,
                    PREV_SCALE_BASIC
                FROM BUETIIS.EMPLOYEE
                WHERE EMPLOYEEID = :empId";

            using (var cmd = new OracleCommand(masterQuery, conn))
            {
                cmd.BindByName = true;
                cmd.Parameters.Add("empId", OracleDbType.Int64).Value = legacyEmpId;

                using var reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    int basicPayOrdinal = reader.GetOrdinal("PREV_SCALE_BASIC");
                    decimal basicPay = reader.IsDBNull(basicPayOrdinal) ? 0m : reader.GetDecimal(basicPayOrdinal);

                    return new EmployeeProfile
                    {
                        LegacyEmployeeId = legacyEmpId,
                        IsAlreadyRecorded = false,
                        EmployeeId = reader["EMPLOYEE_ID"]?.ToString() ?? "",
                        EmployeeName = reader["EMPLOYEE_NAME"]?.ToString() ?? "",
                        Designation = reader["DESIGNATION"]?.ToString() ?? "",
                        Office = reader["OFFICE"]?.ToString() ?? "",
                        Category = reader["CATEGORY"]?.ToString() ?? "",
                        BankAccountNo = reader["BANK_ACCOUNT_NO"]?.ToString() ?? "",
                        BasicPay = basicPay,
                        BillNo = ""
                    };
                }
            }

            // Salary ID does not exist.
            return null;
        }

        // 2. SAVE RECREATION BILL
        // Delete existing matching record, then insert new record.
        // Both operations run in one transaction.

        public void SaveRecreationBill(RecreationBillRequest model)
        {
            using var conn = _dbService.CreateConnection();
            conn.Open();

            using var transaction = conn.BeginTransaction();

            try
            {
                // STEP 1: Delete existing matching record.

                string deleteSql = @"
                    DELETE FROM MONI.REC_RESULT
                    WHERE EMPLOYEEID = :empId
                      AND BILL_NO = :billNo";

                using (var cmd = new OracleCommand(deleteSql, conn))
                {
                    cmd.Transaction = transaction;
                    cmd.BindByName = true;
                    cmd.Parameters.Add("empId", OracleDbType.Int64).Value = model.LegacyEmployeeId;
                    cmd.Parameters.Add("billNo", OracleDbType.Varchar2, 15).Value = model.BillNo;

                    cmd.ExecuteNonQuery();
                }

                // STEP 2: Insert the new recreation bill.

                string insertSql = @"
                    INSERT INTO MONI.REC_RESULT
                    (
                        EMPLOYEEID,
                        EMPLOYEE_ID,
                        EMPLOYEE_NAME,
                        DESIGNATION,
                        OFFICE,
                        CATEGORY,
                        BASICPAY,
                        BANK_ACCOUNT_NO,
                        BILL_NO,
                        STAMP,
                        DDATE
                    )
                    VALUES
                    (
                        :legacyId,
                        :empId,
                        :name,
                        :designation,
                        :office,
                        :category,
                        :basicPay,
                        :bank,
                        :billNo,
                        :stamp,
                        :ddate
                    )";

                using (var cmd = new OracleCommand(insertSql, conn))
                {
                    cmd.Transaction = transaction;
                    cmd.BindByName = true;
                    cmd.Parameters.Add("legacyId", OracleDbType.Int64).Value = model.LegacyEmployeeId;
                    cmd.Parameters.Add("empId", OracleDbType.Varchar2, 15).Value = model.EmployeeId;
                    cmd.Parameters.Add("name", OracleDbType.Varchar2, 50).Value = model.EmployeeName;
                    cmd.Parameters.Add("designation", OracleDbType.Varchar2, 50).Value = model.Designation;
                    cmd.Parameters.Add("office", OracleDbType.Varchar2, 50).Value = model.Office;
                    cmd.Parameters.Add("category", OracleDbType.Varchar2, 20).Value = model.Category;
                    cmd.Parameters.Add("basicPay", OracleDbType.Decimal).Value = model.BasicPay;
                    cmd.Parameters.Add("bank", OracleDbType.Varchar2, 15).Value = string.IsNullOrWhiteSpace(model.BankAccountNo) ? DBNull.Value : model.BankAccountNo;
                    cmd.Parameters.Add("billNo", OracleDbType.Varchar2, 15).Value = model.BillNo;
                    cmd.Parameters.Add("stamp", OracleDbType.Decimal).Value = model.Stamp;
                    cmd.Parameters.Add("ddate", OracleDbType.Date).Value = model.DDate;

                    cmd.ExecuteNonQuery();
                }

                // STEP 3: Commit both operations.

                transaction.Commit();
            }
            catch
            {
                try
                {
                    transaction.Rollback();
                }
                catch
                {
                    // Preserve the original exception.
                }

                throw;
            }
        }

        // 3. UPDATE DOCKET NUMBER
        // DOC_NO is NUMBER in Oracle.

        public bool UpdateDocketNumber(string billNo, decimal docketNo)
        {
            using var conn = _dbService.CreateConnection();
            conn.Open();

            string updateSql = @"
                UPDATE MONI.REC_RESULT
                SET DOC_NO = :docketNo
                WHERE BILL_NO = :billNo";

            using var cmd = new OracleCommand(updateSql, conn);

            cmd.BindByName = true;
            cmd.Parameters.Add("docketNo", OracleDbType.Decimal).Value = docketNo;
            cmd.Parameters.Add("billNo", OracleDbType.Varchar2, 15).Value = billNo;

            int rowsAffected = cmd.ExecuteNonQuery();

            return rowsAffected > 0;
        }
    }
}
