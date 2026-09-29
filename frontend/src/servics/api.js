const API_BASE_URL = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers, // {/* ...options.header: This is the JavaScript spread operator. It allows you to provide additional headers if you ever need them. */}
                         
    },
    ...options, //This allows the caller to specify things such as: method: "POST" or body: JSON.stringify(...)
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage =
        errorData.detail || errorData.message || errorMessage;
    } catch(error) {
      // Keep default error message
      console.log(error.message);
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Conductors
  getConductors: () => request("/conductors/"),

  addConductor: (data) =>
    request("/conductors/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateConductor: (id, data) =>
    request(`/conductors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Materials
  getMaterials: () => request("/materials/"),

  addMaterial: (data) =>
    request("/materials/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMaterial: (id, data) =>
    request(`/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Installation Conditions
  getInstallationConditions: () =>
    request("/installation-conditions/"),

  addInstallationCondition: (data) =>
    request("/installation-conditions/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateInstallationCondition: (id, data) =>
    request(`/installation-conditions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Current Ratings
  getCurrentRatings: () =>
    request("/current-ratings/"),

  addCurrentRating: (data) =>
    request("/current-ratings/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCurrentRating: (id, data) =>
    request(`/current-ratings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Voltage Drop
  getVoltageDropReferences: () =>
    request("/voltage-drop/"),

  addVoltageDropReference: (data) =>
    request("/voltage-drop/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateVoltageDropReference: (id, data) =>
    request(`/voltage-drop/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Calculation
  calculate: (calculationData) =>
    request("/calculate/", {
      method: "POST",
      body: JSON.stringify(calculationData),
    }),

    //Getting Calculation History
    getCalculationHistory: () =>
  request("/calculation-history/"),

    getEngineeringDesigns: () =>
  request("/engineering-designs/"),

addEngineeringDesign: (data) =>
  request("/engineering-designs/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

updateEngineeringDesign: (id, data) =>
  request(`/engineering-designs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};