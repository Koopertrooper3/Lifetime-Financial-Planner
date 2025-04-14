import { Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import type { ReactElement } from "react";

interface CreateSlideWrapperProps {
  routes: ReactElement[];
}

export default function CreateSlideWrapper({ routes }: CreateSlideWrapperProps) {
  const location = useLocation();

  return (
    <div className="slide-wrapper">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {routes}
        </Routes>
      </AnimatePresence>
    </div>
  );
}

