import { useState } from "react";

function ReferenceData() {
  const [activeSection, setActiveSection] = useState("conductors");

  const referenceSections = [
    {
      id: "conductors",
      title: "Conductors",
      description: "Manage conductor sizes used in engineering calculations.",
      icon: "⚡",
    },
    {
      id: "materials",
      title: "Materials",
      description: "Manage conductor material references.",
      icon: "🔩",
    },
    {
      id: "installation",
      title: "Installation Conditions",
      description: "Manage cable installation condition references.",
      icon: "🏗️",
    },
    {
      id: "current-ratings",
      title: "Current Ratings",
      description: "Manage allowable current ratings for cable combinations.",
      icon: "📊",
    },
    {
      id: "voltage-drop",
      title: "Voltage Drop References",
      description: "Manage voltage drop reference values.",
      icon: "📐",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#050B14",
        color: "#E8F1FA",
        padding: "30px",
      }}
    >
      {/* Page Header */}
      <div className="mb-4">
        <div
          style={{
            fontSize: "14px",
            color: "#8FA6BD",
            marginBottom: "6px",
          }}
        >
          Engineering Design Center
        </div>

        <h2
          style={{
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Reference Data
        </h2>

        <p
          style={{
            color: "#8FA6BD",
            marginBottom: 0,
          }}
        >
          Manage the engineering reference data used by the calculation
          engine.
        </p>
      </div>

      {/* Reference Cards */}
      <div className="row g-4">
        {referenceSections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <div className="col-md-6 col-xl-4" key={section.id}>
              <div
                onClick={() => setActiveSection(section.id)}
                style={{
                  background: "#0D1726",
                  border: isActive
                    ? "1px solid #1683FF"
                    : "1px solid #1D3148",
                  borderRadius: "12px",
                  padding: "24px",
                  height: "100%",
                  cursor: "pointer",
                  transition: "0.2s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    marginBottom: "18px",
                  }}
                >
                  {section.icon}
                </div>

                <h5
                  style={{
                    color: "#E8F1FA",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {section.title}
                </h5>

                <p
                  style={{
                    color: "#8FA6BD",
                    fontSize: "14px",
                    marginBottom: "20px",
                  }}
                >
                  {section.description}
                </p>

                <span
                  style={{
                    color: "#35A7FF",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Manage Data →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Section */}
      <div
        className="mt-4"
        style={{
          background: "#0D1726",
          border: "1px solid #1D3148",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div
          style={{
            color: "#8FA6BD",
            fontSize: "13px",
            marginBottom: "6px",
          }}
        >
          SELECTED REFERENCE
        </div>

        <h4 style={{ marginBottom: "8px" }}>
          {
            referenceSections.find(
              (section) => section.id === activeSection
            )?.title
          }
        </h4>

        <p
          style={{
            color: "#8FA6BD",
            marginBottom: 0,
          }}
        >
          The management interface for this reference table will be added
          here.
        </p>
      </div>
    </div>
  );
}

export default ReferenceData;