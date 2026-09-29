import { useEffect, useState } from "react";
import {
  Cable,
  Calculator,
  Database,
  Gauge,
  Zap,
  Layers3,
  ArrowRight,
  Activity,
  Settings2,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";

import { api } from "../servics/api.js";
import "./Dashboard.css";

function Dashboard() {
  const [data, setData] = useState({
    conductors: [],
    materials: [],
    conditions: [],
    currentRatings: [],
    voltageDrop: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load dashboard data
  // --------------------------------------------------

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          conductors,
          materials,
          conditions,
          currentRatings,
          voltageDrop,
        ] = await Promise.all([
          api.getConductors(),
          api.getMaterials(),
          api.getInstallationConditions(),
          api.getCurrentRatings(),
          api.getVoltageDropReferences(),
        ]);

        setData({
          conductors,
          materials,
          conditions,
          currentRatings,
          voltageDrop,
        });
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );

        setError(
          error.message ||
            "Unable to load dashboard reference data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // --------------------------------------------------
  // Standard conductor range
  // --------------------------------------------------

  const standardConductors = data.conductors.filter(
    (conductor) =>
      Number(conductor.conductor_size_mm2) <= 500
  );

  const sortedConductors = [...standardConductors].sort(
    (a, b) =>
      Number(a.conductor_size_mm2) -
      Number(b.conductor_size_mm2)
  );

  const smallestConductor =
    sortedConductors.length > 0
      ? sortedConductors[0].conductor_size_mm2
      : "-";

  const largestConductor =
    sortedConductors.length > 0
      ? sortedConductors[
          sortedConductors.length - 1
        ].conductor_size_mm2
      : "-";

  // --------------------------------------------------
  // Dashboard stats
  // --------------------------------------------------

  const stats = [
    {
      title: "Conductors",
      value: loading
        ? "..."
        : standardConductors.length,
      description: "Standard conductor sizes",
      icon: Cable,
      link: "/reference/conductors",
      type: "primary",
    },
    {
      title: "Materials",
      value: loading ? "..." : data.materials.length,
      description: "Reference materials",
      icon: Layers3,
      link: "/reference/materials",
      type: "blue",
    },
    {
      title: "Installation Conditions",
      value: loading
        ? "..."
        : data.conditions.filter(
            (condition) =>
              condition.code !== "test_condition"
          ).length,
      description: "Installation methods",
      icon: Settings2,
      link: "/reference/installation-conditions",
      type: "green",
    },
    {
      title: "Current Ratings",
      value: loading
        ? "..."
        : data.currentRatings.length,
      description: "Rating references",
      icon: Gauge,
      link: "/reference/current-ratings",
      type: "orange",
    },
  ];

  // --------------------------------------------------
  // Quick actions
  // --------------------------------------------------

  const quickActions = [
    {
      title: "Cable Rating Calculator",
      description:
        "Calculate current capacity and voltage drop.",
      icon: Calculator,
      link: "/calculator",
      type: "primary",
    },
    {
      title: "Current Ratings",
      description:
        "Manage conductor current-carrying capacity.",
      icon: Gauge,
      link: "/reference/current-ratings",
      type: "orange",
    },
    {
      title: "Voltage Drop",
      description:
        "Manage voltage drop reference values.",
      icon: Zap,
      link: "/reference/voltage-drop",
      type: "blue",
    },
    {
      title: "Conductors",
      description:
        "View and manage conductor sizes.",
      icon: Cable,
      link: "/reference/conductors",
      type: "green",
    },
  ];

  // --------------------------------------------------
  // Reference status
  // --------------------------------------------------

  const referenceStatus = [
    {
      label: "Conductor Reference",
      value: loading
        ? "Loading..."
        : `${standardConductors.length} standard sizes`,
      detail: loading
        ? ""
        : `${smallestConductor}–${largestConductor} mm²`,
      icon: Cable,
      link: "/reference/conductors",
    },
    {
      label: "Material Reference",
      value: loading
        ? "Loading..."
        : `${data.materials.length} records`,
      detail: "Copper / Aluminium",
      icon: Layers3,
      link: "/reference/materials",
    },
    {
      label: "Installation Reference",
      value: loading
        ? "Loading..."
        : `${
            data.conditions.filter(
              (condition) =>
                condition.code !== "test_condition"
            ).length
          } conditions`,
      detail: "Approved installation methods",
      icon: Settings2,
      link: "/reference/installation-conditions",
    },
    {
      label: "Current Rating Reference",
      value: loading
        ? "Loading..."
        : `${data.currentRatings.length} records`,
      detail: "A",
      icon: Gauge,
      link: "/reference/current-ratings",
    },
    {
      label: "Voltage Drop Reference",
      value: loading
        ? "Loading..."
        : `${data.voltageDrop.length} records`,
      detail: "mV/A/m",
      icon: Zap,
      link: "/reference/voltage-drop",
    },
  ];

  return (
    <div className="dashboard-page">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="dashboard-header">
        <div>
          <div className="dashboard-breadcrumb">
            Engineering Design Center
            <span>/</span>
            Dashboard
          </div>

          <h1>Engineering Dashboard</h1>

          <p>
            Cable calculation tools and engineering
            reference data.
          </p>
        </div>

        <div className="dashboard-status">
          <span className="dashboard-status-dot"></span>

          <span>
            {loading
              ? "Loading reference data"
              : "Reference data connected"}
          </span>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="dashboard-error">
          <Activity size={18} />

          <div>
            <strong>Unable to load dashboard data</strong>

            <span>{error}</span>
          </div>
        </div>
      )}

      {/* ==================================================
          STAT CARDS
      ================================================== */}

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <span className="dashboard-section-label">
              SYSTEM OVERVIEW
            </span>

            <h2>Engineering Reference Data</h2>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className={`dashboard-stat-card dashboard-stat-${stat.type}`}
                key={stat.title}
              >
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon">
                    <Icon size={21} />
                  </div>

                  <a
                    href={stat.link}
                    className="dashboard-stat-link"
                  >
                    <ArrowRight size={17} />
                  </a>
                </div>

                <div className="dashboard-stat-value">
                  {stat.value}
                </div>

                <div className="dashboard-stat-title">
                  {stat.title}
                </div>

                <div className="dashboard-stat-description">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          MAIN WORKSPACE
      ================================================== */}

      <div className="dashboard-main-grid">
        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <section className="dashboard-panel dashboard-quick-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-section-label">
                WORKSPACE
              </span>

              <h2>Quick Actions</h2>

              <p>
                Access commonly used engineering tools.
              </p>
            </div>

            <Calculator size={22} />
          </div>

          <div className="dashboard-quick-actions">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <a
                  href={action.link}
                  className="dashboard-quick-action"
                  key={action.title}
                >
                  <div
                    className={`dashboard-quick-icon dashboard-quick-${action.type}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="dashboard-quick-content">
                    <strong>{action.title}</strong>

                    <span>{action.description}</span>
                  </div>

                  <ArrowRight
                    size={17}
                    className="dashboard-quick-arrow"
                  />
                </a>
              );
            })}
          </div>
        </section>

        {/* ==================================================
            REFERENCE STATUS
        ================================================== */}

        <section className="dashboard-panel dashboard-reference-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-section-label">
                REFERENCE DATA
              </span>

              <h2>Data Status</h2>

              <p>
                Current engineering reference
                configuration.
              </p>
            </div>

            <Database size={22} />
          </div>

          <div className="dashboard-reference-list">
            {referenceStatus.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  href={item.link}
                  className="dashboard-reference-item"
                  key={item.label}
                >
                  <div className="dashboard-reference-icon">
                    <Icon size={17} />
                  </div>

                  <div className="dashboard-reference-content">
                    <strong>{item.label}</strong>

                    <span>{item.value}</span>
                  </div>

                  <div className="dashboard-reference-detail">
                    {item.detail}
                  </div>

                  <CircleCheck
                    size={16}
                    className="dashboard-reference-check"
                  />
                </a>
              );
            })}
          </div>
        </section>
      </div>

      {/* ==================================================
          CALCULATION WORKSPACE
      ================================================== */}

      <section className="dashboard-calculator-banner">
        <div className="dashboard-calculator-icon">
          <Calculator size={25} />
        </div>

        <div className="dashboard-calculator-content">
          <span>ENGINEERING CALCULATION</span>

          <h2>Ready to perform a cable calculation?</h2>

          <p>
            Select conductor size, material, installation
            condition and design parameters to calculate
            current capacity and voltage drop.
          </p>
        </div>

        <a
          href="/calculator"
          className="dashboard-calculator-button"
        >
          Open Calculator
          <ArrowRight size={17} />
        </a>
      </section>

      {/* ==================================================
          FOOTER INFORMATION
      ================================================== */}

      <div className="dashboard-footer-info">
        <div>
          <Database size={16} />

          <span>
            Data is loaded from the Engineering Design
            Center reference database.
          </span>
        </div>

        {loading && (
          <div className="dashboard-loading-indicator">
            <LoaderCircle
              size={15}
              className="dashboard-spinner"
            />

            Updating...
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;