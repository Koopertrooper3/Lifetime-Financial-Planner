// New DraggableItem component
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Item } from "./Types";
import "../../stylesheets/Strategies/DraggableItem.css";

export function DraggableItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { type: "item" }, // Explicit item type
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: item.id,
    data: { type: "item" }, // Also a drop target
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
      }}
      style={style}
      {...attributes}
      {...listeners}
      className="draggable-item"
    >
      {item.name}
    </div>
  );
}
