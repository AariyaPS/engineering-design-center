import { useEffect, useState } from "react";
import {
  Boxes,
  Plus,
  Search,
  Pencil,
  X,
  Save,
  LoaderCircle,
} from "lucide-react";

import { api } from "../../servics/api.js";
import "./Materials.css";

function Materials() {
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true); //loading:I'm fetching the table data
  const [saving, setSaving] = useState(false); //saving: I'm adding/updating a material.

  const [error, setError] = useState(""); 
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false); //This determines whether your Add/Edit popup is visible.
  const [editingMaterial, setEditingMaterial] = useState(null);  //This is how your component knows whether it is in Add mode or Edit mode.

  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  // --------------------------------------------------
  // Load materials
  // --------------------------------------------------

  const loadMaterials = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getMaterials(); //calls your API.

      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);

      setError(
        error.message || "Failed to load material data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []); //empty [] means Run this effect when the component initially mounts

  // --------------------------------------------------
  // Open Add modal
  // --------------------------------------------------

  const handleAdd = () => {   // This runs when the user clicks: + Add Material
    setEditingMaterial(null); // We are creating a new material.

    setFormData({
      code: "",
      name: "",
    }); // clear the form

    setError("");
    setSuccess("");

    setShowModal(true);  // Open the modal.
  };

  // --------------------------------------------------
  // Open Edit modal
  // --------------------------------------------------

  const handleEdit = (material) => {
    setEditingMaterial(material);

    setFormData({
      code: material.code || "",
      name: material.name || "",
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
  // Save material
  // --------------------------------------------------

  const handleSubmit = async (event) => {  // It Save Material or Update Material
    event.preventDefault();

    setError("");
    setSuccess("");

    const code = formData.code.trim().toUpperCase();
    const name = formData.name.trim();

    if (!code || !name) {
      setError("Material code and material name are required.");
      return;
    }

    setSaving(true);

    try {
      if (editingMaterial) {            // If editingMaterial exists, you're editing.
        await api.updateMaterial(       // It calls PUT /api/materials/{id}
          editingMaterial._id,
          {
            code,
            name,
          }
        );

        setSuccess("Material updated successfully.");
      } else {                        // If editingMaterial is null
        await api.addMaterial({       // It calls POST /api/materials/
          code,
          name,
        });

        setSuccess("Material added successfully.");
      }

      await loadMaterials();

      setShowModal(false);

      setFormData({
        code: "",
        name: "",
      });

      setEditingMaterial(null);
    } catch (error) {
      console.error("Failed to save material:", error);

      setError(
        error.message || "Failed to save material."
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
    setEditingMaterial(null);

    setFormData({
      code: "",
      name: "",
    });

    setError("");
  };

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredMaterials = materials.filter((material) => { //creates a filtered version of original data.
    const searchValue = searchTerm.toLowerCase();

    return (
      material.code
        ?.toLowerCase()
        .includes(searchValue) ||
      material.name
        ?.toLowerCase()
        .includes(searchValue)
    );
  });

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="materials-page">

      {/* PAGE HEADER */}

      <div className="materials-header">

        <div className="materials-header-content">

          <div className="materials-breadcrumb">
            Reference Data
            <span>/</span>
            Materials
          </div>

          <div className="materials-title-row">

            <div className="materials-title-icon">
              <Boxes size={22} />
            </div>

            <div>
              <h1>Materials</h1>

              <p>
                Manage conductor materials used in
                engineering calculations.
              </p>
            </div>

          </div>

        </div>

        <button
          className="materials-add-button"
          onClick={handleAdd}
        >
          <Plus size={17} />
          Add Material
        </button>

      </div>


      {/* SUCCESS MESSAGE */}

      {success && (
        <div className="materials-alert materials-alert-success">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={15} />
          </button>
        </div>
      )}


      {/* ERROR MESSAGE */}

      {error && !showModal && (
        <div className="materials-alert materials-alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>
        </div>
      )}


      {/* MAIN CARD */}

      <div className="materials-card">

        {/* CARD HEADER */}

        <div className="materials-card-header">

          <div>

            <h2>
              Material Reference Values
            </h2>

            <p>
              {materials.length} records available
            </p>

          </div>

          <div className="materials-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="materials-search-clear"
              >
                <X size={14} />
              </button>
            )}

          </div>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="materials-loading">

            <LoaderCircle
              size={22}
              className="materials-spinner"
            />

            <span>
              Loading material data...
            </span>

          </div>
        )}


        {/* TABLE */}

        {!loading && (
          <div className="materials-table-wrapper">

            <table className="materials-table">

              <thead>

                <tr>
                  <th className="materials-column-number">
                    #
                  </th>

                  <th>
                    Material Code
                  </th>

                  <th>
                    Material Name
                  </th>

                  <th className="materials-column-action">
                    Action
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredMaterials.length > 0 ? (

                  filteredMaterials.map(
                    (material, index) => (
                      <tr key={material._id}>

                        <td className="materials-row-number">
                          {index + 1}
                        </td>

                        <td>
                          <span className="materials-code">
                            {material.code}
                          </span>
                        </td>

                        <td>
                          <span className="materials-name">
                            {material.name}
                          </span>
                        </td>

                        <td className="materials-action-cell">

                          <button
                            type="button"
                            className="materials-edit-button"
                            onClick={() =>
                              handleEdit(material)
                            }
                            title="Edit material"
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
                      className="materials-empty"
                    >

                      <Boxes size={30} />

                      <div>
                        <strong>
                          No materials found
                        </strong>

                        <span>
                          {searchTerm
                            ? "Try a different search term."
                            : "Add your first material to get started."}
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


      {/* MODAL */}

      {showModal && (
        <div
          className="materials-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              handleCloseModal();
            }
          }}
        >

          <div className="materials-modal">

            {/* MODAL HEADER */}

            <div className="materials-modal-header">

              <div>

                <div className="materials-modal-icon">
                  <Boxes size={19} />
                </div>

                <div>
                  <h2>
                    {editingMaterial
                      ? "Edit Material"
                      : "Add Material"}
                  </h2>

                  <p>
                    {editingMaterial
                      ? "Update the material reference details."
                      : "Add a new material reference."}
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="materials-modal-close"
                onClick={handleCloseModal}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>


            {/* MODAL ERROR */}

            {error && (
              <div className="materials-modal-error">
                {error}
              </div>
            )}


            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="materials-form-body">

                <div className="materials-form-group">

                  <label htmlFor="material-code">
                    Material Code
                  </label>

                  <input
                    id="material-code"
                    name="code"
                    type="text"
                    placeholder="e.g. CU"
                    value={formData.code}
                    onChange={handleChange}
                    maxLength={10}
                    disabled={saving}
                    autoComplete="off"
                  />

                  <span>
                    Use a short code such as CU or AL.
                  </span>

                </div>


                <div className="materials-form-group">

                  <label htmlFor="material-name">
                    Material Name
                  </label>

                  <input
                    id="material-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Copper"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={100}
                    disabled={saving}
                    autoComplete="off"
                  />

                  <span>
                    Enter the full material name.
                  </span>

                </div>

              </div>


              {/* MODAL FOOTER */}

              <div className="materials-modal-footer">

                <button
                  type="button"
                  className="materials-cancel-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="materials-save-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="materials-spinner"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />

                      {editingMaterial
                        ? "Update Material"
                        : "Save Material"}
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

export default Materials;

