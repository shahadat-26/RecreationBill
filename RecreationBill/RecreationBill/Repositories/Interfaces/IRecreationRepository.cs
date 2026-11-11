
using RecreationBill.Models;

namespace RecreationBill.Repositories.Interfaces
{
    public interface IRecreationRepository
    {
        EmployeeProfile? GetEmployeeData(long legacyEmpId);

        void SaveRecreationBill(RecreationBillRequest model);

        bool UpdateDocketNumber(string billNo, decimal docketNo);
    }
}
