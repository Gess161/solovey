import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import P2P1Win from "./p2p-1win.jsx";
import P2PParimatch from "./p2p-parimatch.jsx";
import P2PStake from "./p2p-stake.jsx";
import P2PV3 from "./p2p-v3 (2)main.jsx";

export default function App() {
  return (
    <Router>
      <nav
        style={{
          padding: "10px",
          background: "#f0f0f0",
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
        }}
      >
        <Link
          to="/1"
          style={{
            padding: "8px 12px",
            background: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          1Win
        </Link>
        <Link
          to="/2"
          style={{
            padding: "8px 12px",
            background: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Parimatch
        </Link>
        <Link
          to="/3"
          style={{
            padding: "8px 12px",
            background: "#ffc107",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Stake
        </Link>
        <Link
          to="/4"
          style={{
            padding: "8px 12px",
            background: "#dc3545",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          P2P V3
        </Link>
      </nav>

      <Routes>
        <Route path="/1" element={<P2P1Win />} />
        <Route path="/2" element={<P2PParimatch />} />
        <Route path="/3" element={<P2PStake />} />
        <Route path="/4" element={<P2PV3 />} />
        <Route path="/" element={<Navigate to="/1" />} />
      </Routes>
    </Router>
  );
}
