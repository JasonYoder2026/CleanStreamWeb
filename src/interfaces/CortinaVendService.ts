export interface CortinaQuote {
  machineId: number;
  machineName: string;
  machineType: "washer" | "dryer";
  washerSizeLabel: string | null;
  amountCents: number;
  dryer: {
    incrementCents: number;
    minutesPerIncrement: number;
    minimumCents: number;
    maximumCents: number;
    defaultCents: number;
  } | null;
}

export interface CortinaVendReference {
  sessionId: string;
  accessToken: string;
}

export interface CortinaVendStatus {
  status: string;
  dryer_minutes?: number | null;
  failure_message?: string | null;
}

export interface CortinaVendService {
  quote(machineToken?: string, uniQr?: string): Promise<CortinaQuote>;
  createCard(machineToken: string | undefined, uniQr: string | undefined, amountCents: number, clientRequestId: string): Promise<CortinaVendReference & { checkoutUrl: string }>;
  payWithWallet(machineToken: string | undefined, uniQr: string | undefined, amountCents: number, clientRequestId: string): Promise<CortinaVendReference>;
  status(reference: CortinaVendReference): Promise<CortinaVendStatus>;
  hasSession(): Promise<boolean>;
}
