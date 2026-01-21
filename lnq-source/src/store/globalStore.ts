import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createSelectors } from "./createSelectors";
import { LoadingSlice, createLoadingSlice } from "../slices/loadingSlice";

// Reset logic needs to be added in every slice and added to sliceResetFns in createSlice
export const sliceResetFns = new Set<() => void>();
export const reset = () => {
  sliceResetFns.forEach((resetFn) => {
    resetFn();
  });
};

// Every slice state needs to be added here
export type GlobalState = LoadingSlice;

export const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      (...a) => ({
        ...createLoadingSlice(...a),
      }),
      // Persist options
      {
        name: "globalStore",
        // Uncomment to select what we want to persist here (otherwise persists all)
        // partialize: (state) => ({
        // }),
      },
    ),
    // Devtools options
    { enabled: import.meta.env.MODE === "development", name: "globalStore" },
  ),
);

// Create selectors
export const useGlobalSelectors = createSelectors(useGlobalStore);
