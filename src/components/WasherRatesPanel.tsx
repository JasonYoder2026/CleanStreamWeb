import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { useLocations } from "../di/container";
import type { WasherSizeRate } from "../interfaces/LocationService";

interface Props { locationId: number; onChanged: () => void; }

const blankRate = (locationId: number): WasherSizeRate => ({
  id: 0, location_id: locationId, size_label: "", capacity_kg: 0,
  price_cents: 0, is_active: true, review_required: false,
});

export default function WasherRatesPanel({ locationId, onChanged }: Props) {
  const service = useLocations();
  const [rates, setRates] = useState<WasherSizeRate[]>([]);
  const [draft, setDraft] = useState(blankRate(locationId));
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setRates(await service.getWasherSizeRates(locationId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load washer rates.");
    }
  };
  useEffect(() => { setDraft(blankRate(locationId)); void load(); }, [locationId]);

  const save = async (rate: WasherSizeRate) => {
    setError("");
    if (!rate.size_label.trim() || rate.capacity_kg <= 0 || rate.price_cents <= 0) {
      setError("Enter a size label, capacity, and price."); return;
    }
    const result = await service.saveWasherSizeRate({ ...rate, review_required: false });
    if (result) { setError(result); return; }
    setDraft(blankRate(locationId));
    await load();
    onChanged();
  };

  const field = (rate: WasherSizeRate, key: keyof WasherSizeRate, value: string | boolean) => {
    const parsed = key === "capacity_kg" || key === "price_cents" ? Number(value) : value;
    if (rate.id === 0) setDraft({ ...rate, [key]: parsed });
    else setRates((current) => current.map((item) => item.id === rate.id ? { ...item, [key]: parsed } : item));
  };

  const row = (rate: WasherSizeRate) => (
    <div className="rate-row" key={rate.id || "new"}>
      <input aria-label="Size label" value={rate.size_label} placeholder="e.g. Large" onChange={(e) => field(rate, "size_label", e.target.value)} />
      <input aria-label="Capacity kg" type="number" min="1" value={rate.capacity_kg || ""} placeholder="kg" onChange={(e) => field(rate, "capacity_kg", e.target.value)} />
      <div className="price-input"><span>$</span><input aria-label="Price" type="number" min="0.25" step="0.25" value={rate.price_cents ? rate.price_cents / 100 : ""} onChange={(e) => field(rate, "price_cents", String(Math.round(Number(e.target.value) * 100)))} /></div>
      <label className="active-toggle"><input type="checkbox" checked={rate.is_active} onChange={(e) => field(rate, "is_active", e.target.checked)} />Active</label>
      <button className="icon-action" aria-label={rate.id ? `Save ${rate.size_label}` : "Add washer rate"} title="Save rate" onClick={() => save(rate)}>{rate.id ? <Check /> : <Plus />}</button>
    </div>
  );

  return <section className="rate-section"><div className="rate-heading"><div><h2>Washer size rates</h2><p>New quotes use these location prices.</p></div></div>{error && <p className="inline-error">{error}</p>}<div className="rate-list">{rates.map(row)}{row(draft)}</div></section>;
}
