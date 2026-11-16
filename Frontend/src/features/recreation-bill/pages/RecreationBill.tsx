
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";

import MessageModal, {
    type MessageType,
} from "../../../shared/components/MessageModal";

import { useEmployeeSearch } from "../hooks/useEmployeeSearch";
import {
    saveRecreationBill,
    updateDocketNumber,
} from "../services/recreationApi";

interface ModalState {
    type: MessageType;
    message: string;
    title?: string;
}

function getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const inputClass =
    "h-[42px] w-full rounded-md border border-slate-300 bg-white px-4 text-[14px] text-slate-800 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-300 read-only:bg-slate-50 read-only:text-slate-600";

const labelClass = "mb-2 block text-[15px] font-medium text-slate-800";

const buttonClass =
    "h-[40px] rounded-md bg-[#1D0200] px-3 text-sm font-semibold text-white transition hover:bg-[#350600] disabled:cursor-not-allowed disabled:opacity-50";

function RecreationBill() {
    const { employee, loading, message, search, reset } = useEmployeeSearch();

    const [billNo, setBillNo] = useState("");
    const [salaryId, setSalaryId] = useState("");
    const [buetId, setBuetId] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [basicSalary, setBasicSalary] = useState("");
    const [docNo, setDocNo] = useState("");
    const [stamp, setStamp] = useState("10");
    const [billDate, setBillDate] = useState(getTodayDate());

    const [saving, setSaving] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [modal, setModal] = useState<ModalState | null>(null);

    const showModal = (
        type: MessageType,
        message: string,
        title?: string
    ) => {
        setModal({ type, message, title });
    };

    const closeModal = () => {
        setModal(null);
    };

    // Populate employee information after a successful search.
    useEffect(() => {
        if (!employee) return;

        setBuetId(employee.employeeId);
        setBankAccount(employee.bankAccountNo);
        setBasicSalary(String(employee.basicPay ?? ""));

        if (employee.isAlreadyRecorded) {
            setBillNo(employee.billNo);
            setDocNo(employee.docketNo?.toString() ?? "");
        }
    }, [employee]);

    // Display employee-search messages through the shared modal.
    useEffect(() => {
        if (!message) return;

        if (employee?.isAlreadyRecorded) {
            showModal("info", message);
        } else if (employee) {
            showModal("success", message);
        } else if (message === "Please enter a valid Salary ID.") {
            showModal("warning", message);
        } else {
            showModal("error", message);
        }
    }, [message, employee]);

    useEffect(() => {
        document.title = "Recreation Bill";
    }, []);

    const handleSalaryIdChange = (value: string) => {
        if (!/^\d*$/.test(value)) return;

        setSalaryId(value);
        setBuetId("");
        setBankAccount("");
        setBasicSalary("");
        reset();
    };

    const handleSearch = async () => {
        await search(salaryId);
    };

    const handleSalaryIdKeyDown = async (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            await handleSearch();
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

    const handleSave = async () => {
        if (!employee) {
            showModal(
                "warning",
                "Please search and load an employee first."
            );
            return;
        }

        if (!billNo.trim()) {
            showModal("warning", "Please enter the Bill Number.");
            return;
        }

        if (!buetId.trim() || !employee.employeeName || !employee.category) {
            showModal("error", "Employee information is incomplete.");
            return;
        }

        if (
            !basicSalary.trim() ||
            !Number.isFinite(Number(basicSalary)) ||
            Number(basicSalary) < 0
        ) {
            showModal("warning", "Please enter a valid Basic Salary.");
            return;
        }

        if (
            !stamp.trim() ||
            !Number.isFinite(Number(stamp)) ||
            Number(stamp) < 0
        ) {
            showModal("warning", "Please enter a valid R Stamp value.");
            return;
        }

        if (!billDate) {
            showModal("warning", "Please select the Bill Date.");
            return;
        }

        if (docNo && !/^\d{1,5}$/.test(docNo)) {
            showModal("warning", "Doc No must contain up to 5 digits.");
            return;
        }

        setSaving(true);

        try {
            await saveRecreationBill({
                legacyEmployeeId: employee.legacyEmployeeId,
                employeeId: buetId.trim(),
                employeeName: employee.employeeName,
                designation: employee.designation,
                office: employee.office,
                category: employee.category,
                bankAccountNo: bankAccount.trim(),
                basicPay: Number(basicSalary),
                billNo: billNo.trim(),
                docketNo: docNo ? Number(docNo) : null,
                stamp: Number(stamp),
                dDate: billDate,
            });

            showModal(
                "success",
                "Recreation Bill saved successfully."
            );

            reset();
            setSalaryId("");
            setBuetId("");
            setBankAccount("");
            setBasicSalary("");

            document.getElementById("salaryId")?.focus();
        } catch (error) {
            showModal(
                "error",
                error instanceof Error
                    ? error.message
                    : "Unable to save Recreation Bill."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!billNo.trim()) {
            showModal("warning", "Please enter the Bill Number.");
            return;
        }

        if (!/^\d{1,5}$/.test(docNo)) {
            showModal(
                "warning",
                "Please enter a valid Doc No (1–5 digits)."
            );
            return;
        }

        setUpdating(true);

        try {
            await updateDocketNumber(billNo.trim(), Number(docNo));

            showModal(
                "success",
                "Docket Number updated successfully."
            );
        } catch (error) {
            showModal(
                "error",
                error instanceof Error
                    ? error.message
                    : "Unable to update Docket Number."
            );
        } finally {
            setUpdating(false);
        }
    };

    return (
        <main className="min-h-screen w-full bg-white px-4 py-10 sm:px-8">
            <div className="mx-auto w-full max-w-[1000px]">
                <h1 className="mb-10 text-center font-['Fraunces'] text-5xl font-black not-italic leading-tight text-slate-900 sm:text-6xl">
                    RECREATION BILL
                </h1>

                <h2 className="mb-9 text-center text-[28px] font-semibold tracking-tight text-slate-800">
                    Entry Form
                    <span className="mx-auto mt-3 block h-[2px] w-11 rounded-full bg-[#1D0200]" />
                </h2>

                <section className="w-full">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>Salary ID</label>
                            <div className="flex gap-3">
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

                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={loading || saving || updating}
                                    className={`${buttonClass} w-20 shrink-0`}
                                >
                                    {loading ? "..." : "Search"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Doc No</label>
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
                                    onClick={handleUpdate}
                                    disabled={updating || saving}
                                    className={`${buttonClass} w-20 shrink-0`}
                                >
                                    {updating ? "..." : "Update"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Employee ID</label>
                            <input
                                type="text"
                                value={buetId}
                                onChange={(event) => setBuetId(event.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Bill Number</label>
                            <input
                                type="text"
                                value={billNo}
                                onChange={(event) => setBillNo(event.target.value)}
                                onKeyDown={handleBillNoKeyDown}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Employee Name</label>
                            <input
                                type="text"
                                value={employee?.employeeName ?? ""}
                                readOnly
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Designation</label>
                            <input
                                type="text"
                                value={employee?.designation ?? ""}
                                readOnly
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Office</label>
                            <input
                                type="text"
                                value={employee?.office ?? ""}
                                readOnly
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Category</label>
                            <input
                                type="text"
                                value={employee?.category ?? ""}
                                readOnly
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Bank Account</label>
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
                            <label className={labelClass}>Date</label>
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
                            <label className={labelClass}>Basic Salary</label>
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
                            <label className={labelClass}>R Stamp</label>
                            <input
                                type="number"
                                value={stamp}
                                onChange={(event) => setStamp(event.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {loading && (
                        <p className="mt-5 text-sm text-slate-500" role="status">
                            Retrieving employee information...
                        </p>
                    )}

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-10 pt-7">
                        <button
                            type="button"
                            className={`${buttonClass} w-30`}
                        >
                            Report View
                        </button>

                        <button
                            type="button"
                            className={`${buttonClass} w-30`}
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || updating}
                            className={`${buttonClass} w-30`}
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </section>
            </div>

            <MessageModal
                isOpen={modal !== null}
                type={modal?.type ?? "info"}
                title={modal?.title}
                message={modal?.message ?? ""}
                onClose={closeModal}
            />
        </main>
    );
}

export default RecreationBill;
