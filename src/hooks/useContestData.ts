import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Category, Contest, Nominee, Voter } from "../types/domain";

export type ContestDataStatus =
  | "loading"
  | "invalidLink"
  | "inactiveLink"
  | "outOfPeriod"
  | "alreadyVoted"
  | "ready"
  | "error";

type ContestDataResult = {
  status: ContestDataStatus;
  contest: Contest | null;
  categories: Category[];
  nominees: Nominee[];
  voter: Voter | null;
  errorMessage: string | null;
};

export function useContestData(token: string | null): ContestDataResult {
  const [status, setStatus] = useState<ContestDataStatus>("loading");
  const [contest, setContest] = useState<Contest | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalidLink");
      setErrorMessage("Token de votação não encontrado. Use o link enviado.");
      return;
    }

    const load = async () => {
      setStatus("loading");
      setErrorMessage(null);

      const {
        data: voterData,
        error: voterError,
      } = await supabase
        .from("voters")
        .select("*")
        .eq("code", token)
        .maybeSingle<Voter>();

      if (voterError) {
        setStatus("error");
        setErrorMessage("Erro ao validar token.");
        return;
      }

      if (!voterData) {
        setStatus("invalidLink");
        setErrorMessage("Token inválido ou expirado.");
        return;
      }

      if (!voterData.is_active) {
        setStatus("inactiveLink");
        setErrorMessage("Link inativo. Solicite um novo token.");
        return;
      }

      const {
        data: contestData,
        error: contestError,
      } = await supabase
        .from("contests")
        .select("*")
        .eq("id", voterData.contest_id)
        .maybeSingle<Contest>();

      if (contestError) {
        setStatus("error");
        setErrorMessage("Erro ao carregar concurso.");
        return;
      }

      if (!contestData) {
        setStatus("invalidLink");
        setErrorMessage("Concurso não encontrado para este token.");
        return;
      }

      const now = new Date();
      const startAt = new Date(contestData.start_at);
      const endAt = new Date(contestData.end_at);

      if (now < startAt || now > endAt) {
        setStatus("outOfPeriod");
        setErrorMessage(
          now < startAt
            ? "A votação ainda não começou. Volte em breve."
            : "Período de votação encerrado."
        );
        return;
      }

      const {
        data: existingVotes,
        error: votesError,
      } = await supabase
        .from("votes")
        .select("id")
        .eq("voter_id", voterData.id)
        .eq("contest_id", voterData.contest_id)
        .limit(1);

      if (votesError) {
        setStatus("error");
        setErrorMessage("Erro ao verificar votos anteriores.");
        return;
      }

      if (existingVotes && existingVotes.length > 0) {
        setStatus("alreadyVoted");
        setErrorMessage("Você já registrou seus votos para este concurso.");
        return;
      }

      const {
        data: categoriesData,
        error: categoriesError,
      } = await supabase
        .from("categories")
        .select("*")
        .eq("contest_id", contestData.id)
        .order("sort_order", { ascending: true });

      if (categoriesError) {
        setStatus("error");
        setErrorMessage("Erro ao carregar categorias.");
        return;
      }

      const categoryIds = categoriesData?.map((category) => category.id) ?? [];

      let nomineesData: Nominee[] = [];

      if (categoryIds.length > 0) {
        const { data, error } = await supabase
          .from("nominees")
          .select("*")
          .in("category_id", categoryIds)
          .order("sort_order", { ascending: true });

        if (error) {
          setStatus("error");
          setErrorMessage("Erro ao carregar indicados.");
          return;
        }

        nomineesData = data ?? [];
      }

      setVoter(voterData);
      setContest(contestData);
      setCategories(categoriesData ?? []);
      setNominees(nomineesData);
      setStatus("ready");
    };

    load();
  }, [token]);

  return { status, contest, categories, nominees, voter, errorMessage };
}
