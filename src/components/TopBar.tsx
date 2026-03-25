import { Link } from "react-router-dom";
import "../styles/topBar.css";

function TopBar() {
  return (
    <Link to="/home">
    <div className="top-bar-container">
      <div className="image-container">
        <img src="\src\assets\Icon.png" alt="clean stream icon" />
        <img
          src="\src\assets\Slogan.png"
          alt="clean stream laundry solutions slogan"
        />
      </div>
    </div>
    </Link>
  );
}

export default TopBar;
