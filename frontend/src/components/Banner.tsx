import { Link } from "react-router-dom";
import "../stylesheets/Banner.css";

const Banner = () => {
  return (
    <div className="banner">
      <div className="flexbox-container">
        <Link to="/user-profile" className="button">
          User
        </Link>
        <button className="button">Logout</button>
      </div>
    </div>
  );
};

export default Banner;