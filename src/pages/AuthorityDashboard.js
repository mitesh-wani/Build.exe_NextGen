import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";

export default function AuthorityDashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, background: "#f1f5f9" }}>
        <Topbar />

        <div style={{ padding: "20px", display: "flex", gap: "20px" }}>
          <StatCard title="New Issues" value="42" />
          <StatCard title="In Progress" value="18" />
          <StatCard title="Resolved" value="11" />
        </div>
      </div>
    </div>
  );
}
