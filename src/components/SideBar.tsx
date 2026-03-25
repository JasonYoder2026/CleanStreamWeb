import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/sideBar.css";
import {
  ArrowBigLeft,
  ArrowBigRight,
  Landmark,
  Map,
  Settings,
} from "lucide-react";

function SideBar() {
  const [showSideBar, setShowSideBar] = useState(false);
  if (showSideBar == false) {
    return (
      <div className="closed-side-bar" onClick={() => setShowSideBar(true)}>
        <ArrowBigRight />
      </div>
    );
  } else {
    return (
      <div className="side-bar-container">
        <div  className="sidebar-item" onClick={() => setShowSideBar(false)}>
          <ArrowBigLeft />
        </div>
        <Link to="/home/refunds" className="sidebar-item">
          <Landmark />
          Refunds
        </Link>
        <Link to='/home/locations' className="sidebar-item">
          <Map />
          Locations
        </Link>
        <Link to='/home/settings' className="sidebar-item">
          <Settings />
          Settings
        </Link>
      </div>
    );
  }
}

export default SideBar;
