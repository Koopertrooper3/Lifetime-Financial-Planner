import "../stylesheets/Dashboard.css";
import Banner from "./Banner";
import SideBar from "./Sidebar";
import AddPlan from "./AddPlan";
import CreateScenario from "./CreateScenario";

function Dashboard() {
  return (
    <div>
      <Banner></Banner>
      <SideBar></SideBar>
      <div className="dashboard-container">
        <AddPlan />
      </div>
      {/* <CreateScenario></CreateScenario> */}
    </div>
  );
}

export default Dashboard;
