export interface RefundService {
    getRefunds(): Promise<Refund[]>
}

export type RefundStatus = "pending" | "approved" | "denied";

export interface Refund {
    id: string;
    customerName: string;
    amount: number;
    reason: string;
    date: string;
    status: RefundStatus;
    attempts: number;
}