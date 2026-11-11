
using System.Globalization;
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
        private readonly ILogger<RecreationController> _logger;

        public RecreationController(RecreationRepository repository, ILogger<RecreationController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        // GET: api/recreation/employee/5001
        [HttpGet("employee/{legacyEmpId}")]
        public IActionResult SearchEmployee(long legacyEmpId)
        {
            if (legacyEmpId <= 0) return BadRequest(new { message = "Please enter a valid Salary ID." });

            var profile = _repository.GetEmployeeData(legacyEmpId);

            if (profile == null) return NotFound(new { message = "There is no such ID. Please enter a valid ID." });

            return Ok(profile);
        }

        // POST: api/recreation/save
        [HttpPost("save")]
        public IActionResult SaveBill([FromBody] RecreationBillRequest request)
        {
            try
            {
                _repository.SaveRecreationBill(request);
                return Ok(new { message = "Recreation bill successfully saved." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving recreation bill.");
                return StatusCode(500, new { message = "An error occurred while saving the recreation bill." });
            }
        }

        // PUT: api/recreation/update-docket
        // Example: api/recreation/update-docket?billNo=RB-001&docketNo=12345
        [HttpPut("update-docket")]
        public IActionResult UpdateDocket([FromQuery] string? billNo, [FromQuery] string? docketNo)
        {
            if (string.IsNullOrWhiteSpace(billNo) || string.IsNullOrWhiteSpace(docketNo))
                return BadRequest(new { message = "Please provide both Bill Number and Docket Number." });

            if (billNo.Length > 15)
                return BadRequest(new { message = "Bill Number cannot exceed 15 characters." });

            // Accept digits only. Oracle DOC_NO is a NUMBER column.
            if (!decimal.TryParse(docketNo, NumberStyles.None, CultureInfo.InvariantCulture, out decimal numericDocketNo))
                return BadRequest(new { message = "Docket Number must contain digits only." });

            try
            {
                bool success = _repository.UpdateDocketNumber(billNo, numericDocketNo);

                if (!success) return NotFound(new { message = "No records found for the supplied Bill Number." });

                return Ok(new { message = "Docket Number successfully updated." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating docket number.");
                return StatusCode(500, new { message = "An error occurred while updating the docket number." });
            }
        }
    }
}
