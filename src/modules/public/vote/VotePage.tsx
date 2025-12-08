import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "../../../components/layout/PageContainer";
import { useContestData } from "../../../hooks/useContestData";
import { VoteCarousel } from "./components/VoteCarousel";

export function VotePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { status, errorMessage, contest, categories, nominees, voter } =
    useContestData(token);

  const nomineesByCategory = useMemo(() => {
    return nominees.reduce<Record<string, typeof nominees>>((acc, nominee) => {
      if (!acc[nominee.category_id]) {
        acc[nominee.category_id] = [];
      }
      acc[nominee.category_id].push(nominee);
      return acc;
    }, {});
  }, [nominees]);

  return (
    <main className="bg-[#05051A]">
      <PageContainer>
        {status === "loading" && <p className="text-slate-200">Carregando votacao...</p>}
        {status === "invalidLink" && (
          <p className="text-slate-200">{errorMessage ?? "Token invalido ou expirado."}</p>
        )}
        {status === "inactiveLink" && (
          <p className="text-slate-200">
            {errorMessage ?? "Link inativo. Solicite um novo token."}
          </p>
        )}
        {status === "outOfPeriod" && (
          <p className="text-slate-200">{errorMessage ?? "Fora do período de votação."}</p>
        )}
        {status === "alreadyVoted" && (
          <p className="text-slate-200">
            {errorMessage ?? "Você já registrou seus votos para este concurso."}
          </p>
        )}
        {status === "error" && (
          <p className="text-slate-200">
            {errorMessage ?? "Não foi possível carregar a votação."}
          </p>
        )}
        {status === "ready" &&
          contest &&
          voter && (
            <VoteCarousel
              contest={contest}
              voter={voter}
              categories={categories}
              nomineesByCategory={nomineesByCategory}
            />
          )}
      </PageContainer>
    </main>
  );
}
