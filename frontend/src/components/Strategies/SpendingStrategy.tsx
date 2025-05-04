import { useState, useEffect } from "react";
import type { Item, Column as ColumnType } from "./Types";
import { Column } from "./Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Scenario } from "../../../../backend/db/Scenario";
import { expenseEvent, eventData } from "../../../../backend/db/EventSchema.ts";
import { useScenarioContext } from "../../context/useScenarioContext.tsx";
import "../../stylesheets/Strategies/SpendingStrategy.css";
import { Status } from "./Types";

export default function SpendingStrategy() {
  const { editScenario } = useScenarioContext();
  const [discretionaryExpenses, setDiscretionaryExpenses] = useState<Item[]>(
    []
  );
  const COLUMNS: ColumnType[] = [
    { id: "INCLUDED", name: "INCLUDED" },
    { id: "EXCLUDED", name: "EXCLUDED" },
  ];

  const isExpenseEvent = (event: eventData) => {
    return (event as expenseEvent).discretionary === true;
  };

  useEffect(() => {
    console.log(discretionaryExpenses);
  }, [discretionaryExpenses]);

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
            status: "EXCLUDED",
          });
        }
      }
    );
    setDiscretionaryExpenses(expenses);
  }, [editScenario]);

  const handleDragEnd = (event: DragEndEvent) => {
    // active represents the currently dragged item
    // over represents the drop target, which are the two columns
    const { active, over } = event;

    if (!over) return;

    // update state with previous state
    setDiscretionaryExpenses((prev) => {
      const items = [...prev];
      console.log("active: ", active.id);
      const activeItem = items.find((item) => item.id === active.id);
      console.log("over.id: ", over.data.current?.type);

      if (!activeItem) return items;

      // If dropped into a different column, change the status of the activeItem
      if (over.data.current?.type === "column") {
        return items.map((item) =>
          item.id === active.id ? { ...item, status: over.id as Status } : item
        );
      }

      // If dropped on another card (reordering)
      if (over.data.current?.type === "item") {
        const overItem = items.find((item) => item.id === over.id);
        if (overItem && overItem.status === activeItem.status) {
          const activeIndex = items.findIndex((item) => item.id === active.id);
          const overIndex = items.findIndex((item) => item.id === over.id);
          // Swap two elements in the items array
          [items[activeIndex], items[overIndex]] = [
            items[overIndex],
            items[activeIndex],
          ];

          // Update ranks based on new order
          return items.map((item, index) => ({
            ...item, // Keep all existing properties
            rank: index + 1, // Update rank to be index + 1
          }));
        }
      }

      return items;
    });
  };

  // In your SpendingStrategy component's return statement
  return (
    <div>
      <h1>Spending Strategy</h1>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="columns-container">
          {" "}
          {/* Add this container */}
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
