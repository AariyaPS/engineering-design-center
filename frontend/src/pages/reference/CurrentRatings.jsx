import { useEffect, useState } from "react";
import {
  Gauge,
  Plus,
  Search,
  Pencil,
  X,
  Save,
  LoaderCircle,
} from "lucide-react";

import { api } from "../../servics/api.js";
import "./CurrentRatings.css";

function CurrentRatings() {
  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [ratings, setRatings] = useState([]);

  const [conductors, setConductors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [conditions, setConditions] = useState([]);

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
    installation_condition: "",
  });

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingRating, setEditingRating] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    conductor_size_mm2: "",
    material: "",
    installation_condition: "",
    current_rating_a: "",
  });

  // --------------------------------------------------
  // Load all reference data
  // --------------------------------------------------

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [ratingData, conductorData, materialData, conditionData] =
        await Promise.all([
          api.getCurrentRatings(),
          api.getConductors(),
          api.getMaterials(),
          api.getInstallationConditions(),
        ]);

      setRatings(ratingData);
      setConductors(conductorData);
      setMaterials(materialData);
      setConditions(conditionData);
    } catch (error) {
      console.error("Failed to load current rating data:", error);

      setError(error.message || "Failed to load current rating data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // Add new rating
  // --------------------------------------------------

  const handleAdd = () => {
    setEditingRating(null);

    setFormData({
      conductor_size_mm2: "",
      material: "",
      installation_condition: "",
      current_rating_a: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // --------------------------------------------------
  // Edit rating
  // --------------------------------------------------

  const handleEdit = (rating) => {
    setEditingRating(rating);

    setFormData({
      conductor_size_mm2: rating.conductor_size_mm2 ?? "",
      material: rating.material || "",
      installation_condition: rating.installation_condition || "",
      current_rating_a: rating.current_rating_a ?? "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // --------------------------------------------------
  // Handle form input changes
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
  // Clear search and filters
  // --------------------------------------------------

  const clearFilters = () => {
    setSearchTerm("");

    setFilters({
      conductor: "",
      material: "",
      installation_condition: "",
    });
  };

  // --------------------------------------------------
  // Check whether any search/filter is active
  // --------------------------------------------------

  const hasActiveFilters =
    searchTerm ||
    filters.conductor ||
    filters.material ||
    filters.installation_condition;

  // --------------------------------------------------
  // Filter current ratings
  // --------------------------------------------------

  const filteredRatings = ratings.filter((rating) => {
    const searchValue = searchTerm.trim().toLowerCase();

    // Search
    const matchesSearch =
      !searchValue ||
      String(rating.conductor_size_mm2)
        .toLowerCase()
        .includes(searchValue) ||
      rating.material?.toLowerCase().includes(searchValue) ||
      rating.installation_condition
        ?.toLowerCase()
        .includes(searchValue) ||
      String(rating.current_rating_a)
        .toLowerCase()
        .includes(searchValue);

    // Conductor filter
    const matchesConductor =
      !filters.conductor ||
      String(rating.conductor_size_mm2) ===
        String(filters.conductor);

    // Material filter
    const matchesMaterial =
      !filters.material ||
      rating.material === filters.material;

    // Installation condition filter
    const matchesInstallation =
      !filters.installation_condition ||
      rating.installation_condition ===
        filters.installation_condition;

    // All conditions must match
    return (
      matchesSearch &&
      matchesConductor &&
      matchesMaterial &&
      matchesInstallation
    );
  });

  // --------------------------------------------------
  // Add / Update rating
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const conductorSize = Number(formData.conductor_size_mm2);

    const currentRating = Number(formData.current_rating_a);

    const material = formData.material.trim().toUpperCase();

    const installationCondition =
      formData.installation_condition.trim();

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

    if (!installationCondition) {
      setError("Please select an installation condition.");
      return;
    }

    if (
      !formData.current_rating_a ||
      Number.isNaN(currentRating) ||
      currentRating <= 0
    ) {
      setError(
        "Please enter a valid current rating greater than 0 A."
      );
      return;
    }

    setSaving(true);

    const payload = {
      conductor_size_mm2: conductorSize,
      material,
      installation_condition: installationCondition,
      current_rating_a: currentRating,
    };

    try {
      if (editingRating) {
        await api.updateCurrentRating(
          editingRating._id,
          payload
        );

        setSuccess("Current rating updated successfully.");
      } else {
        await api.addCurrentRating(payload);

        setSuccess("Current rating added successfully.");
      }

      // Refresh data
      await loadData();

      // Close modal
      setShowModal(false);

      // Reset form
      setFormData({
        conductor_size_mm2: "",
        material: "",
        installation_condition: "",
        current_rating_a: "",
      });

      setEditingRating(null);
    } catch (error) {
      console.error(
        "Failed to save current rating:",
        error
      );

      setError(
        error.message || "Failed to save current rating."
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
    setEditingRating(null);

    setFormData({
      conductor_size_mm2: "",
      material: "",
      installation_condition: "",
      current_rating_a: "",
    });

    setError("");
  };

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div className="current-ratings-page">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="current-ratings-header">
        <div className="current-ratings-header-content">
          <div className="current-ratings-breadcrumb">
            Reference Data
            <span>/</span>
            Current Ratings
          </div>

          <div className="current-ratings-title-row">
            <div className="current-ratings-title-icon">
              <Gauge size={22} />
            </div>

            <div>
              <h1>Current Ratings</h1>

              <p>
                Manage current-carrying capacity reference
                values for cable calculations.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="current-ratings-add-button"
          onClick={handleAdd}
        >
          <Plus size={17} />
          Add Rating
        </button>
      </div>

      {/* ==================================================
          SUCCESS MESSAGE
      ================================================== */}

      {success && (
        <div className="current-ratings-alert current-ratings-alert-success">
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
          ERROR MESSAGE
      ================================================== */}

      {error && !showModal && (
        <div className="current-ratings-alert current-ratings-alert-error">
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

      <div className="current-ratings-card">
        {/* ==================================================
            CARD HEADER
        ================================================== */}

        <div className="current-ratings-card-header">
          <div>
            <h2>Current Rating Reference Data</h2>

            <span>
              Showing {filteredRatings.length} of{" "}
              {ratings.length} records
            </span>
          </div>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <div className="current-ratings-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search ratings..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="current-ratings-search-clear"
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

        <div className="current-ratings-filters">
          {/* CONDUCTOR */}

          <div className="current-ratings-filter">
            <label htmlFor="filter-conductor">
              Conductor
            </label>

            <select
              id="filter-conductor"
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

          <div className="current-ratings-filter">
            <label htmlFor="filter-material">
              Material
            </label>

            <select
              id="filter-material"
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

          {/* INSTALLATION CONDITION */}

          <div className="current-ratings-filter">
            <label htmlFor="filter-installation">
              Installation Condition
            </label>

            <select
              id="filter-installation"
              name="installation_condition"
              value={filters.installation_condition}
              onChange={handleFilterChange}
            >
              <option value="">
                All Conditions
              </option>

              {conditions.map((condition) => (
                <option
                  key={condition._id}
                  value={condition.code}
                >
                  {condition.name}
                </option>
              ))}
            </select>
          </div>

          {/* CLEAR FILTERS */}

          {hasActiveFilters && (
            <button
              type="button"
              className="current-ratings-clear-filters"
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
          <div className="current-ratings-loading">
            <LoaderCircle
              size={22}
              className="current-ratings-spinner"
            />

            <span>
              Loading current rating data...
            </span>
          </div>
        )}

        {/* ==================================================
            TABLE
        ================================================== */}

        {!loading && (
          <div className="current-ratings-table-wrapper">
            <table className="current-ratings-table">
              <thead>
                <tr>
                  <th>#</th>

                  <th>Conductor</th>

                  <th>Material</th>

                  <th>Installation Condition</th>

                  <th>Current Rating</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRatings.length > 0 ? (
                  filteredRatings.map(
                    (rating, index) => (
                      <tr key={rating._id}>
                        {/* NUMBER */}

                        <td>{index + 1}</td>

                        {/* CONDUCTOR */}

                        <td>
                          <span className="rating-conductor">
                            {rating.conductor_size_mm2} mm²
                          </span>
                        </td>

                        {/* MATERIAL */}

                        <td>
                          <span className="rating-material">
                            {rating.material}
                          </span>
                        </td>

                        {/* INSTALLATION */}

                        <td>
                          {rating.installation_condition}
                        </td>

                        {/* CURRENT RATING */}

                        <td>
                          <strong className="rating-value">
                            {rating.current_rating_a} A
                          </strong>
                        </td>

                        {/* ACTION */}

                        <td>
                          <button
                            type="button"
                            className="current-ratings-edit-button"
                            onClick={() =>
                              handleEdit(rating)
                            }
                            title="Edit current rating"
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
                      colSpan="6"
                      className="current-ratings-empty"
                    >
                      <Gauge size={30} />

                      <div>
                        <strong>
                          No current ratings found
                        </strong>

                        <span>
                          {hasActiveFilters
                            ? "Try changing your search or filter criteria."
                            : "Add your first current rating to get started."}
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
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div
          className="current-ratings-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              handleCloseModal();
            }
          }}
        >
          <div className="current-ratings-modal">
            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="current-ratings-modal-header">
              <div>
                <div className="current-ratings-modal-icon">
                  <Gauge size={19} />
                </div>

                <div>
                  <h2>
                    {editingRating
                      ? "Edit Current Rating"
                      : "Add Current Rating"}
                  </h2>

                  <p>
                    {editingRating
                      ? "Update the current rating reference."
                      : "Add a new current rating reference."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="current-ratings-modal-close"
                onClick={handleCloseModal}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            {/* ==================================================
                MODAL ERROR
            ================================================== */}

            {error && (
              <div className="current-ratings-modal-error">
                {error}
              </div>
            )}

            {/* ==================================================
                FORM
            ================================================== */}

            <form onSubmit={handleSubmit}>
              <div className="current-ratings-form-body">
                {/* ==================================================
                    CONDUCTOR
                ================================================== */}

                <div className="current-ratings-form-group">
                  <label htmlFor="conductor-size">
                    Conductor Size
                  </label>

                  <select
                    id="conductor-size"
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

                {/* ==================================================
                    MATERIAL
                ================================================== */}

                <div className="current-ratings-form-group">
                  <label htmlFor="rating-material">
                    Material
                  </label>

                  <select
                    id="rating-material"
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

                {/* ==================================================
                    INSTALLATION CONDITION
                ================================================== */}

                <div className="current-ratings-form-group">
                  <label htmlFor="rating-condition">
                    Installation Condition
                  </label>

                  <select
                    id="rating-condition"
                    name="installation_condition"
                    value={
                      formData.installation_condition
                    }
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">
                      Select installation condition
                    </option>

                    {conditions.map((condition) => (
                      <option
                        key={condition._id}
                        value={condition.code}
                      >
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ==================================================
                    CURRENT RATING
                ================================================== */}

                <div className="current-ratings-form-group">
                  <label htmlFor="current-rating">
                    Current Rating (A)
                  </label>

                  <input
                    id="current-rating"
                    name="current_rating_a"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 110"
                    value={formData.current_rating_a}
                    onChange={handleChange}
                    disabled={saving}
                  />

                  <span>
                    Enter the permissible current rating
                    in amperes.
                  </span>
                </div>
              </div>

              {/* ==================================================
                  MODAL FOOTER
              ================================================== */}

              <div className="current-ratings-modal-footer">
                <button
                  type="button"
                  className="current-ratings-cancel-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="current-ratings-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="current-ratings-spinner"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />

                      {editingRating
                        ? "Update Rating"
                        : "Save Rating"}
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

export default CurrentRatings;