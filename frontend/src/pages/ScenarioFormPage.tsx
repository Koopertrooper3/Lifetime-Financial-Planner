import { useState, useEffect, useRef } from "react";
import "../stylesheets/CreateScenario.css";
import LifeExpectency from "../components/LifeExpectency";
import { Link, useNavigate } from "react-router-dom";
import ValidationTextFields from "../components/shared/ValidationTextFields";
import { useHelperContext } from "../HelperContext";
import { useScenarioContext, ScenarioInterface } from "../useScenarioContext";
import SelectionTable from "../components/shared/SelectionTable";
import axios from "axios";
import ImportScenario from '../components/ImportScenario';

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

export default function ScenarioFormPage() {
  // Used to track if editScenario is already set
  const hasInitialized = useRef(false);
  const navigate = useNavigate();
  const { allInvestmentTypes } = useHelperContext();
  const [allEventSeries, setAllEventSeries] = useState(null);
  const {
    name,
    setName,
    maritalStatus,
    setMaritalStatus,
    birthYear,
    setBirthYear,
    lifeExpectancy,
    setLifeExpectancy,
    financialGoal,
    setFinancialGoal,
    residenceState,
    setResidenceState,
    investmentTypes,
    setInvestmentTypes,
    investments,
    setInvestments,
    eventSeries,
    setEventSeries,
    inflationAssumption,
    setInflationAssumption,
    afterTaxContributionLimit,
    setAfterTaxContributionLimit,
    spendingStrategy,
    setSpendingStrategy,
    expenseWithdrawalStrategy,
    setExpenseWithdrawalStrategy,
    RMDStrategy,
    setRMDStrategy,
    RothConversionOpt,
    setRothConversionOpt,
    RothConversionStart,
    setRothConversionStart,
    RothConversionEnd,
    setRothConversionEnd,
    RothConversionStrategy,
    setRothConversionStrategy,
    editScenario,
    setEditScenario,
  } = useScenarioContext();

  const handleCancel = () => {
    resetScenario();
    navigate(`/scenario/${editScenario._id}`);
  };

  const handleBack = () => {
    resetScenario();
    navigate("/dashboard");
  };

  const handleFileParsed = async function(data:unknown){
    // grabs user info
    const userInfo = await axios.get("http://localhost:8000/user", {
      withCredentials: true,
    });

    // create correct json object for backend scenario creation
    const requestBody = {
      userID: userInfo.data.googleId,
      scenario: data
    }

    //attempts to create the scenario
    try{
      const response = await axios.post("http://localhost:8000/scenario/create", requestBody);
      console.log(response);
    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    if (editScenario && !hasInitialized.current) {
      setName(editScenario.name);
      setMaritalStatus(editScenario.maritalStatus);
      setBirthYear(editScenario.birthYear);
      setLifeExpectancy(editScenario.lifeExpectancy);
      // Only set investmentTypes if they're empty (prevent overwrite)
      if (Object.keys(investmentTypes).length === 0) {
        setInvestmentTypes(editScenario.investmentTypes);
      }
      setInvestments(editScenario.investments);
      setEventSeries(editScenario.eventSeries);
      setInflationAssumption(editScenario.inflationAssumption);
      setAfterTaxContributionLimit(editScenario.afterTaxContributionLimit);
      setSpendingStrategy(editScenario.spendingStrategy);
      setExpenseWithdrawalStrategy(editScenario.expenseWithdrawalStrategy);
      setRMDStrategy(editScenario.RMDStrategy);
      setRothConversionOpt(editScenario.RothConversionOpt);
      setRothConversionStart(editScenario.RothConversionStart);
      setRothConversionEnd(editScenario.RothConversionEnd);
      setRothConversionStrategy(editScenario.RothConversionStrategy);
      setFinancialGoal(editScenario.financialGoal);
      setResidenceState(editScenario.residenceState);
      hasInitialized.current = true;
    }
  }, [editScenario]);

  useEffect(() => {
    console.log("Updated investmentTypes:", investmentTypes);
  }, [investmentTypes]);

  useEffect(() => {
    console.log("EditScenario changed:", editScenario);
  }, [editScenario]);

  const getId = async () => {
    const res = await fetch("http://localhost:8000/user", {
      credentials: "include", // ensures session cookie is sent
    });
    const user = await res.json();
    return user._id;
  };

  function removeIds(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(removeIds);
    } else if (obj !== null && typeof obj === "object") {
      const { _id, ...rest } = obj;
      return Object.fromEntries(
        Object.entries(rest).map(([key, value]) => [key, removeIds(value)])
      );
    }
    return obj;
  }

  const handleSubmit = async () => {
    console.log("handleSubmit triggered");
    const currentUserId = await getId();

    // Use the context values declared above in the same component scope
    const latestScenario: ScenarioInterface = {
      name,
      maritalStatus,
      birthYear,
      lifeExpectancy,
      investmentTypes,
      investments,
      eventSeries,
      inflationAssumption,
      afterTaxContributionLimit,
      spendingStrategy,
      expenseWithdrawalStrategy,
      RMDStrategy,
      RothConversionOpt,
      RothConversionStart,
      RothConversionEnd,
      RothConversionStrategy,
      financialGoal,
      residenceState,
    };

    const cleanedScenario = removeIds(latestScenario);

    if (editScenario !== null) {
      console.log(`cleanedScenario:`, cleanedScenario.investmentTypes);
      await handleEditScenario(
        currentUserId,
        editScenario._id,
        cleanedScenario
      );
    } else {
      await handleSaveScenario(currentUserId, cleanedScenario);
    }
  };

  const resetScenario = () => {
    setName("sup");
    setMaritalStatus("individual");
    setBirthYear([1985]);
    setLifeExpectancy([{ type: "Fixed", value: 80 }]);
    setInvestmentTypes({});
    setInvestments({});
    setEventSeries({});
    setInflationAssumption({ type: "Fixed", value: 0 });
    setAfterTaxContributionLimit(0);
    setSpendingStrategy([]);
    setExpenseWithdrawalStrategy([]);
    setRMDStrategy([]);
    setRothConversionOpt(false);
    setRothConversionStart(0);
    setRothConversionEnd(0);
    setRothConversionStrategy([]);
    setFinancialGoal(0);
    setResidenceState("NY");
    setEditScenario(null);
  };

  const handleSaveScenario = async (
    userID: string,
    scenario: ScenarioInterface
  ) => {
    console.log("Sending scenario:", scenario);
    try {
      const res = await axios.post("http://localhost:8000/scenario/create", {
        userID,
        scenario,
      });

      console.log("Scenario created successfully:", res.data);
      resetScenario();
      navigate("/dashboard");
      // You can redirect or show success UI here
    } catch (error) {
      console.error("Error saving scenario:", error);
      // Optionally show an error message to the user
    }
  };

  const handleEditScenario = async (
    userID: string,
    scenarioID: string,
    scenario: ScenarioInterface
  ) => {
    console.log("Sending scenario:", scenario);
    try {
      const res = await axios.post("http://localhost:8000/scenario/edit", {
        userID,
        scenarioID,
        scenario,
      });

      console.log("Scenario updated successfully:", res.data);
      resetScenario();
      navigate(`/scenario/${scenarioID}`);
      // You can redirect or show success UI here
    } catch (error) {
      console.error("Error updating scenario:", error);
    }
  };

  return (
    <div className="create-scenario-container">
      {/*Title*/}
      <div className="header-line">
        <h2 className="header">
          {editScenario !== null ? "Update Scenario" : "Create Scenario"}
        </h2>
        {editScenario !== null ? (
          <button className="back-link" onClick={handleCancel}>
            Cancel
          </button>
        ) : (
          <button className="back-link" onClick={handleBack}>
            {"<<"}Back
          </button>
        )}
      </div>
      <div>
        <p>
          You can choose to import a yaml file here instead
        </p>
        <ImportScenario onFileParsed={handleFileParsed}/>
      </div>
      {/*Scenario Name*/}
      <div className="scenario-name-container">
        <h3 className="purple-title">Name</h3>
        <ValidationTextFields
          value={name || ""}
          placeholder="Enter name"
          setInput={(val) => setName(String(val))}
          inputType="string"
          width="160"
          height="1.4375em"
          disabled={false}
        />
      </div>

      {/*Financial Goal*/}
      <div className="financial-goal-container">
        <h3 className="purple-title">Financial Goal</h3>
        <ValidationTextFields
          value={financialGoal || ""}
          placeholder="Enter amount"
          setInput={(val) => setFinancialGoal(Number(val))}
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
              id="martialStatus"
              value="individual"
              onChange={() => setMaritalStatus("individual")}
              checked={maritalStatus == "individual"}
            ></input>
            Single
          </label>
          <label>
            <input
              className="status-option"
              type="radio"
              id="martialStatus"
              value="couple"
              onChange={() => {
                setMaritalStatus("couple");
              }}
              checked={maritalStatus == "couple"}
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
            value={birthYear?.[0] || ""}
            placeholder="Enter a year (e.g., 2003)"
            setInput={(val) =>
              setBirthYear((prev) => {
                const updated = [...prev];
                updated[0] = Number(val);
                return updated;
              })
            }
            inputType="number"
            width="200px"
            height="1.4375em"
            disabled={false}
          />
        </div>
        <div>
          <h3 className="purple-title">Spouse Birth Year</h3>
          <ValidationTextFields
            value={birthYear?.[1] || ""}
            placeholder="Enter a year (e.g., 2003)"
            setInput={(val) =>
              setBirthYear((prev) => {
                const updated = [...prev];
                updated[1] = Number(val);
                return updated;
              })
            }
            inputType="number"
            width="200px"
            height="1.4375em"
            disabled={maritalStatus === "individual"}
          />
        </div>
      </div>

      {/*State of Residence*/}
      <div className="residence-container">
        <h3 className="purple-title">State of Residence</h3>
        <ValidationTextFields
          value={residenceState || ""}
          placeholder="Enter a state eg. New York"
          setInput={(val) => setResidenceState(String(val))}
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
                onChange={() =>
                  setLifeExpectancy((prev) => [
                    { type: "Fixed", value: prev?.[0]?.value || 80 },
                    ...(prev.length > 1 ? [prev[1]] : []),
                  ])
                }
                checked={lifeExpectancy[0]?.type === "Fixed"}
              />
              Fixed Age
            </label>
            <label>
              <input
                type="radio"
                id="life-expectancy"
                value="Normal Distribution"
                onChange={() =>
                  setLifeExpectancy((prev) => [
                    {
                      type: "Normal",
                      mean: prev?.[0]?.mean || 82,
                      stdev: prev?.[0]?.stdev || 3,
                    },
                    ...(prev.length > 1 ? [prev[1]] : []),
                  ])
                }
                checked={lifeExpectancy[0]?.type === "Normal"}
              />
              Normal Distribution
            </label>

            <LifeExpectency
              lifeExpectancyType={lifeExpectancy[0]?.type}
              expectedAge={lifeExpectancy[0]?.value ?? ""}
              setExpectedAge={(val) =>
                setLifeExpectancy((prev) => {
                  const updated = [...prev];
                  updated[0] = { type: "Fixed", value: Number(val) };
                  return updated;
                })
              }
              meanAge={lifeExpectancy[0]?.mean ?? ""}
              setMeanAge={(val) =>
                setLifeExpectancy((prev) => {
                  const updated = [...prev];
                  updated[0] = {
                    type: "Normal",
                    mean: Number(val),
                    stdev: lifeExpectancy[0]?.stdev ?? 0,
                  };
                  return updated;
                })
              }
              std={lifeExpectancy[0]?.stdev ?? ""}
              setStd={(val) =>
                setLifeExpectancy((prev) => {
                  const updated = [...prev];
                  updated[0] = {
                    type: "Normal",
                    mean: lifeExpectancy[0]?.mean ?? 0,
                    stdev: Number(val),
                  };
                  return updated;
                })
              }
            />
          </div>
        </div>

        {maritalStatus === "couple" && (
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
                  onChange={() =>
                    setLifeExpectancy((prev) => [
                      prev[0],
                      { type: "Fixed", value: prev?.[1]?.value || 80 },
                    ])
                  }
                  checked={lifeExpectancy[1]?.type === "Fixed"}
                />
                Fixed Age
              </label>
              <label>
                <input
                  type="radio"
                  id="spouse-life-expectancy"
                  value="Normal Distribution"
                  onChange={() =>
                    setLifeExpectancy((prev) => [
                      prev[0],
                      {
                        type: "Normal",
                        mean: prev?.[1]?.mean || 82,
                        stdev: prev?.[1]?.stdev || 3,
                      },
                    ])
                  }
                  checked={lifeExpectancy[1]?.type === "Normal"}
                />
                Normal Distribution
              </label>

              <LifeExpectency
                lifeExpectancyType={lifeExpectancy[1]?.type}
                expectedAge={lifeExpectancy[1]?.value ?? ""}
                setExpectedAge={(val) =>
                  setLifeExpectancy((prev) => {
                    const updated = [...prev];
                    updated[1] = { type: "Fixed", value: Number(val) };
                    return updated;
                  })
                }
                meanAge={lifeExpectancy[1]?.mean ?? ""}
                setMeanAge={(val) =>
                  setLifeExpectancy((prev) => {
                    const updated = [...prev];
                    updated[1] = {
                      type: "Normal",
                      mean: Number(val),
                      stdev: lifeExpectancy[1]?.stdev ?? 0,
                    };
                    return updated;
                  })
                }
                std={lifeExpectancy[1]?.stdev ?? ""}
                setStd={(val) =>
                  setLifeExpectancy((prev) => {
                    const updated = [...prev];
                    updated[1] = {
                      type: "Normal",
                      mean: lifeExpectancy[1]?.mean ?? 0,
                      stdev: Number(val),
                    };
                    return updated;
                  })
                }
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
            data={investmentTypes}
            emptyMessage="This plan does not contain any new investment types."
            category="Tax Status"
            renderAttribute={(investmentType) =>
              investmentType.taxability ? "Taxable" : "Tax-exempt"
            }
          ></SelectionTable>
          {editScenario === null && (
            <Link
              to="/dashboard/createScenario/addNewInvestmentType"
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
            data={eventSeries}
            emptyMessage="This plan does not contain any new event series."
            category="Type"
            renderAttribute={(eventSeries) => eventSeries.type}
          ></SelectionTable>
          {editScenario === null && (
            <Link
              to="/dashboard/createScenario/addNewEventSeries"
              className="add-event-series-container"
            >
              Add New Event Series
            </Link>
          )}
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

        <div className="save-button-container">
          <button onClick={handleSubmit} className="save-button">
            Save Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
