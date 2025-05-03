import React, { useState } from "react";
import axiosCookie from "../axiosCookie";
import "../stylesheets/SimulationExplorationPage.css";

const SimulationExplorationPage = () => {
  const [scenarioId, setScenarioId] = useState("");
  const [param1Name, setParam1Name] = useState("");
  const [param1Lower, setParam1Lower] = useState(0);
  const [param1Upper, setParam1Upper] = useState(0);
  const [param1Step, setParam1Step] = useState(1);

  const [param2Name, setParam2Name] = useState("");
  const [param2Lower, setParam2Lower] = useState(0);
  const [param2Upper, setParam2Upper] = useState(0);
  const [param2Step, setParam2Step] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        scenarioId,
        parameters: [
          {
            name: param1Name,
            lowerBound: param1Lower,
            upperBound: param1Upper,
            stepSize: param1Step,
          },
        ],
      };

      if (param2Name.trim()) {
        payload.parameters.push({
          name: param2Name,
          lowerBound: param2Lower,
          upperBound: param2Upper,
          stepSize: param2Step,
        });
      }

      const response = await axiosCookie.post("/simulation-explore", payload);
      setResults(response.data);
    } catch (err) {
      console.error("Simulation request failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="simulation-container">
      <h2 className="simulation-header">Scenario Exploration (1D / 2D)</h2>
      <form onSubmit={handleSubmit} className="simulation-form">
        <input
          type="text"
          placeholder="Scenario ID"
          value={scenarioId}
          onChange={(e) => setScenarioId(e.target.value)}
          className="simulation-input"
          required
        />
  
        <div className="simulation-section-title">Primary Parameter</div>
        <input
          type="text"
          placeholder="Parameter 1 Name"
          value={param1Name}
          onChange={(e) => setParam1Name(e.target.value)}
          className="simulation-input"
          required
        />
        <input
          type="number"
          placeholder="Lower Bound"
          value={param1Lower}
          onChange={(e) => setParam1Lower(Number(e.target.value))}
          className="simulation-input"
        />
        <input
          type="number"
          placeholder="Upper Bound"
          value={param1Upper}
          onChange={(e) => setParam1Upper(Number(e.target.value))}
          className="simulation-input"
        />
        <input
          type="number"
          placeholder="Step Size"
          value={param1Step}
          onChange={(e) => setParam1Step(Number(e.target.value))}
          className="simulation-input"
        />
  
        <div className="simulation-section-title">Optional: Second Parameter for 2D</div>
        <input
          type="text"
          placeholder="Parameter 2 Name (optional)"
          value={param2Name}
          onChange={(e) => setParam2Name(e.target.value)}
          className="simulation-input"
        />
        <input
          type="number"
          placeholder="Lower Bound"
          value={param2Lower}
          onChange={(e) => setParam2Lower(Number(e.target.value))}
          className="simulation-input"
        />
        <input
          type="number"
          placeholder="Upper Bound"
          value={param2Upper}
          onChange={(e) => setParam2Upper(Number(e.target.value))}
          className="simulation-input"
        />
        <input
          type="number"
          placeholder="Step Size"
          value={param2Step}
          onChange={(e) => setParam2Step(Number(e.target.value))}
          className="simulation-input"
        />
  
        <button
          type="submit"
          disabled={isSubmitting}
          className="simulation-button"
        >
          {isSubmitting ? "Running Simulations..." : "Run Simulations"}
        </button>
      </form>
  
      {results && (
        <div className="simulation-results">
          <h3>Simulation Results</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );  
};

export default SimulationExplorationPage;
