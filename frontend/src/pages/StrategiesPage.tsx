import { useState } from "react";
import type {
  Item,
  Column as ColumnType,
} from "../components/Strategies/Types";
import { Column } from "../components/Strategies/Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Link, useNavigate } from "react-router-dom";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import { motion } from "framer-motion";
import "../stylesheets/Strategies/Strategies.css";

export default function Strategies() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ x: window.innerWidth }}
      animate={{ x: 0 }}
      exit={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CenteredFormWrapper>
        <div className="strategies-container">
          <div className="header-line">
            <h2 className="header">
              Spending & Withdrawal{" "}
              {/* <span className="grayed-text">
                Spending, Roth Conversion, RMDs, etc.{" "}
              </span> */}
            </h2>
            <Link to="/dashboard/createScenario" className="back-link">
              {"<<"}Back
            </Link>
          </div>
          <div className="grayed-text">
            Define how your expenses are prioritized, how investments are
            withdrawn when cash is low, and how required minimum distributions
            (RMDs) and Roth conversions are handled.
          </div>

          <div className="strategy-buttons-container">
            <Link
              to="/dashboard/createScenario/addStrategies/spendingStrategy"
              className="strategy-button"
            >
              Edit Spending Strategy
            </Link>
            <Link
              to="/dashboard/createScenario/addStrategies/withdrawalStrategy"
              className="strategy-button"
            >
              Edit Withdrawal Strategy
            </Link>
            <Link
              to="/dashboard/createScenario/addStrategies/rothConversionOptimizer"
              className="strategy-button"
            >
              Roth Conversion Optimizer
            </Link>
          </div>
        </div>
      </CenteredFormWrapper>
    </motion.div>
  );
}
