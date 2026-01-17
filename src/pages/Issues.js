import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import IssueCard from "../components/IssueCard";
import { dummyIssues } from "../data/dummyIssues";

export default function Issues() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, background: "#f1f5f9" }}>
        <Topbar />

        <div style={{
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px"
        }}>
          {dummyIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </div>
  );
}
