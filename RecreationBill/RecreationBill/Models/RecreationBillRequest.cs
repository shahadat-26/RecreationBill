using System.ComponentModel.DataAnnotations;

namespace RecreationBill.Models
{
    public class RecreationBillRequest
    {
        [Range(1, long.MaxValue)]
        public long LegacyEmployeeId { get; set; }

        [Required]
        public string EmployeeId { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        public string EmployeeName { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public string Office { get; set; } = string.Empty;

        public string BankAccountNo { get; set; } = string.Empty;

        public decimal Stamp { get; set; } = 10;

        [Range(0, double.MaxValue)]
        public decimal BasicPay { get; set; }

        [Required]
        public string BillNo { get; set; } = string.Empty;

        public DateTime DDate { get; set; }
    }
}