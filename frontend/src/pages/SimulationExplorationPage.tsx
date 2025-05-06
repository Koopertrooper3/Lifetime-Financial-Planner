import React from "react";
import { useSimulationHook } from "../hooks/useSimulationHook";
import axiosCookie from "../axiosCookie";
import { Link } from "react-router-dom";
import "../stylesheets/SimulationExplorationPage.css";

export default function SimulationExplorationPage() {
  const form = useSimulationHook();
  const sendOneDimensionalSimulatorRequest = async () => {
    try {
      const userID = await (async () => {
        const res = await fetch("http://localhost:8000/user", {
          credentials: "include",
        });
        const user = await res.json();
        return user.user._id;
      })();

      const explorationParam =
        form.param1Type === "boolean"
          ? { type: "roth" }
          : {
              eventName: form.param1Name,
              type: form.param1Name,
              lowerBound: form.param1Lower,
              upperBound: form.param1Upper,
              stepSize: form.param1Step,
            };

      const { data: jobId } = await axiosCookie.post("/simulation/simulation-explore", {
        userID,
        scenarioID: form.scenarioId,
        totalSimulations: form.numSimulations,
        explorationParameter: explorationParam, // Fixed spelling (was explorationPrameters)
      });

      await axiosCookie.post("/simulation/simulation-explore/poll", { id: jobId });

      const { data: simulationResults } = await axiosCookie.get(
        `/fetch-results/${jobId}`
      );

      form.setResults(simulationResults);
    } catch (error) {
      console.error("Simulation failed:", error);
      alert("Simulation failed. Check console for details.");
    }
  };

  return (
    <div className="simulation-container">
      <form className="simulation-form" onSubmit={form.handleSubmit}>
        <h2 className="simulation-header">
          Scenario Parameter Exploration{" "}
          <Link to="/dashboard" className="close-link">
            Close
          </Link>
        </h2>
        <p>
          Use this form to simulate how changes to one or two parameters affect
          your financial scenario. This helps visualize potential outcomes based
          on varying input assumptions.
        </p>

        <div className="form-section">
          <h3>Step 1: Select a Scenario</h3>
          <p>
            Enter the unique ID of the scenario you'd like to simulate. This is
            typically a 24-character identifier generated when the scenario was
            saved.
          </p>
          <label htmlFor="scenarioId">Scenario ID</label>
          <input
            id="scenarioId"
            type="text"
            placeholder="e.g., 660f4abc1234567890abcdef"
            value={form.scenarioId}
            onChange={(e) => form.setScenarioId(e.target.value)}
          />
        </div>

        <div className="form-section">
          <h3>Step 2: Define a Primary Parameter</h3>
          <p>
            Choose a parameter to test. For example, annual return rate, savings
            amount, or a boolean setting like retirement eligibility. You can
            simulate either numeric ranges or a true/false condition.
          </p>

          <label htmlFor="param1Name">Parameter Name</label>
          <input
            id="param1Name"
            type="text"
            placeholder="e.g., expectedReturn"
            value={form.param1Name}
            onChange={(e) => form.setParam1Name(e.target.value)}
            required
          />

          <label htmlFor="param1Type">Parameter Type</label>
          <select
            id="param1Type"
            value={form.param1Type}
            onChange={(e) =>
              form.setParam1Type(e.target.value as "numeric" | "boolean")
            }
          >
            <option value="numeric">Numeric</option>
            <option value="boolean">Boolean</option>
          </select>

          {form.param1Type === "numeric" ? (
            <div className="row-group">
              <div>
                <label htmlFor="param1Lower">Lower Bound</label>
                <input
                  id="param1Lower"
                  type="number"
                  placeholder="e.g., 4"
                  value={form.param1Lower}
                  onChange={(e) => form.setParam1Lower(Number(e.target.value))}
                  min={0} // Minimum allowed value
                  max={100} // Maximum allowed value
                />
              </div>
              <div>
                <label htmlFor="param1Upper">Upper Bound</label>
                <input
                  id="param1Upper"
                  type="number"
                  placeholder="e.g., 8"
                  value={form.param1Upper}
                  onChange={(e) => form.setParam1Upper(Number(e.target.value))}
                  min={0} // Minimum allowed value
                  max={100} // Maximum allowed value
                />
              </div>
              <div>
                <label htmlFor="param1Step">Step Size</label>
                <input
                  id="param1Step"
                  type="number"
                  placeholder="e.g., 1"
                  value={form.param1Step}
                  onChange={(e) => form.setParam1Step(Number(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="param1BoolValue">Boolean Value</label>
              <select
                id="param1BoolValue"
                value={form.param1BoolValue.toString()}
                onChange={(e) =>
                  form.setParam1BoolValue(e.target.value === "true")
                }
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          )}
        </div>

        {/* Parameter 2 */}
        <div className="form-section">
          <h3>Step 3: (Optional) Add a Second Parameter</h3>
          <p>
            To run a 2D simulation, you can include a second numeric parameter.
            This creates a grid of combinations between the two parameters and
            provides deeper insights.
          </p>

          <label htmlFor="param2Name">Parameter Name</label>
          <input
            id="param2Name"
            type="text"
            placeholder="e.g., contributionAmount"
            value={form.param2Name}
            onChange={(e) => form.setParam2Name(e.target.value)}
          />

          <div className="row-group">
            <div>
              <label htmlFor="param2Lower">Lower Bound</label>
              <input
                id="param2Lower"
                type="number"
                placeholder="e.g., 5000"
                value={form.param2Lower}
                onChange={(e) => form.setParam2Lower(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="param2Upper">Upper Bound</label>
              <input
                id="param2Upper"
                type="number"
                placeholder="e.g., 15000"
                value={form.param2Upper}
                onChange={(e) => form.setParam2Upper(Number(e.target.value))}
                min={0} // Minimum allowed value
                max={100} // Maximum allowed value
              />
            </div>
            <div>
              <label htmlFor="param2Step">Step Size</label>
              <input
                id="param2Step"
                type="number"
                placeholder="e.g., 1000"
                value={form.param2Step}
                onChange={(e) => form.setParam2Step(Number(e.target.value))}
                min={0} // Minimum allowed value
                max={100} // Maximum allowed value
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Step 3: (Optional) Add a Second Parameter</h3>
          <p>
            To run a 2D simulation, you can include a second numeric parameter.
            This creates a grid of combinations between the two parameters and
            provides deeper insights.
          </p>

          <label htmlFor="param2Name">Parameter Name</label>
          <input
            id="param2Name"
            type="text"
            placeholder="e.g., contributionAmount"
            value={form.param2Name}
            onChange={(e) => form.setParam2Name(e.target.value)}
          />

          <div className="form-section">
            <h3>Step 4: Enter the Number of Simulation(s)</h3>
            <label htmlFor="numberOfSimulations">Number of simulations</label>
            <input
              id="numberOfSimulations"
              type="number"
              placeholder="e.g., 10"
              value={form.numSimulations}
              onChange={(e) => form.setNumSimulations(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="simulation-button"
          disabled={form.isSubmitting}
          onClick={() => sendOneDimensionalSimulatorRequest()}
        >
          {form.isSubmitting ? "Running..." : "Run Simulation"}
        </button>

        {/* Results */}
        {form.results && (
          <div className="simulation-results">
            <h3>Simulation Results</h3>
            <p>
              The output below reflects the scenario outcomes based on your
              selected parameter ranges.
            </p>
            <pre>{JSON.stringify(form.results, null, 2)}</pre>
          </div>
        )}
      </form>
    </div>
  );
}
