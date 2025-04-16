import { useHelperContext } from "../HelperContext";
import ScenarioFormPage from "./ScenarioFormPage";

interface TransformedScenarioData {
  financialGoal: string | number;
  name: string;
  description: string;
  filingStatus: "Single" | "Filing Jointly";
  birthYear: string | number;
  spouseBirthYear: string | number;
  stateOfResidence: string | number;
  // Life Expectancy
  lifeExpectancyType: string;
  expectedAge: string | number;
  meanAge: string | number;
  std: string | number;
  // Spouse Life Expectancy
  spouseLifeExpectancyType?: string;
  spouseExpectedAge?: string | number;
  spouseMeanAge?: string | number;
  spouseStd?: string | number;
  scenario: any;
}

export default function EditScenarioPage() {
  const { editScenario } = useHelperContext();

  function reformatScenario(scenario: any): TransformedScenarioData {
    const primaryBirthYear = scenario.birthYear?.[0] ?? "";
    const isCouple = scenario.maritalStatus === "couple";
    const spouseBirthYear = isCouple ? scenario.birthYear?.[1] ?? "" : "";

    let primaryLifeExpectancyType = scenario.lifeExpectancy[0].type;
    primaryLifeExpectancyType =
      primaryLifeExpectancyType === "Normal"
        ? "Normal Distribution"
        : "Fixed Age";
    const primaryLifeExpectancyAge = scenario.lifeExpectancy[0]?.value ?? "";
    const primaryLifeExpectancyMean = scenario.lifeExpectancy[0]?.mean ?? "";
    const primaryLifeExpectancyStd = scenario.lifeExpectancy[0]?.stdev ?? "";

    let spouseLifeExpectancyType = scenario.lifeExpectancy?.[1].type;
    spouseLifeExpectancyType =
      spouseLifeExpectancyType === "Normal"
        ? "Normal Distribution"
        : "Fixed Age";
    const spouseLifeExpectancyAge = scenario.lifeExpectancy?.[1]?.value ?? "";
    const spouseLifeExpectancyMean = scenario.lifeExpectancy?.[1]?.mean ?? "";
    const spouseLifeExpectancyStd = scenario.lifeExpectancy?.[1]?.stdev ?? "";

    return {
      financialGoal: scenario.financialGoal,
      name: scenario.name,
      description: scenario.description,
      filingStatus:
        scenario.maritalStatus === "single" ? "Single" : "Filing Jointly",
      birthYear: primaryBirthYear,
      spouseBirthYear: spouseBirthYear,
      stateOfResidence: scenario.residenceState,
      // User Life Expectancy
      lifeExpectancyType: primaryLifeExpectancyType,
      expectedAge: primaryLifeExpectancyAge,
      meanAge: primaryLifeExpectancyMean,
      std: primaryLifeExpectancyStd,
      // Spouse Life Expectancy
      spouseLifeExpectancyType: spouseLifeExpectancyType,
      spouseExpectedAge: spouseLifeExpectancyAge,
      spouseMeanAge: spouseLifeExpectancyMean,
      spouseStd: spouseLifeExpectancyStd,
      scenario,
    };
  }

  if (!editScenario) return <div>Loading...</div>;

  const transformedData = reformatScenario(editScenario);
  return <ScenarioFormPage isEditMode={true} scenarioData={transformedData} />;
}
