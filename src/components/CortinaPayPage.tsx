import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, CreditCard, LoaderCircle, WalletCards, WashingMachine } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useCortinaVend } from "../di/container";
import type { CortinaQuote, CortinaVendReference } from "../interfaces/CortinaVendService";
import icon from "../assets/Icon-web.png";
import "../styles/CortinaPay.css";

const TERMINAL_FAILURES = new Set(["failed", "refunded", "timed_out", "support_required", "voided"]);

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function CortinaPayPage() {
  const service = useCortinaVend();
  const [params] = useSearchParams();
  const machineToken = params.get("machine") ?? undefined;
  const uniQr = params.get("uniqr") ?? undefined;
  const returningReference = useMemo<CortinaVendReference | null>(() => {
    const sessionId = params.get("session");
    const accessToken = params.get("access");
    return sessionId && accessToken ? { sessionId, accessToken } : null;
  }, [params]);
  const [quote, setQuote] = useState<CortinaQuote | null>(null);
  const [amountCents, setAmountCents] = useState(150);
  const [signedIn, setSignedIn] = useState(false);
  const [isWasherVend, setIsWasherVend] = useState<boolean | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "paying" | "pending" | "started" | "failed">("loading");
  const [message, setMessage] = useState("");
  const cardRequestId = useRef<string | null>(null);
  const walletRequestId = useRef<string | null>(null);

  const pollVend = useCallback(async (reference: CortinaVendReference, isCancelled = () => false) => {
    setState("pending");
    for (let attempt = 0; attempt < 35 && !isCancelled(); attempt += 1) {
      const vend = await service.status(reference);
      setIsWasherVend(vend.dryer_minutes == null);
      if (vend.status === "started") {
        setState("started");
        return;
      }
      if (TERMINAL_FAILURES.has(vend.status)) {
        setMessage(vend.failure_message ?? "The machine could not be started. Your payment will be returned when required.");
        setState("failed");
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }
    if (!isCancelled()) {
      setMessage("The payment was received, but the machine is still responding. Keep this page open or contact the location for help.");
      setState("pending");
    }
  }, [service]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setSignedIn(await service.hasSession());
        if (returningReference) {
          await pollVend(returningReference, () => cancelled);
          return;
        }
        if (!machineToken && !uniQr) throw new Error("This QR code does not identify a machine.");
        const nextQuote = await service.quote(machineToken, uniQr);
        if (cancelled) return;
        setQuote(nextQuote);
        setAmountCents(nextQuote.dryer?.defaultCents ?? nextQuote.amountCents);
        setState("ready");
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Unable to load this machine.");
          setState("failed");
        }
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [machineToken, pollVend, returningReference, service, uniQr]);

  const payByCard = async () => {
    try {
      setState("paying");
      cardRequestId.current ??= crypto.randomUUID();
      const checkout = await service.createCard(machineToken, uniQr, amountCents, cardRequestId.current);
      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Card payment could not be started.");
      setState("failed");
    }
  };

  const payByWallet = async () => {
    try {
      setState("paying");
      walletRequestId.current ??= crypto.randomUUID();
      const reference = await service.payWithWallet(machineToken, uniQr, amountCents, walletRequestId.current);
      await pollVend(reference);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wallet payment could not be completed.");
      setState("failed");
    }
  };

  const dryerMinutes = quote?.dryer ? (amountCents / quote.dryer.incrementCents) * quote.dryer.minutesPerIncrement : null;

  return (
    <main className="cortina-pay-shell">
      <header className="cortina-pay-header">
        <img src={icon} alt="" />
        <strong>Clean Stream Laundry</strong>
      </header>
      <section className="cortina-pay-panel" aria-live="polite">
        {state === "loading" && <div className="cortina-state"><LoaderCircle className="spin" /><h1>Loading machine</h1></div>}
        {state === "paying" && <div className="cortina-state"><LoaderCircle className="spin" /><h1>Securing payment</h1></div>}
        {state === "pending" && <div className="cortina-state"><Clock3 /><h1>Starting machine</h1><p>{message || "Payment received. Waiting for the machine to confirm."}</p></div>}
        {state === "started" && <div className="cortina-state success"><CheckCircle2 /><h1>Machine started</h1><p>{(quote ? quote.machineType === "washer" : isWasherVend) ? "Select your wash cycle on the machine." : "Your purchased time has been added."}</p></div>}
        {state === "failed" && <div className="cortina-state failed"><WashingMachine /><h1>Unable to continue</h1><p>{message}</p></div>}
        {state === "ready" && quote && (
          <>
            <div className="cortina-machine-heading">
              <WashingMachine />
              <div><p>{quote.machineType === "washer" ? quote.washerSizeLabel ?? "Washer" : "Dryer"}</p><h1>{quote.machineName}</h1></div>
            </div>
            {quote.dryer ? (
              <div className="dryer-price-control">
                <div><strong>{money(amountCents)}</strong><span>{dryerMinutes} minutes</span></div>
                <input aria-label="Dryer amount" type="range" min={quote.dryer.minimumCents} max={quote.dryer.maximumCents} step={quote.dryer.incrementCents} value={amountCents} onChange={(event) => {
                  cardRequestId.current = null;
                  walletRequestId.current = null;
                  setAmountCents(Number(event.target.value));
                }} />
                <div className="dryer-range"><span>{money(quote.dryer.minimumCents)}</span><span>{money(quote.dryer.maximumCents)}</span></div>
              </div>
            ) : (
              <div className="washer-price"><span>Total</span><strong>{money(amountCents)}</strong><p>Choose temperature and cycle settings on the washer after it starts.</p></div>
            )}
            <div className="cortina-payment-actions">
              <button onClick={payByCard}><CreditCard />Pay with card</button>
              {signedIn && <button className="secondary" onClick={payByWallet}><WalletCards />Use Clean Stream wallet</button>}
            </div>
            {!signedIn && <p className="loyalty-note">Use the Clean Stream Loyalty app next time to pay with your wallet and manage rewards.</p>}
          </>
        )}
      </section>
      <footer>Secure payment by Clean Stream Laundry</footer>
    </main>
  );
}

export default CortinaPayPage;
