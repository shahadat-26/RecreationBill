
using RecreationBill.Models;
using RecreationBill.Repositories;
using RecreationBill.Repositories.Interfaces;
using RecreationBill.Services.Interfaces;

namespace RecreationBill.Services
{
    public class RecreationService : IRecreationService
    {
        private readonly IRecreationRepository _repository;

        public RecreationService(IRecreationRepository repository)
        {
            _repository = repository;
        }

        public EmployeeProfile? GetEmployeeData(long legacyEmpId)
        {
            return _repository.GetEmployeeData(legacyEmpId);
        }

        public void SaveRecreationBill(RecreationBillRequest request)
        {
            _repository.SaveRecreationBill(request);
        }

        public bool UpdateDocketNumber(string billNo, decimal docketNo)
        {
            return _repository.UpdateDocketNumber(billNo, docketNo);
        }
    }
}
