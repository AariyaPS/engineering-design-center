import { useEffect, useState } from "react";
function Conductors() {
  const [conductors, setConductors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/conductors/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch conductor data.");
        }
        return response.json();
      })
      .then((data) => {
        setConductors(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);
  return (
    <div
      style={{
        minHeight: "100%",
        background: "#050B14",
        color: "#E8F1FA",
        padding: "30px",
      }}
    >
      {" "}
      {/* Page Header */}{" "}
      <div className="mb-4">
        {" "}
        <div
          style={{ fontSize: "14px", color: "#8FA6BD", marginBottom: "6px" }}
        >
          {" "}
          Reference Data{" "}
        </div>{" "}
        <h2 style={{ fontWeight: "600", marginBottom: "8px" }}>
          {" "}
          Conductors{" "}
        </h2>{" "}
        <p style={{ color: "#8FA6BD", marginBottom: 0 }}>
          {" "}
          Manage conductor sizes used in engineering calculations.{" "}
        </p>{" "}
      </div>{" "}
      {/* Loading */}{" "}
      {loading && (
        <div
          style={{
            background: "#0D1726",
            border: "1px solid #1D3148",
            borderRadius: "12px",
            padding: "24px",
            color: "#8FA6BD",
          }}
        >
          {" "}
          Loading conductor data...{" "}
        </div>
      )}{" "}
      {/* Error */}{" "}
      {error && (
        <div className="alert alert-danger" role="alert">
          {" "}
          {error}{" "}
        </div>
      )}{" "}
      {/* Data Table */}{" "}
      {!loading && !error && (
        <div
          style={{
            background: "#0D1726",
            border: "1px solid #1D3148",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {" "}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #1D3148",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {" "}
            <div>
              {" "}
              <h5 style={{ marginBottom: "4px", fontWeight: "600" }}>
                {" "}
                Conductor Reference Values{" "}
              </h5>{" "}
              <span style={{ color: "#8FA6BD", fontSize: "13px" }}>
                {" "}
                {conductors.length} records available{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="table-responsive">
            {" "}
            <table
              className="table table-dark table-hover mb-0"
              style={{ background: "#0D1726" }}
            >
              {" "}
              <thead>
                {" "}
                <tr>
                  {" "}
                  <th
                    style={{
                      padding: "16px 24px",
                      color: "#8FA6BD",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {" "}
                    #{" "}
                  </th>{" "}
                  <th
                    style={{
                      padding: "16px 24px",
                      color: "#8FA6BD",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {" "}
                    Conductor Size{" "}
                  </th>{" "}
                  <th
                    style={{
                      padding: "16px 24px",
                      color: "#8FA6BD",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {" "}
                    Unit{" "}
                  </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {conductors.map((conductor, index) => (
                  <tr key={conductor._id}>
                    {" "}
                    <td style={{ padding: "15px 24px", color: "#8FA6BD" }}>
                      {" "}
                      {index + 1}{" "}
                    </td>{" "}
                    <td
                      style={{
                        padding: "15px 24px",
                        fontWeight: "500",
                        color: "#E8F1FA",
                      }}
                    >
                      {" "}
                      {conductor.conductor_size_mm2}{" "}
                    </td>{" "}
                    <td style={{ padding: "15px 24px", color: "#8FA6BD" }}>
                      {" "}
                      mm²{" "}
                    </td>{" "}
                  </tr>
                ))}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
export default Conductors;
