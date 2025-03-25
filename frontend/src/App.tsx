// @ts-ignore
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ScenarioDashboard from "./components/ExampleScenario";
import { HelperContextProvider } from "./HelperContext";

function App() {
  return (
    <HelperContextProvider>
      {/* <Router>
        <Routes>
           <Route path="/" element={<LoginPage />} />
           <Route path="/Dashboard" element={<Dashboard />} />
        </Routes>
      </Router> */}
      {/* <ScenarioDashboard /> */}
      <Dashboard></Dashboard>
    </HelperContextProvider>
  );
}

export default App;
