import { useState, useEffect } from "react";
import type { Item, Column as ColumnType } from "./Types";
import { Column } from "./Column.tsx";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useScenarioContext } from "../../context/useScenarioContext.tsx";
import "../../stylesheets/Strategies/SpendingStrategy.css";
import { useNavigate, Link } from "react-router-dom";
import { useHelperContext } from "../../context/HelperContext.tsx";
import { Investment } from "../../../../backend/db/InvestmentSchema.ts";
import ValidationTextFields from "../shared/ValidationTextFields.tsx";

interface RothOptimizerToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function RothOptimizerToggle({
  isEnabled,
  onToggle,
}: RothOptimizerToggleProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(e.target.checked); // Call parent's handler
  };

  return (
    <div style={{ backgroundColor: "#e6edff", padding: "10px" }}>
      <label style={{ fontSize: "16px", color: "#444" }}>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={handleChange}
          style={{ marginRight: "8px" }}
        />
        Enable Roth Conversion Optimizer
      </label>
    </div>
  );
}

export default function RothConversionOptimizer() {
  const navigate = useNavigate();
  const { editScenario, setEditScenario } = useScenarioContext();
  const { handleEditScenario } = useHelperContext();
  const [preTaxInvestments, setPreTaxInvestments] = useState<Item[]>([]);
  const COLUMNS: ColumnType[] = [{ id: "Investments", name: "Investments" }];
  const [rothStartYear, setRothStartYear] = useState<string | number>("");
  const [rothEndYear, setRothEndYear] = useState<string | number>("");
  const [isRothOptimizerEnabled, setIsRothOptimizerEnabled] = useState(false);

  const handleToggle = (enabled: boolean) => {
    setIsRothOptimizerEnabled(enabled);
  };

  const handleSaveRothConverstionOptimizer = async () => {
    const updatedInvestments: string[] = preTaxInvestments.map(
      (investment) => investment.name
    );

    const userID = await (async () => {
      const res = await fetch("http://localhost:8000/user", {
        credentials: "include", // ensures session cookie is sent
      });
      const user = await res.json();
      return user.user._id;
    })();
    console.log(userID);
    const scenarioID = editScenario._id;
    const updatedField = {
      RothConversionOpt: isRothOptimizerEnabled,
      RothConverstionStart: Number(rothStartYear),
      RothConverstionEnd: Number(rothEndYear),
      RothConverstionStrategy: updatedInvestments,
    };
    const response = await handleEditScenario(userID, scenarioID, updatedField);
    setEditScenario(response.data);
    navigate("/dashboard/createScenario/addStrategies/");
  };

  useEffect(() => {
    console.log("Roth Conversion Optimizer: ", editScenario.investments);
  }, [editScenario]);

  useEffect(() => {
    if (!editScenario) return;

    const seenNames = new Set<string>();
    const investments: Item[] = [];

    Object.entries(editScenario.investments as Investment).forEach(
      ([investmentName, investment]) => {
        if (investment && investment.taxStatus === "pre-tax") {
          // Handle duplicate names by appending count
          let uniqueName = investmentName;
          let counter = 0;
          while (seenNames.has(uniqueName)) {
            counter += 1;
            uniqueName = `${investmentName}-(${counter})`;
          }
          seenNames.add(uniqueName);

          console.log(investment.id);

          investments.push({
            id: uniqueName,
            name: investment.id,
            rank: investments.length + 1,
            status: "Investments",
          });
        }
      }
    );
    setPreTaxInvestments(investments);
  }, [editScenario]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    setPreTaxInvestments((prev) => {
      const items = [...prev];
      const activeItem = items.find((item) => item.id === active.id);
      if (!activeItem) return items;

      // Item drop
      if (over.data.current?.type === "item") {
        const overItem = items.find((item) => item.id === over.id);
        if (!overItem) return items;

        // Same column - reorder
        if (overItem.status === activeItem.status) {
          const activeIndex = items.findIndex((item) => item.id === active.id);
          const overIndex = items.findIndex((item) => item.id === over.id);

          [items[activeIndex], items[overIndex]] = [
            items[overIndex],
            items[activeIndex],
          ];

          return items.map((item, index) => ({
            ...item,
            rank: index + 1,
          }));
        }
      }

      return items;
    });
  };

  // In your SpendingStrategy component's return statement
  return (
    <div className="spending-strategy-container">
      <div className="spending-strategy-header">
        <h2 className="purple-header">Roth Conversion Optimizer</h2>
        <Link
          to="/dashboard/createScenario/addStrategies/"
          className="back-link"
        >
          {"<<"}Back
        </Link>
      </div>
      <div className="description-container">
        <p className="instruction-text">
          Configure Roth conversions.
          <span className="secondary-text">
            The optimizer converts assets in-kind from pre-tax accounts
            (tax-deferred) to after-tax accounts (tax-free), up to the top of
            the user's current tax bracket during the selected period.
          </span>
        </p>
        <RothOptimizerToggle
          isEnabled={isRothOptimizerEnabled}
          onToggle={handleToggle}
        />
      </div>

      <div className="roth-years-container">
        <div>
          <div className="purple-text text-field">Start Year</div>
          <ValidationTextFields
            value={rothStartYear ?? ""}
            placeholder="Enter a year (eg. 2003)"
            setInput={(val) => setRothStartYear(Number(val))}
            inputType="number"
            width="160"
            height="1.4375em"
            disabled={false}
          />
        </div>
        <div>
          <div className="purple-text text-field">End Year</div>
          <ValidationTextFields
            value={rothEndYear ?? ""}
            placeholder="Enter a year (eg. 2003)"
            setInput={(val) => setRothEndYear(Number(val))}
            inputType="number"
            width="160"
            height="1.4375em"
            disabled={false}
          />
        </div>
      </div>

      <div className="description-container">
        <p className="instruction-text">
          Rank your pre-tax investments are converted to Roth accounts. Drag
          your investments onto the list below, with 1 being the first
          investment to be converted.
          <span className="secondary-text">
            Investments higher in the list are converted first; those below are
            only converted when those above are fully transferred.
          </span>
        </p>
        <p className="hint-text">
          Click an expense to drag and order it through the list
        </p>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="columns-container">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={preTaxInvestments.filter(
                (investment: Item) => investment.status === column.id
              )}
            />
          ))}
        </div>
      </DndContext>

      <div
        className="save-spending-strategy-button"
        onClick={handleSaveRothConverstionOptimizer}
      >
        Save Roth Conversion Optimizer
      </div>
    </div>
  );
}
