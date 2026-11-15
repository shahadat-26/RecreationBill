import type { EmployeeProfile } from "../types/recreation/EmployeeProfile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export async function searchEmployee(
    salaryId: number
): Promise<EmployeeProfile> {
    const response = await fetch(
        `${API_BASE_URL}/api/recreation/employee/${salaryId}`
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message || "Unable to retrieve employee information."
        );
    }

    return response.json();
}
