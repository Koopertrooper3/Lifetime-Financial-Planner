import { useState, useEffect } from "react";
import type { Item, Column as ColumnType } from "./Types";
import { Column } from "./Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { expenseEvent, eventData } from "../../../../backend/db/EventSchema.ts";
import { useScenarioContext } from "../../context/useScenarioContext.tsx";
import "../../stylesheets/Strategies/SpendingStrategy.css";
import { useNavigate, Link } from "react-router-dom";
import { useHelperContext } from "../../context/HelperContext.tsx";

export default function SpendingStrategy() {
  const navigate = useNavigate();
  const { editScenario, setEditScenario } = useScenarioContext();
  const { handleEditScenario } = useHelperContext();
  const [discretionaryExpenses, setDiscretionaryExpenses] = useState<Item[]>(
    []
  );
  const COLUMNS: ColumnType[] = [{ id: "Expenses", name: "Expenses" }];

  const isExpenseEvent = (event: eventData) => {
    return (event as expenseEvent).discretionary === true;
  };

  useEffect(() => {
    console.log(discretionaryExpenses);
  }, [discretionaryExpenses]);

  const handleSaveSpendingStrategy = async () => {
    const updatedDiscretionaryExpenses: string[] = discretionaryExpenses.map(
      (expense) => expense.name
    );

    const userID = await (async () => {
      const res = await fetch("http://localhost:8000/user", {
        credentials: "include", // ensures session cookie is sent
      });
      const user = await res.json();
      return user._id;
    })();
    console.log(userID);
    const scenarioID = editScenario._id;
    const updatedField = {
      spendingStrategy: updatedDiscretionaryExpenses,
    };
    const response = await handleEditScenario(userID, scenarioID, updatedField);
    setEditScenario(response.data);
    navigate("/dashboard/createScenario/addStrategies/");
  };

  useEffect(() => {
    if (!editScenario) return;

    const seenNames = new Set<string>();
    const expenses: Item[] = [];

    Object.entries(editScenario.eventSeries as Event).forEach(
      ([eventName, event]) => {
        if (isExpenseEvent(event.event)) {
          // Handle duplicate names by appending count
          let uniqueName = eventName;
          let counter = 0;
          while (seenNames.has(uniqueName)) {
            counter += 1;
            uniqueName = `${eventName}-(${counter})`;
          }
          seenNames.add(uniqueName);

          expenses.push({
            id: uniqueName,
            name: eventName,
            rank: expenses.length + 1,
            status: "Expenses",
          });
        }
      }
    );
    setDiscretionaryExpenses(expenses);
  }, [editScenario]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    setDiscretionaryExpenses((prev) => {
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
        <h2 className="purple-header">Spending Strategy</h2>
        <Link
          to="/dashboard/createScenario/addStrategies/"
          className="back-link"
        >
          {"<<"}Back
        </Link>
      </div>
      <div className="description-container">
        <p className="instruction-text">
          Rank the order in which discretionary expenses are paid. Drag your
          expenses onto the list below to rank them by priority, with 1 being
          the highest.
          <span className="secondary-text">
            Expenses lower on the list will only be paid if there is enough cash
            and the financial goal has not been violated.
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
              cards={discretionaryExpenses.filter(
                (expense: Item) => expense.status === column.id
              )}
            />
          ))}
        </div>
      </DndContext>

      <div
        className="save-spending-strategy-button"
        onClick={handleSaveSpendingStrategy}
      >
        Save Spending Strategy
      </div>
    </div>
  );
}
