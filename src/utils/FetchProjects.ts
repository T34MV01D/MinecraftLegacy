// Types
import { IProjects } from "../types/projects";

// Zustand
import useReposStore from "../zustand/ReposStore";

type ReposResponse = {
  repos: IProjects[];
};

export default new (class {
  public async SetProjects(): Promise<void> {
    try {
      const jsonFile = window.location.hostname === "localhost" ? "placeholder.json" : "projects.json";
      const res = await fetch(`https://raw.githubusercontent.com/MinecraftConsole/json/refs/heads/main/${jsonFile}`);
      if (!res.ok) throw new Error("Request failed");

      const data: ReposResponse = await res.json();

      useReposStore.setState({ projects: data.repos ?? [] });
    } catch (err) {
      useReposStore.setState({ error: err instanceof Error ? err.message : "An unknown error occurred" });
    } finally {
      useReposStore.setState({ loading: false });
    }
  }
})();