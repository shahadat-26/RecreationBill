
import { useRef, useState } from "react";
import { searchEmployee } from "../services/recreationApi";
import type { EmployeeProfile } from "../types/EmployeeProfile";

export function useEmployeeSearch() {
    const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const searchRequestId = useRef(0);

    const search = async (salaryId: string) => {
        const trimmedSalaryId = salaryId.trim();

        if (!trimmedSalaryId || !/^\d+$/.test(trimmedSalaryId) || Number(trimmedSalaryId) <= 0) {
            searchRequestId.current++;
            setEmployee(null);
            setLoading(false);
            setMessage("Please enter a valid Salary ID.");
            return;
        }

        const requestId = ++searchRequestId.current;
        setLoading(true);
        setEmployee(null);
        setMessage("");

        try {
            const result = await searchEmployee(Number(trimmedSalaryId));
            if (requestId !== searchRequestId.current) return;

            setEmployee(result);
            setMessage(result.isAlreadyRecorded
                ? "Already Recorded. Edit Information and Then Save."
                : "No record found. Provided Bill number is system generated.");
        } catch (error) {
            if (requestId !== searchRequestId.current) return;
            setEmployee(null);
            setMessage(error instanceof Error ? error.message : "Unable to retrieve employee information.");
        } finally {
            if (requestId === searchRequestId.current) setLoading(false);
        }
    };

    const reset = () => {
        searchRequestId.current++;
        setEmployee(null);
        setLoading(false);
        setMessage("");
    };

    return { employee, loading, message, search, reset };
}
