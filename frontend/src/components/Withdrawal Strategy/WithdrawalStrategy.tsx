import { useState, useEffect } from "react";
import type { Item, Column as ColumnType } from "./Types";
import { Column } from "./Column.tsx";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useScenarioContext } from "../../context/useScenarioContext.tsx";
import "../../stylesheets/Strategies/SpendingStrategy.css";
import { useNavigate, Link } from "react-router-dom";
import { useHelperContext } from "../../context/HelperContext.tsx";
import { Investment } from "../../../../backend/db/InvestmentSchema.ts";

export default function WithdrawalStrategy() {
  const navigate = useNavigate();
  const { editScenario, setEditScenario } = useScenarioContext();
  const { handleEditScenario } = useHelperContext();
  const [strategyInvestments, setStrategyInvestments] = useState<Item[]>([]);
  const COLUMNS: ColumnType[] = [{ id: "Investments", name: "Investments" }];

  const handleSaveWithdrawalStrategy = async () => {
    const updatedInvestments: string[] = strategyInvestments.map(
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
      expenseWithdrawalStrategy: updatedInvestments,
    };
    const response = await handleEditScenario(userID, scenarioID, updatedField);
    setEditScenario(response.data);
    navigate("/dashboard/createScenario/addStrategies/");
  };

  useEffect(() => {
    console.log("Withdrawal Strategy: ", editScenario.investments);
  }, [editScenario]);

  useEffect(() => {
    if (!editScenario) return;

    const seenNames = new Set<string>();
    const investments: Item[] = [];

    Object.entries(editScenario.investments as Investment).forEach(
      ([investmentName, investment]) => {
        if (investment) {
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
    setStrategyInvestments(investments);
  }, [editScenario]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    setStrategyInvestments((prev) => {
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
        <h2 className="purple-header">Withdrawal Strategy</h2>
        <Link
          to="/dashboard/createScenario/addStrategies/"
          className="back-link"
        >
          {"<<"}Back
        </Link>
      </div>
      <div className="description-container">
        <p className="instruction-text">
          Rank the order in which investments are sold to cover shortfalls. Drag
          your investments to the list below to prioritize withdrawals, with 1
          being the first investment to be depleted.
          <span className="secondary-text">
            Investments lower in the list will only be sold if those above have
            a balance of zero.
          </span>
        </p>
        <p className="hint-text">
          Click an Investment to drag and order it through the list
        </p>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="columns-container">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={strategyInvestments.filter(
                (investment: Item) => investment.status === column.id
              )}
            />
          ))}
        </div>
      </DndContext>

      <div
        className="save-spending-strategy-button"
        onClick={handleSaveWithdrawalStrategy}
      >
        Save Spending Strategy
      </div>
    </div>
  );
}
