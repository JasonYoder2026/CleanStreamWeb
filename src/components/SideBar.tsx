import { useState } from "react";
import "../styles/sideBar.css";
import { Menu, ArrowBigLeft, Landmark, Map, Settings } from "lucide-react";

function SideBar() {
  const [showSideBar, setShowSideBar] = useState(false);
  if (showSideBar == false) {
    return (
      <div className="closed-side-bar">
        <div className="side-bar-button" onClick={() => setShowSideBar(true)}>
          <Menu color="#000000"/>
        </div>
      </div>
    );
  } else {
    return (
      <div className="side-bar-container">
        <div onClick={() => setShowSideBar(false)}><ArrowBigLeft color="#000000"/></div>
        <div><Landmark color="#000000" />Refunds</div>
        <div><Map color="#000000"/>Locations</div>
        <div><Settings color="#000000"/>Settings</div>
      </div>
    );
  }
}

export default SideBar;
