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
  const { fetchSimulationResults, allScenarios } = useHelperContext();
  const [simResults, setSimResults] = useState<any>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  useEffect(() => {
    if (isDebug) {
      console.log("DEBUG MODE: Using mock simulation results.");
      setSimResults(mockSimulationResults);
      return;
    }

    const loadSimulationResults = async () => {
      if (!selectedScenarioId && allScenarios?.length) {
        setSelectedScenarioId(allScenarios[0]._id);
        return;
      }

      if (selectedScenarioId) {
        const results = await fetchSimulationResults(selectedScenarioId);
        setSimResults(results);
      }
    };

    loadSimulationResults();
  }, [selectedScenarioId, allScenarios]);

  if (!simResults) return <LoadingWheel />;

  return (
    <div>
      <Banner />
      <SideBar />
      <div className="charts-container">
        <h2>Charts</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Probability of Success</h3>
            <LineChartProbability probabilities={simResults.successProbabilities} />
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

