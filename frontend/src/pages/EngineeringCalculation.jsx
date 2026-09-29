import { useEffect, useState } from "react";
import {
  Calculator,
  Cable,
  Settings2,
  Zap,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Gauge,
  Activity,
} from "lucide-react";

import { api } from "../servics/api.js";

function EngineeringCalculation() {
  // --------------------------------------------------
  // Reference data
  // --------------------------------------------------

  const [conductors, setConductors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [installationConditions, setInstallationConditions] = useState([]);

  // --------------------------------------------------
  // UI state
  // --------------------------------------------------

  const [loadingReferences, setLoadingReferences] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Calculation form
  // --------------------------------------------------

  const [formData, setFormData] = useState({
    conductor_size_mm2: 16,
    material: "CU",
    installation_condition: "buried_direct",
    design_current_a: 95,
    cable_length_m: 50,
    supply_voltage_v: 230,
  });

  // --------------------------------------------------
  // Load reference data from backend
  // --------------------------------------------------

  useEffect(() => {
    const loadReferenceData = async () => {
      setLoadingReferences(true);
      setError("");

      try {
        const [conductorData, materialData, conditionData] = await Promise.all([
          api.getConductors(),
          api.getMaterials(),
          api.getInstallationConditions(),
        ]);

        // Remove test conductor data
        const standardConductors = conductorData.filter(
          (item) => Number(item.conductor_size_mm2) <= 500,
        );

        // Keep only standard materials
        const standardMaterials = materialData.filter(
          (item) => item.code === "CU" || item.code === "AL",
        );

        // Remove test installation condition
        const standardConditions = conditionData.filter(
          (item) => item.code !== "test_condition",
        );

        setConductors(standardConductors);
        setMaterials(standardMaterials);
        setInstallationConditions(standardConditions);
      } catch (error) {
        setError(error.message || "Failed to load engineering reference data.");
      } finally {
        setLoadingReferences(false);
      }
    };

    loadReferenceData();
  }, []);

  // --------------------------------------------------
  // Handle form changes
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear previous result when user changes an input
    setResult(null);

    // Clear previous error
    setError("");
  };

  // --------------------------------------------------
  // Perform calculation
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const conductorSize = Number(formData.conductor_size_mm2);
    const designCurrent = Number(formData.design_current_a);
    const cableLength = Number(formData.cable_length_m);
    const supplyVoltage = Number(formData.supply_voltage_v);

    // Frontend validation
    if (!conductorSize || conductorSize <= 0) {
      setError("Please select a valid conductor size.");
      return;
    }

    if (!formData.material) {
      setError("Please select a material.");
      return;
    }

    if (!formData.installation_condition) {
      setError("Please select an installation condition.");
      return;
    }

    if (!Number.isFinite(designCurrent) || designCurrent <= 0) {
      setError("Design current must be greater than 0 A.");
      return;
    }

    if (!Number.isFinite(cableLength) || cableLength <= 0) {
      setError("Cable length must be greater than 0 m.");
      return;
    }

    if (!Number.isFinite(supplyVoltage) || supplyVoltage <= 0) {
      setError("Supply voltage must be greater than 0 V.");
      return;
    }

    setCalculating(true);

    try {
      const calculationResult = await api.calculate({
        conductor_size_mm2: conductorSize,
        material: formData.material,
        installation_condition: formData.installation_condition,
        design_current_a: designCurrent,
        cable_length_m: cableLength,
        supply_voltage_v: supplyVoltage,
      });

      setResult(calculationResult);
    } catch (error) {
      console.error("Calculation failed:", error);

      setError(
        error.message || "Unable to complete the engineering calculation.",
      );
    } finally {
      setCalculating(false);
    }
  };

  // --------------------------------------------------
  // Reset form
  // --------------------------------------------------

  const handleReset = () => {
    setFormData({
      conductor_size_mm2: 16,
      material: "CU",
      installation_condition: "buried_direct",
      design_current_a: 95,
      cable_length_m: 50,
      supply_voltage_v: 230,
    });

    setResult(null);
    setError("");
  };

  // --------------------------------------------------
  // Loading screen
  // --------------------------------------------------

  if (loadingReferences) {
    return (
      <div className="calculation-page">
        <div className="calculation-container">
          <div className="calculation-loading">
            <div
              className="spinner-border"
              role="status"
              style={{ color: "#EA6814" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>

            <p>Loading engineering reference data...</p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="calculation-page">
      <div className="calculation-container">
        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="calculation-header">
          <div>
            <div className="breadcrumb-text">
              Engineering Design Centre / Dashboard
            </div>

            <div className="d-flex align-items-center gap-3 mt-3">
              <div className="page-icon">
                <Calculator size={24} />
              </div>

              <div>
                <h1>Engineering Calculation</h1>

                <p>
                  Calculate cable current capacity and voltage drop using
                  engineering reference data.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn reset-button"
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* ==========================================
            ERROR MESSAGE
        ========================================== */}

        {error && (
          <div className="calculation-error">
            <div className="calculation-error-icon">!</div>

            <div>
              <strong>Calculation could not be completed</strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {/* ==========================================
            MAIN WORKSPACE
        ========================================== */}

        <div className="row g-4">
          {/* ========================================
              CALCULATION PARAMETERS
          ======================================== */}

          <div className="col-xl-7">
            <form onSubmit={handleSubmit}>
              <div className="calculation-card h-100">
                {/* Card Header */}

                <div className="calculation-card-header">
                  <div>
                    <h2>Calculation Parameters</h2>

                    <p>Select cable and installation parameters</p>
                  </div>
                </div>

                {/* Card Body */}

                <div className="calculation-card-body">
                  {/* ==================================
                      CABLE INFORMATION
                  ================================== */}

                  <div className="form-section">
                    <div className="section-title">
                      <Cable size={18} />

                      <span>Cable Information</span>
                    </div>

                    <div className="row g-3">
                      {/* Conductor Size */}

                      <div className="col-md-6">
                        <label
                          htmlFor="conductor_size_mm2"
                          className="form-label"
                        >
                          Conductor Size
                        </label>

                        <select
                          id="conductor_size_mm2"
                          name="conductor_size_mm2"
                          className="form-select"
                          value={formData.conductor_size_mm2}
                          onChange={handleChange}
                        >
                          {conductors.map((conductor) => (
                            <option
                              key={conductor._id}
                              value={conductor.conductor_size_mm2}
                            >
                              {conductor.conductor_size_mm2} mm²
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Material */}

                      <div className="col-md-6">
                        <label htmlFor="material" className="form-label">
                          Material
                        </label>

                        <select
                          id="material"
                          name="material"
                          className="form-select"
                          value={formData.material}
                          onChange={handleChange}
                        >
                          {materials.map((material) => (
                            <option key={material._id} value={material.code}>
                              {material.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ==================================
                      INSTALLATION
                  ================================== */}

                  <div className="form-section">
                    <div className="section-title">
                      <Settings2 size={18} />

                      <span>Installation</span>
                    </div>

                    <label
                      htmlFor="installation_condition"
                      className="form-label"
                    >
                      Installation Condition
                    </label>

                    <select
                      id="installation_condition"
                      name="installation_condition"
                      className="form-select"
                      value={formData.installation_condition}
                      onChange={handleChange}
                    >
                      {installationConditions.map((condition) => (
                        <option key={condition._id} value={condition.code}>
                          {condition.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ==================================
                      ELECTRICAL PARAMETERS
                  ================================== */}

                  <div className="form-section">
                    <div className="section-title">
                      <Zap size={18} />

                      <span>Electrical Parameters</span>
                    </div>

                    <div className="row g-3">
                      {/* Design Current */}

                      <div className="col-md-4">
                        <label
                          htmlFor="design_current_a"
                          className="form-label"
                        >
                          Design Current
                        </label>

                        <div className="input-with-unit">
                          <input
                            id="design_current_a"
                            type="number"
                            min="0"
                            step="0.1"
                            className="form-control"
                            name="design_current_a"
                            value={formData.design_current_a}
                            onChange={handleChange}
                          />

                          <span>A</span>
                        </div>
                      </div>

                      {/* Cable Length */}

                      <div className="col-md-4">
                        <label htmlFor="cable_length_m" className="form-label">
                          Cable Length
                        </label>

                        <div className="input-with-unit">
                          <input
                            id="cable_length_m"
                            type="number"
                            min="0"
                            step="0.1"
                            className="form-control"
                            name="cable_length_m"
                            value={formData.cable_length_m}
                            onChange={handleChange}
                          />

                          <span>m</span>
                        </div>
                      </div>

                      {/* Supply Voltage */}

                      <div className="col-md-4">
                        <label
                          htmlFor="supply_voltage_v"
                          className="form-label"
                        >
                          Supply Voltage
                        </label>

                        <div className="input-with-unit">
                          <input
                            id="supply_voltage_v"
                            type="number"
                            min="0"
                            step="0.1"
                            className="form-control"
                            name="supply_voltage_v"
                            value={formData.supply_voltage_v}
                            onChange={handleChange}
                          />

                          <span>V</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ==================================
                      CALCULATE BUTTON
                  ================================== */}

                  <button
                    type="submit"
                    className="btn calculate-button w-100"
                    disabled={calculating}
                  >
                    {calculating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator size={18} className="me-2" />
                        Calculate Engineering Design
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ========================================
              CALCULATION RESULT
          ======================================== */}

          <div className="col-xl-5">
            <div className="calculation-card result-card h-100">
              {/* Result Header */}

              <div className="calculation-card-header">
                <div>
                  <h2>Calculation Result</h2>

                  <p>Engineering assessment</p>
                </div>
              </div>

              {/* Result Body */}

              <div className="calculation-card-body">
                {!result ? (
                  /* =================================
                     EMPTY RESULT
                  ================================= */

                  <div className="empty-result">
                    <div className="result-icon">
                      <Calculator size={28} />
                    </div>

                    <h3>Ready to Calculate</h3>

                    <p>
                      Enter the required engineering parameters and click
                      Calculate.
                    </p>
                  </div>
                ) : (
                  /* =================================
                     CALCULATION RESULTS
                  ================================= */

                  <div className="result-content">
                    {/* ==========================================
                    CAPACITY ASSESSMENT
                    ========================================== */}

                    <div className="capacity-result">
                      <div className="capacity-header">
                        <div>
                          <span className="result-label">CURRENT CAPACITY</span>

                          <div className="capacity-value">
                            {result.current_rating_a}
                            <span>A</span>
                          </div>

                          <div className="design-current">
                            Design current:{" "}
                            <strong>{formData.design_current_a} A</strong>
                          </div>
                        </div>

                        <div
                          className={`status-badge ${
                            result.current_capacity_status === "Suitable"
                              ? "status-suitable"
                              : "status-warning"
                          }`}
                        >
                          {result.current_capacity_status === "Suitable" ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <AlertCircle size={16} />
                          )}

                          <span>{result.current_capacity_status}</span>
                        </div>
                      </div>
                    </div>

                    {/* ==========================================
      VOLTAGE DROP
  ========================================== */}

                    <div className="result-section">
                      <div className="result-section-heading">
                        <Activity size={17} />
                        <span>VOLTAGE DROP</span>
                      </div>

                      <div className="voltage-grid">
                        <div className="voltage-card">
                          <span>Voltage Drop</span>

                          <strong>
                            {result.voltage_drop_v}
                            <small> V</small>
                          </strong>
                        </div>

                        <div className="voltage-card">
                          <span>Drop Percentage</span>

                          <strong>
                            {result.voltage_drop_percent}
                            <small> %</small>
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* ==========================================
      CALCULATION INPUTS
  ========================================== */}

                    <div className="result-section">
                      <div className="result-section-heading">
                        <Settings2 size={17} />
                        <span>CALCULATION INPUTS</span>
                      </div>

                      <div className="input-summary">
                        <div className="input-summary-row">
                          <span>Conductor</span>
                          <strong>{formData.conductor_size_mm2} mm²</strong>
                        </div>

                        <div className="input-summary-row">
                          <span>Material</span>
                          <strong>
                            {formData.material === "CU"
                              ? "Copper"
                              : "Aluminium"}
                          </strong>
                        </div>

                        <div className="input-summary-row">
                          <span>Installation</span>
                          <strong>
                            {installationConditions.find(
                              (condition) =>
                                condition.code ===
                                formData.installation_condition,
                            )?.name || formData.installation_condition}
                          </strong>
                        </div>

                        <div className="input-summary-row">
                          <span>Design Current</span>
                          <strong>{formData.design_current_a} A</strong>
                        </div>

                        <div className="input-summary-row">
                          <span>Cable Length</span>
                          <strong>{formData.cable_length_m} m</strong>
                        </div>

                        <div className="input-summary-row">
                          <span>Supply Voltage</span>
                          <strong>{formData.supply_voltage_v} V</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EngineeringCalculation;
