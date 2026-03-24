import { useState } from "react";
import "../styles/sideBar.css";

function SideBar() {
  const [showSideBar, setShowSideBar] = useState(false);
  if (showSideBar == false) {
    return (
      <div className="closed-side-bar">
        <div className="side-bar-button" onClick={() => setShowSideBar(true)}>
          X
        </div>
      </div>
    );
  } else {
    return (
      <div className="side-bar-container">
        <div onClick={() => setShowSideBar(false)}>X</div>
        <div>Refunds</div>
        <div>Locations</div>
        <div>Settings</div>
      </div>
    );
  }
}

export default SideBar;
