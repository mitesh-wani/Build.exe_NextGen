export default function PriorityBadge({ level }) {
    const colors = {
      High: "#ef4444",
      Medium: "#f59e0b",
      Low: "#10b981"
    };
  
    return (
      <span style={{
        background: colors[level],
        color: "white",
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "12px"
      }}>
        {level}
      </span>
    );
  }
  