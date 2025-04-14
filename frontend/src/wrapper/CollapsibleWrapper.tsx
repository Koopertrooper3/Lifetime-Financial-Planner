import React from "react";
import { useState } from "react";
import "../stylesheets/CollapsibleWrapper.css";

interface CollapsibleWrapperProps {
  description: string;
  children: React.ReactNode;
}

const CollapsibleWrapper: React.FC<CollapsibleWrapperProps> = ({
  description,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div className="description" onClick={handleExpand}>
        {description} {isExpanded ? "▲" : "▼"}
      </div>
      {isExpanded && children}
    </div>
  );
};

export default CollapsibleWrapper;
