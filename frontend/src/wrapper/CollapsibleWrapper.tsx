import { useState } from "react";
import "../stylesheets/CollapsibleWrapper.css";

interface CollapsibleWrapperProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
}

export default function CollapsibleWrapper({
  title,
  children,
  initiallyOpen = false,
}: CollapsibleWrapperProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div className="collapsible-container">
      <div className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="collapsible-title">{title}</h3>
        <span className={`toggle-icon ${isOpen ? "open" : ""}`}>
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      <div className={`collapsible-content ${isOpen ? "open" : ""}`}>
        {children}
      </div>
    </div>
  );
}
