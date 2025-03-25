import "react";
import "../stylesheets/Sidebar.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WalletIcon from "@mui/icons-material/Wallet";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import PaidIcon from "@mui/icons-material/Paid";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";

const SideBar = () => {
  const upperIcons = [
    { name: "Dashboard", icon: DashboardIcon },
    { name: "Wallets", icon: WalletIcon },
    { name: "Post Reports", icon: SignalCellularAltIcon },
    { name: "Transaction", icon: PaidIcon },
  ];

  const lowerIcons = [
    { name: "Settings", icon: SettingsIcon },
    { name: "Help", icon: HelpIcon },
  ];

  return (
    <aside>
      <div className="side-bar">
        {upperIcons.map((item) => (
          <button className="sidebar-button">
            <item.icon></item.icon>
            {item.name}
          </button>
        ))}

        <hr className="delimiter" />

        {lowerIcons.map((item) => (
          <button className="sidebar-button">
            <item.icon></item.icon>
            {item.name}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default SideBar;
