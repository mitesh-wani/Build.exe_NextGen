export default function Topbar() {
    return (
      <div style={{
        background: "#566789ff",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e5e7eb"
      }}>
        <h3>Municipal Authority Dashboard</h3>
        <button>Logout</button>
      </div>
    );
  }
  