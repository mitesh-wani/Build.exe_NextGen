import PriorityBadge from "./PriorityBadge";

export default function IssueCard({ issue, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}
    >
      <img
        src={issue.image}
        alt="issue"
        style={{ width: "100%", height: "140px", objectFit: "cover" }}
      />

      <div style={{ padding: "10px" }}>
        <h4>{issue.title}</h4>
        <p style={{ fontSize: "12px" }}>{issue.location}</p>
        <PriorityBadge level={issue.priority} />
      </div>
    </div>
  );
}
