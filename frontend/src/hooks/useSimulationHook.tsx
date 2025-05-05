import { useState } from "react";

export function useSimulationHook() {
  const [scenarioId, setScenarioId] = useState("");
  const [param1Name, setParam1Name] = useState("");
  const [param1Type, setParam1Type] = useState<"numeric" | "boolean">("numeric");

  const [param1Lower, setParam1Lower] = useState(0);
  const [param1Upper, setParam1Upper] = useState(0);
  const [param1Step, setParam1Step] = useState(1);
  const [param1BoolValue, setParam1BoolValue] = useState(true);

  const [param2Name, setParam2Name] = useState("");
  const [param2Lower, setParam2Lower] = useState(0);
  const [param2Upper, setParam2Upper] = useState(0);
  const [param2Step, setParam2Step] = useState(1);

  const [distributionType, setDistributionType] = useState<DistributionType>("Fixed Value/Percentage");
const [isFixedAmount, setIsFixedAmount] = useState(true);
const [fixedValue, setFixedValue] = useState("");
const [mean, setMean] = useState("");
const [stdDev, setStdDev] = useState("");
const [lowerBound, setLowerBound] = useState("");
const [upperBound, setUpperBound] = useState("");


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parameters: any[] = [];

    if (param1Type === "boolean") {
      parameters.push({
        name: param1Name,
        boolValues: [param1BoolValue, !param1BoolValue],
        type: "boolean"
      });
    } else {
      parameters.push({
        name: param1Name,
        lowerBound: param1Lower,
        upperBound: param1Upper,
        stepSize: param1Step,
        type: "numeric"
      });
    }

    if (param2Name.trim()) {
      parameters.push({
        name: param2Name,
        lowerBound: param2Lower,
        upperBound: param2Upper,
        stepSize: param2Step,
        type: "numeric"
      });
    }

    try {
      const response = await fetch("/simulation-explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, parameters }),
      });

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Simulation request failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    scenarioId,
    setScenarioId,
    param1Name,
    setParam1Name,
    param1Type,
    setParam1Type,
    param1Lower,
    setParam1Lower,
    param1Upper,
    setParam1Upper,
    param1Step,
    setParam1Step,
    param1BoolValue,
    setParam1BoolValue,
    param2Name,
    setParam2Name,
    param2Lower,
    setParam2Lower,
    param2Upper,
    setParam2Upper,
    param2Step,
    setParam2Step,
    isSubmitting,
    results,
    handleSubmit,
  };
}
