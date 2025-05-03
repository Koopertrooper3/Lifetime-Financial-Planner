import "../stylesheets/DashboardPage.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import AddPlan from "../components/AddPlan";
import { useState, useEffect } from "react";
import LoadingWheel from "../components/LoadingWheel";
import axiosCookie from "../axiosCookie";
import { useHelperContext } from "../HelperContext";
import { Link } from "react-router-dom";
import { isDebug, User } from "../debug"; 
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";


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

function SharedWithMePage() {
  const { sharedWithScenarios } = useHelperContext();
  const [userData, setUserData] = useState<User | null>(null);
  const location = useLocation();
  const isCreatePage = location.pathname.includes("createScenario"); 
  const getBreadcrumb = () => {
    if (location.pathname.includes("AddNewInvestmentType")) {
      return " > Create Scenario > Add Investment Type";
    } else if (location.pathname.includes("AddNewEventSeries")) {
      return " > Create Scenario > Add Event Series";
    } else if (location.pathname.includes("createScenario")) {
      return " > Create Scenario";
    } else {
      return "";
    }
  };
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

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
          ownedScenarios: [], // NOTE: include mock scenario IDs
        });
        console.log("DEBUG MODE: Mock user data set.");
        return;
      }

      try {
        const response = await axiosCookie.get("/user");
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
    
    <motion.div
      // initial={{ x: 0 }}
      // animate={{ x: 0 }}
      // exit={{ x: -window.innerWidth }}
      // transition={{ duration: 0.3 }}
    >
      <Banner />
      <SideBar />
      <div style={{ marginLeft: "320px", padding: "24px" }}>

      <div className="dashboard-title">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          Shared With Me
        </motion.span>
        <motion.span
          key={location.pathname}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {getBreadcrumb()}
        </motion.span>
      </div>
        {!isCreatePage && (
          <div className="dashboard-container">
            {sharedWithScenarios?.map((scenario) => (
              <Link
                key={scenario._id}
                to={`/scenario/${scenario._id}`}
                className="scenario-card"
              >
                {scenario.name}
              </Link>
            ))}
          </div>
        )}
  
        {/* Animated nested route transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      
      </div>
    </motion.div>
  );
    
}

export default SharedWithMePage;
