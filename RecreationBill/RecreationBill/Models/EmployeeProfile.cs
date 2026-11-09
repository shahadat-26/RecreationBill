namespace RecreationBill.Models
{
    public class EmployeeProfile
    {
        public long LegacyEmployeeId { get; set; }

        public string EmployeeId { get; set; } = string.Empty;

        public string EmployeeName { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public string Office { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string BankAccountNo { get; set; } = string.Empty;

        public decimal BasicPay { get; set; }

        public string BillNo { get; set; } = string.Empty;

        public bool IsAlreadyRecorded { get; set; }
    }
}