import { create } from "zustand";

// Types
import { IProjects } from "../types/projects";

type State = {
  loading: boolean;
  projects: IProjects[];
  error: string;
};

type Actions = {
  setLoading: (x: boolean) => void;
  setProjects: (x: IProjects[]) => void;
  setError: (x: string) => void;
};

const useRepoStore = create<State & Actions>((set) => ({
  projects: [],
  loading: true,
  error: "",

  setLoading: (loading) => set(() => ({ loading })),
  setProjects: (projects) => set(() => ({ projects })),
  setError: (error) => set(() => ({ error })),
}));

export default useRepoStore;
