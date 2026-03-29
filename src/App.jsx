import { useEffect, useMemo, useRef, useState } from "react";

// Assets
import * as Assets from "@/utils/ImportAssets";

// Zustand
import useRepoStore from "@/zustand/ReposStore";

const logoSet = {
  small: Assets.logoSmall,
  medium: Assets.logoMedium,
  large: Assets.logoLarge
};

const COD_EASTER_EGG_CHANCE = 0.0000003;
const MIN_LOADING_MS = 1200;
const LOADER_FADE_MS = 420;

const MUSIC_TRACKS = [
  Assets.ariaMath,
  Assets.beginning,
  Assets.biomeFest,
  Assets.blindSpots,
  Assets.clark,
  Assets.danny,
  Assets.dreiton,
  Assets.dryHands,
  Assets.haggstrom,
  Assets.hauntMuskie,
  Assets.miceOnVenus,
  Assets.minecraftSong,
  Assets.moogCity,
  Assets.subwooferLullaby,
  Assets.sweden,
  Assets.taswell,
  Assets.wetHands
];

const BACKGROUND_IMAGES = [Assets.dirtBg, Assets.endPoemBg, Assets.endStoneBg, Assets.portalBg];

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function App() {
  const { projects, loading, error } = useRepoStore();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loaderFadingOut, setLoaderFadingOut] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const startTimeRef = useRef(Date.now());
  const audioStartedRef = useRef(false);
  const backgroundMusicRef = useRef(null);
  const clickPoolRef = useRef([]);
  const clickIndexRef = useRef(0);

  const pigAudioRef = useRef(null);
  const pigTimerRef = useRef(null);

  const backgroundImage = useMemo(() => randomItem(BACKGROUND_IMAGES), []);
  const loadingImage = useMemo(() => {
    return Math.random() < COD_EASTER_EGG_CHANCE ? Assets.codLoader : Assets.gearLoader;
  }, []);
  const isCodLoadingScreen = loadingImage === Assets.codLoader;

  useEffect(() => {
    if (loading) return;

    const elapsed = Date.now() - startTimeRef.current;
    const waitMs = Math.max(0, MIN_LOADING_MS - elapsed);
    const fadeTimer = window.setTimeout(() => {
      setLoaderFadingOut(true);
    }, waitMs);
    const hideTimer = window.setTimeout(() => {
      setShowLoader(false);
    }, waitMs + LOADER_FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [loading]);

  useEffect(() => {
    const music = new Audio(randomItem(MUSIC_TRACKS));
    music.loop = true;
    music.volume = 0.14;
    music.preload = "auto";
    backgroundMusicRef.current = music;

    clickPoolRef.current = Array.from({ length: 5 }, () => {
      const click = new Audio(Assets.clickSoundFile);
      click.volume = 0.2;
      click.preload = "auto";
      return click;
    });

    const startMusic = () => {
      if (audioStartedRef.current) return;
      audioStartedRef.current = true;
      void music.play().catch(() => {
        audioStartedRef.current = false;
      });
    };

    const playClickSound = () => {
      startMusic();

      const pool = clickPoolRef.current;
      if (!pool.length) return;

      const currentIndex = clickIndexRef.current % pool.length;
      clickIndexRef.current += 1;
      const click = pool[currentIndex];

      try {
        click.currentTime = 0;
        void click.play();
      } catch {
        // Ignore playback exceptions from strict browser media policies.
      }
    };

    window.addEventListener("mousedown", playClickSound, true);
    window.addEventListener("touchstart", startMusic, true);
    window.addEventListener("keydown", startMusic, true);

    return () => {
      window.removeEventListener("mousedown", playClickSound, true);
      window.removeEventListener("touchstart", startMusic, true);
      window.removeEventListener("keydown", startMusic, true);
      music.pause();
      music.src = "";
    };
  }, []);

  useEffect(() => {
    const pig = new Audio(Assets.pigSoundFile);
    pig.volume = 0.35;
    pig.preload = "auto";
    pigAudioRef.current = pig;
    return () => { pig.pause(); pig.src = ""; };
  }, []);

  const handleTechnoMouseEnter = () => {
    pigTimerRef.current = window.setTimeout(() => {
      const pig = pigAudioRef.current;
      if (pig) {
        pig.currentTime = 0;
        void pig.play().catch(() => {});
      }
    }, 5000);
  };

  const handleTechnoMouseLeave = () => {
    if (pigTimerRef.current) {
      window.clearTimeout(pigTimerRef.current);
      pigTimerRef.current = null;
    }
  };

  const sortedRepos = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aPriority = Number.isFinite(a.priority) ? a.priority : 9999;
      const bPriority = Number.isFinite(b.priority) ? b.priority : 9999;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [projects]);

  const filteredRepos = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sortedRepos;

    return sortedRepos.filter((repo) => {
      const priorityLabel = `p${repo.priority ?? ""}`.toLowerCase();
      return (
        String(repo.name || "").toLowerCase().includes(normalized) ||
        String(repo.url || "").toLowerCase().includes(normalized) ||
        priorityLabel.includes(normalized)
      );
    });
  }, [query, sortedRepos]);

  const REPOS_PER_PAGE = 4;
  const totalPages = Math.max(1, Math.ceil(filteredRepos.length / REPOS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedRepos = filteredRepos.slice((currentPage - 1) * REPOS_PER_PAGE, currentPage * REPOS_PER_PAGE);

  return (
    <main className="page-shell" style={{ "--legacy-bg-image": `url(${backgroundImage})` }}>
      <a
        className="top-link"
        href="https://www.minecraft.net"
        target="_blank"
        rel="noreferrer"
        aria-label="Visit Minecraft.net"
      >
        <img src={Assets.steveAndAlex} alt="Steve and Alex" className="top-link-image" />
      </a>

      {showLoader && (
        <section className={`loader-screen ${loaderFadingOut ? "is-fading-out" : ""}`}>
          <img
            src={loadingImage}
            className={`loader-art ${isCodLoadingScreen ? "is-cod" : "is-gear"}`}
            alt={isCodLoadingScreen ? "Rare cod loading easter egg" : "Loading"}
          />
          <p className="loader-label">Loading Legacy World...</p>
          <p className="loader-disclaimer">Not affiliated with Mojang AB or Microsoft. "Minecraft" is a trademark of Mojang Synergies AB.</p>
        </section>
      )}

      <section className={`content-panel ${showLoader ? "is-waiting" : ""}`}>
        <header className="hero">
          <picture>
            <source media="(min-width: 1280px)" srcSet={logoSet.large} />
            <source media="(min-width: 700px)" srcSet={logoSet.medium} />
            <img className="hero-logo" src={logoSet.small} alt="Minecraft Legacy logo" />
          </picture>
          <h1 className="seo-heading">Minecraft Legacy Repository Index</h1>
          <p className="subtitle">Legacy Repository Index</p>
          <p className="seo-intro">
            Search Minecraft Legacy repositories, source mirrors, and Discord bot resources sorted by
            priority.
          </p>
          <a
            className="discord-link"
            href="https://discord.gg/MinecraftLegacy"
            target="_blank"
            rel="noreferrer"
          >
            Join the Discord
          </a>
        </header>

        <div className="search-row">
          <label htmlFor="repo-search" className="search-label">
            Search repos
          </label>
          <div className="search-wrap">
            <input
              id="repo-search"
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder="Search by name, URL, or priority (p1, p2...)"
              autoComplete="off"
            />
            {query && (
              <button type="button" className="clear-search" onClick={() => setQuery("")}>
                Clear
              </button>
            )}
          </div>
        </div>

        {loading && <p className="status">Loading repo list...</p>}
        {error && <p className="status error">{error}</p>}

        {!loading && !error && (
          <>
            <p className="repo-count">Showing {filteredRepos.length} repos - Page {currentPage} of {totalPages}</p>
            <ul className="repo-list">
              {pagedRepos.map((repo) => (
                <li key={repo.url} className="repo-item">
                  <a href={repo.url} target="_blank" rel="noreferrer" className="repo-link-row">
                    <span className="repo-priority">P{repo.priority ?? "-"}</span>
                    <span className="repo-link">{repo.name}</span>
                  </a>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <span className="page-info">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}

            {filteredRepos.length === 0 && (
              <p className="status">No repos matched your search.</p>
            )}

            <div className="submit-project-wrap">
              <a
                className="submit-project-btn"
                href="https://github.com/MinecraftConsole/json"
                target="_blank"
                rel="noreferrer"
              >
                + Submit a Project
                <div className="mc-tooltip">
                  <p className="mc-tooltip-title">Submit a Project</p>
                  <p className="mc-tooltip-desc">Know of a Legacy Edition project?</p>
                  <p className="mc-tooltip-desc">Open a PR or issue to get it listed!</p>
                  <p className="mc-tooltip-hint">Click to visit the repo</p>
                </div>
              </a>
            </div>

          </>
        )}
      </section>

      <a
        className="techno-memorial"
        href="https://technoblade.com"
        target="_blank"
        rel="noreferrer"
        aria-label="Technoblade Never Dies - visit merch store"
        onMouseEnter={handleTechnoMouseEnter}
        onMouseLeave={handleTechnoMouseLeave}
      >
        <img src={Assets.technoDeco} alt="Technoblade" className="techno-pig" />
        <div className="techno-text">
          <p className="techno-quote">"If you wish to defeat me, train for another 100 years."</p>
          <p className="techno-attr">- Technoblade</p>
          <p className="techno-note">Technoblade Never Dies.</p>
        </div>
      </a>

      <a
        className="bmc-link"
        href="https://buymeacoffee.com/minecraftlegacy"
        target="_blank"
        rel="noreferrer"
        aria-label="Buy Me a Coffee"
      >
        <span className="bmc-icon"></span> Buy Me a Coffee
      </a>

      <p className="disclaimer">Not affiliated with Mojang AB or Microsoft. "Minecraft" is a trademark of Mojang Synergies AB.</p>
    </main>
  );
}

export default App;
