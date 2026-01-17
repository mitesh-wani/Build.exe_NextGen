import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MapView() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Topbar />
        <div style={{ padding: "20px" }}>
          <h2>City Issue Map</h2>
          <p>Google Maps integration here</p>
        </div>
      </div>
    </div>
  );
}

