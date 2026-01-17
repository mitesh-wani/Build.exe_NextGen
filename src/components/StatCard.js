export default function StatCard({ title, value }) {
    return (
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        width: "200px"
      }}>
        <h4>{title}</h4>
        <h2>{value}</h2>
      </div>
    );
  }
  