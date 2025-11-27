import { useSearchParams } from "react-router-dom";
import { useContestData } from "../../../hooks/useContestData";

export function VotePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { status, errorMessage, contest } = useContestData(token);

  return (
    <main>
      {status === "loading" && <p>Carregando votação...</p>}
      {status === "invalidLink" && (
        <p>{errorMessage ?? "Token inválido ou expirado."}</p>
      )}
      {status === "inactiveLink" && (
        <p>{errorMessage ?? "Link inativo. Solicite um novo token."}</p>
      )}
      {status === "outOfPeriod" && (
        <p>{errorMessage ?? "Fora do período de votação."}</p>
      )}
      {status === "alreadyVoted" && (
        <p>{errorMessage ?? "Você já registrou seus votos para este concurso."}</p>
      )}
      {status === "error" && (
        <p>{errorMessage ?? "Não foi possível carregar a votação."}</p>
      )}
      {status === "ready" && (
        <div>
          <h1>{contest?.name}</h1>
          <p>Fluxo de votação em breve.</p>
        </div>
      )}
    </main>
  );
}
