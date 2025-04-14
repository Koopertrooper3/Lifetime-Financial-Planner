import { useState, useEffect } from "react";
import "../stylesheets/CreateScenario.css";
import LifeExpectency from "../components/LifeExpectency";
import { Link } from "react-router-dom";
import ValidationTextFields from "../components/shared/ValidationTextFields";
import { useHelperContext } from "../HelperContext";
import SelectionTable from "../components/shared/SelectionTable";

interface ScenarioFormPageProps {
  isEditMode?: boolean;
  scenarioData?: {
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
  };
}

export default function ScenarioFormPage({
  isEditMode = false,
  scenarioData,
}: ScenarioFormPageProps) {
  const { allInvestmentTypes } = useHelperContext();
  const [allEventSeries, setAllEventSeries] = useState(null);

  useEffect(() => {
    const rawEventSeries = scenarioData?.scenario?.eventSeries;

    if (!rawEventSeries) return;

    const formattedEventSeries = rawEventSeries.map((event: any) => ({
      name: event.name,
      startYear: event.start?.value,
      startYearDistriubtionType: event.start?.type,
      duration: event.duration?.value,
      durationDistributionType: event.duration?.type,
      eventType: event.event?.type,
      initialAmount: event.event?.initalAmount,
      distributionType: event.event?.changeDistribution?.type,
      lower: event.event?.changeDistribution?.lower,
      upper: event.event?.changeDistribution?.upper,
      inflationAdjusted: event.event?.inflationAdjusted,
      userFraction: event.event?.userFraction,
      socialSecurity: event.event?.socialSecurity,
    }));

    setAllEventSeries(formattedEventSeries);
  }, [scenarioData]);

  // const [filteredInvestmentTypes, setFilteredInvestmentTypes] = useState<
  //   any[] | null
  // >(null);

  // useEffect(() => {
  //   if (
  //     isEditMode &&
  //     allInvestmentTypes &&
  //     scenarioData?.scenario?.investmentTypes
  //   ) {
  //     const scenarioInvIds = scenarioData.scenario.investmentTypes.map(
  //       (inv: any) => inv._id
  //     );

  //     setFilteredInvestmentTypes(
  //       allInvestmentTypes.filter((type) => scenarioInvIds.includes(type._id))
  //     );
  //   } else {
  //     setFilteredInvestmentTypes(allInvestmentTypes || []);
  //   }
  // }, [isEditMode, allInvestmentTypes, scenarioData]);

  // console.log("Scenario:", scenarioData?.scenario);
  // console.log("All:", allInvestmentTypes);
  // console.log("Filtered:", filteredInvestmentTypes);

  // Initialize state with transformed data or defaults
  const [filingStatus, setFilingStatus] = useState(
    scenarioData?.filingStatus || "Single"
  );
  const [lifeExpectancyType, setLifeExpectancyType] = useState(
    scenarioData?.lifeExpectancyType || "Fixed Age"
  );
  const [spouseLifeExpectancyType, setSpouseLifeExpectancyType] = useState(
    scenarioData?.spouseLifeExpectancyType || "Fixed Age"
  );

  const [expectedAge, setExpectedAge] = useState<string | number>(
    scenarioData?.expectedAge || ""
  );
  const [meanAge, setMeanAge] = useState<string | number>(
    scenarioData?.meanAge || ""
  );
  const [std, setStd] = useState<string | number>(scenarioData?.std || "");

  const [spouseExpectedAge, setSpouseExpectedAge] = useState<string | number>(
    scenarioData?.spouseExpectedAge || ""
  );
  const [spouseMeanAge, setSpouseMeanAge] = useState<string | number>(
    scenarioData?.spouseMeanAge || ""
  );
  const [spouseStd, setSpouseStd] = useState<string | number>(
    scenarioData?.spouseStd || ""
  );

  const [financialGoal, setFinancialGoal] = useState<string | number>(
    scenarioData?.financialGoal || ""
  );
  const [birthYear, setBirthYear] = useState<string | number>(
    scenarioData?.birthYear || ""
  );
  const [spouseBirthYear, setSpouseBirthYear] = useState<string | number>(
    scenarioData?.spouseBirthYear || ""
  );
  const [residence, setResidence] = useState<string | number>(
    scenarioData?.stateOfResidence || ""
  );

  return (
    <div className="create-scenario-container">
      {/*Title*/}
      <div className="header-line">
        <h2 className="header">
          {isEditMode ? "Update Scenario" : "Create Scenario"}
        </h2>
        <Link to="/dashboard" className="back-link">
          {"<<"}Back
        </Link>
      </div>
      {/*Financial Goal*/}
      <div className="financial-goal-container">
        <h3 className="purple-title">Financial Goal</h3>
        <ValidationTextFields
          value={financialGoal || ""}
          placeholder="Enter amount"
          setInput={setFinancialGoal}
          inputType="number"
          width="160"
          height="1.4375em"
          disabled={false}
        />
      </div>

      {/*Description*/}
      <p className="scenario-description">
        A scenario is a personalized financial plan. It includes investments,
        income, expenses, life events, and retirement strategies
      </p>

      {/*Filing Status*/}
      <div className="filing-status-container">
        <h3 className="purple-title">Filing Status</h3>
        <div>
          <label>
            <input
              className="status-option"
              type="radio"
              id="filingStatus"
              value="Single"
              onChange={() => setFilingStatus("Single")}
              checked={filingStatus == "Single"}
            ></input>
            Single
          </label>
          <label>
            <input
              className="status-option"
              type="radio"
              id="filingStatus"
              value="Filing Jointly"
              onChange={() => {
                setFilingStatus("Filing Jointly");
              }}
              checked={filingStatus == "Filing Jointly"}
            ></input>
            Filing Jointly
          </label>
        </div>
      </div>

      {/*Birth Year*/}
      <div className="birth-container">
        <div className="first-birth-textbox">
          <h3 className="purple-title">Birth Year</h3>
          <ValidationTextFields
            value={birthYear || ""}
            placeholder="Enter a year (e.g., 2003)"
            setInput={setBirthYear}
            inputType="number"
            width="200px"
            height="1.4375em"
            disabled={false}
          />
        </div>
        <div>
          <h3 className="purple-title">Spouse Birth Year</h3>
          <ValidationTextFields
            value={spouseBirthYear || ""}
            placeholder="Enter a year (e.g., 2003)"
            setInput={setSpouseBirthYear}
            inputType="number"
            width="200px"
            height="1.4375em"
            disabled={filingStatus === "Single"}
          />
        </div>
      </div>

      {/*State of Residence*/}
      <div className="residence-container">
        <h3 className="purple-title">State of Residence</h3>
        <ValidationTextFields
          value={residence || ""}
          placeholder="Enter a state eg. New York"
          setInput={setResidence}
          inputType="string"
          width="205px"
          height="1.4375em"
          disabled={false}
        />
      </div>

      <div className="section-container">
        {/*Life Expectancy*/}
        <div className="life-expectancy-container">
          <div className="title-with-info">
            <h3 className="purple-title">Life Expectancy</h3>
            <span className="grayed-text">How long you live</span>
          </div>
          <div>
            <span>Choose how to model your life expectancy. </span>
            <span className="grayed-text">
              You can enter a fixed age or use a normal distribution
            </span>
          </div>
          <div>
            <label>
              <input
                type="radio"
                id="life-expectancy"
                value="Fixed Age"
                onChange={() => setLifeExpectancyType("Fixed Age")}
                checked={lifeExpectancyType == "Fixed Age"}
              ></input>
              Fixed Age
            </label>
            <label>
              <input
                type="radio"
                id="life-expectancy"
                value="Normal Distribution"
                onChange={() => setLifeExpectancyType("Normal Distribution")}
                checked={lifeExpectancyType == "Normal Distribution"}
              ></input>
              Normal Distribution
            </label>

            <LifeExpectency
              lifeExpectancyType={lifeExpectancyType}
              expectedAge={expectedAge}
              setExpectedAge={setExpectedAge}
              meanAge={meanAge}
              setMeanAge={setMeanAge}
              std={std}
              setStd={setStd}
            />
          </div>
        </div>

        {filingStatus === "Filing Jointly" && (
          <div className="life-expectancy-container">
            <div className="title-with-info">
              <h3 className="purple-title">Spouse's Life Expectancy</h3>
              <span className="grayed-text">How long you live</span>
            </div>
            <div>
              <span>Choose how to model your life expectancy. </span>
              <span className="grayed-text">
                You can enter a fixed age or use a normal distribution
              </span>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  id="spouse-life-expectancy"
                  value="Fixed Age"
                  onChange={() => setSpouseLifeExpectancyType("Fixed Age")}
                  checked={spouseLifeExpectancyType == "Fixed Age"}
                ></input>
                Fixed Age
              </label>
              <label>
                <input
                  type="radio"
                  id="spouse-life-expectancy"
                  value="Normal Distribution"
                  onChange={() =>
                    setSpouseLifeExpectancyType("Normal Distribution")
                  }
                  checked={spouseLifeExpectancyType == "Normal Distribution"}
                ></input>
                Normal Distribution
              </label>

              <LifeExpectency
                lifeExpectancyType={spouseLifeExpectancyType}
                expectedAge={spouseExpectedAge}
                setExpectedAge={setSpouseExpectedAge}
                meanAge={spouseMeanAge}
                setMeanAge={setSpouseMeanAge}
                std={spouseStd}
                setStd={setSpouseStd}
              />
            </div>
          </div>
        )}

        {/*Investment Types*/}
        <div className="investment-type-container">
          <div className="title-with-info">
            <h3 className="green-title">Investment Types</h3>
            <span className="red-text">&nbsp;Required</span>
          </div>
          <p>
            Expand below to view previously defined investment types or create a
            new one.
          </p>
          <SelectionTable
            title="Investment Types"
            description="An investment type represents an account or vehicle used to grow or
          preserve assets."
            data={allInvestmentTypes}
            emptyMessage="This plan does not contain any new investment types."
            category="Tax Status"
            renderAttribute={(investmentType) =>
              investmentType.taxability ? "Taxable" : "Tax-exempt"
            }
          ></SelectionTable>
          {!isEditMode && (
            <Link
              to="/InvestmentTypeForm"
              className="add-investment-type-container"
            >
              Add New Investment Type
            </Link>
          )}
        </div>

        {/*Event Series*/}
        <div className="event-series-container">
          <div className="title-with-info">
            <h3 className="green-title">Event Series</h3>
            <span className="red-text">&nbsp;Required</span>
          </div>
          <p>
            Expand below to view previously defined events or create a new one.
          </p>
          <SelectionTable
            title="Event Series"
            description="An event series represents recurring income, expenses, or investment activity over time."
            data={allEventSeries}
            emptyMessage="This plan does not contain any new event series."
            category="Type"
            renderAttribute={(eventSeries) => eventSeries.type}
          ></SelectionTable>
          <Link to="/AddNewEventSeries">
            Click here to expand Event Series settings ▼
          </Link>
        </div>

        {/*Inflation & Contribution Limits*/}
        <div className="inflation-container">
          <div className="title-with-info">
            <h3 className="green-title">Inflation & Contribution Limits</h3>
            <span className="red-text">&nbsp;Required</span>
          </div>
          <p>
            Expand below to adjust inflation assumptions and annual contribution
            limits for retirement accounts.
          </p>
          <Link to="/Limits&ContributionLimits">
            Click here to expand Inflation & Contribution Limits settings ▼
          </Link>
        </div>

        {/*Spending & Withdrawal*/}
        <div className="spending-withdrawal-container">
          <div className="title-with-info">
            <h3 className="green-title">Spending & Withdrawal</h3>
            <span className="red-text">&nbsp;Required</span>
          </div>
          <p>
            Expand below to view and customize how income is spent, withdrawals
            are handled, and retirement distributions are managed.
          </p>
          <a href="#">Click here to expand Spending & Withdrawal settings ▼</a>
        </div>

        {/*Sharing Settings*/}
        <div className="sharing-container">
          <div className="title-with-info">
            <h3 className="red-title">Sharing Setings</h3>
            <span className="grayed-text">&nbsp;Optional</span>
          </div>
          <p>Expand below to manage who can access or edit this scenario.</p>
          <a href="#">Click here to expand Sharing settings ▼</a>
        </div>
      </div>
    </div>
  );
}
