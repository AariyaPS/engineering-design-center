import { useEffect, useState } from "react";
import {
  Zap,
  Plus,
  Search,
  Pencil,
  X,
  Save,
  LoaderCircle,
} from "lucide-react";

import { api } from "../../servics/api.js";
import "./VoltageDrop.css";

function VoltageDrop() {
  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [references, setReferences] = useState([]);

  const [conductors, setConductors] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    conductor: "",
    material: "",
  });

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingReference, setEditingReference] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    conductor_size_mm2: "",
    material: "",
    voltage_drop_mv_per_a_m: "",
  });

  // --------------------------------------------------
  // Load reference data
  // --------------------------------------------------

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        voltageDropData,
        conductorData,
        materialData,
      ] = await Promise.all([
        api.getVoltageDropReferences(),
        api.getConductors(),
        api.getMaterials(),
      ]);

      setReferences(voltageDropData);
      setConductors(conductorData);
      setMaterials(materialData);
    } catch (error) {
      console.error(
        "Failed to load voltage drop data:",
        error
      );

      setError(
        error.message ||
          "Failed to load voltage drop reference data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // Add reference
  // --------------------------------------------------

  const handleAdd = () => {
    setEditingReference(null);

    setFormData({
      conductor_size_mm2: "",
      material: "",
      voltage_drop_mv_per_a_m: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // --------------------------------------------------
  // Edit reference
  // --------------------------------------------------

  const handleEdit = (reference) => {
    setEditingReference(reference);

    setFormData({
      conductor_size_mm2:
        reference.conductor_size_mm2 ?? "",
      material: reference.material || "",
      voltage_drop_mv_per_a_m:
        reference.voltage_drop_mv_per_a_m ?? "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // --------------------------------------------------
  // Handle form changes
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Handle filter changes
  // --------------------------------------------------

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Clear filters
  // --------------------------------------------------

  const clearFilters = () => {
    setSearchTerm("");

    setFilters({
      conductor: "",
      material: "",
    });
  };

  // --------------------------------------------------
  // Active filters
  // --------------------------------------------------

  const hasActiveFilters =
    searchTerm ||
    filters.conductor ||
    filters.material;

  // --------------------------------------------------
  // Filter references
  // --------------------------------------------------

  const filteredReferences = references.filter(
    (reference) => {
      const searchValue = searchTerm
        .trim()
        .toLowerCase();

      // Search
      const matchesSearch =
        !searchValue ||
        String(reference.conductor_size_mm2)
          .toLowerCase()
          .includes(searchValue) ||
        reference.material
          ?.toLowerCase()
          .includes(searchValue) ||
        String(reference.voltage_drop_mv_per_a_m)
          .toLowerCase()
          .includes(searchValue);

      // Conductor
      const matchesConductor =
        !filters.conductor ||
        String(reference.conductor_size_mm2) ===
          String(filters.conductor);

      // Material
      const matchesMaterial =
        !filters.material ||
        reference.material === filters.material;

      return (
        matchesSearch &&
        matchesConductor &&
        matchesMaterial
      );
    }
  );

  // --------------------------------------------------
  // Add / Update reference
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const conductorSize = Number(
      formData.conductor_size_mm2
    );

    const voltageDrop = Number(
      formData.voltage_drop_mv_per_a_m
    );

    const material = formData.material
      .trim()
      .toUpperCase();

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (!formData.conductor_size_mm2) {
      setError("Please select a conductor size.");
      return;
    }

    if (!material) {
      setError("Please select a material.");
      return;
    }

    if (
      !formData.voltage_drop_mv_per_a_m ||
      Number.isNaN(voltageDrop) ||
      voltageDrop <= 0
    ) {
      setError(
        "Please enter a valid voltage drop value greater than 0."
      );
      return;
    }

    setSaving(true);

    const payload = {
      conductor_size_mm2: conductorSize,
      material,
      voltage_drop_mv_per_a_m: voltageDrop,
    };

    try {
      if (editingReference) {
        await api.updateVoltageDrop(
          editingReference._id,
          payload
        );

        setSuccess(
          "Voltage drop reference updated successfully."
        );
      } else {
        await api.addVoltageDrop(payload);

        setSuccess(
          "Voltage drop reference added successfully."
        );
      }

      await loadData();

      setShowModal(false);

      setFormData({
        conductor_size_mm2: "",
        material: "",
        voltage_drop_mv_per_a_m: "",
      });

      setEditingReference(null);
    } catch (error) {
      console.error(
        "Failed to save voltage drop reference:",
        error
      );

      setError(
        error.message ||
          "Failed to save voltage drop reference."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Close modal
  // --------------------------------------------------

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingReference(null);

    setFormData({
      conductor_size_mm2: "",
      material: "",
      voltage_drop_mv_per_a_m: "",
    });

    setError("");
  };

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div className="voltage-drop-page">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="voltage-drop-header">
        <div className="voltage-drop-header-content">
          <div className="voltage-drop-breadcrumb">
            Reference Data
            <span>/</span>
            Voltage Drop
          </div>

          <div className="voltage-drop-title-row">
            <div className="voltage-drop-title-icon">
              <Zap size={22} />
            </div>

            <div>
              <h1>Voltage Drop</h1>

              <p>
                Manage voltage drop reference values used
                for cable calculations.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="voltage-drop-add-button"
          onClick={handleAdd}
        >
          <Plus size={17} />
          Add Reference
        </button>
      </div>

      {/* ==================================================
          SUCCESS
      ================================================== */}

      {success && (
        <div className="voltage-drop-alert voltage-drop-alert-success">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && !showModal && (
        <div className="voltage-drop-alert voltage-drop-alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ==================================================
          DATA CARD
      ================================================== */}

      <div className="voltage-drop-card">
        {/* ==================================================
            CARD HEADER
        ================================================== */}

        <div className="voltage-drop-card-header">
          <div>
            <h2>Voltage Drop Reference Data</h2>

            <span>
              Showing {filteredReferences.length} of{" "}
              {references.length} records
            </span>
          </div>

          {/* SEARCH */}

          <div className="voltage-drop-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search voltage drop..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="voltage-drop-search-clear"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="voltage-drop-filters">
          {/* CONDUCTOR */}

          <div className="voltage-drop-filter">
            <label htmlFor="filter-voltage-conductor">
              Conductor
            </label>

            <select
              id="filter-voltage-conductor"
              name="conductor"
              value={filters.conductor}
              onChange={handleFilterChange}
            >
              <option value="">
                All Conductors
              </option>

              {[...conductors]
                .sort(
                  (a, b) =>
                    Number(a.conductor_size_mm2) -
                    Number(b.conductor_size_mm2)
                )
                .map((conductor) => (
                  <option
                    key={conductor._id}
                    value={conductor.conductor_size_mm2}
                  >
                    {conductor.conductor_size_mm2} mm²
                  </option>
                ))}
            </select>
          </div>

          {/* MATERIAL */}

          <div className="voltage-drop-filter">
            <label htmlFor="filter-voltage-material">
              Material
            </label>

            <select
              id="filter-voltage-material"
              name="material"
              value={filters.material}
              onChange={handleFilterChange}
            >
              <option value="">
                All Materials
              </option>

              {materials.map((material) => (
                <option
                  key={material._id}
                  value={material.code}
                >
                  {material.name}
                </option>
              ))}
            </select>
          </div>

          {/* CLEAR */}

          {hasActiveFilters && (
            <button
              type="button"
              className="voltage-drop-clear-filters"
              onClick={clearFilters}
            >
              <X size={15} />
              Clear Filters
            </button>
          )}
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="voltage-drop-loading">
            <LoaderCircle
              size={22}
              className="voltage-drop-spinner"
            />

            <span>
              Loading voltage drop reference data...
            </span>
          </div>
        )}

        {/* ==================================================
            TABLE
        ================================================== */}

        {!loading && (
          <div className="voltage-drop-table-wrapper">
            <table className="voltage-drop-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Conductor</th>
                  <th>Material</th>
                  <th>Voltage Drop</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredReferences.length > 0 ? (
                  filteredReferences.map(
                    (reference, index) => (
                      <tr key={reference._id}>
                        <td>{index + 1}</td>

                        <td>
                          <span className="voltage-drop-conductor">
                            {reference.conductor_size_mm2} mm²
                          </span>
                        </td>

                        <td>
                          <span className="voltage-drop-material">
                            {reference.material}
                          </span>
                        </td>

                        <td>
                          <strong className="voltage-drop-value">
                            {
                              reference.voltage_drop_mv_per_a_m
                            }{" "}
                            mV/A/m
                          </strong>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="voltage-drop-edit-button"
                            onClick={() =>
                              handleEdit(reference)
                            }
                            title="Edit voltage drop reference"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="voltage-drop-empty"
                    >
                      <Zap size={30} />

                      <div>
                        <strong>
                          No voltage drop references found
                        </strong>

                        <span>
                          {hasActiveFilters
                            ? "Try changing your search or filter criteria."
                            : "Add your first voltage drop reference to get started."}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================
          MODAL
      ================================================== */}

      {showModal && (
        <div
          className="voltage-drop-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              handleCloseModal();
            }
          }}
        >
          <div className="voltage-drop-modal">
            {/* MODAL HEADER */}

            <div className="voltage-drop-modal-header">
              <div>
                <div className="voltage-drop-modal-icon">
                  <Zap size={19} />
                </div>

                <div>
                  <h2>
                    {editingReference
                      ? "Edit Voltage Drop"
                      : "Add Voltage Drop"}
                  </h2>

                  <p>
                    {editingReference
                      ? "Update the voltage drop reference."
                      : "Add a new voltage drop reference."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="voltage-drop-modal-close"
                onClick={handleCloseModal}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL ERROR */}

            {error && (
              <div className="voltage-drop-modal-error">
                {error}
              </div>
            )}

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="voltage-drop-form-body">
                {/* CONDUCTOR */}

                <div className="voltage-drop-form-group">
                  <label htmlFor="voltage-conductor-size">
                    Conductor Size
                  </label>

                  <select
                    id="voltage-conductor-size"
                    name="conductor_size_mm2"
                    value={formData.conductor_size_mm2}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">
                      Select conductor size
                    </option>

                    {[...conductors]
                      .sort(
                        (a, b) =>
                          Number(a.conductor_size_mm2) -
                          Number(b.conductor_size_mm2)
                      )
                      .map((conductor) => (
                        <option
                          key={conductor._id}
                          value={
                            conductor.conductor_size_mm2
                          }
                        >
                          {conductor.conductor_size_mm2} mm²
                        </option>
                      ))}
                  </select>
                </div>

                {/* MATERIAL */}

                <div className="voltage-drop-form-group">
                  <label htmlFor="voltage-material">
                    Material
                  </label>

                  <select
                    id="voltage-material"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">
                      Select material
                    </option>

                    {materials.map((material) => (
                      <option
                        key={material._id}
                        value={material.code}
                      >
                        {material.name} (
                        {material.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* VOLTAGE DROP */}

                <div className="voltage-drop-form-group">
                  <label htmlFor="voltage-drop-value">
                    Voltage Drop (mV/A/m)
                  </label>

                  <input
                    id="voltage-drop-value"
                    name="voltage_drop_mv_per_a_m"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 2.8"
                    value={
                      formData.voltage_drop_mv_per_a_m
                    }
                    onChange={handleChange}
                    disabled={saving}
                  />

                  <span>
                    Enter the voltage drop reference in
                    mV/A/m.
                  </span>
                </div>
              </div>

              {/* FOOTER */}

              <div className="voltage-drop-modal-footer">
                <button
                  type="button"
                  className="voltage-drop-cancel-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="voltage-drop-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="voltage-drop-spinner"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />

                      {editingReference
                        ? "Update Reference"
                        : "Save Reference"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoltageDrop;