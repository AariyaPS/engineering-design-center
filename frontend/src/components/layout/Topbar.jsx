import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Search,
  Settings,
} from "lucide-react";

import "./Topbar.css";

function Topbar() {
  return (
    <header className="topbar">

      <div className="topbar-left">
        <div className="topbar-context">
          <span className="topbar-context-label">
            ENGINEERING DESIGN CENTER
          </span>

          <h1 className="topbar-title">
            Engineering Workspace
          </h1>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={17} />

        <input
          type="text"
          placeholder="Search engineering data..."
          aria-label="Search engineering data"
        />

        <span className="topbar-search-shortcut">
          Ctrl K
        </span>
      </div>

      <div className="topbar-right">

        <div className="topbar-system-status">
          <span className="topbar-status-dot"></span>
          <span>System Online</span>
        </div>

        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />

          <span className="topbar-notification-dot"></span>
        </button>

        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={19} />
        </button>

        <div className="topbar-divider"></div>

        <button
          type="button"
          className="topbar-user"
          aria-label="User profile"
        >
          <div className="topbar-user-avatar">
            <CircleUserRound size={21} />
          </div>

          <div className="topbar-user-info">
            <strong>Engineering User</strong>
            <span>EDC Administrator</span>
          </div>

          <ChevronDown
            size={16}
            className="topbar-user-chevron"
          />
        </button>

      </div>

    </header>
  );
}

export default Topbar;