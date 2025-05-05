import { useDroppable } from "@dnd-kit/core";
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
      <h2 className="purple-header">{column.name}</h2>
      <div ref={setNodeRef} className="droppable-area">
        {cards.map((card, index) => (
          <div key={card.id} className="item-container">
            <DraggableItem item={card} />
            {/* Add divider after each item except the last one */}
            {index < cards.length - 1 && <div className="item-divider" />}
          </div>
        ))}
      </div>
    </div>
  );
}
