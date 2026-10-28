import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "typeface-minecraft";
import "@/css/styles.css";

// Utils
import FetchProjects from "@/utils/FetchProjects";

// Pages
import Main from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const App = () => {
  const Fetch = async () => {
    await FetchProjects.SetProjects();
  };

  Fetch();
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </>
  );
};

document.addEventListener("contextmenu", (e) => e.preventDefault());

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
