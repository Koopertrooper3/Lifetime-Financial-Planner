import "./stylesheets/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ScenarioFormPage from "./pages/ScenarioFormPage";
import { HelperContextProvider } from "./HelperContext";
import { ScenarioProvider } from "./useScenarioContext";
import ScenarioPage from "./pages/ScenarioPage";
import ChartsPage from "./pages/ChartsPage";
import InvestmentTypeForm from "./pages/InvestmentTypeForm";
import AddNewEventSeries from "./pages/EventSeriesForm";
import { LimitsInflationPage } from "./pages/LimitsInflationPage";
import EditScenarioPage from "./pages/EditScenarioPage";
import CreateSlideWrapper from "./CreateSlideWrapper";
import UserProfilePage from "./pages/UserProfilePage";

function App() {
  return (
    <ScenarioProvider>
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
                    <Route path="/" element={<ScenarioFormPage />} />,
                    <Route path="addNewInvestmentType" element={<InvestmentTypeForm />} />,
                    <Route path="addNewEventSeries" element={<AddNewEventSeries />} />
                  ]}
                />
              }
            />
          </Route>
        
          <Route path="/scenario/:id" element={<ScenarioPage />} />
          <Route path="/chartsPage/" element={<ChartsPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="/InvestmentTypeForm" element={<InvestmentTypeForm />} />
          <Route path="/AddNewEventSeries" element={<AddNewEventSeries />} />
          <Route path="/scenarios/:id/edit" element={<EditScenarioPage />} />

            {/* <Route
            path="Limits&ContributionLimits"
            element={<LimitsInflationPage />}
          />

          <Route path="/AddNewEventSeries" element={<AddNewEventSeries />} /> */}
          </Routes>
        </Router>
      </HelperContextProvider>
    </ScenarioProvider>
  );
}

export default App;
