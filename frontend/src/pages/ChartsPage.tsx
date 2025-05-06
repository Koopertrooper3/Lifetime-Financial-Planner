/* eslint-disable react-hooks/rules-of-hooks */
import "../stylesheets/ChartsPage.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import { useState, useEffect } from "react";
import LoadingWheel from "../components/LoadingWheel";
import { useHelperContext } from "../context/HelperContext";
import { useParams } from "react-router-dom";
import { isDebug, User } from "../debug";
import axios from "axios";
import LineChartProbability from "../components/Charts/LineChartProbability";
import ShadedLineChart from "../components/Charts/ShadedLineChart";
import StackedBarChart from "../components/Charts/StackedBarChart";
import LineChartByParam from "../components/Charts/LineChartByParam";
import MultiLineChart from "../components/Charts/MultiLineChart";
import SurfacePlot from "../components/Charts/SurfacePlot";
import ContourPlot from "../components/Charts/ContourPlot";
import { mockSimulationResults } from "../components/Charts/MockData";
import axiosCookie from "../axiosCookie";
import { ChartData } from "../components/Charts/ChartDataTypes";
import { useProbabilityRangeChartData } from "../hooks/useProbabilityRangeChartData";
import { useStackedBarChartData } from "../hooks/useStackedBarChartData";

function ChartsPage() {
  const { fetchSimulationResults } = useHelperContext();
  const { id } = useParams();
  const [simResults, setSimResults] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = async (id: string) => {
    try {
      const response = await axios.get(`/chart/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError("Failed to load chart metadata.");
      return null;
    }
  };

  useEffect(() => {
    const loadChartData = async () => {
      if (!id) return;
      const data = await fetchChartData(id);
      if (data) setChartData(data);
    };
    loadChartData();
  }, [id]);

  useEffect(() => {
    if (isDebug) {
      console.log("DEBUG MODE: Using mock simulation results.");
      setSimResults(mockSimulationResults);
      return;
    }

    const loadSimulationResults = async () => {
      if (!id) return;
      try {
        const results =await fetchSimulationResults(id);
        setSimResults(results.data);
      } catch (error) {
        console.error("Error fetching simulation results:", error);
        setError("Failed to load simulation results.");
      }
    };
    loadSimulationResults();
  }, [id]);

  if (error) {
    return (
      <div className="error-container">
        <Banner />
        <SideBar />
        <div className="charts-container">
          <h2>Charts</h2>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!simResults) return <LoadingWheel />;

  const { yearlyResults, ranges } = useProbabilityRangeChartData(simResults.probabilityRangeChart ?? []);
  const yearlyBreakdown = useStackedBarChartData(simResults.stackBarChart ?? {}, "average");

  return (
    <div>
      <Banner />
      <SideBar />
      <div className="charts-container">
        <h2>Charts</h2>
        <div className="charts-grid">

          {/* Chart 4.1 */}
          {chartData?.successProbability ? (
            <div className="chart-card">
              <h3>Probability of Success</h3>
              <LineChartProbability probabilities={chartData.successProbability} />
            </div>
          ) : null}

          {/* Chart 4.2 */}
          {simResults.yearlyResults && simResults.ranges ? (
            <div className="chart-card">
              <h3>Shaded Probability Ranges</h3>
              <ShadedLineChart yearlyResults={yearlyResults} ranges={ranges} />
            </div>
          ) : null}

          {/* Chart 4.3 */}
          {yearlyBreakdown ? (
            <div className="chart-card">
              <h3>Investment Breakdown</h3>
              <StackedBarChart yearlyBreakdown={yearlyBreakdown} />
            </div>
          ) : null}

          {/* Chart 5.1 */}
          {simResults.simulationRecords ? (
            <div className="chart-card">
              <h3>Multi-line Chart Over Time</h3>
              <MultiLineChart simulationRecords={simResults.simulationRecords} quantity="totalInvestments" />
            </div>
          ) : null}

          {/* Chart 5.2 */}
          {simResults.simulationRecords ? (
            <div className="chart-card">
              <h3>Line Chart by Parameter</h3>
              <LineChartByParam simulationRecords={simResults.simulationRecords} quantity="totalInvestments" />
            </div>
          ) : null}

          
          {/* Chart 6.1 */}
          {simResults.surfaceData && simResults.param1Values && simResults.param2Values ? (
            <div className="chart-card">
              <h3>3D Surface Plot</h3>
              <SurfacePlot
                surfaceData={simResults.surfaceData}
                param1Values={simResults.param1Values}
                param2Values={simResults.param2Values}
              />
            </div>
          ) : null}

          {/* Chart 6.2 */}
          {simResults.surfaceData && simResults.param1Values && simResults.param2Values ? (
            <div className="chart-card">
              <h3>Contour Plot</h3>
              <ContourPlot
                surfaceData={simResults.surfaceData}
                param1Values={simResults.param1Values}
                param2Values={simResults.param2Values}
              />
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}

export default ChartsPage;
