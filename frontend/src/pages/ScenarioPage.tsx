/* eslint-disable @typescript-eslint/no-explicit-any */
import { useHelperContext } from "../context/HelperContext";
import { useScenarioContext } from "../context/useScenarioContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../stylesheets/ScenarioPage.css";
import { Link } from "react-router-dom";
import axiosCookie from "../axiosCookie";
import ExportScenario from "../components/ExportScenario";
import ShareScenarioButton from "../components/ShareScenarioButton";

export default function ScenarioPage() {
  const { id } = useParams();
  const [scenario, setScenario] = useState<any>(null);
  const { ownedScenarios, fetchScenario, fetchUser, userID } =
    useHelperContext();
  const { setEditScenario } = useScenarioContext();
  const [activeTab, setActiveTab] = useState("investments");
  const [numberOfSimulations, setNumberOfSimulations] = useState(1);
  const navigate = useNavigate();

  //const [investmentTypes, setInvestmentTypes] = useState<any[]>([]);
  // const [distributionMap, setDistributionMap] = useState<Record<string, any>>(
  //   {}
  // );

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const res = await fetchScenario(id);
      setScenario(res);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!ownedScenarios) return;
    const filteredScenario = ownedScenarios.find(
      (scenario: any) => scenario._id === id
    );
    setScenario(filteredScenario);
  }, []);

  if (!scenario) return <div>Loading....</div>;

  const investments = scenario.investments;
  const investmentTypes = scenario.investmentTypes;
  const eventSeries = scenario.eventSeries;
  const spendingStrategy = scenario.spendingStrategy;
  const expenseWithdrawalStrategy = scenario.expenseWithdrawalStrategy;
  const RMDStrategy = scenario.RMDStrategy;
  const RothConversionStrategy = scenario.RothConversionStrategy;

  const tabs = [
    { id: "investments", label: "Investments" },
    { id: "investmentTypes", label: "Investment Types" },
    { id: "events", label: "Events" },
    { id: "strategies", label: "Strategies" },
    { id: "simulation", label: "Simulation" },
  ];
  const sendSimulatorRequest = async () => {
    if (userID == null) {
      throw new Error("Undefined user");
    }
    const simResponse = await axiosCookie.post("/simulation/run-simulation", {
      userID: userID._id,
      scenarioID: id,
      totalSimulations: numberOfSimulations,
    });

    await axiosCookie.post("/simulation/run-simulation/poll", {
      id : simResponse.data
    });
    const chartID = userID._id+id+numberOfSimulations
    navigate('/chartsPage/'+chartID)
  };

  function handleEditClick() {
    setEditScenario(scenario); // Store the scenario
  }

  return (
    <div className="scenario-container">
      <div className="card header-card">
        <div className="header-line">
          <h2>Scenario: {scenario.name}</h2>
          <button
            className="styled-button edit-link"
            style={{ height: "30px", width: "60px" }}
            onClick={handleEditClick}
          >
            <Link style={{ color: "white" }} to={"/dashboard/createScenario/"}>
              Edit
            </Link>
          </button>
          <ShareScenarioButton scenarioId={scenario._id} />
          <ExportScenario scenarioID={scenario._id} />
          <Link to="/dashboard" className="close-link">
            Close
          </Link>
        </div>
        <div className="grid">
          <div>Martial Status: {scenario.maritalStatus}</div>
          <div>
            Life Expectancy:
            {scenario.lifeExpectancy
              .map((expectancy: any) => {
                if (expectancy.type === "fixed") {
                  return ` Fixed: ${expectancy.value}`;
                }
                if (expectancy.type === "normal") {
                  return ` Normal: mean = ${expectancy.mean}, stdev = ${expectancy.stdev}`;
                }
                return null;
              })
              .join(" | ")}
          </div>
          <div>Financial Goal: ${scenario.financialGoal}</div>
          <div>
            Birth Year:
            {scenario.maritalStatus === "couple"
              ? `${scenario.birthYears[0]}, ${scenario.birthYears[1]}`
              : scenario.birthYears[0]}
          </div>
          <div>Residence State: {scenario.residenceState}</div>
        </div>
      </div>

      {/* Tab-Based Interface */}
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Investments */}
      {activeTab === "investments" && (
        <div className="card tab-content">
          <div className="card-grid">
            {Object.values(investments).map((inv: any) => (
              <div className="mini-card" key={inv._id}>
                <strong>{inv.investmentType}</strong>
                <div>Value: {inv.value}</div>
                <div>Tax Status: {inv.taxStatus}</div>
                <div>ID: {inv.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment Types */}
      {activeTab === "investmentTypes" && (
        <div className="card tab-content">
          <div className="card-grid">
            {Object.values(investmentTypes).map((invType: any) => {
              // const returnDist = distributionMap[invType.returnDistribution];
              // const incomeDist = distributionMap[invType.incomeDistribution];

              return (
                <div className="mini-card" key={invType._id}>
                  <strong>{invType.name}</strong>
                  <div>Description: {invType.description}</div>
                  <div>Return Type: {invType.returnAmtOrPct}</div>
                  <div>
                    Return Distribution:{" "}
                    {invType.returnDistribution?.type === "fixed" &&
                      `Fixed (${invType.returnDistribution?.value})`}
                    {invType.returnDistribution?.type === "percent" &&
                      `Percent (mean = ${invType.returnDistribution?.mean}, stdev = ${invType.returnDistribution?.stdev})`}
                    {invType.returnDistribution?.type === "normal" &&
                      `Normal (mean = ${invType.returnDistribution?.mean}, stdev = ${invType.returnDistribution?.stdev})`}
                  </div>
                  <div>Expense Ratio: {invType.expenseRatio}</div>
                  <div>Income Type: {invType.incomeAmtOrPct}</div>
                  <div>
                    Income Distribution:{" "}
                    {invType.incomeDistribution?.type === "fixed" &&
                      `Fixed (${invType.incomeDistribution?.value})`}
                    {invType.incomeDistribution?.type === "percent" &&
                      `Percent (mean = ${invType.incomeDistribution?.mean}, stdev = ${invType.incomeDistribution?.stdev})`}
                    {invType.incomeDistribution?.type === "normal" &&
                      `Normal (mean = ${invType.incomeDistribution?.mean}, stdev = ${invType.incomeDistribution?.stdev})`}
                  </div>
                  <div>Taxable: {invType.taxability ? "Yes" : "No"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Events */}
      {activeTab === "events" && (
        <div className="card tab-content">
          {Object.values(eventSeries).map((event: any) => (
            <div className="mini-card" key={event._id}>
              <strong>{event.name}</strong>
              <div>Start: {event.start.type}</div>
              <div>Duration: {event.duration.type}</div>
              <div>Type: {event.event.type}</div>
              <div>
                Initial Amount: ${event.event.initalAmount?.toLocaleString()}
              </div>
              <div>Change Mode: {event.event.changeAmountOrPecent}</div>
              <div>
                Change Distribution: {event.event.changeDistribution?.type}
                {event.event.changeDistribution?.type === "uniform" && (
                  <>
                    {" "}
                    ({event.event.changeDistribution.min} –{" "}
                    {event.event.changeDistribution.max})
                  </>
                )}
              </div>
              <div>
                Inflation Adjusted:{" "}
                {event.event.inflationAdjusted ? "Yes" : "No"}
              </div>
              <div>User Fraction: {event.event.userFraction}</div>
              <div>
                Social Security: {event.event.socialSecurity ? "Yes" : "No"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strategies */}
      {activeTab === "strategies" && (
        <div className="card tab-content">
          <div className="mini-card">
            <strong>Strategies</strong>

            <div>
              <strong>Spending Strategy:</strong>
              <ul>
                {spendingStrategy.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Expense Withdrawal Strategy:</strong>
              <ul>
                {expenseWithdrawalStrategy.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>RMD Strategy:</strong>
              <ul>
                {RMDStrategy.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Roth Conversion:</strong>
              <div>Opted In: {scenario.RothConversionOpt ? "Yes" : "No"}</div>
              <div>Start Year: {scenario.RothConversionStart}</div>
              <div>End Year: {scenario.RothConversionEnd}</div>
              <div>Strategy:</div>
              <ul>
                {RothConversionStrategy.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Simulation */}
      {activeTab === "simulation" && (
        <div className="card tab-content">
          <div className="card-grid-simulator">
            <button
              className="styled-button"
              style={{ height: "3rem" }}
              onClick={sendSimulatorRequest}
            >
              Run Simulation
            </button>
            <p style={{ textAlign: "right" }}>Number of simulations</p>
            <input
              className="simulator-run-input"
              type="text"
              onChange={(elem) => {
                setNumberOfSimulations(
                  Number(elem.target.value.replace(/\D/, ""))
                );
              }}
            ></input>
          </div>
        </div>
      )}
    </div>
  );
}
