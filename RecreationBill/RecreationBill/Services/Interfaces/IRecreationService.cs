
using RecreationBill.Models;

namespace RecreationBill.Services.Interfaces
{
    public interface IRecreationService
    {
        EmployeeProfile? GetEmployeeData(long legacyEmpId);

        void SaveRecreationBill(RecreationBillRequest request);

        bool UpdateDocketNumber(string billNo, decimal docketNo);
    }
}
