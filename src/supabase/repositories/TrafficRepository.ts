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
  location_id?: number | null;
  LocationID?: number | null;
  amount?: number | null;
  total?: number | null;
  transaction_amount?: number | null;
  price?: number | null;
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
      console.warn(
        "Traffic locations lookup failed; continuing without filter",
        locationError,
      );
    }

    const managedLocations: TrafficLocation[] = locationError
      ? []
      : ((locationRows ?? []) as LocationRow[])
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
    const { data, error } = await this.client
      .from("transactions")
      .select("*")
      .gte("created_at", startIso);

    if (error) {
      throw error;
    }

    return ((data ?? []) as RawTrafficEventRow[])
      .map((row) => ({
        occurredAt: row.created_at ?? "",
        locationId: row.location_id ?? row.LocationID ?? null,
        amount: toSafeNumber(
          row.amount ?? row.total ?? row.transaction_amount ?? row.price,
        ),
      }))
      .filter((row) => Boolean(row.occurredAt));
  }
}
