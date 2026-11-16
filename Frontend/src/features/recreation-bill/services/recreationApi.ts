import type { EmployeeProfile } from "../types/EmployeeProfile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RecreationBillSaveRequest {
    legacyEmployeeId: number;
    employeeId: string;
    employeeName: string;
    designation: string;
    office: string;
    category: string;
    bankAccountNo: string;
    basicPay: number;
    billNo: string;
    docketNo: number | null;
    stamp: number;
    dDate: string;
}

async function sendRequest(url: string, options: RequestInit): Promise<void> {
    let response: Response;

    try {
        response = await fetch(url, options);
    } catch {
        throw new Error("Unable to connect to the server. Please check your connection.");
    }

    if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        let message = "The operation failed.";

        if (typeof data === "object" && data !== null) {
            const result = data as Record<string, unknown>;
            if (typeof result.message === "string") message = result.message;
            else if (typeof result.title === "string") message = result.title;
        }

        throw new Error(message);
    }
}

export async function searchEmployee(salaryId: number): Promise<EmployeeProfile> {
    const baseUrl = API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) throw new Error("API base URL is not configured.");

    let response: Response;

    try {
        response = await fetch(`${baseUrl}/api/recreation/employee/${salaryId}`);
    } catch {
        throw new Error("Unable to connect to the server. Please check your connection.");
    }

    if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => null);
        let errorMessage = "Unable to retrieve employee information.";

        if (typeof errorData === "object" && errorData !== null) {
            const data = errorData as Record<string, unknown>;
            if (typeof data.message === "string") errorMessage = data.message;
            else if (typeof data.title === "string") errorMessage = data.title;
        }

        throw new Error(errorMessage);
    }

    return response.json() as Promise<EmployeeProfile>;
}

export async function saveRecreationBill(model: RecreationBillSaveRequest): Promise<void> {
    const baseUrl = API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) throw new Error("API base URL is not configured.");

    await sendRequest(`${baseUrl}/api/recreation/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(model)
    });
}

export async function updateDocketNumber(billNo: string, docketNo: number): Promise<void> {
    const baseUrl = API_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) throw new Error("API base URL is not configured.");

    const params = new URLSearchParams({ billNo, docketNo: String(docketNo) });

    await sendRequest(`${baseUrl}/api/recreation/update-docket?${params}`, {
        method: "PUT"
    });
}
