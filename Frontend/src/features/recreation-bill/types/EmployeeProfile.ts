export interface EmployeeProfile {
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
    isAlreadyRecorded: boolean;
}