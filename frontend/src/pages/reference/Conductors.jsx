import { useEffect, useState } from "react";
import {
  Cable,
  Plus,
  Search,
  Pencil,
  X,
  Save,
  LoaderCircle,
} from "lucide-react";

import { api } from "../../servics/api.js";

import "./Conductors.css";

function Conductors() {
  const [conductors, setConductors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingConductor, setEditingConductor] = useState(null);

  const [formData, setFormData] = useState({
    conductor_size_mm2: "",
  });

  // --------------------------------------------------
  // Fetch conductors
  // --------------------------------------------------

  useEffect(() => {
    loadConductors();
  }, []);

  const loadConductors = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getConductors();

      // Remove test conductor data if present
      // const standardConductors = data.filter(
      //   (item) =>
      //     Number(item.conductor_size_mm2) <= 500
      // );

      // setConductors(standardConductors);
      setConductors(data);
    } catch (error) {
      console.error("Failed to fetch conductors:", error);

      setError(
        error.message ||
          "Failed to fetch conductor data."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredConductors = conductors.filter(
    (conductor) =>
      String(conductor.conductor_size_mm2)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // --------------------------------------------------
  // Open Add Modal
  // --------------------------------------------------

  const handleAdd = () => {
    setEditingConductor(null);

    setFormData({
      conductor_size_mm2: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------

  const handleEdit = (conductor) => {
    setEditingConductor(conductor);

    setFormData({
      conductor_size_mm2:
        conductor.conductor_size_mm2,
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

    setError("");
    setSuccess("");
  };

  // --------------------------------------------------
  // Save conductor
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const conductorData = {
        conductor_size_mm2: Number(
          formData.conductor_size_mm2
        ),
      };

      if (editingConductor) {
        await api.updateConductor(
          editingConductor._id,
          conductorData
        );

        setSuccess(
          "Conductor updated successfully."
        );
      } else {
        await api.addConductor(
          conductorData
        );

        setSuccess(
          "Conductor added successfully."
        );
      }

      setShowModal(false);

      await loadConductors();

    } catch (error) {
      console.error(
        "Failed to save conductor:",
        error
      );

      setError(
        error.message ||
          "Failed to save conductor."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Close modal
  // --------------------------------------------------

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingConductor(null);

    setFormData({
      conductor_size_mm2: "",
    });
  };

  return (
    <div className="reference-page">

      <div className="reference-container">

        {/* ----------------------------------------- */}
        {/* Page Header */}
        {/* ----------------------------------------- */}

        <div className="reference-header">

          <div className="reference-header-content">

            <div className="reference-breadcrumb">
              Reference Data
            </div>

            <div className="reference-title-row">

              <div className="reference-page-icon">
                <Cable size={23} />
              </div>

              <div>
                <h1>Conductors</h1>

                <p>
                  Manage conductor sizes used in
                  engineering calculations.
                </p>
              </div>

            </div>

          </div>

          <button
            type="button"
            className="reference-add-button"
            onClick={handleAdd}
          >
            <Plus size={17} />
            Add Conductor
          </button>

        </div>

        {/* ----------------------------------------- */}
        {/* Success Message */}
        {/* ----------------------------------------- */}

        {success && (
          <div className="reference-alert success">
            {success}
          </div>
        )}

        {/* ----------------------------------------- */}
        {/* Error Message */}
        {/* ----------------------------------------- */}

        {error && !showModal && (
          <div className="reference-alert error">
            {error}
          </div>
        )}

        {/* ----------------------------------------- */}
        {/* Loading */}
        {/* ----------------------------------------- */}

        {loading ? (

          <div className="reference-card loading-card">

            <LoaderCircle
              size={24}
              className="loading-spinner"
            />

            <span>
              Loading conductor data...
            </span>

          </div>

        ) : (

          <div className="reference-card">

            {/* ------------------------------------- */}
            {/* Table Header */}
            {/* ------------------------------------- */}

            <div className="reference-card-header">

              <div>
                <h2>
                  Conductor Reference Values
                </h2>

                <span>
                  {conductors.length} records available
                </span>
              </div>

              {/* Search */}
              <div className="reference-search">

                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search conductor size..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm("")
                    }
                  >
                    <X size={15} />
                  </button>
                )}

              </div>

            </div>

            {/* ------------------------------------- */}
            {/* Table */}
            {/* ------------------------------------- */}

            <div className="table-responsive">

              <table className="reference-table">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>Conductor Size</th>
                    <th>Unit</th>
                    <th className="action-column">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredConductors.length > 0 ? (

                    filteredConductors.map(
                      (conductor, index) => (

                        <tr key={conductor._id}>

                          <td className="row-number">
                            {index + 1}
                          </td>

                          <td>
                            <div className="conductor-size">
                              {conductor.conductor_size_mm2}
                            </div>
                          </td>

                          <td>
                            <span className="unit-badge">
                              mm²
                            </span>
                          </td>

                          <td className="action-column">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                handleEdit(
                                  conductor
                                )
                              }
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
                        colSpan="4"
                        className="empty-table"
                      >
                        <Cable size={28} />

                        <strong>
                          No conductors found
                        </strong>

                        <span>
                          Try a different search term.
                        </span>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      {/* ========================================= */}
      {/* Add / Edit Modal */}
      {/* ========================================= */}

      {showModal && (

        <div
          className="reference-modal-overlay"
          onMouseDown={handleCloseModal}
        >

          <div
            className="reference-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="reference-modal-header">

              <div>

                <div className="modal-icon">
                  <Cable size={19} />
                </div>

                <div>
                  <h2>
                    {editingConductor
                      ? "Edit Conductor"
                      : "Add Conductor"}
                  </h2>

                  <p>
                    {editingConductor
                      ? "Update the conductor reference value."
                      : "Add a new conductor size to the reference data."}
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={handleCloseModal}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            {/* Modal Body */}

            <form onSubmit={handleSubmit}>

              <div className="reference-modal-body">

                {error && (
                  <div className="reference-alert error">
                    {error}
                  </div>
                )}

                <div className="form-group">

                  <label htmlFor="conductor_size_mm2">
                    Conductor Size
                  </label>

                  <div className="input-unit-wrapper">

                    <input
                      id="conductor_size_mm2"
                      name="conductor_size_mm2"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Enter conductor size"
                      value={
                        formData.conductor_size_mm2
                      }
                      onChange={handleChange}
                      required
                      autoFocus
                    />

                    <span>mm²</span>

                  </div>

                </div>

              </div>

              {/* Modal Footer */}

              <div className="reference-modal-footer">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="loading-spinner"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />

                      {editingConductor
                        ? "Update Conductor"
                        : "Add Conductor"}
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

export default Conductors;