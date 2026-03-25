import { useState } from "react";
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
        <div onClick={() => setShowSideBar(false)}>
          <ArrowBigLeft />
        </div>
        <div>
          <Landmark />
          Refunds
        </div>
        <div>
          <Map />
          Locations
        </div>
        <div>
          <Settings />
          Settings
        </div>
      </div>
    );
  }
}

export default SideBar;
