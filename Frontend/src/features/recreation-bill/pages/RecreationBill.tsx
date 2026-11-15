
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { useEmployeeSearch } from "../hooks/useEmployeeSearch";

function getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const inputClass = "h-[42px] w-full rounded-md border border-slate-300 bg-white px-4 text-[14px] text-slate-800 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-300 read-only:bg-slate-50 read-only:text-slate-600";

const labelClass = "mb-2 block text-[15px] font-medium text-slate-800";

const buttonClass = "h-[40px] rounded-md bg-[#1D0200] px-3 text-sm font-semibold text-white transition hover:bg-[#350600] disabled:cursor-not-allowed disabled:opacity-50";

function RecreationBill() {
    const { employee, loading, message, search, reset } =
        useEmployeeSearch();

    const [billNo, setBillNo] = useState("");
    const [salaryId, setSalaryId] = useState("");
    const [buetId, setBuetId] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [basicSalary, setBasicSalary] = useState("");
    const [docNo, setDocNo] = useState("");
    const [stamp, setStamp] = useState("10");
    const [billDate, setBillDate] = useState(getTodayDate());

    useEffect(() => {
        if (!employee) {
            return;
        }

        setBuetId(employee.employeeId);
        setBankAccount(employee.bankAccountNo);
        setBasicSalary(String(employee.basicPay ?? ""));

        if (employee.isAlreadyRecorded) {
            setBillNo(employee.billNo);
        }
    }, [employee]);

    const handleSalaryIdChange = (value: string) => {
        if (!/^\d*$/.test(value)) {
            return;
        }

        setSalaryId(value);
        setBuetId("");
        setBankAccount("");
        setBasicSalary("");
        setBillNo("");
        reset();
    };

    const handleSalaryIdKeyDown = async (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();

            if (!salaryId.trim()) {
                return;
            }

            await search(salaryId);
        }
    };

    const handleBillNoKeyDown = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("salaryId")?.focus();
        }
    };

    const handleDocNoChange = (value: string) => {
        if (/^\d{0,5}$/.test(value)) {
            setDocNo(value);
        }
    };

    return (
        <main className="min-h-screen w-full bg-white px-4 py-10 sm:px-8">
            <div className="mx-auto w-full max-w-[1000px]">

                {/* Page Title */}
                <h1 className="mb-10 text-center font-['Fraunces'] text-5xl font-black not-italic leading-tight text-slate-900 sm:text-6xl">
                    RECREATION BILL
                </h1>

                {/* Form Heading */}
                <h2 className="mb-9 text-center text-[28px] font-semibold tracking-tight text-slate-800">
                    Entry Form
                    <span className="mx-auto mt-3 block h-[2px] w-11 rounded-full bg-[#1D0200]" />
                </h2>

                {/* Form Fields */}
                <section className="w-full">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">

                        <div>
                            <label className={labelClass}>
                                Bill Number
                            </label>
                            <input
                                type="text"
                                value={billNo}
                                onChange={(event) =>
                                    setBillNo(event.target.value)
                                }
                                onKeyDown={handleBillNoKeyDown}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Doc No
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={5}
                                    value={docNo}
                                    onChange={(event) =>
                                        handleDocNoChange(event.target.value)
                                    }
                                    className={inputClass}
                                />

                                <button
                                    type="button"
                                    disabled
                                    className={`${buttonClass} shrink-0`}
                                >
                                    Update
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Salary ID
                            </label>
                            <input
                                id="salaryId"
                                type="text"
                                inputMode="numeric"
                                value={salaryId}
                                onChange={(event) =>
                                    handleSalaryIdChange(event.target.value)
                                }
                                onKeyDown={handleSalaryIdKeyDown}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                BUET EMPLOYEE ID
                            </label>
                            <input
                                type="text"
                                value={buetId}
                                onChange={(event) =>
                                    setBuetId(event.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>
                                Employee Name
                            </label>
                            <input
                                type="text"
                                value={employee?.employeeName ?? ""}
                                readOnly
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Designation
                            </label>
                            <input
                                type="text"
                                value={employee?.designation ?? ""}
                                readOnly
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Office
                            </label>
                            <input
                                type="text"
                                value={employee?.office ?? ""}
                                readOnly
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Category
                            </label>
                            <input
                                type="text"
                                value={employee?.category ?? ""}
                                readOnly
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Bank Account
                            </label>
                            <input
                                type="text"
                                value={bankAccount}
                                onChange={(event) =>
                                    setBankAccount(event.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Date
                            </label>
                            <input
                                type="date"
                                value={billDate}
                                onChange={(event) =>
                                    setBillDate(event.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                Basic Salary
                            </label>
                            <input
                                type="number"
                                value={basicSalary}
                                onChange={(event) =>
                                    setBasicSalary(event.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                R Stamp
                            </label>
                            <input
                                type="number"
                                value={stamp}
                                onChange={(event) =>
                                    setStamp(event.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <p
                            className={`mt-5 text-sm ${
                                employee
                                    ? "text-emerald-700"
                                    : "text-red-600"
                            }`}
                            role="status"
                        >
                            {loading ? "Searching..." : message}
                        </p>
                    )}

                    {loading && (
                        <p className="mt-2 text-sm text-slate-500">
                            Retrieving employee information...
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-10 pt-7">
                        <button
                            type="button"
                            disabled
                            className={`${buttonClass} w-30`}
                        >
                            Report View
                        </button>

                        <button
                            type="button"
                            disabled
                            className={`${buttonClass} w-30`}
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            disabled
                            className={`${buttonClass} w-30`}
                        >
                            Save
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default RecreationBill;
