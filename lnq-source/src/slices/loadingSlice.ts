import "zustand/middleware";
import { StateCreator } from "zustand";
import { GlobalState, sliceResetFns } from "../store/globalStore";

interface State {
  isLoading: boolean;
}

interface Actions {
  setIsLoading: (isLoading: boolean) => void;
}

const initialState: State = {
  isLoading: false,
};

export type LoadingSlice = Actions & State;

export const createLoadingSlice: StateCreator<
  GlobalState,
  [["zustand/persist", unknown], ["zustand/devtools", never]],
  [],
  LoadingSlice
> = (set) => {
  sliceResetFns.add(() => set(initialState));
  return {
    ...initialState,
    setIsLoading: (newIsLoading: boolean) => {
      set({ isLoading: newIsLoading });
    },
  };
};
