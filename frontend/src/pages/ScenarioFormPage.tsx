import { useState, useEffect, useRef } from "react";
import "../stylesheets/CreateScenario.css";
import LifeExpectency from "../components/LifeExpectency";
import { Link, useNavigate } from "react-router-dom";
import ValidationTextFields from "../components/shared/ValidationTextFields";
import { useHelperContext } from "../HelperContext";
import { useScenarioContext } from "../useScenarioContext";
import { Scenario } from "../../../backend/db/Scenario";
import SelectionTable from "../components/shared/SelectionTable";
import axiosCookie from "../axiosCookie";
import ImportScenario from "../components/ImportScenario";

export default function ScenarioFormPage() {
  const navigate = useNavigate();
  const { handleEditScenario } = useHelperContext();
  const {
    name,
    setName,
    maritalStatus,
    setMaritalStatus,
    birthYears,
    setBirthYears,
    lifeExpectancy,
    setLifeExpectancy,
    financialGoal,
    setFinancialGoal,
    residenceState,
    setResidenceState,
    investmentTypes,
    setInvestmentTypes,
    setInvestments,
    eventSeries,
    setEventSeries,
    setInflationAssumption,
    setAfterTaxContributionLimit,
    setSpendingStrategy,
    setExpenseWithdrawalStrategy,
    setRMDStrategy,
    setRothConversionOpt,
    setRothConversionStart,
    setRothConversionEnd,
    setRothConversionStrategy,
    editScenario,
    setEditInvestmentType,
    setEditEventSeries,
  } = useScenarioContext();

  const handleCancel = () => {
    console.log(editScenario);
    navigate(`/scenario/${editScenario._id}`);
  };

  const handleFileParsed = async function (data: unknown) {
    // grabs user info
    const userInfo = await axiosCookie.get("/user");

    // create correct json object for backend scenario creation
    const requestBody = {
      userID: userInfo.data._id,
      scenario: data,
    };

    //attempts to create the scenario
    try {
      const response = await axiosCookie.post(
        "/scenario/create",
        requestBody
      );
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log("Scenario Form Page Investment Type: ", investmentTypes);
  }, [investmentTypes]);

  useEffect(() => {
    if (editScenario) {
      setName(editScenario.name);
      setMaritalStatus(editScenario.maritalStatus);
      setBirthYears(editScenario.birthYears);
      setLifeExpectancy(editScenario.lifeExpectancy);
      setInvestmentTypes(editScenario.investmentTypes);
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
    }
  }, [editScenario]);

  const handleSubmit = async () => {
    const userID = await (async () => {
      const res = await fetch("http://localhost:8000/user", {
        credentials: "include", // ensures session cookie is sent
      });
      const user = await res.json();
      return user._id;
    })();
    const scenarioID = editScenario._id;
    // Removes the _id from life expectancy
    const cleanedLifeExpectancy = lifeExpectancy.map((item) => {
      if ("_id" in item) {
        const { _id, ...rest } = item;
        return rest;
      }
      return item;
    });
    const updatedFields = {
      name: name,
      maritalStatus: maritalStatus,
      birthYears: birthYears,
      lifeExpectancy: cleanedLifeExpectancy,
    };
    console.log("Scenario Form Page: ", updatedFields);
    console.log("Scenario Form Page: ", editScenario._id);
    await handleEditScenario(userID, scenarioID, updatedFields);
    navigate(`/scenario/${scenarioID}`);
  };

  return (
    <div className="create-scenario-container">
      {/*Title*/}
      <div className="header-line">
        <h2 className="header">
          {editScenario !== null ? "Update Scenario" : "Create Scenario"}
        </h2>
        <button className="back-link" onClick={handleCancel}>
          Cancel
        </button>
      </div>
      <div>
        <p>You can choose to import a yaml file here instead</p>
        <ImportScenario onFileParsed={handleFileParsed} />
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
          value={financialGoal ?? ""}
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
            value={birthYears?.[0] || ""}
            placeholder="Enter a year (e.g., 2003)"
            setInput={(val) =>
              setBirthYears((prev) => {
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
            value={birthYears?.[1] || ""}
            placeholder="Enter a year (e.g., 2003)"
            setInput={(val) =>
              setBirthYears((prev) => {
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
                    {
                      type: "fixed",
                      value: prev[0]?.type === "fixed" ? prev[0].value : 80,
                    },
                    ...(prev.length > 1 ? [prev[1]] : []),
                  ])
                }
                checked={lifeExpectancy[0]?.type === "fixed"}
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
                      type: "normal",
                      mean: prev[0]?.type === "normal" ? prev[0].mean : 82,
                      stdev: prev[0]?.type === "normal" ? prev[0].stdev : 3,
                    },
                    ...(prev.length > 1 ? [prev[1]] : []),
                  ])
                }
                checked={lifeExpectancy[0]?.type === "normal"}
              />
              Normal Distribution
            </label>

            <LifeExpectency
              lifeExpectancyType={lifeExpectancy[0]?.type}
              expectedAge={
                lifeExpectancy[0]?.type === "fixed"
                  ? lifeExpectancy[0].value.toString()
                  : ""
              }
              setExpectedAge={(val) =>
                setLifeExpectancy((prev) => {
                  const updated = [...prev];
                  updated[0] = {
                    type: "fixed",
                    value: Number(val),
                  };
                  return updated;
                })
              }
              meanAge={
                lifeExpectancy[0]?.type === "normal"
                  ? lifeExpectancy[0].mean.toString()
                  : ""
              }
              setMeanAge={(val) =>
                setLifeExpectancy((prev) => {
                  const updated = [...prev];
                  // Preserve the existing stdev if it's already Normal
                  const currentStdev =
                    prev[0]?.type === "normal" ? prev[0].stdev : 3;
                  updated[0] = {
                    type: "normal",
                    mean: Number(val),
                    stdev: currentStdev,
                  };
                  return updated;
                })
              }
              std={
                lifeExpectancy[0]?.type === "normal"
                  ? lifeExpectancy[0].stdev.toString()
                  : ""
              }
              setStd={(val) =>
                setLifeExpectancy((prev) => {
                  const updated = [...prev];
                  // Preserve the existing mean if it's already Normal
                  const currentMean =
                    prev[0]?.type === "normal" ? prev[0].mean : 82;
                  updated[0] = {
                    type: "normal",
                    mean: currentMean,
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
              <span className="grayed-text">How long your spouse lives</span>
            </div>
            <div>
              <span>Choose how to model your spouse's life expectancy. </span>
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
                      {
                        type: "fixed",
                        value: prev[1]?.type === "fixed" ? prev[1].value : 80,
                      },
                    ])
                  }
                  checked={lifeExpectancy[1]?.type === "fixed"}
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
                        type: "normal",
                        mean: prev[1]?.type === "normal" ? prev[1].mean : 82,
                        stdev: prev[1]?.type === "normal" ? prev[1].stdev : 3,
                      },
                    ])
                  }
                  checked={lifeExpectancy[1]?.type === "normal"}
                />
                Normal Distribution
              </label>

              <LifeExpectency
                lifeExpectancyType={lifeExpectancy[1]?.type}
                expectedAge={
                  lifeExpectancy[1]?.type === "fixed"
                    ? lifeExpectancy[1].value.toString()
                    : ""
                }
                setExpectedAge={(val) =>
                  setLifeExpectancy((prev) => {
                    const updated = [...prev];
                    updated[1] = {
                      type: "fixed",
                      value: Number(val),
                    };
                    return updated;
                  })
                }
                meanAge={
                  lifeExpectancy[1]?.type === "normal"
                    ? lifeExpectancy[1].mean.toString()
                    : ""
                }
                setMeanAge={(val) =>
                  setLifeExpectancy((prev) => {
                    const updated = [...prev];
                    const currentStdev =
                      prev[1]?.type === "normal" ? prev[1].stdev : 3;
                    updated[1] = {
                      type: "normal",
                      mean: Number(val),
                      stdev: currentStdev,
                    };
                    return updated;
                  })
                }
                std={
                  lifeExpectancy[1]?.type === "normal"
                    ? lifeExpectancy[1].stdev.toString()
                    : ""
                }
                setStd={(val) =>
                  setLifeExpectancy((prev) => {
                    const updated = [...prev];
                    const currentMean =
                      prev[1]?.type === "normal" ? prev[1].mean : 82;
                    updated[1] = {
                      type: "normal",
                      mean: currentMean,
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
            data={Object.values(investmentTypes)}
            emptyMessage="This plan does not contain any new investment types."
            renderAttribute={(investmentType) =>
              investmentType.taxability ? "Taxable" : "Tax-exempt"
            }
          ></SelectionTable>
          <Link
            to="/dashboard/createScenario/addNewInvestmentType"
            className="add-investment-type-container"
            onClick={() => setEditInvestmentType(null)}
          >
            Add New Investment Type
          </Link>
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
            data={Object.values(eventSeries)}
            emptyMessage="This plan does not contain any new event series."
            renderAttribute={(event) => event?.event?.type}
          ></SelectionTable>
          <Link
            to="/dashboard/createScenario/addNewEventSeries"
            className="add-event-series-container"
            onClick={() => setEditEventSeries(null)}
          >
            Add New Event Series
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
          <Link
            to="/dashboard/createScenario/Limits&ContributionLimits"
            className="limits-and-contribution-container"
          >
            {editScenario !== null
              ? "Edit Limits & Contribution"
              : "Add Limits & Contribution"}
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
          <button className="save-button" onClick={handleSubmit}>
            Save Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
