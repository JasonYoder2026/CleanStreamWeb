import { Link, Outlet } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import icon from "../assets/Icon-web.png";
import "../styles/PublicSite.css";

function PublicLayout() {
  return (
    <div className="public-site-shell">
      <header className="public-header">
        <Link className="public-brand" to="/" aria-label="Clean Stream Laundry home">
          <img src={icon} alt="" />
          <span>Clean Stream Laundry</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link to="/#services">Services</Link>
          <Link to="/#locations">Locations</Link>
          <Link className="public-support-link" to="/support">Support</Link>
        </nav>
      </header>

      <Outlet />

      <footer className="public-footer">
        <div className="public-footer-main">
          <div>
            <Link className="public-brand public-footer-brand" to="/">
              <img src={icon} alt="" />
              <span>Clean Stream Laundry</span>
            </Link>
            <p>Simple payments, dependable machines, and a cleaner laundry day.</p>
          </div>
          <div>
            <strong>Get in touch</strong>
            <a href="tel:+17656102114"><Phone /> (765) 610-2114</a>
            <a href="mailto:jacob@cleanstreamlaundry.com"><Mail /> jacob@cleanstreamlaundry.com</a>
          </div>
          <div>
            <strong>Company</strong>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/account-deletion">Delete account</Link>
          </div>
        </div>
        <div className="public-footer-bottom">
          <span>Clean Stream Laundry Solutions LLC</span>
          <span>&copy; {new Date().getFullYear()} Clean Stream Laundry</span>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
