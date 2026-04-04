import type {
  TrafficDashboardSeed,
  TrafficEvent,
  TrafficLocation,
  TrafficService,
} from "../../interfaces/TrafficService";
import type { SupabaseClient } from "@supabase/supabase-js";

interface LocationRow {
  id: number;
  Name: string;
}

interface RawTrafficEventRow {
  created_at?: string | null;
  date?: string | null;
  location_id?: number | null;
  amount?: number | null;
  total?: number | null;
  transaction_amount?: number | null;
  price?: number | null;
}

interface TrafficQueryPlan {
  table: string;
  dateColumn: "created_at" | "date" | "transaction_date" | "timestamp";
}

function toSafeNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    if (!cleaned) {
      return 0;
    }

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export class TrafficRepository implements TrafficService {
  constructor(private client: SupabaseClient) {}

  getTrafficDashboardSeed = async (
    startIso: string,
  ): Promise<TrafficDashboardSeed> => {
    const { data: locationRows, error: locationError } = await this.client
      .from("Locations")
      .select("id, Name");

    if (locationError) {
      throw locationError;
    }

    const managedLocations: TrafficLocation[] = (
      (locationRows ?? []) as LocationRow[]
    )
      .map((row) => ({
        id: row.id,
        name: row.Name,
      }))
      .filter((row) => Number.isFinite(row.id) && Boolean(row.name));

    const events = await this.fetchTrafficEvents(startIso);

    return {
      managedLocations,
      events,
    };
  };

  private async fetchTrafficEvents(startIso: string): Promise<TrafficEvent[]> {
    const queryPlans: TrafficQueryPlan[] = [
      {
        table: "Transactions",
        dateColumn: "created_at",
      },
      {
        table: "Transactions",
        dateColumn: "created_at",
      },
      {
        table: "Transactions",
        dateColumn: "date",
      },
      { table: "Transactions", dateColumn: "date" },
      {
        table: "Transactions",
        dateColumn: "transaction_date",
      },
      {
        table: "Transactions",
        dateColumn: "transaction_date",
      },
      {
        table: "Transactions",
        dateColumn: "timestamp",
      },
      { table: "Transactions", dateColumn: "timestamp" },

      {
        table: "Transaction",
        dateColumn: "created_at",
      },
      {
        table: "Transaction",
        dateColumn: "created_at",
      },
      {
        table: "Transaction",
        dateColumn: "date",
      },
      { table: "Transaction", dateColumn: "date" },
      {
        table: "Transaction",
        dateColumn: "transaction_date",
      },
      {
        table: "Transaction",
        dateColumn: "transaction_date",
      },
      {
        table: "Transaction",
        dateColumn: "timestamp",
      },
      { table: "Transaction", dateColumn: "timestamp" },

      {
        table: "transactions",
        dateColumn: "created_at",
      },
      {
        table: "transactions",
        dateColumn: "created_at",
      },
      {
        table: "transactions",
        dateColumn: "date",
      },
      { table: "transactions", dateColumn: "date" },
      {
        table: "transactions",
        dateColumn: "transaction_date",
      },
      {
        table: "transactions",
        dateColumn: "transaction_date",
      },
      {
        table: "transactions",
        dateColumn: "timestamp",
      },
      { table: "transactions", dateColumn: "timestamp" },

      {
        table: "Machine_Transactions",
        dateColumn: "created_at",
      },
      {
        table: "Machine_Transactions",
        dateColumn: "created_at",
      },
      {
        table: "Machine_Transactions",
        dateColumn: "date",
      },
      { table: "Machine_Transactions", dateColumn: "date" },
      {
        table: "Machine_Transactions",
        dateColumn: "transaction_date",
      },
      { table: "Machine_Transactions", dateColumn: "transaction_date" },

      {
        table: "machine_transactions",
        dateColumn: "created_at",
      },
      {
        table: "machine_transactions",
        dateColumn: "created_at",
      },
      {
        table: "machine_transactions",
        dateColumn: "date",
      },
      { table: "machine_transactions", dateColumn: "date" },
      {
        table: "machine_transactions",
        dateColumn: "transaction_date",
      },
      { table: "machine_transactions", dateColumn: "transaction_date" },
    ];

    let lastError: unknown = null;
    let bestResult: TrafficEvent[] = [];
    let hadSuccessfulQuery = false;

    for (const plan of queryPlans) {
      const { data, error } = await this.client
        .from(plan.table)
        .select("*")
        .gte(plan.dateColumn, startIso);

      if (!error) {
        const mapped = ((data ?? []) as RawTrafficEventRow[])
          .map((row) => ({
            occurredAt:
              row.created_at ??
              row.date ??
              (row as { transaction_date?: string | null }).transaction_date ??
              (row as { timestamp?: string | null }).timestamp ??
              "",
            locationId: row.location_id ?? null,
            amount: toSafeNumber(
              row.amount ?? row.total ?? row.transaction_amount ?? row.price,
            ),
          }))
          .filter((row) => Boolean(row.occurredAt));

        if (mapped.length > 0) {
          return mapped;
        }

        hadSuccessfulQuery = true;
        bestResult = mapped;
        continue;
      }

      lastError = error;
    }

    if (hadSuccessfulQuery) {
      return bestResult;
    }

    const message =
      (lastError as { message?: string } | null)?.message?.toLowerCase() ?? "";

    if (
      message.includes("relation") ||
      message.includes("does not exist") ||
      message.includes("column")
    ) {
      return [];
    }

    throw lastError ?? new Error("No supported transactions table found");
  }
}
