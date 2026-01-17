import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Analytics() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Topbar />
        <div style={{ padding: "20px" }}>
          <h2>Analytics</h2>
          <p>Issue trends, resolution time, performance metrics</p>
        </div>
      </div>
    </div>
  );
}
