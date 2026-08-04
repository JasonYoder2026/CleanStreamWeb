import { useEffect, useState } from "react";
import { Download, QrCode, X } from "lucide-react";
import QRCode from "qrcode";
import { useLocations } from "../di/container";
import type { CortinaMachineConfig, Machine } from "../interfaces/LocationService";

interface Props { machine: Machine | null; onClose: () => void; onSuccess: () => void; }

export default function CortinaConfigModal({ machine, onClose, onSuccess }: Props) {
  const service = useLocations();
  const [config, setConfig] = useState<CortinaMachineConfig | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const next = machine?.cortina_machine_config ?? null;
    setConfig(next ? { ...next } : null);
    setQrDataUrl(""); setError("");
  }, [machine]);
  if (!machine || !config) return null;

  const payUrl = `https://cleanstreamlaundry.com/pay?machine=${config.public_machine_token}`;
  const preview = async () => setQrDataUrl(await QRCode.toDataURL(payUrl, { width: 520, margin: 2, errorCorrectionLevel: "H" }));
  const save = async () => {
    setError("");
    const canEnable = Boolean((config.nayax_terminal_id || config.nayax_uniqr) && config.pulse_line_number);
    if (config.is_enabled && !canEnable) { setError("A terminal ID or UniQR and pulse line are required before enabling."); return; }
    const result = await service.saveCortinaConfig({ ...config, review_required: !canEnable });
    if (result) { setError(result); return; }
    onSuccess(); onClose();
  };
  const text = (value: string) => value.trim() || null;

  return <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}><div className="modal-card cortina-config-modal">
    <div className="top-section"><div><p>Cortina setup</p><span>{machine.Name}</span></div><button onClick={onClose} aria-label="Close Cortina setup"><X /></button></div>
    {error && <p className="inline-error">{error}</p>}
    <div className="modal-form">
      <div className="form-row"><div className="form-group"><label className="form-label" htmlFor="terminalId">Terminal ID</label><input className="form-input" id="terminalId" value={config.nayax_terminal_id ?? ""} onChange={(e) => setConfig({ ...config, nayax_terminal_id: text(e.target.value) })} /></div><div className="form-group"><label className="form-label" htmlFor="pulseLine">Pulse line</label><input className="form-input" id="pulseLine" type="number" min="1" value={config.pulse_line_number ?? ""} onChange={(e) => setConfig({ ...config, pulse_line_number: Number(e.target.value) || null })} /></div></div>
      <div className="form-group"><label className="form-label" htmlFor="uniQr">Nayax UniQR (optional)</label><input className="form-input" id="uniQr" value={config.nayax_uniqr ?? ""} onChange={(e) => setConfig({ ...config, nayax_uniqr: text(e.target.value) })} /></div>
      <div className="form-row"><div className="form-group"><label className="form-label" htmlFor="environment">Environment</label><select className="form-select" id="environment" value={config.environment} onChange={(e) => setConfig({ ...config, environment: e.target.value as "sandbox" | "production" })}><option value="sandbox">Sandbox</option><option value="production">Production</option></select></div><label className="config-toggle"><input type="checkbox" checked={config.is_enabled} onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })} />Enable payments</label></div>
    </div>
    <div className="qr-tools"><button className="btn-cancel" onClick={preview}><QrCode />Preview QR</button>{qrDataUrl && <><img src={qrDataUrl} alt={`Payment QR for ${machine.Name}`} /><a className="btn-submit" href={qrDataUrl} download={`${machine.Name.replaceAll(" ", "-")}-CleanStream-QR.png`}><Download />Download</a></>}</div>
    <div className="modal-actions"><button className="btn-cancel" onClick={onClose}>Cancel</button><button className="btn-submit" onClick={save}>Save setup</button></div>
  </div></div>;
}
