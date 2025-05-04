import { useDraggable } from "@dnd-kit/core";
import { Item } from "./Types.ts";

type CardProps = {
  card: Item;
};

export default function Card({ card }: CardProps) {
  // The useDraggable hook makes this component draggable
  // The hook returns several properties we need for the dragging functionality
  // - attributes: Required accessibility attributes
  // - listeners: Event handlers for drag initiation
  // - setNodeRef: Function to attach to the DOM element
  // - transform: Current position transformation (while dragging)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id, // An identifier for this draggable item
  });

  // Calculate the style for the component when it's being dragged. The style
  // is basically the x and y positions of the card the user is moving.
  // If transform exists (meaning we're dragging), apply translate styles
  // Otherwise, no special styling is needed
  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef} // Attach the drag reference to this DOM element
      {...listeners} // Applies all event listeners to the draggable card
      {...attributes} // Applies all attributes to the draggable card
      className="cursor-grab rounded-lg bg-neutral-700 p-4 shadow-sm hover:shadow-md"
      style={style} // Apply the transform style when dragging
    >
      <h3 className="font-medium text-neutral-100">{card.name}</h3>
    </div>
  );
}
