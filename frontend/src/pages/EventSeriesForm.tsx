import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import EventSeriesIncome from "../components/EventSeries/Income";
import EventSeriesExpense from "../components/EventSeries/Expense";
import EventSeriesInvest from "../components/EventSeries/Invest";
import "../stylesheets/EventSeries/AddNewEventSeries.css";
import EventSeriesRebalance from "../components/EventSeries/Rebalance";
import ValidationTextFields from "../components/shared/ValidationTextFields";
import {
  useScenarioContext,
  EventSeries,
  eventStartType,
  EventSeriesDistribution,
  IncomeEvent,
  ExpenseEvent,
  InvestEvent,
  RebalanceEvent,
  assetProportion,
} from "../useScenarioContext";
import { useEventSeriesFormHooks } from "../hooks/useEventSeriesFormHooks";

const defaultInvestments = [
  { id: "1", name: "S&P 500 ETF", initialAllocation: 0, finalAllocation: 0 },
  {
    id: "2",
    name: "Corporate Bonds",
    initialAllocation: 0,
    finalAllocation: 0,
  },
  {
    id: "3",
    name: "Real Estate Fund",
    initalAllocation: 0,
    finalAllocation: 0,
  },
];

export default function EventSeriesForm() {
  const navigate = useNavigate();
  const { eventSeriesFormHooks } = useEventSeriesFormHooks();
  const { eventSeries, setEventSeries, editEventSeries, setEditEventSeries } =
    useScenarioContext();

  useEffect(() => {
    if (editEventSeries) {
      const {
        setEventSeriesName,

        // Year
        setStartYearModel,
        setStartYear,
        setMeanYear,
        setStdDevYear,
        setLowerBoundYear,
        setUpperBoundYear,
        setWithOrAfter,
        setSelectedEvent,

        // Duration
        setDurationType,
        setDurationValue,
        setMeanDuration,
        setStdDuration,
        setLowerBoundDuration,
        setUpperBoundDuration,

        // Event Type
        setEventType,

        // Income
        setIncomeType,
        setIncomeInitialValue,
        setIncomeDistributionType,
        setIsFixedIncomeAmount,
        setFixedIncomeValue,
        setIncomeMean,
        setIncomeStdDev,
        setIncomeLowerBound,
        setIncomeUpperBound,
        setApplyInflation,
        setUserPercentage,

        // Expense
        setIsDiscretionary,
        setExpenseInitialAmount,
        setExpenseDistributionType,
        setIsExpenseAmount,
        setExpenseFixedValue,
        setExpenseMean,
        setExpenseStdDev,
        setExpenseLowerBound,
        setExpenseUpperBound,

        // Invest
        setInvestAllocationType,
        setAllocatedInvestments,
        setAllocated2Investments,
        setInvestMaxCashHoldings,

        // Rebalance
        setAllocationType,
        setAllocatedRebalanceInvestments,
        setTaxStatus,
      } = eventSeriesFormHooks;

      // Name
      setEventSeriesName(editEventSeries.name || "");

      // Start Year
      setStartYearModel(editEventSeries.start?.type || "");
      setStartYear(editEventSeries.start?.value || "");
      setMeanYear(editEventSeries.start?.mean || "");
      setStdDevYear(editEventSeries.start?.stdev || "");
      setLowerBoundYear(editEventSeries.start?.min || "");
      setUpperBoundYear(editEventSeries.start?.max || "");
      setWithOrAfter(editEventSeries.start?.withOrAfter || "");
      setSelectedEvent(editEventSeries.start?.event || "");

      // Duration
      setDurationType(editEventSeries.duration?.type || "");
      setDurationValue(editEventSeries.duration?.value || "");
      setMeanDuration(editEventSeries.duration?.mean || "");
      setStdDuration(editEventSeries.duration?.stdev || "");
      setLowerBoundDuration(editEventSeries.duration?.min || "");
      setUpperBoundDuration(editEventSeries.duration?.max || "");

      // Event Type
      setEventType(editEventSeries.event?.type || "");

      const mapDistributionTypeToLabel = (type: string) => {
        if (type === "Normal") return "Normal Distribution";
        if (type === "Fixed") return "Fixed Amount/Percentage";
        if (type === "Uniform") return "Uniform Distribution";
      };

      // Handle based on Event Type
      if (editEventSeries.event?.type === "Income") {
        setIncomeType(
          editEventSeries.event.socialSecurity === true
            ? "Social Security"
            : "Wages"
        );
        setIncomeInitialValue(editEventSeries.event.initialAmount || 0);
        setIncomeDistributionType(
          // mapDistributionTypeToLabel(
          editEventSeries.event.changeDistribution.type
          // )
        );
        setIsFixedIncomeAmount(
          editEventSeries.event.changeAmountOrPercent?.type === "Amount"
        );
        setFixedIncomeValue(
          editEventSeries.event.changeDistribution?.value || ""
        );
        setIncomeMean(editEventSeries.event.changeDistribution?.mean || "");
        setIncomeStdDev(editEventSeries.event.changeDistribution?.stdev || "");
        setIncomeLowerBound(
          editEventSeries.event.changeDistribution?.min || ""
        );
        setIncomeUpperBound(
          editEventSeries.event.changeDistribution?.max || ""
        );
        setApplyInflation(editEventSeries.event.inflationAdjusted || false);
        setUserPercentage(editEventSeries.event.userFraction * 100 || 100);
      }

      if (editEventSeries.event?.type === "Expense") {
        setIsDiscretionary(editEventSeries.event.discretionary || false);
        setExpenseInitialAmount(editEventSeries.event.initialAmount || 0);
        setExpenseDistributionType(
          editEventSeries.event.changeDistribution?.type || ""
        );
        setIsExpenseAmount(
          editEventSeries.event.changeDistribution?.type === "Fixed"
        );
        setExpenseFixedValue(
          editEventSeries.event.changeDistribution?.value || ""
        );
        setExpenseMean(editEventSeries.event.changeDistribution?.mean || "");
        setExpenseStdDev(editEventSeries.event.changeDistribution?.stdev || "");
        setExpenseLowerBound(
          editEventSeries.event.changeDistribution?.lower || ""
        );
        setExpenseUpperBound(
          editEventSeries.event.changeDistribution?.upper || ""
        );
        setApplyInflation(editEventSeries.event.inflationAdjusted || false);
        setUserPercentage(editEventSeries.event.userFraction || 0);
      }

      if (editEventSeries.event?.type === "Invest") {
        setInvestAllocationType(
          editEventSeries.event.glidePath ? "Glide Path" : "Fixed"
        );
        setAllocatedInvestments(editEventSeries.event.assetAllocation || []);
        setAllocated2Investments(editEventSeries.event.assetAllocation2 || []);
        setInvestMaxCashHoldings(editEventSeries.event.maxCash || 0);
      }

      if (editEventSeries.event?.type === "Rebalance") {
        setAllocationType(editEventSeries.event.allocatedType);
        setAllocatedRebalanceInvestments(
          editEventSeries.event.assetAllocation || []
        );
        setTaxStatus(editEventSeries.event.taxStatus);
      }
    }
  });

  const handleSaveEventSeries = () => {
    if (!eventSeriesFormHooks) {
      return;
    }

    const {
      eventSeriesName,
      eventSeriesDescription,

      // Year
      startYearModel,
      startYear,
      meanYear,
      stdDevYear,
      lowerBoundYear,
      upperBoundYear,
      withOrAfter,
      selectedEvent,

      // Duration
      durationType,
      durationValue,
      meanDuration,
      stdDuration,
      lowerBoundDuration,
      upperBoundDuration,

      // Event Type
      eventType,

      // Income
      incomeType,
      incomeInitialValue,
      incomeDistributionType,
      isFixedIncomeAmount,
      fixedIncomeValue,
      incomeMean,
      incomeStdDev,
      incomeLowerBound,
      incomeUpperBound,
      applyInflation,
      userPercentage,

      // Expense
      isDiscretionary,
      expenseInitialAmount,
      expenseDistributionType,
      isExpenseAmount,
      expenseFixedValue,
      expenseMean,
      expenseStdDev,
      expenseLowerBound,
      expenseUpperBound,

      // Invest
      investAllocationType,
      allocatedInvestments,
      allocated2Investments,
      investStartYear,
      investEndYear,
      investMaxCashHoldings,

      // Rebalance
      allocationType,
      rebalanceStartYear,
      rebalanceEndYear,
      allocatedRebalanceInvestments,
      allocatedRebalance2Investments,
      taxStatus,
      rebalanceMaxCashHoldings,
    } = eventSeriesFormHooks;

    // =========== Start =============
    let start: eventStartType;

    if (startYearModel === "Fixed Value") {
      start = {
        type: "Fixed",
        value: Number(startYear),
      };
    } else if (startYearModel === "Normal Distribution") {
      start = {
        type: "Normal",
        mean: Number(meanYear),
        stdev: Number(stdDevYear),
      };
    } else if (startYearModel === "Uniform Distribution") {
      start = {
        type: "Uniform",
        min: Number(lowerBoundYear),
        max: Number(upperBoundYear),
      };
    } else if (startYearModel === "EventBased") {
      start = {
        type: "EventBased",
        withOrAfter: withOrAfter,
        event: selectedEvent,
      };
    } else {
      throw new Error("Invalid start year model selected");
    }

    // ========== Duration ===========
    let duration: EventSeriesDistribution;

    if (durationType === "Fixed Value") {
      duration = {
        type: "Fixed",
        value: Number(durationValue),
      };
    } else if (durationType === "Normal Distribution") {
      duration = {
        type: "Normal",
        mean: Number(meanDuration),
        stdev: Number(stdDuration),
      };
    } else if (durationType === "Uniform Distribution") {
      duration = {
        type: "Uniform",
        min: Number(lowerBoundDuration),
        max: Number(upperBoundDuration),
      };
    } else {
      throw new Error("Invalid duration type selected");
    }

    // ============= Event ===============
    let event: IncomeEvent | ExpenseEvent | InvestEvent | RebalanceEvent;
    if (eventType === "Income") {
      const incomeChangeDistribution: EventSeriesDistribution =
        incomeDistributionType === "Fixed Value/Percentage"
          ? { type: "Fixed", value: Number(fixedIncomeValue) }
          : incomeDistributionType === "Normal Distribution"
          ? {
              type: "Normal",
              mean: Number(incomeMean),
              stdev: Number(incomeStdDev),
            }
          : {
              type: "Uniform",
              min: Number(incomeLowerBound),
              max: Number(incomeUpperBound),
            };

      event = {
        type: "Income",
        initialAmount: Number(incomeInitialValue),
        changeAmountOrPercent: isFixedIncomeAmount ? "Amount" : "Percent",
        changeDistribution: incomeChangeDistribution,
        inflationAdjusted: applyInflation,
        userFraction: userPercentage / 100,
        socialSecurity: incomeType === "Social Security",
      };
    } else if (eventType === "Expense") {
      const expenseChangeDistribution: EventSeriesDistribution =
        expenseDistributionType === "Fixed Value/Percentage"
          ? { type: "Fixed", value: Number(expenseFixedValue) }
          : expenseDistributionType === "Normal Distribution"
          ? {
              type: "Normal",
              mean: Number(expenseMean),
              stdev: Number(expenseStdDev),
            }
          : {
              type: "Uniform",
              min: Number(expenseLowerBound),
              max: Number(expenseUpperBound),
            };

      event = {
        type: "Expense",
        initialAmount: Number(expenseInitialAmount),
        changeAmountOrPercent: isExpenseAmount ? "Amount" : "Percent",
        changeDistribution: expenseChangeDistribution,
        inflationAdjusted: applyInflation,
        userFraction: userPercentage / 100,
        discretionary: isDiscretionary,
      };
    } else if (eventType === "Invest") {
      const allocation: assetProportion[] = allocatedInvestments.map(
        (inv: any) => ({
          asset: inv.asset,
          proportion: Number(inv.proportion),
        })
      );
      console.log(`inside handleSubmit`, { allocatedInvestments });

      let allocation2: assetProportion[] | undefined;
      if (investAllocationType === "Glide Path") {
        allocation2 = allocated2Investments.map((inv: any) => ({
          asset: inv.asset,
          proportion: Number(inv.proportion),
        }));
      }

      event = {
        type: "Invest",
        assetAllocation: allocation,
        glidePath: investAllocationType === "Glide Path",
        assetAllocation2:
          investAllocationType === "Glide Path" ? allocation2 : [],
        maxCash: Number(investMaxCashHoldings),
      };
    } else if (eventType === "Rebalance") {
      const allocation: assetProportion[] = allocatedRebalanceInvestments.map(
        (inv: any) => ({
          asset: inv.asset,
          proportion: Number(inv.proportion),
        })
      );

      let allocation2: assetProportion[] | undefined;
      if (allocationType === "Glide Path") {
        allocation2 = allocatedRebalance2Investments.map((inv: any) => ({
          asset: inv.asset,
          proportion: Number(inv.proportion),
        }));
      }

      event = {
        type: "Rebalance",
        taxStatus: taxStatus,
        assetAllocation: allocation,
        glidePath: allocationType === "Glide Path",
        assetAllocation2: allocationType === "Glide Path" ? allocation2 : [],
      };
    } else {
      throw new Error("Event Reformatting Issue");
    }

    // ============ Event Series ============
    const newEventSeries: EventSeries = {
      name: String(eventSeriesName),
      start,
      duration,
      event,
    };

    // Store in map or record
    setEventSeries({
      ...eventSeries,
      [newEventSeries.name]: newEventSeries,
    });

    console.log(`New Event Series`, { newEventSeries });

    navigate("/dashboard/createScenario");
  };

  return (
    <motion.div
      initial={{ x: window.innerWidth }}
      animate={{ x: 0 }}
      exit={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CenteredFormWrapper>
        {/*Title*/}
        <div className="header-line">
          <h2 className="header">Add New Event Series</h2>
          <Link to="/dashboard/createScenario" className="back-link">
            {"<<"}Back
          </Link>
        </div>

        {/*Investment Name*/}
        <div className="event-series-name-container">
          <h3 className="purple-title">Event Series Name</h3>
          <ValidationTextFields
            value={eventSeriesFormHooks.eventSeriesName}
            placeholder="e.g., Retirement Income, Child's College Fund, S&P 500 ETF"
            setInput={eventSeriesFormHooks.setEventSeriesName}
            inputType="string"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>

        {/*Description*/}
        <div className="event-series-description-container">
          <h3 className="purple-title">Description</h3>
          <ValidationTextFields
            value={eventSeriesFormHooks.eventSeriesDescription}
            placeholder="Describe your event series, e.g. Provides fixed annual income until age 65"
            setInput={eventSeriesFormHooks.setEventSeriesDescription}
            inputType="string"
            width="100%"
            height="150px"
            disabled={false}
          />
        </div>

        {/*Expected Start Year*/}
        <div className="expected-start-year-container">
          <div className="title-with-info">
            <h3 className="purple-title">Expected Start Year</h3>
            <span className="grayed-text">Start Year</span>
          </div>

          {/*Expected Start Year Description*/}
          <div className="start-year-description-container">
            <span className="black-text">
              Choose how to model the expected start year for this event series:{" "}
            </span>
            <span className="grayed-text">
              You can enter a fixed value, a value sampled from a normal or
              uniform distribution, or use advanced settings to select the same
              year that a specificed event series starts, or the year after a
              speicfied event series ends.
            </span>
          </div>

          {/*Different selection types*/}
          <div className="type-container">
            <div>
              <label className="option">
                <input
                  type="radio"
                  id="startYearModel"
                  value="Fixed Value"
                  onChange={() =>
                    eventSeriesFormHooks.setStartYearModel("Fixed Value")
                  }
                  checked={
                    eventSeriesFormHooks.startYearModel === "Fixed Value"
                  }
                />
                Fixed Value
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="startYearModel"
                  value="Normal Distribution"
                  onChange={() => {
                    eventSeriesFormHooks.setStartYearModel(
                      "Normal Distribution"
                    );
                  }}
                  checked={
                    eventSeriesFormHooks.startYearModel == "Normal Distribution"
                  }
                ></input>
                Normal Distribution
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="startYearModel"
                  value="Uniform Distribution"
                  onChange={() => {
                    eventSeriesFormHooks.setStartYearModel(
                      "Uniform Distribution"
                    );
                  }}
                  checked={
                    eventSeriesFormHooks.startYearModel ==
                    "Uniform Distribution"
                  }
                ></input>
                Uniform Distribution
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="startYearModel"
                  value="eventBased"
                  onChange={() => {
                    eventSeriesFormHooks.setStartYearModel("eventBased");
                  }}
                  checked={eventSeriesFormHooks.startYearModel == "eventBased"}
                ></input>
                eventBased
              </label>
            </div>
          </div>

          {eventSeriesFormHooks.startYearModel === "Fixed Value" && (
            <div className="input-group">
              <div className="input-label">Enter the Start Year</div>
              <ValidationTextFields
                value={eventSeriesFormHooks.startYear}
                placeholder="Enter a fixed year (e.g. 2024)"
                setInput={eventSeriesFormHooks.setStartYear}
                inputType="number"
                width="100%"
                height="1.4375em"
                disabled={false}
              />
            </div>
          )}

          {eventSeriesFormHooks.startYearModel === "Normal Distribution" && (
            <div>
              <div className="input-container">
                <div className="input-label">Enter Mean Year</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.meanYear}
                  placeholder="Enter year (e.g., 2024)"
                  setInput={eventSeriesFormHooks.setMeanYear}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>

              <div className="input-container">
                <div className="input-label">Enter Standard Deviation</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.stdDevYear}
                  placeholder="Enter standard deviation (e.g., 2)"
                  setInput={eventSeriesFormHooks.setStdDevYear}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>
            </div>
          )}

          {eventSeriesFormHooks.startYearModel === "Uniform Distribution" && (
            <div>
              <div className="input-container">
                <div className="input-label">Enter Lower Bound Year</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.lowerBoundYear}
                  placeholder="Enter year (e.g., 2024)"
                  setInput={eventSeriesFormHooks.setLowerBoundYear}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>

              <div className="input-container">
                <div className="input-label">Enter Upper Bound Year</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.upperBoundYear}
                  placeholder="Enter year (e.g., 2025)"
                  setInput={eventSeriesFormHooks.setUpperBoundYear}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>
            </div>
          )}

          {eventSeriesFormHooks.startYearModel === "eventBased" && (
            <div className="event-based-container">
              {/* Radio Buttons */}
              <div className="radio-options">
                <div className="input-label">When should this event start?</div>
                <label>
                  <input
                    type="radio"
                    name="eventStart"
                    value="With"
                    onChange={() => eventSeriesFormHooks.setWithOrAfter("With")}
                    checked={eventSeriesFormHooks.withOrAfter === "With"}
                  />
                  With
                </label>
                <label>
                  <input
                    type="radio"
                    name="eventStart"
                    value="After"
                    onChange={() =>
                      eventSeriesFormHooks.setWithOrAfter("After")
                    }
                    checked={eventSeriesFormHooks.withOrAfter === "After"}
                  />
                  After
                </label>
              </div>

              {/* Textbox for Investment Name */}
              {/* <div className="event-name-input">
                <div className="input-label">Related Investment Name</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.eventSeriesName}
                  placeholder="Enter event name"
                  setInput={eventSeriesFormHooks.setEventSeriesName}
                  inputType="string"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div> */}
            </div>
          )}
        </div>

        {/*Duration*/}
        <div className="duration-container">
          <div className="title-with-info">
            <h3 className="purple-title">Duration</h3>
            <span className="grayed-text">Event Series Duration in Years</span>
          </div>

          <div className="description-container">
            <span className="black-text">
              Choose how to model the duration for this event series.{" "}
            </span>
            <span className="grayed-text">
              You can enter a fixed value or a value sampled from a normal or
              uniform distribution.
            </span>
          </div>

          <div className="type-container">
            <label className="option">
              <input
                type="radio"
                id="durationType"
                value="Fixed Value"
                onChange={() =>
                  eventSeriesFormHooks.setDurationType("Fixed Value")
                }
                checked={eventSeriesFormHooks.durationType === "Fixed Value"}
              />
              Fixed Value
            </label>
            <label className="option">
              <input
                type="radio"
                id="durationType"
                value="Normal Distribution"
                onChange={() =>
                  eventSeriesFormHooks.setDurationType("Normal Distribution")
                }
                checked={
                  eventSeriesFormHooks.durationType === "Normal Distribution"
                }
              />
              Normal Distribution
            </label>
            <label className="option">
              <input
                type="radio"
                id="durationType"
                value="Uniform Distribution"
                onChange={() => {
                  eventSeriesFormHooks.setDurationType("Uniform Distribution");
                }}
                checked={
                  eventSeriesFormHooks.durationType == "Uniform Distribution"
                }
              ></input>
              Uniform Distribution
            </label>
          </div>

          {eventSeriesFormHooks.durationType === "Fixed Value" && (
            <div className="input-group">
              <div className="input-label">Enter the Duration</div>
              {/* <input
              className="textbox"
              placeholder="Enter a number of year (e.g. 10)"
              onChange={(e) => setDurationFixedValue(e.target.value)}
            /> */}
              <ValidationTextFields
                value={eventSeriesFormHooks.durationValue}
                placeholder="Enter a number of year (e.g. 10)"
                setInput={eventSeriesFormHooks.setDurationValue}
                inputType="number"
                width="100%"
                height="1.4375em"
                disabled={false}
              />
            </div>
          )}

          {eventSeriesFormHooks.durationType === "Normal Distribution" && (
            <div>
              <div className="input-container">
                <div className="input-label">Enter Mean Year</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.meanDuration}
                  placeholder="Enter a number of year (e.g. 10)"
                  setInput={eventSeriesFormHooks.setMeanDuration}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>

              <div className="input-container">
                <div className="input-label">Enter Standard Deviation</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.stdDuration}
                  placeholder="Enter standard deviation (e.g., 2)"
                  setInput={eventSeriesFormHooks.setStdDuration}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>
            </div>
          )}

          {eventSeriesFormHooks.durationType === "Uniform Distribution" && (
            <div>
              <div className="input-container">
                <div className="input-label">Enter Duration Lower Bound</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.stdDuration}
                  placeholder="Enter standard deviation (e.g., 2)"
                  setInput={eventSeriesFormHooks.setStdDuration}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>

              <div className="input-container">
                <div className="input-label">Enter Duration Upper Bound</div>
                <ValidationTextFields
                  value={eventSeriesFormHooks.upperBoundDuration}
                  placeholder="Enter year (e.g., 10)"
                  setInput={eventSeriesFormHooks.setUpperBoundDuration}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>
            </div>
          )}
        </div>

        {/*Event Series Type*/}
        <div>
          <h3 className="purple-title">Type</h3>
          <div className="type-container">
            <div>
              <label className="option">
                <input
                  type="radio"
                  id="eventSeriesType"
                  value="Income"
                  onChange={() => eventSeriesFormHooks.setEventType("Income")}
                  checked={eventSeriesFormHooks.eventType === "Income"}
                />
                Income
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="eventSeriesType"
                  value="Expense"
                  onChange={() => eventSeriesFormHooks.setEventType("Expense")}
                  checked={eventSeriesFormHooks.eventType === "Expense"}
                />
                Expense
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="eventSeriesType"
                  value="Invest"
                  onChange={() => eventSeriesFormHooks.setEventType("Invest")}
                  checked={eventSeriesFormHooks.eventType === "Invest"}
                />
                Invest
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="eventSeriesType"
                  value="Rebalance"
                  onChange={() =>
                    eventSeriesFormHooks.setEventType("Rebalance")
                  }
                  checked={eventSeriesFormHooks.eventType === "Rebalance"}
                />
                Rebalance
              </label>
            </div>
          </div>

          {eventSeriesFormHooks.eventType === "Income" && (
            <EventSeriesIncome
              incomeType={eventSeriesFormHooks.incomeType}
              setIncomeType={eventSeriesFormHooks.setIncomeType}
              initialAmount={eventSeriesFormHooks.incomeInitialValue}
              setInitialAmount={eventSeriesFormHooks.setIncomeInitialValue}
              distributionType={eventSeriesFormHooks.incomeDistributionType}
              setDistributionType={
                eventSeriesFormHooks.setIncomeDistributionType
              }
              isFixedAmount={eventSeriesFormHooks.isFixedIncomeAmount}
              setIsFixedAmount={eventSeriesFormHooks.setIsFixedIncomeAmount}
              fixedValue={eventSeriesFormHooks.fixedIncomeValue}
              setFixedValue={eventSeriesFormHooks.setFixedIncomeValue}
              mean={eventSeriesFormHooks.incomeMean}
              setMean={eventSeriesFormHooks.setIncomeMean}
              stdDev={eventSeriesFormHooks.incomeStdDev}
              setStdDev={eventSeriesFormHooks.setIncomeStdDev}
              lowerBound={eventSeriesFormHooks.incomeLowerBound}
              setLowerBound={eventSeriesFormHooks.setIncomeLowerBound}
              upperBound={eventSeriesFormHooks.incomeUpperBound}
              setUpperBound={eventSeriesFormHooks.setIncomeUpperBound}
              applyInflation={eventSeriesFormHooks.applyInflation}
              setToggleInflation={eventSeriesFormHooks.setApplyInflation}
              userPercentage={eventSeriesFormHooks.userPercentage}
              setUserPercentage={eventSeriesFormHooks.setUserPercentage}
              spousePercentage={eventSeriesFormHooks.spousePercentage}
              setSpousePercentage={eventSeriesFormHooks.setSpousePercentage}
            />
          )}

          {eventSeriesFormHooks.eventType === "Expense" && (
            <EventSeriesExpense
              isDiscretionary={eventSeriesFormHooks.isDiscretionary}
              setIsDiscretionary={eventSeriesFormHooks.setIsDiscretionary}
              expenseInitialAmount={eventSeriesFormHooks.expenseInitialAmount}
              setExpenseInitialAmount={
                eventSeriesFormHooks.setExpenseInitialAmount
              }
              expenseDistributionType={
                eventSeriesFormHooks.expenseDistributionType
              }
              setExpenseDistributionType={
                eventSeriesFormHooks.setExpenseDistributionType
              }
              isExpenseAmount={eventSeriesFormHooks.isExpenseAmount}
              setIsExpenseAmount={eventSeriesFormHooks.setIsExpenseAmount}
              expenseFixedValue={eventSeriesFormHooks.expenseFixedValue}
              setExpenseFixedValue={eventSeriesFormHooks.setExpenseFixedValue}
              expenseMean={eventSeriesFormHooks.expenseMean}
              setExpenseMean={eventSeriesFormHooks.setExpenseMean}
              expenseStdDev={eventSeriesFormHooks.expenseStdDev}
              setExpenseStdDev={eventSeriesFormHooks.setExpenseStdDev}
              expenseLowerBound={eventSeriesFormHooks.expenseLowerBound}
              setExpenseLowerBound={eventSeriesFormHooks.setExpenseLowerBound}
              expenseUpperBound={eventSeriesFormHooks.expenseUpperBound}
              setExpenseUpperBound={eventSeriesFormHooks.setExpenseUpperBound}
              applyInflation={eventSeriesFormHooks.applyInflation}
              setInflation={eventSeriesFormHooks.setApplyInflation}
              userPercentage={eventSeriesFormHooks.userPercentage}
              setUserPercentage={eventSeriesFormHooks.setUserPercentage}
              spousePercentage={eventSeriesFormHooks.spousePercentage}
              setSpousePercentage={eventSeriesFormHooks.setSpousePercentage}
            />
          )}

          {eventSeriesFormHooks.eventType === "Invest" && (
            <EventSeriesInvest
              allocationType={eventSeriesFormHooks.investAllocationType}
              setAllocationType={eventSeriesFormHooks.setInvestAllocationType}
              allocatedInvestments={eventSeriesFormHooks?.allocatedInvestments}
              setAllocatedInvestments={
                eventSeriesFormHooks?.setAllocatedInvestments
              }
              allocated2Investments={
                eventSeriesFormHooks?.allocated2Investments
              }
              setAllocated2Investments={
                eventSeriesFormHooks?.setAllocated2Investments
              }
              startYear={eventSeriesFormHooks.investStartYear}
              setStartYear={eventSeriesFormHooks.setInvestStartYear}
              endYear={eventSeriesFormHooks.investEndYear}
              setEndYear={eventSeriesFormHooks.setInvestEndYear}
              maxCashHoldings={eventSeriesFormHooks.investMaxCashHoldings}
              setMaxCashHoldings={eventSeriesFormHooks.setInvestMaxCashHoldings}
            />
          )}

          {eventSeriesFormHooks.eventType === "Rebalance" && (
            <EventSeriesRebalance
              allocationType={eventSeriesFormHooks.allocationType}
              setAllocationType={eventSeriesFormHooks.setAllocationType}
              allocatedInvestments={
                eventSeriesFormHooks?.allocatedRebalanceInvestments
              }
              setAllocatedInvestments={
                eventSeriesFormHooks?.setAllocatedRebalanceInvestments
              }
              allocated2Investments={
                eventSeriesFormHooks?.allocatedRebalance2Investments
              }
              setAllocated2Investments={
                eventSeriesFormHooks?.setAllocatedRebalance2Investments
              }
              startYear={eventSeriesFormHooks.rebalanceStartYear}
              setStartYear={eventSeriesFormHooks.setRebalanceStartYear}
              endYear={eventSeriesFormHooks.rebalanceEndYear}
              setEndYear={eventSeriesFormHooks.setRebalanceEndYear}
              maxCashHoldings={eventSeriesFormHooks.rebalanceMaxCashHoldings}
              setMaxCashHoldings={
                eventSeriesFormHooks.setRebalanceMaxCashHoldings
              }
              taxStatus={eventSeriesFormHooks.taxStatus}
              setTaxStatus={eventSeriesFormHooks.setTaxStatus}
            />
          )}
        </div>

        <div className="save-event-series-container">
          <button
            className="save-event-series-button"
            onClick={handleSaveEventSeries}
          >
            Save Event Series
          </button>
        </div>
      </CenteredFormWrapper>
    </motion.div>
  );
}
