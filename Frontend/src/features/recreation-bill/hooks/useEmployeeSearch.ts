
import { useState } from "react";
import { searchEmployee } from "../services/recreationApi";
import type { EmployeeProfile } from "../types/EmployeeProfile";

export function useEmployeeSearch() {
    const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const search = async (salaryId: string) => {
        const trimmedSalaryId = salaryId.trim();

        if (!trimmedSalaryId) {
            setEmployee(null);
            setMessage("Please enter a valid Salary ID.");
            return;
        }

        if (!/^\d+$/.test(trimmedSalaryId) || Number(trimmedSalaryId) <= 0) {
            setEmployee(null);
            setMessage("Please enter a valid Salary ID.");
            return;
        }

        setLoading(true);
        setEmployee(null);
        setMessage("");

        try {
            const result = await searchEmployee(Number(trimmedSalaryId));

            setEmployee(result);

            setMessage(
                result.isAlreadyRecorded
                    ? "Already Recorded. Edit Information and Then Save."
                    : "Employee information loaded successfully."
            );
        } catch (error) {
            setEmployee(null);

            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to retrieve employee information."
            );
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setEmployee(null);
        setMessage("");
    };

    return {
        employee,
        loading,
        message,
        search,
        reset,
    };
}
