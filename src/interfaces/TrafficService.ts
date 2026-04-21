export interface TrafficEvent {
  occurredAt: string;
  locationId: number | null;
  amount: number;
}

export interface TrafficLocation {
  id: number;
  name: string;
}

export interface TrafficDashboardSeed {
  managedLocations: TrafficLocation[];
  events: TrafficEvent[];
}

export interface TrafficService {
  getTrafficDashboardSeed(startIso: string): Promise<TrafficDashboardSeed>;
}
