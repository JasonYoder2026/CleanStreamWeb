export interface RefundService {
    getRefunds(): Promise<Refund[]>
}

export interface Refund {
    id: String
}