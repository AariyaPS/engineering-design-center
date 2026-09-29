import { useEffect, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  LoaderCircle,
  Search,
  X,
  XCircle,
} from "lucide-react";

import { api } from "../servics/api.js";
import "./CalculationHistory.css";

function CalculationHistory() {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    material: "",
    installation_condition: "",
    status: "",
  });

  const [selectedCalculation, setSelectedCalculation] =
    useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getCalculationHistory();

      setCalculations(data);
    } catch (error) {
      console.error(
        "Failed to load calculation history:",
        error
      );

      setError(
        error.message ||
          "Unable to load calculation history."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatInstallationCondition = (value) => {
    if (!value) {
      return "-";
    }

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatMaterial = (value) => {
    if (value === "CU") {
      return "Copper";
    }

    if (value === "AL") {
      return "Aluminium";
    }

    return value || "-";
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredCalculations = calculations.filter(
    (calculation) => {
      const searchValue = searchTerm
        .trim()
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        String(
          calculation.conductor_size_mm2
        )
          .toLowerCase()
          .includes(searchValue) ||
        calculation.material
          ?.toLowerCase()
          .includes(searchValue) ||
        calculation.installation_condition
          ?.toLowerCase()
          .includes(searchValue) ||
        String(
          calculation.design_current_a
        )
          .toLowerCase()
          .includes(searchValue) ||
        calculation.current_capacity_status
          ?.toLowerCase()
          .includes(searchValue);

      const matchesMaterial =
        !filters.material ||
        calculation.material === filters.material;

      const matchesInstallation =
        !filters.installation_condition ||
        calculation.installation_condition ===
          filters.installation_condition;

      const matchesStatus =
        !filters.status ||
        calculation.current_capacity_status ===
          filters.status;

      return (
        matchesSearch &&
        matchesMaterial &&
        matchesInstallation &&
        matchesStatus
      );
    }
  );

  const materials = [
    ...new Set(
      calculations
        .map((item) => item.material)
        .filter(Boolean)
    ),
  ];

  const installationConditions = [
    ...new Set(
      calculations
        .map(
          (item) =>
            item.installation_condition
        )
        .filter(Boolean)
    ),
  ];

  const clearFilters = () => {
    setSearchTerm("");

    setFilters({
      material: "",
      installation_condition: "",
      status: "",
    });
  };

  const hasActiveFilters =
    searchTerm ||
    filters.material ||
    filters.installation_condition ||
    filters.status;

  const passCount = calculations.filter(
    (item) =>
      item.current_capacity_status === "PASS"
  ).length;

  const failCount = calculations.filter(
    (item) =>
      item.current_capacity_status === "FAIL"
  ).length;

  return (
    <div className="calculation-history-page">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <div className="calculation-history-header">

        <div>
          <div className="calculation-history-breadcrumb">
            Engineering Design Center
            <span>/</span>
            Workspace
            <span>/</span>
            Calculation History
          </div>

          <h1>Calculation History</h1>

          <p>
            Review previous cable engineering
            calculations and their results.
          </p>
        </div>

        <button
          type="button"
          className="calculation-history-refresh"
          onClick={loadHistory}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle
              size={16}
              className="calculation-history-spinner"
            />
          ) : (
            <Clock3 size={16} />
          )}

          Refresh
        </button>

      </div>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="calculation-history-error">

          <XCircle size={19} />

          <div>
            <strong>
              Unable to load calculation history
            </strong>

            <span>{error}</span>
          </div>

        </div>
      )}

      {/* =================================================
          SUMMARY
          ================================================= */}

      <div className="calculation-history-summary">

        <div className="calculation-history-summary-card">

          <div className="calculation-history-summary-icon primary">
            <Calculator size={20} />
          </div>

          <div>
            <span>Total Calculations</span>
            <strong>
              {calculations.length}
            </strong>
          </div>

        </div>

        <div className="calculation-history-summary-card">

          <div className="calculation-history-summary-icon success">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Passed</span>
            <strong>{passCount}</strong>
          </div>

        </div>

        <div className="calculation-history-summary-card">

          <div className="calculation-history-summary-icon danger">
            <XCircle size={20} />
          </div>

          <div>
            <span>Failed</span>
            <strong>{failCount}</strong>
          </div>

        </div>

        <div className="calculation-history-summary-card">

          <div className="calculation-history-summary-icon blue">
            <Calculator size={20} />
          </div>

          <div>
            <span>Displayed Records</span>
            <strong>
              {filteredCalculations.length}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          HISTORY TABLE CARD
          ================================================= */}

      <section className="calculation-history-card">

        <div className="calculation-history-card-header">

          <div>
            <span className="calculation-history-section-label">
              ENGINEERING RECORDS
            </span>

            <h2>Previous Calculations</h2>

            <p>
              {filteredCalculations.length} of{" "}
              {calculations.length} records displayed
            </p>
          </div>

        </div>

        {/* =================================================
            FILTERS
            ================================================= */}

        <div className="calculation-history-filters">

          <div className="calculation-history-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search calculations..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

          </div>

          <div className="calculation-history-filter">

            <label>Material</label>

            <select
              value={filters.material}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  material: event.target.value,
                }))
              }
            >
              <option value="">
                All Materials
              </option>

              {materials.map((material) => (
                <option
                  key={material}
                  value={material}
                >
                  {formatMaterial(material)}
                </option>
              ))}
            </select>

          </div>

          <div className="calculation-history-filter">

            <label>Installation</label>

            <select
              value={
                filters.installation_condition
              }
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  installation_condition:
                    event.target.value,
                }))
              }
            >
              <option value="">
                All Installations
              </option>

              {installationConditions.map(
                (condition) => (
                  <option
                    key={condition}
                    value={condition}
                  >
                    {formatInstallationCondition(
                      condition
                    )}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="calculation-history-filter">

            <label>Status</label>

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
            >
              <option value="">
                All Statuses
              </option>

              <option value="PASS">
                PASS
              </option>

              <option value="FAIL">
                FAIL
              </option>

            </select>

          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="calculation-history-clear"
              onClick={clearFilters}
            >
              <Filter size={15} />
              Clear
            </button>
          )}

        </div>

        {/* =================================================
            TABLE
            ================================================= */}

        <div className="calculation-history-table-wrapper">

          {loading ? (
            <div className="calculation-history-loading">

              <LoaderCircle
                size={25}
                className="calculation-history-spinner"
              />

              <span>
                Loading calculation history...
              </span>

            </div>
          ) : filteredCalculations.length === 0 ? (
            <div className="calculation-history-empty">

              <Calculator size={36} />

              <h3>
                {hasActiveFilters
                  ? "No matching calculations"
                  : "No calculation history"}
              </h3>

              <p>
                {hasActiveFilters
                  ? "Try changing your filters."
                  : "Completed calculations will appear here."}
              </p>

            </div>
          ) : (
            <table className="calculation-history-table">

              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Conductor</th>
                  <th>Material</th>
                  <th>Installation</th>
                  <th>Design Current</th>
                  <th>Current Rating</th>
                  <th>Status</th>
                  <th>Voltage Drop</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredCalculations.map(
                  (calculation) => (
                    <tr key={calculation._id}>

                      {/* Date */}
                      <td>
                        <span className="history-date">
                          {formatDateTime(
                            calculation.calculated_at
                          )}
                        </span>
                      </td>

                      {/* Conductor */}
                      <td>
                        <strong className="history-conductor">
                          {
                            calculation.conductor_size_mm2
                          }{" "}
                          mm²
                        </strong>
                      </td>

                      {/* Material */}
                      <td>
                        <span className="history-material">
                          {formatMaterial(
                            calculation.material
                          )}
                        </span>
                      </td>

                      {/* Installation */}
                      <td>
                        <span className="history-installation">
                          {formatInstallationCondition(
                            calculation.installation_condition
                          )}
                        </span>
                      </td>

                      {/* Design Current */}
                      <td>
                        <strong>
                          {
                            calculation.design_current_a
                          }{" "}
                          A
                        </strong>
                      </td>

                      {/* Current Rating */}
                      <td>
                        <strong>
                          {
                            calculation.current_rating_a
                          }{" "}
                          A
                        </strong>
                      </td>

                      {/* Status */}
                      <td>

                        <span
                          className={`history-status ${
                            calculation.current_capacity_status ===
                            "PASS"
                              ? "pass"
                              : "fail"
                          }`}
                        >
                          {calculation.current_capacity_status ===
                          "PASS" ? (
                            <CheckCircle2
                              size={14}
                            />
                          ) : (
                            <XCircle
                              size={14}
                            />
                          )}

                          {
                            calculation.current_capacity_status
                          }
                        </span>

                      </td>

                      {/* Voltage Drop */}
                      <td>

                        <strong>
                          {
                            calculation.voltage_drop_v
                          }{" "}
                          V
                        </strong>

                        <span className="history-voltage-percent">
                          {" "}
                          (
                          {
                            calculation.voltage_drop_percent
                          }
                          %)
                        </span>

                      </td>

                      {/* Action */}
                      <td>

                        <button
                          type="button"
                          className="history-view-button"
                          title="View calculation details"
                          onClick={() =>
                            setSelectedCalculation(
                              calculation
                            )
                          }
                        >
                          <Eye size={16} />
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </section>

      {/* =================================================
          DETAILS MODAL
          ================================================= */}

      {selectedCalculation && (
        <div
          className="history-modal-overlay"
          onClick={() =>
            setSelectedCalculation(null)
          }
        >

          <div
            className="history-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="history-modal-header">

              <div>
                <span>
                  CALCULATION DETAILS
                </span>

                <h2>
                  {
                    selectedCalculation
                      .conductor_size_mm2
                  }{" "}
                  mm² Cable Calculation
                </h2>
              </div>

              <button
                type="button"
                className="history-modal-close"
                onClick={() =>
                  setSelectedCalculation(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="history-modal-status">

              <span
                className={`history-status ${
                  selectedCalculation.current_capacity_status ===
                  "PASS"
                    ? "pass"
                    : "fail"
                }`}
              >
                {selectedCalculation.current_capacity_status ===
                "PASS" ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <XCircle size={15} />
                )}

                {
                  selectedCalculation.current_capacity_status
                }
              </span>

              <span>
                {formatDateTime(
                  selectedCalculation.calculated_at
                )}
              </span>

            </div>

            <div className="history-detail-grid">

              <div>
                <span>Conductor Size</span>
                <strong>
                  {
                    selectedCalculation
                      .conductor_size_mm2
                  }{" "}
                  mm²
                </strong>
              </div>

              <div>
                <span>Material</span>
                <strong>
                  {formatMaterial(
                    selectedCalculation.material
                  )}
                </strong>
              </div>

              <div>
                <span>Installation Condition</span>
                <strong>
                  {formatInstallationCondition(
                    selectedCalculation.installation_condition
                  )}
                </strong>
              </div>

              <div>
                <span>Design Current</span>
                <strong>
                  {
                    selectedCalculation.design_current_a
                  }{" "}
                  A
                </strong>
              </div>

              <div>
                <span>Current Rating</span>
                <strong>
                  {
                    selectedCalculation.current_rating_a
                  }{" "}
                  A
                </strong>
              </div>

              <div>
                <span>Current Capacity</span>
                <strong
                  className={
                    selectedCalculation.current_capacity_status ===
                    "PASS"
                      ? "detail-pass"
                      : "detail-fail"
                  }
                >
                  {
                    selectedCalculation
                      .current_capacity_status
                  }
                </strong>
              </div>

              <div>
                <span>Cable Length</span>
                <strong>
                  {
                    selectedCalculation.cable_length_m
                  }{" "}
                  m
                </strong>
              </div>

              <div>
                <span>Supply Voltage</span>
                <strong>
                  {
                    selectedCalculation.supply_voltage_v
                  }{" "}
                  V
                </strong>
              </div>

              <div>
                <span>Voltage Drop</span>
                <strong>
                  {
                    selectedCalculation.voltage_drop_v
                  }{" "}
                  V
                </strong>
              </div>

              <div>
                <span>Voltage Drop Percentage</span>
                <strong>
                  {
                    selectedCalculation
                      .voltage_drop_percent
                  }
                  %
                </strong>
              </div>

            </div>

            <div className="history-modal-footer">

              <span>
                Calculation ID
              </span>

              <code>
                {selectedCalculation._id}
              </code>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default CalculationHistory;