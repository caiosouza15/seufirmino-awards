import { Route, Routes } from "react-router-dom";
import { AdminApp } from "./modules/admin/AdminApp";
import { ResultsPage } from "./modules/public/results/ResultsPage";
import { VotePage } from "./modules/public/vote/VotePage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<VotePage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}
