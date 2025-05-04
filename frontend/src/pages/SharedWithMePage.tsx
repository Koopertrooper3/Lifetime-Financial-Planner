import "../stylesheets/DashboardPage.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import { useState, useEffect } from "react";
import LoadingWheel from "../components/LoadingWheel";
import axiosCookie from "../axiosCookie";
import { Link } from "react-router-dom";
import { isDebug, User } from "../debug";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Scenario {
  _id: string;
  scenarioID?: string;
  scenario?: {
    _id: string;
    name: string;
    // Add other scenario properties as needed
  };
  // Add other shared scenario properties
}

function SharedWithMePage() {
  const [sharedWithScenarios, setSharedWithScenarios] = useState<Scenario[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isCreatePage = location.pathname.includes("createScenario");

  const getBreadcrumb = () => {
    if (location.pathname.includes("AddNewInvestmentType")) {
      return " > Create Scenario > Add Investment Type";
    } else if (location.pathname.includes("AddNewEventSeries")) {
      return " > Create Scenario > Add Event Series";
    } else if (location.pathname.includes("createScenario")) {
      return " > Create Scenario";
    }
    return "";
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (isDebug) {
          console.log("DEBUG MODE: Using mock data");
          setUserData({
            _id: "guest-id-123",
            name: "Guest",
            email: "guest@example.com",
            ownedScenarios: [],
          });
          setSharedWithScenarios([
            { 
              _id: "1", 
              scenarioID: "1",
              scenario: {
                _id: "1",
                name: "Mock Shared Scenario 1"
              }
            },
            { 
              _id: "2",
              scenarioID: "2",
              scenario: {
                _id: "2",
                name: "Mock Shared Scenario 2"
              }
            }
          ]);
          setLoading(false);
          return;
        }

        // Fetch user data first
        const userResponse = await axiosCookie.get("/user");
        setUserData(userResponse.data);

        // Fetch shared scenarios
        const sharedResponse = await axiosCookie.post("/scenario/getShareScenarios", {
          userID: userResponse.data.user._id
        });

        // Process scenarios in parallel
        const enrichedScenarios = await Promise.all(
          sharedResponse.data.sharedScenarios.map(async (scenario: any) => {
            try {
              const scenarioResponse = await axiosCookie.get(`/scenario/${scenario.scenarioID}`);
              return {
                ...scenario,
                scenario: scenarioResponse.data.data
              };
            } catch (error) {
              console.error(`Error fetching scenario ${scenario.scenarioID}:`, error);
              return scenario; // Return original if error occurs
            }
          })
        );

        setSharedWithScenarios(enrichedScenarios);
        console.log(enrichedScenarios)
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || userData == null) {
    return <LoadingWheel />;
  }

  return (
    <motion.div>
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
            {sharedWithScenarios.length > 0 ? (
              sharedWithScenarios.map((scenario) => (
                scenario?.scenario?.name && (
                  <Link
                    key={scenario._id}
                    to={`/sharedScenario/${scenario._id}`}
                    className="scenario-card"
                    state={{
                      scenario: scenario
                    }}
                  >
                    {scenario.scenario.name}
                  </Link>
                )
              ))
            ) : (
              <div className="no-scenarios">No scenarios shared with you yet</div>
            )}
          </div>
        )}

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