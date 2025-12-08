import { useEffect, useState } from "react";
import { RESULTS_CONTEST_ID } from "../config/results";
import { supabase } from "../lib/supabaseClient";
import type { Contest } from "../types/domain";

export type ResultsNominee = {
  id: string;
  name: string;
  image_url?: string | null;
  totalVotes: number;
  percent: number;
  isWinner: boolean;
};

export type ResultsCategory = {
  id: string;
  name: string;
  nominees: ResultsNominee[];
};

export type ResultsStatus = "loading" | "error" | "beforeReveal" | "ready";

export type UseResultsDataResult =
  | { status: "loading" | "error"; contest: Contest | null; categories: ResultsCategory[] }
  | { status: "beforeReveal"; contest: Contest; categories: ResultsCategory[] }
  | { status: "ready"; contest: Contest; categories: ResultsCategory[] };

export function useResultsData(): UseResultsDataResult {
  const [status, setStatus] = useState<ResultsStatus>("loading");
  const [contest, setContest] = useState<Contest | null>(null);
  const [categories, setCategories] = useState<ResultsCategory[]>([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setStatus("loading");

      const {
        data: contestData,
        error: contestError,
      } = await supabase
        .from("contests")
        .select("*")
        .eq("id", RESULTS_CONTEST_ID)
        .maybeSingle<Contest>();

      if (!isMounted) {
        return;
      }

      if (contestError || !contestData) {
        setStatus("error");
        setContest(null);
        setCategories([]);
        return;
      }

      setContest(contestData);

      const revealAt = contestData.reveal_at ? new Date(contestData.reveal_at) : null;
      const now = new Date();

      if (!revealAt || now < revealAt) {
        setStatus("beforeReveal");
        setCategories([]);
        return;
      }

      const {
        data: categoriesData,
        error: categoriesError,
      } = await supabase
        .from("categories")
        .select("*")
        .eq("contest_id", RESULTS_CONTEST_ID)
        .order("sort_order", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (categoriesError || !categoriesData) {
        setStatus("error");
        setCategories([]);
        return;
      }

      const categoriesWithNominees: ResultsCategory[] = [];

      for (const category of categoriesData) {
        const { data: nomineesData, error: nomineesError } = await supabase
          .from("nominees")
          .select("*")
          .eq("category_id", category.id)
          .order("sort_order", { ascending: true });

        if (!isMounted) {
          return;
        }

        if (nomineesError || !nomineesData) {
          setStatus("error");
          setCategories([]);
          return;
        }

        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("nominee_id")
          .eq("category_id", category.id)
          .eq("contest_id", RESULTS_CONTEST_ID);

        if (!isMounted) {
          return;
        }

        if (votesError) {
          setStatus("error");
          setCategories([]);
          return;
        }

        const totalsByNominee: Record<string, number> = {};
        (votesData as { nominee_id: string }[] | null)?.forEach((voteRow) => {
          totalsByNominee[voteRow.nominee_id] =
            (totalsByNominee[voteRow.nominee_id] ?? 0) + 1;
        });

        const totalVotesInCategory = Object.values(totalsByNominee).reduce(
          (sum, current) => sum + current,
          0
        );

        const nomineesWithVotes = nomineesData.map<ResultsNominee>((nominee) => {
          const totalVotes = totalsByNominee[nominee.id] ?? 0;
          const percent =
            totalVotesInCategory > 0 ? (totalVotes / totalVotesInCategory) * 100 : 0;

          return {
            id: nominee.id,
            name: nominee.name,
            image_url: nominee.image_url,
            totalVotes,
            percent,
            isWinner: false,
          };
        });

        const maxVotes = nomineesWithVotes.reduce(
          (max, nominee) => Math.max(max, nominee.totalVotes),
          0
        );

        const nomineesMarked = nomineesWithVotes.map((nominee) => ({
          ...nominee,
          isWinner: maxVotes > 0 && nominee.totalVotes === maxVotes,
        }));

        categoriesWithNominees.push({
          id: category.id,
          name: category.name,
          nominees: nomineesMarked,
        });
      }

      if (!isMounted) {
        return;
      }

      setCategories(categoriesWithNominees);
      setStatus("ready");
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { status, contest, categories } as UseResultsDataResult;
}
