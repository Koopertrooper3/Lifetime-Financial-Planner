import "../stylesheets/Dashboard.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import AddPlan from "../components/AddPlan";
import { useState, useEffect } from 'react';
import LoadingWheel from "../components/LoadingWheel";
import axios from 'axios';

function DashboardPage() {
  const [ userData, setUserData ] = useState(null);
  const fullBackendUrl = "http://" + import.meta.env.VITE_BACKEND_IP + ":" + import.meta.env.VITE_BACKEND_PORT;

  useEffect(()=>{
    try{
      const fetchUserData = async() => {
        const response = await axios.get(fullBackendUrl + "/user", {
          withCredentials: true
        });
        console.log(response.data);
        setUserData(response.data);
      }
      fetchUserData();
    }
    catch (err){
      console.log("error fetching user data");
    }
  }, []);

  return (
    userData == null ? 
      <LoadingWheel /> 
      :
      <div>
        <Banner />
        <SideBar />
        <div className="dashboard-container">
          <AddPlan />
        </div>
        {/* <CreateScenario></CreateScenario> */}
      </div>
  );
}

export default DashboardPage;
