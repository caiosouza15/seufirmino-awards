const RESULTS_ID_FROM_ENV = import.meta.env.VITE_RESULTS_CONTEST_ID;

if (!RESULTS_ID_FROM_ENV) {
  throw new Error("VITE_RESULTS_CONTEST_ID is not defined");
}

export const RESULTS_CONTEST_ID = RESULTS_ID_FROM_ENV;
