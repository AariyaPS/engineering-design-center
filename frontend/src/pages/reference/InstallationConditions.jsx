import { useEffect, useState } from "react";
import {
  GitBranch,
  Plus,
  Search,
  Pencil,
  X,
  Save,
  LoaderCircle,
} from "lucide-react";

import { api } from "../../servics/api.js";
import "./InstallationConditions.css";

function InstallationConditions() {
  const [conditions, setConditions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // --------------------------------------------------
  // Load installation conditions
  // --------------------------------------------------

  const loadConditions = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getInstallationConditions();

      setConditions(data);
    } catch (error) {
      console.error(
        "Failed to fetch installation conditions:",
        error
      );

      setError(
        error.message ||
          "Failed to load installation condition data."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Load data when page opens
  // --------------------------------------------------

  useEffect(() => {
    loadConditions();
  }, []);

  // --------------------------------------------------
  // Open Add modal
  // --------------------------------------------------

  const handleAdd = () => {
    setEditingCondition(null);

    setFormData({
      code: "",
      name: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // --------------------------------------------------
  // Open Edit modal
  // --------------------------------------------------

  const handleEdit = (condition) => {
    setEditingCondition(condition);

    setFormData({
      code: condition.code || "",
      name: condition.name || "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // --------------------------------------------------
  // Handle input changes
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Add / Update condition
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const code = formData.code.trim().toLowerCase();
    const name = formData.name.trim();

    // Validation
    if (!code || !name) {
      setError(
        "Installation condition code and name are required."
      );
      return;
    }

    setSaving(true);

    try {
      if (editingCondition) {
        // Update existing condition
        await api.updateInstallationCondition(
          editingCondition._id,
          {
            code,
            name,
          }
        );

        setSuccess(
          "Installation condition updated successfully."
        );
      } else {
        // Add new condition
        await api.addInstallationCondition({
          code,
          name,
        });

        setSuccess(
          "Installation condition added successfully."
        );
      }

      // Refresh table
      await loadConditions();

      // Close modal
      setShowModal(false);

      setFormData({
        code: "",
        name: "",
      });

      setEditingCondition(null);
    } catch (error) {
      console.error(
        "Failed to save installation condition:",
        error
      );

      setError(
        error.message ||
          "Failed to save installation condition."
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
    setEditingCondition(null);

    setFormData({
      code: "",
      name: "",
    });

    setError("");
  };

  // --------------------------------------------------
  // Search / Filter
  // --------------------------------------------------

  const filteredConditions = conditions.filter(
    (condition) => {
      const searchValue = searchTerm.toLowerCase();

      return (
        condition.code
          ?.toLowerCase()
          .includes(searchValue) ||
        condition.name
          ?.toLowerCase()
          .includes(searchValue)
      );
    }
  );

  return (
    <div className="installation-page">

      {/* -------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* -------------------------------------------- */}

      <div className="installation-header">

        <div className="installation-header-content">

          <div className="installation-breadcrumb">
            Reference Data
            <span>/</span>
            Installation Conditions
          </div>

          <div className="installation-title-row">

            <div className="installation-title-icon">
              <GitBranch size={22} />
            </div>

            <div>
              <h1>Installation Conditions</h1>

              <p>
                Manage installation conditions used in
                engineering cable calculations.
              </p>
            </div>

          </div>

        </div>

        <button
          className="installation-add-button"
          onClick={handleAdd}
        >
          <Plus size={17} />
          Add Condition
        </button>

      </div>

      {/* -------------------------------------------- */}
      {/* SUCCESS MESSAGE */}
      {/* -------------------------------------------- */}

      {success && (
        <div className="installation-alert installation-alert-success">

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={15} />
          </button>

        </div>
      )}

      {/* -------------------------------------------- */}
      {/* ERROR MESSAGE */}
      {/* -------------------------------------------- */}

      {error && !showModal && (
        <div className="installation-alert installation-alert-error">

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>

        </div>
      )}

      {/* -------------------------------------------- */}
      {/* DATA CARD */}
      {/* -------------------------------------------- */}

      <div className="installation-card">

        <div className="installation-card-header">

          <div>

            <h2>
              Installation Condition Reference
            </h2>

            <p>
              {conditions.length} records available
            </p>

          </div>

          {/* Search */}

          <div className="installation-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search conditions..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="installation-search-clear"
              >
                <X size={14} />
              </button>
            )}

          </div>

        </div>

        {/* ------------------------------------------ */}
        {/* LOADING */}
        {/* ------------------------------------------ */}

        {loading && (
          <div className="installation-loading">

            <LoaderCircle
              size={22}
              className="installation-spinner"
            />

            <span>
              Loading installation condition data...
            </span>

          </div>
        )}

        {/* ------------------------------------------ */}
        {/* TABLE */}
        {/* ------------------------------------------ */}

        {!loading && (
          <div className="installation-table-wrapper">

            <table className="installation-table">

              <thead>

                <tr>

                  <th className="installation-column-number">
                    #
                  </th>

                  <th>
                    Condition Code
                  </th>

                  <th>
                    Installation Condition
                  </th>

                  <th className="installation-column-action">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredConditions.length > 0 ? (

                  filteredConditions.map(
                    (condition, index) => (

                      <tr key={condition._id}>

                        <td className="installation-row-number">
                          {index + 1}
                        </td>

                        <td>

                          <span className="installation-code">
                            {condition.code}
                          </span>

                        </td>

                        <td>

                          <span className="installation-name">
                            {condition.name}
                          </span>

                        </td>

                        <td className="installation-action-cell">

                          <button
                            type="button"
                            className="installation-edit-button"
                            onClick={() =>
                              handleEdit(condition)
                            }
                            title="Edit installation condition"
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
                      className="installation-empty"
                    >

                      <GitBranch size={30} />

                      <div>

                        <strong>
                          No installation conditions found
                        </strong>

                        <span>
                          {searchTerm
                            ? "Try a different search term."
                            : "Add your first installation condition to get started."}
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

      {/* -------------------------------------------- */}
      {/* ADD / EDIT MODAL */}
      {/* -------------------------------------------- */}

      {showModal && (

        <div
          className="installation-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              handleCloseModal();
            }

          }}
        >

          <div className="installation-modal">

            {/* Modal Header */}

            <div className="installation-modal-header">

              <div>

                <div className="installation-modal-icon">
                  <GitBranch size={19} />
                </div>

                <div>

                  <h2>
                    {editingCondition
                      ? "Edit Installation Condition"
                      : "Add Installation Condition"}
                  </h2>

                  <p>
                    {editingCondition
                      ? "Update the installation condition reference."
                      : "Add a new installation condition reference."}
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="installation-modal-close"
                onClick={handleCloseModal}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            {/* Modal Error */}

            {error && (
              <div className="installation-modal-error">
                {error}
              </div>
            )}

            {/* Form */}

            <form onSubmit={handleSubmit}>

              <div className="installation-form-body">

                {/* Code */}

                <div className="installation-form-group">

                  <label htmlFor="installation-code">
                    Condition Code
                  </label>

                  <input
                    id="installation-code"
                    name="code"
                    type="text"
                    placeholder="e.g. buried_direct"
                    value={formData.code}
                    onChange={handleChange}
                    maxLength={100}
                    disabled={saving}
                    autoComplete="off"
                  />

                  <span>
                    Use a unique code such as
                    buried_direct or underground_ducts.
                  </span>

                </div>

                {/* Name */}

                <div className="installation-form-group">

                  <label htmlFor="installation-name">
                    Condition Name
                  </label>

                  <input
                    id="installation-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Buried Direct"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={200}
                    disabled={saving}
                    autoComplete="off"
                  />

                  <span>
                    Enter the full installation condition name.
                  </span>

                </div>

              </div>

              {/* Footer */}

              <div className="installation-modal-footer">

                <button
                  type="button"
                  className="installation-cancel-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="installation-save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="installation-spinner"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />

                      {editingCondition
                        ? "Update Condition"
                        : "Save Condition"}
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

export default InstallationConditions;