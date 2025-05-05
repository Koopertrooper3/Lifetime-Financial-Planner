import { useState, useEffect } from "react";
import type { Item, Column as ColumnType } from "./Types";
import { Column } from "./Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Scenario } from "../../../../backend/db/Scenario";
import { expenseEvent, eventData } from "../../../../backend/db/EventSchema.ts";
import { useScenarioContext } from "../../context/useScenarioContext.tsx";
import "../../stylesheets/Strategies/SpendingStrategy.css";
import { Status } from "./Types";
import { useNavigate } from "react-router-dom";

export default function SpendingStrategy() {
  const navigate = useNavigate();
  const { editScenario } = useScenarioContext();
  const [discretionaryExpenses, setDiscretionaryExpenses] = useState<Item[]>(
    []
  );
  const COLUMNS: ColumnType[] = [{ id: "Expenses", name: "Expenses" }];

  const isExpenseEvent = (event: eventData) => {
    return (event as expenseEvent).discretionary === true;
  };

  const handleClick = () => {
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
      <h1>
        Spending Strategy{" "}
        <span>
          <button onClick={handleClick}>Back</button>
        </span>
      </h1>
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
    </div>
  );
}
