import "../stylesheets/ChartsPage.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import { useState, useEffect } from "react";
import LoadingWheel from "../components/LoadingWheel";
import axios from "axios";
import { useHelperContext } from "../HelperContext";
import { isDebug, User } from "../debug";

import LineChartProbability from "../components/Charts/LineChartProbability";
import ShadedLineChart from "../components/Charts/ShadedLineChart";
import StackedBarChart from "../components/Charts/StackedBarChart";
import { mockSimulationResults } from "../components/Charts/MockData"; 


function ChartsPage() {
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
          console.log("DEBUG MODE: Injecting mock user data.");
          const mockUser: User = {
            _id: "mockuserid123",
            name: "Mock User",
            email: "mockuser@example.com",
            ownedScenarios: ["scenario1", "scenario2"],
          };
          setUserData(mockUser);
          return;
        }
    
        try {
          const response = await axios.get(fullBackendUrl + "/user", {
            withCredentials: true,
          });
          setUserData(response.data);
        } catch (err) {
          console.log("error fetching user data");
        }
      };
      fetchUserData();
    }, []);    

    return (
      userData == null ? (
        <LoadingWheel />
      ) : (
        <div>
          <Banner />
          <SideBar />
          <div className="charts-container">
            <h2>Charts (WIP) </h2>
    
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Probability of Success</h3>
                <LineChartProbability
                  years={(userData.simulationResults?.years ?? mockSimulationResults.years)}
                  successRates={(userData.simulationResults?.successRates ?? mockSimulationResults.successRates)}
                />
              </div>
    
              <div className="chart-card">
                <h3>Shaded Probability Ranges</h3>
                <ShadedLineChart
                  years={(userData.simulationResults?.years ?? mockSimulationResults.years)}
                  medianValues={(userData.simulationResults?.medianValues ?? mockSimulationResults.medianValues)}
                  ranges={(userData.simulationResults?.ranges ?? mockSimulationResults.ranges)}
                />
              </div>
    
              <div className="chart-card">
                <h3>Investment Breakdown</h3>
                <StackedBarChart
                  data={(userData.simulationResults?.stackedBarData ?? mockSimulationResults.stackedBarData)}
                />
              </div>
    
              <div className="chart-card">
                <h3> Chart 4 (Placeholder)</h3>
                <span className="chart-card-text">Future Chart</span>
              </div>
            </div>
          </div>
        </div>
      )
    );    
}

export default ChartsPage;

