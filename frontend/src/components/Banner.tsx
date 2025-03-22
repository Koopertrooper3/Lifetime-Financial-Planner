import "react";
import "../stylesheets/Banner.css";

const Banner = () => {
  return (
    <div className="banner">
      <div className="flexbox-container">
        <button className="button">User</button>
        <button className="button">Logout</button>
      </div>
    </div>
  );
};

export default Banner;
