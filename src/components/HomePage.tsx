import { useState, useRef, useEffect } from "react";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

function HomePage() {
  return (
    <div className="app-container">
      <TopBar />
      <SideBar />
    </div>
  );
}

export default HomePage;
