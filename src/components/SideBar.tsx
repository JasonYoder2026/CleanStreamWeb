import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/sideBar.css";
import {
  ArrowBigLeft,
  ArrowBigRight,
  Landmark,
  Map,
  Settings,
    LogOut
} from "lucide-react";
import { useAuth } from "../di/container";
import { useNavigate } from "react-router-dom";  // add useNavigate here

function SideBar() {
  const [showSideBar, setShowSideBar] = useState(false);
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

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
          <div className="sidebar-item sign-out" onClick={handleSignOut}>
              <LogOut />
              Sign Out
          </div>
      </div>
    );
  }
}

export default SideBar;
