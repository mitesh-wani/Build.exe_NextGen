import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={{
      width: "230px",
      background: "#0f172a",
      color: "white",
      padding: "20px",
      minHeight: "100vh"
    }}>
      <h2>UrbanFix</h2>
      <p style={{ fontSize: "12px", opacity: 0.7 }}>Authority Panel</p>

      <nav style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>📊 Dashboard</Link>
        <Link to="/admin/issues" style={{ color: "white", textDecoration: "none" }}>📥 Issues</Link>
        <Link to="/admin/map" style={{ color: "white", textDecoration: "none" }}>🗺️ Map</Link>
        <Link to="/admin/analytics" style={{ color: "white", textDecoration: "none" }}>📈 Analytics</Link>
      </nav>
    </div>
  );
}
