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
import CreateSlideWrapper from "./CreateSlideWrapper";

function App() {
  return (
    <HelperContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/dashboard" element={<DashboardPage />}>
            <Route
              path="createScenario/*"
              element={
                <CreateSlideWrapper
                  routes={[
                    <Route path="/" element={<CreateScenarioPage />} />,
                    <Route path="addNewInvestmentType" element={<AddNewInvestmentType />} />,
                    <Route path="addNewEventSeries" element={<AddNewEventSeries />} />
                  ]}
                />
              }
            />
          </Route>
        
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
