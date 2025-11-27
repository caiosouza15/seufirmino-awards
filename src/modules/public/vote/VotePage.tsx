import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import type { Contest, Voter } from "../../../types/domain";

type VotePageStatus = "loading" | "error" | "ready";

export function VotePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VotePageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Token de votação não encontrado. Use o link enviado.");
      return;
    }

    const loadData = async () => {
      setStatus("loading");
      setErrorMessage(null);

      const { data: voter, error: voterError } = await supabase
        .from("voters")
        .select("*")
        .eq("code", token)
        .maybeSingle<Voter>();

      if (voterError || !voter) {
        setStatus("error");
        setErrorMessage("Token inválido ou expirado.");
        return;
      }

      if (!voter.is_active) {
        setStatus("error");
        setErrorMessage("Link inativo. Solicite um novo token.");
        return;
      }

      const { data: contestData, error: contestError } = await supabase
        .from("contests")
        .select("*")
        .eq("id", voter.contest_id)
        .maybeSingle<Contest>();

      if (contestError || !contestData) {
        setStatus("error");
        setErrorMessage("Concurso não encontrado para este token.");
        return;
      }

      const now = new Date();
      const startAt = new Date(contestData.start_at);
      const endAt = new Date(contestData.end_at);

      if (now < startAt) {
        setStatus("error");
        setErrorMessage("A votação ainda não começou. Volte em breve.");
        return;
      }

      if (now > endAt) {
        setStatus("error");
        setErrorMessage("Período de votação encerrado.");
        return;
      }

      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("id")
        .eq("voter_id", voter.id)
        .eq("contest_id", voter.contest_id)
        .limit(1);

      if (votesError) {
        setStatus("error");
        setErrorMessage("Erro ao verificar votos anteriores.");
        return;
      }

      if (votes && votes.length > 0) {
        setStatus("error");
        setErrorMessage("Você já registrou seus votos para este concurso.");
        return;
      }

      setContest(contestData);
      setStatus("ready");
    };

    loadData();
  }, [searchParams]);

  return (
    <main>
      {status === "loading" && <p>Carregando votação...</p>}
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
