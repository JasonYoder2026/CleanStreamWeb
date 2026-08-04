import { ArrowRight, Clock3, MapPin, QrCode, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import hero from "../assets/laundromat-hero.jpg";

function PublicHomePage() {
  return (
    <main>
      <section className="public-hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="public-hero-shade" />
        <div className="public-hero-content">
          <p className="public-eyebrow">Where freshness flows</p>
          <h1>Clean Stream Laundry</h1>
          <p>Fast, straightforward laundry with secure mobile payments and dependable local support.</p>
          <div className="public-hero-actions">
            <a className="public-button" href="#locations">Find a location <ArrowRight /></a>
            <Link className="public-button public-button-secondary" to="/support">Get support</Link>
          </div>
        </div>
      </section>

      <section className="public-band public-intro" id="services">
        <div className="public-section-heading">
          <p className="public-eyebrow">Built for laundry day</p>
          <h2>Everything you need, without the extra steps</h2>
        </div>
        <div className="public-feature-grid">
          <article>
            <QrCode />
            <h3>Scan and start</h3>
            <p>Scan the Clean Stream code on a machine, confirm the price, and pay securely from your phone.</p>
          </article>
          <article>
            <WalletCards />
            <h3>Pay your way</h3>
            <p>Use a card in your browser or the Clean Stream wallet when you are signed into the app.</p>
          </article>
          <article>
            <ShieldCheck />
            <h3>Clear status</h3>
            <p>See when payment is accepted, the machine is starting, and the vend has completed.</p>
          </article>
        </div>
      </section>

      <section className="public-band public-pay-band">
        <div>
          <p className="public-eyebrow">One scan. One payment.</p>
          <h2>Start from the app or your camera</h2>
          <p>The same machine QR opens Clean Stream when it is installed and a secure browser payment when it is not. Washer pricing is based on machine size; dryer time is selected before payment.</p>
        </div>
        <div className="public-flow" aria-label="Payment steps">
          <span><b>1</b>Scan the machine QR</span>
          <span><b>2</b>Review and pay</span>
          <span><b>3</b>Start your cycle</span>
        </div>
      </section>

      <section className="public-band public-locations" id="locations">
        <div className="public-location-copy">
          <MapPin />
          <p className="public-eyebrow">Local laundry, made easier</p>
          <h2>Find your nearest Clean Stream</h2>
          <p>Location details, directions, hours, and current machine information are available in the Clean Stream app.</p>
        </div>
        <div className="public-hours">
          <Clock3 />
          <div>
            <strong>Customer support</strong>
            <span>Monday-Friday, 9:00 AM-5:00 PM ET</span>
            <a href="tel:+17656102114">(765) 610-2114</a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PublicHomePage;
