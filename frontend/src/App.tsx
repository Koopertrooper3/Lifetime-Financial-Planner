// @ts-ignore
import './stylesheets/App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateScenarioPage from './pages/CreateScenarioPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/createSenario" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
