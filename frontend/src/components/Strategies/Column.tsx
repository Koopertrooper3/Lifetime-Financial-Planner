import { useDroppable } from "@dnd-kit/core";
import Card from "./Card";
import { Column as ColumnType, Item } from "./Types";
import "../../stylesheets/Strategies/Column.css";
import { DraggableItem } from "./DraggableItem";

type ColumnProps = {
  column: ColumnType;
  cards: Item[];
};

export function Column({ column, cards }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column", // Mark this as a column droppable
    },
  });

  return (
    <div className="column">
      <h2 className="purple-title">{column.name}</h2>
      <div ref={setNodeRef} className="droppable-area">
        {cards.map((card) => (
          <DraggableItem key={card.id} item={card} />
        ))}
      </div>
    </div>
  );
}
