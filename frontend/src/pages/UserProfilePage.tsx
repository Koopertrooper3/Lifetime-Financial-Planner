import React, { useState } from "react";
import axiosCookie from "../axiosCookie";
import "../stylesheets/SimulationExplorationPage.css";

export default function SimulationExplorationPage() {
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

    try {
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
      <h2 className="simulation-header">Scenario Parameter Exploration</h2>
      <form className="simulation-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <label>Scenario ID</label>
          <input
            type="text"
            placeholder="e.g., 660f4abc..."
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
          />
        </div>

        <div className="form-section">
          <h3>Primary Parameter</h3>
          <label>Name</label>
          <input
            type="text"
            value={param1Name}
            onChange={(e) => setParam1Name(e.target.value)}
            required
          />
          <div className="row-group">
            <div>
              <label>Lower</label>
              <input
                type="number"
                value={param1Lower}
                onChange={(e) => setParam1Lower(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Upper</label>
              <input
                type="number"
                value={param1Upper}
                onChange={(e) => setParam1Upper(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Step</label>
              <input
                type="number"
                value={param1Step}
                onChange={(e) => setParam1Step(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Optional: Second Parameter (2D)</h3>
          <label>Name</label>
          <input
            type="text"
            value={param2Name}
            onChange={(e) => setParam2Name(e.target.value)}
          />
          <div className="row-group">
            <div>
              <label>Lower</label>
              <input
                type="number"
                value={param2Lower}
                onChange={(e) => setParam2Lower(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Upper</label>
              <input
                type="number"
                value={param2Upper}
                onChange={(e) => setParam2Upper(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Step</label>
              <input
                type="number"
                value={param2Step}
                onChange={(e) => setParam2Step(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="simulation-button" disabled={isSubmitting}>
          {isSubmitting ? "Running..." : "Run Simulation"}
        </button>
      </form>

      {results && (
        <div className="simulation-results">
          <h3>Results</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
