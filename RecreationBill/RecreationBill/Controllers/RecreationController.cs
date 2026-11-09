using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RecreationBill.Models;
using RecreationBill.Repositories;

namespace RecreationBill.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecreationController : ControllerBase
    {
        private readonly RecreationRepository _repository;

        public RecreationController(RecreationRepository repository)
        {
            _repository = repository;
        }

        // GET: api/recreation/employee/5001
        [HttpGet("employee/{legacyEmpId}")]
        public IActionResult SearchEmployee(long legacyEmpId)
        {
            var profile = _repository.GetEmployeeData(legacyEmpId);
            if (profile == null)
            {
                return NotFound(new { message = "There is no Such ID, Please Enter a Valid ID." });
            }
            return Ok(profile);
        }

        // POST: api/recreation/save
        [HttpPost("save")]
        public IActionResult SaveBill([FromBody] RecreationBillRequest request)
        {
            if (request == null) return BadRequest("Invalid payload context.");

            try
            {
                _repository.SaveRecreationBill(request);
                return Ok(new { message = "Recreation bill verified and successfully written." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database Write Error: {ex.Message}");
            }
        }

        // PUT: api/recreation/update-docket
        [HttpPut("update-docket")]
        public IActionResult UpdateDocket([FromQuery]string billNo, [FromQuery] string docketNo)
        {
            if (string.IsNullOrEmpty(billNo) || string.IsNullOrEmpty(docketNo))
            {
                return BadRequest("Please provide both Bill Number and Docket Number.");
            }

            bool success = _repository.UpdateDocketNumber(billNo, docketNo);
            if (!success) return NotFound("No records found matching target conditions.");

            return Ok(new { message = "Successfully updated." });
        }
    }
}
