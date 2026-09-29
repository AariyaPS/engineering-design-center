import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Edit3,
  LoaderCircle,
  Plus,
  Search,
  X,
} from "lucide-react";

import { api } from "../servics/api.js";
import "./EngineeringDesigns.css";


const initialForm = {
  design_name: "",
  client_name: "",
  project_name: "",
  description: "",
  supply_voltage_v: "",
  design_current_a: "",
  cable_length_m: "",
  status: "Draft",
};


function EngineeringDesigns() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingDesign, setEditingDesign] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const loadDesigns = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getEngineeringDesigns();

      setDesigns(data);
    } catch (err) {
      console.error("Failed to load engineering designs:", err);

      setError(
        err.message ||
          "Unable to load engineering designs."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDesigns();
  }, []);


  const filteredDesigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return designs;
    }

    return designs.filter((design) =>
      [
        design.design_id,
        design.design_name,
        design.client_name,
        design.project_name,
        design.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [designs, search]);


  const openCreateModal = () => {
    setEditingDesign(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };


  const openEditModal = (design) => {
    setEditingDesign(design);

    setFormData({
      design_name: design.design_name || "",
      client_name: design.client_name || "",
      project_name: design.project_name || "",
      description: design.description || "",
      supply_voltage_v:
        design.supply_voltage_v ?? "",
      design_current_a:
        design.design_current_a ?? "",
      cable_length_m:
        design.cable_length_m ?? "",
      status: design.status || "Draft",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };


  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingDesign(null);
    setFormData(initialForm);
  };


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.design_name.trim()) {
      setError("Design name is required.");
      return;
    }

    if (!formData.client_name.trim()) {
      setError("Client name is required.");
      return;
    }

    if (
      !formData.supply_voltage_v ||
      Number(formData.supply_voltage_v) <= 0
    ) {
      setError("Supply voltage must be greater than 0.");
      return;
    }

    if (
      !formData.design_current_a ||
      Number(formData.design_current_a) <= 0
    ) {
      setError("Design current must be greater than 0.");
      return;
    }

    if (
      !formData.cable_length_m ||
      Number(formData.cable_length_m) <= 0
    ) {
      setError("Cable length must be greater than 0.");
      return;
    }

    const payload = {
      design_name: formData.design_name.trim(),
      client_name: formData.client_name.trim(),
      project_name:
        formData.project_name.trim() || null,
      description:
        formData.description.trim() || null,
      supply_voltage_v:
        Number(formData.supply_voltage_v),
      design_current_a:
        Number(formData.design_current_a),
      cable_length_m:
        Number(formData.cable_length_m),
      status: formData.status,
    };


    try {
      setSaving(true);

      if (editingDesign) {
        await api.updateEngineeringDesign(
          editingDesign._id,
          payload
        );

        setSuccess(
          "Engineering design updated successfully."
        );
      } else {
        await api.addEngineeringDesign(payload);

        setSuccess(
          "Engineering design created successfully."
        );
      }

      await loadDesigns();

      setTimeout(() => {
        closeModal();
      }, 500);

    } catch (err) {
      console.error(
        "Failed to save engineering design:",
        err
      );

      setError(
        err.message ||
          "Unable to save engineering design."
      );
    } finally {
      setSaving(false);
    }
  };


  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  return (
    <div className="engineering-designs-page">

      <div className="designs-header">

        <div>
          <div className="designs-eyebrow">
            ENGINEERING WORKSPACE
          </div>

          <h1>Engineering Designs</h1>

          <p>
            Create, manage and track engineering
            design projects.
          </p>
        </div>

        <button
          type="button"
          className="design-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          New Design
        </button>

      </div>


      <div className="designs-toolbar">

        <div className="designs-search">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search designs..."
          />
        </div>

        <div className="designs-count">
          {filteredDesigns.length} design
          {filteredDesigns.length !== 1
            ? "s"
            : ""}
        </div>

      </div>


      {error && !showModal && (
        <div className="designs-alert error">
          {error}
        </div>
      )}


      {loading ? (
        <div className="designs-loading">
          <LoaderCircle
            size={24}
            className="spin"
          />

          <span>
            Loading engineering designs...
          </span>
        </div>
      ) : filteredDesigns.length === 0 ? (

        <div className="designs-empty">

          <div className="designs-empty-icon">
            <ClipboardList size={30} />
          </div>

          <h3>
            No engineering designs found
          </h3>

          <p>
            Create your first engineering design
            to begin managing design calculations.
          </p>

          <button
            type="button"
            className="design-primary-button"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            Create Design
          </button>

        </div>

      ) : (

        <div className="designs-table-card">

          <div className="designs-table-wrapper">

            <table className="designs-table">

              <thead>
                <tr>
                  <th>Design ID</th>
                  <th>Design</th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Voltage</th>
                  <th>Current</th>
                  <th>Length</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {filteredDesigns.map((design) => (

                  <tr key={design._id}>

                    <td>
                      <span className="design-id">
                        {design.design_id}
                      </span>
                    </td>

                    <td>
                      <div className="design-name-cell">
                        <strong>
                          {design.design_name}
                        </strong>

                        {design.description && (
                          <span>
                            {design.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      {design.client_name}
                    </td>

                    <td>
                      {design.project_name || "—"}
                    </td>

                    <td>
                      {design.supply_voltage_v} V
                    </td>

                    <td>
                      {design.design_current_a} A
                    </td>

                    <td>
                      {design.cable_length_m} m
                    </td>

                    <td>
                      <span
                        className={`design-status ${String(
                          design.status
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {design.status}
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        design.created_at
                      )}
                    </td>

                    <td>

                      <button
                        type="button"
                        className="design-action-button"
                        onClick={() =>
                          openEditModal(design)
                        }
                        title="Edit design"
                      >
                        <Edit3 size={16} />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {showModal && (

        <div
          className="design-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="design-modal">

            <div className="design-modal-header">

              <div>
                <span>
                  ENGINEERING DESIGN
                </span>

                <h2>
                  {editingDesign
                    ? "Edit Design"
                    : "Create New Design"}
                </h2>
              </div>

              <button
                type="button"
                className="design-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>


            <form
              className="design-form"
              onSubmit={handleSubmit}
            >

              {error && (
                <div className="designs-alert error">
                  {error}
                </div>
              )}

              {success && (
                <div className="designs-alert success">
                  {success}
                </div>
              )}


              <div className="design-form-grid">

                <div className="design-field full">
                  <label>
                    Design Name
                  </label>

                  <input
                    name="design_name"
                    value={formData.design_name}
                    onChange={handleChange}
                    placeholder="e.g. Main Distribution Feeder"
                  />
                </div>


                <div className="design-field">
                  <label>
                    Client Name
                  </label>

                  <input
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    placeholder="Client name"
                  />
                </div>


                <div className="design-field">
                  <label>
                    Project Name
                  </label>

                  <input
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    placeholder="Project name"
                  />
                </div>


                <div className="design-field">
                  <label>
                    Supply Voltage
                  </label>

                  <div className="design-input-unit">
                    <input
                      type="number"
                      name="supply_voltage_v"
                      value={
                        formData.supply_voltage_v
                      }
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="415"
                    />

                    <span>V</span>
                  </div>
                </div>


                <div className="design-field">
                  <label>
                    Design Current
                  </label>

                  <div className="design-input-unit">
                    <input
                      type="number"
                      name="design_current_a"
                      value={
                        formData.design_current_a
                      }
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="250"
                    />

                    <span>A</span>
                  </div>
                </div>


                <div className="design-field">
                  <label>
                    Cable Length
                  </label>

                  <div className="design-input-unit">
                    <input
                      type="number"
                      name="cable_length_m"
                      value={
                        formData.cable_length_m
                      }
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="80"
                    />

                    <span>m</span>
                  </div>
                </div>


                <div className="design-field">
                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Draft">
                      Draft
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Archived">
                      Archived
                    </option>
                  </select>
                </div>


                <div className="design-field full">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Brief description of the engineering design..."
                  />
                </div>

              </div>


              <div className="design-modal-footer">

                <button
                  type="button"
                  className="design-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="design-primary-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingDesign
                        ? "Update Design"
                        : "Create Design"}
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

export default EngineeringDesigns;