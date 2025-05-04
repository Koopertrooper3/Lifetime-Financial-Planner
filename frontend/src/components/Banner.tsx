import { Link } from "react-router-dom";
import "../stylesheets/Banner.css";
import axiosCookie from "../axiosCookie";
import { useHelperContext } from "../context/HelperContext";

const Banner = () => {
  const { userAuthenticated, setUserAuthenticated } = useHelperContext();

  const logout = async function(){
    try{
      await axiosCookie.post("/logout");
      window.location.href = "/";
      setUserAuthenticated(false);
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
        {
          userAuthenticated ? 
          <button onClick={logout} className="button">Logout</button>
          :
          <></>
        }
      </div>
    </div>
  );
};

export default Banner;