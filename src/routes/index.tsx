import { createFileRoute } from "@tanstack/react-router";
import { App } from "../app/App";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Phisify — Física em movimento" },
      { name: "description", content: "Aprenda física com trilhas, exercícios e simulações interativas." },
      { property: "og:title", content: "Phisify — Física em movimento" },
      { property: "og:description", content: "Aprenda física com trilhas, exercícios e simulações interativas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <App />;
}
