import { createFileRoute } from "@tanstack/react-router";
import { App } from "../app/App";

// The Phisify app uses its own client-side navigation state for screens such as
// /laboratorio and /laboratorio/lancamento-obliquo. TanStack Start still needs
// to resolve those URLs before App can handle them, so this splat route hands
// non-root paths to the existing App instead of showing the framework 404 page.
export const Route = createFileRoute("/$")({
  component: App,
});
