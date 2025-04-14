import "./stylesheets/App.css"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateScenarioPage from "./pages/CreateScenarioPage";
import { HelperContextProvider } from "./HelperContext";
import ScenarioPage from "./pages/ScenarioPage";
import ChartsPage from "./pages/ChartsPage";
import AddNewInvestmentType from "./pages/AddNewInvestmentType";
import AddNewEventSeries from "./pages/AddNewEventSeries";

function App() {
  return (
    <HelperContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />}>
            
            {/* NOTE: Nested routes go here */}
          </Route>
          <Route path="createScenario" element={<CreateScenarioPage />} />
          <Route path="/scenario/:id" element={<ScenarioPage />} />
          <Route path="/chartsPage/" element={<ChartsPage />} />
          <Route
            path="/AddNewInvestmentType"
            element={<AddNewInvestmentType />}
          />
          <Route path="/AddNewEventSeries" element={<AddNewEventSeries />} />
        </Routes>
      </Router>
    </HelperContextProvider>
  );
}

export default App;
