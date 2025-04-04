import "./stylesheets/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateScenarioPage from "./pages/CreateScenarioPage";
import { HelperContextProvider } from "./HelperContext";
import ScenarioPage from "./pages/ScenarioPage";

function App() {
  return (
    <HelperContextProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/createSenario" element={<CreateScenarioPage />} />
          <Route path="/scenario/:id" element={<ScenarioPage />} /> */}
          <Route path="/" element={<CreateScenarioPage />} />
        </Routes>
      </Router>
    </HelperContextProvider>
  );
}

export default App;
