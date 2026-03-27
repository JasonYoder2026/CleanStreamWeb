export interface RefundService {
    getRefunds(): Promise<Refund[]>
}

export type RefundStatus = "pending" | "approved" | "denied";

export interface Refund {
    id: string;
    customerName: string;
    customerId: string,
    amount: number;
    transactionId: string,
    reason: string;
    date: string;
    status: RefundStatus;
    attempts: number;
}