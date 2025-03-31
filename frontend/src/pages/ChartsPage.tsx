import "../stylesheets/ChartsPage.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import { useState, useEffect } from "react";
import LoadingWheel from "../components/LoadingWheel";
import axios from "axios";
import { useHelperContext } from "../HelperContext";

function ChartsPage() {
  const { allScenarios } = useHelperContext();
  const [userData, setUserData] = useState(null);

  const fullBackendUrl =
    "http://" +
    import.meta.env.VITE_BACKEND_IP +
    ":" +
    import.meta.env.VITE_BACKEND_PORT;

  useEffect(() => {
    const fetchUserData = async () => {
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

  return userData == null ? (
    <LoadingWheel />
  ) : (
    <div>
      <Banner />
      <SideBar />
      <div className="charts-container">
        <h2>Charts (WIP)</h2>

        <div className="charts-grid">
          {[1, 2, 3, 4].map((num) => (
            <div className="chart-card" key={num}>
              <span className="chart-card-text">Chart {num}</span>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default ChartsPage;

