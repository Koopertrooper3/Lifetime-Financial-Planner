import "../stylesheets/DashboardPage.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import AddPlan from "../components/AddPlan";
import { useState, useEffect } from "react";
import LoadingWheel from "../components/LoadingWheel";
import axios from "axios";
import { useHelperContext } from "../HelperContext";
import { Link } from "react-router-dom";
import { isDebug, User } from "../debug"; 
// NOTE: To use debug, create an .env file with this line:
// export const isDebug = import.meta.env.VITE_DEBUG_MODE === "true";
// VITE_DEBUG_MODE=true
// VITE_BACKEND_IP=localhost
// VITE_BACKEND_PORT=8000


console.log("VITE_DEBUG_MODE:", import.meta.env.VITE_DEBUG_MODE);
console.log("VITE_BACKEND_IP:", import.meta.env.VITE_BACKEND_IP);
console.log("VITE_BACKEND_PORT:", import.meta.env.VITE_BACKEND_PORT);

console.log("backend url test:", import.meta.env.VITE_BACKEND_IP, import.meta.env.VITE_BACKEND_PORT);
console.log("isDebug:", isDebug);

function DashboardPage() {
  const { allScenarios } = useHelperContext();
  const [userData, setUserData] = useState<User | null>(null);

  const fullBackendUrl =
    "http://" +
    import.meta.env.VITE_BACKEND_IP +
    ":" +
    import.meta.env.VITE_BACKEND_PORT;

  useEffect(() => {
    const fetchUserData = async () => {
      if (isDebug) {
        console.log("DEBUG MODE: Using mock user data");
        setUserData({
          _id: "guest-id-123",
          name: "Guest",
          email: "guest@example.com",
          ownedScenarios: [], // Or include mock scenario IDs
        });
        console.log("DEBUG MODE: Mock user data set.");
        return;
      }

      try {
        const response = await axios.get(fullBackendUrl + "/user", {
          withCredentials: true,
        });
        console.log(response.data);
        setUserData(response.data);
      } catch (err) {
        console.error("error fetching user data", err);
      }
    };

    fetchUserData();
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
          {allScenarios?.map((scenario) => (
            <Link key={scenario._id} to={`/scenario/${scenario._id}`} className="scenario-card">
              {scenario.name}
            </Link>
          ))}

      </div>
    </div>
  );
}

export default DashboardPage;
