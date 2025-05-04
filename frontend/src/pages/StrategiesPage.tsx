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
        <div className="header-line">
          <h2 className="header">
            Spending & Withdrawal{" "}
            <span className="grayed-text">
              Spending, Roth Conversion, RMDs, etc.{" "}
            </span>
            <span className="red-text">Required</span>
          </h2>
          <Link to="/dashboard/createScenario" className="back-link">
            {"<<"}Back
          </Link>
        </div>
        <div className="header-description">
          Define how your expenses are prioritized, how investments are
          withdrawn when cash is low, and how required minimum distributions
          (RMDs) and Roth conversions are handled.
        </div>

        <div>
          <h2 className="purple-title">Spending Strategy</h2>
          <div>
            Rank the order in which discretionary expenses are paid.{" "}
            <span className="purple-text">Drag</span> your expenses onto the
            list below to rank them by priority, with 1 being the highest.
            <span className="grayed-text">
              Expenses lower on the list will only be paid if there is enough
              cash and the financial goal has not been violated.
            </span>
            <Link
              to="/dashboard/createScenario/addStrategies/spendingStrategy"
              className="edit-ranking-container"
            >
              Edit Spending Strategy
            </Link>
          </div>
        </div>
      </CenteredFormWrapper>
    </motion.div>
  );
}
