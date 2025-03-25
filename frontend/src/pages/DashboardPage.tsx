import "../stylesheets/DashboardPage.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import AddPlan from "../components/AddPlan";
import { useState, useEffect } from "react";
import LoadingWheel from "../components/LoadingWheel";
import axios from "axios";
import { useHelperContext } from "../HelperContext";
import { Link } from "react-router-dom";

function DashboardPage() {
  const { allScenarios } = useHelperContext();
  const [userData, setUserData] = useState(null);
  // const [allScenarios, setAllScenarios] = useState([]);

  const fullBackendUrl =
    "http://" +
    import.meta.env.VITE_BACKEND_IP +
    ":" +
    import.meta.env.VITE_BACKEND_PORT;

  useEffect(() => {
    try {
      const fetchUserData = async () => {
        const response = await axios.get(fullBackendUrl + "/user", {
          withCredentials: true,
        });
        console.log(response.data);
        setUserData(response.data);
      };
      fetchUserData();
    } catch (err) {
      console.log("error fetching user data");
    }
  }, []);

  // useEffect(() => {
  //   const fetchScenarios = async () => {
  //     const data = await fetchAllScenarios();
  //     setAllScenarios(data);
  //   };
  //   fetchScenarios();
  // }, []);

  return userData == null ? (
    <LoadingWheel />
  ) : (
    <div>
      <Banner />
      <SideBar />
      <div className="dashboard-container">
        <AddPlan />
        {allScenarios &&
          allScenarios.map((scenario: any) => (
            <Link
              key={scenario._id}
              to={`/scenario/${scenario._id}`}
              className="scenario-card"
            >
              {scenario.name}
            </Link>
          ))}
      </div>
    </div>
  );
}

export default DashboardPage;
