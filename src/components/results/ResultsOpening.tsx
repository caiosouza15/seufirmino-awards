import { useEffect } from "react";
import "./resultsOpening.css";

export type ResultsOpeningProps = {
  onFinish: () => void;
};

export function ResultsOpening({ onFinish }: ResultsOpeningProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4000); // give viewers time to read the intro
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="results-opening">
      <div className="opening-overlay" />
      <div className="opening-content">
        <p className="opening-kicker">Seu Firmino Awards 2025</p>
        <h1 className="opening-title">Apresenta...</h1>
        <div className="opening-sweep" />
        <p className="opening-subtitle">Os Grandes Vencedores</p>
      </div>
    </div>
  );
}
