import { Route, Routes } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { ResultsPage } from "./pages/ResultsPage";
import { VotePage } from "./modules/public/vote/VotePage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<VotePage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
