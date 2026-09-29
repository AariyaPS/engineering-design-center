import {
  LayoutDashboard,
  Calculator,
  History,
  FolderKanban,
  Database,
  Settings,
  Cable,
  Layers,
  Boxes,
  GitBranch,
  Gauge,
  Activity,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuSections = [
  {
    title: "Workspace",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Cable Calculator",
        path: "/calculator",
        icon: Calculator,
      },
      {
        name: "Calculation History",
        path: "/history",
        icon: History,
      },
      {
        name: "Engineering Designs",
        path: "/designs",
        icon: FolderKanban,
      },
    ],
  },

  {
    title: "Engineering Data",
    items: [
      {
        name: "Conductors",
        path: "/reference/conductors",
        icon: Cable,
      },
      {
        name: "Materials",
        path: "/reference/materials",
        icon: Boxes,
      },
      {
        name: "Installation Conditions",
        path: "/reference/installation-conditions",
        icon: GitBranch,
      },
      {
        name: "Current Ratings",
        path: "/reference/current-ratings",
        icon: Gauge,
      },
      {
        name: "Voltage Drop",
        path: "/reference/voltage-drop",
        icon: Activity,
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="edc-sidebar">

      {/* =========================================
          LOGO
      ========================================= */}

      <div className="edc-logo">

        <div className="edc-logo-icon">
          <Cable size={21} />
        </div>

        <div className="edc-logo-text">

          <div className="edc-logo-title">
            EDC
          </div>

          <span className="edc-logo-subtitle">
            Engineering Design Centre
          </span>

        </div>

      </div>


      {/* =========================================
          NAVIGATION
      ========================================= */}

      <nav className="edc-nav">

        {menuSections.map((section) => (

          <div key={section.title}>

            <div className="edc-nav-section">
              {section.title}
            </div>

            {section.items.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `edc-nav-item ${
                      isActive ? "active" : ""
                    }`
                  }
                >

                  <Icon size={17} />

                  <span>
                    {item.name}
                  </span>

                </NavLink>
              );

            })}

          </div>

        ))}

      </nav>


      {/* =========================================
          USER FOOTER
      ========================================= */}

      <div className="edc-sidebar-footer">

        <div className="edc-user-mini">

          <div className="edc-avatar">
            AP
          </div>

          <div className="edc-user-info">

            <div className="edc-user-name">
              Engineering User
            </div>

            <div className="edc-user-role">
              Design Engineer
            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;