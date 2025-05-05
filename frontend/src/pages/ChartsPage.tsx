import "../stylesheets/ChartsPage.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import { useState, useEffect } from "react";
import LoadingWheel from "../components/LoadingWheel";
import { useHelperContext } from "../context/HelperContext";
import { useParams } from "react-router-dom";
import { isDebug, User } from "../debug";

import LineChartProbability from "../components/Charts/LineChartProbability";
import ShadedLineChart from "../components/Charts/ShadedLineChart";
import StackedBarChart from "../components/Charts/StackedBarChart";
import { mockSimulationResults } from "../components/Charts/MockData";

function ChartsPage() {
  // console.log("allScenarios", allScenarios);
  const { fetchSimulationResults, ownedScenarios } = useHelperContext();
  const [simResults, setSimResults] = useState<any>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null
  );
  const [chartData, setChartData] = useState<{
    probabilityRange?: any;
    stackBarData?: any;
    successProbability?: any;
  }>({});

  const { chartID } = useParams();

  useEffect(() => {
    console.log(chartData);
  }, [chartData]);

  const fetchChartData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/chart/${chartID}`);

      const data = await res.json();
      setChartData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchChartData;
  }, [chartID]);

  useEffect(() => {
    if (isDebug) {
      console.log("DEBUG MODE: Using mock simulation results.");
      setSimResults(mockSimulationResults);
      return;
    }

    const loadSimulationResults = async () => {
      if (!selectedScenarioId && ownedScenarios?.length) {
        // setSelectedScenarioId(ownedScenarios[0]._id);
        return;
      }

      if (selectedScenarioId) {
        const results = await fetchSimulationResults(selectedScenarioId);
        setSimResults(results);
      }
    };

    loadSimulationResults();
  }, [selectedScenarioId, ownedScenarios]);

  if (!chartData) return <LoadingWheel />;

  return (
    <div>
      <Banner />
      <SideBar />
      <div className="charts-container">
        <h2>Charts</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Probability of Success</h3>
            <LineChartProbability
              probabilities={chartData.successProbability}
            />
          </div>

          <div className="chart-card">
            <h3>Shaded Probability Ranges</h3>
            <ShadedLineChart
              yearlyResults={simResults.yearlyResults}
              ranges={simResults.ranges}
            />
          </div>

          <div className="chart-card">
            <h3>Investment Breakdown</h3>
            <StackedBarChart yearlyBreakdown={simResults.yearlyBreakdown} />
          </div>

          <div className="chart-card">
            <h3>Chart 4 (Placeholder)</h3>
            <span className="chart-card-text">Future Chart</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartsPage;
