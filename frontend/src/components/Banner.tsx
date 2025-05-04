import { Link } from "react-router-dom";
import "../stylesheets/Banner.css";
import axiosCookie from "../axiosCookie";

const Banner = () => {
  const logout = async function(){
    try{
      await axiosCookie.post("/logout");
      window.location.href = "/";
    }
    catch(err){
      console.error("Error logging out", err)
    }
  }

  return (
    <div className="banner">
      <div className="flexbox-container">
        <Link to="/user-profile" className="button">
          User
        </Link>
        <button onClick={logout} className="button">Logout</button>
      </div>
    </div>
  );
};

export default Banner;