import SideBar from "./SideBar";
import TopBar from "./TopBar";
import { Outlet } from "react-router-dom";
import "../styles/homePage.css";


function HomePage() {
  return (
    <div className="app-container">
      <TopBar />
      <div className="content">
        <SideBar />
        <Outlet />
      </div>
    </div>
  );
}

export default HomePage;
