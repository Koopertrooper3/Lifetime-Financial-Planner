import React, { ReactNode } from "react";
import "../stylesheets/CenteredFormWrapper.css";

interface CenteredFormWrapperProps {
  children: ReactNode;
}

const CenteredFormWrapper: React.FC<CenteredFormWrapperProps> = ({
  children,
}) => {
  return (
    <div className="form-wrapper">
      <div className="form-card">{children}</div>
    </div>
  );
};

export default CenteredFormWrapper;
