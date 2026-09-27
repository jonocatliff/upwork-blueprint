import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/** Keep our working notes out of the file a client receives.
 *
 * Both stylesheets live in a template literal, so their `/* ... *\/` blocks are string
 * content that no minifier touches: the built report carried the engineering commentary,
 * in the language it happened to be written in, into the page the client reads. Stripping
 * them here keeps the reasoning in the source and out of the deliverable.
 */
const stripStyleComments = {
  name: "strip-style-comments",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    if (!/proposal\/(ui|lead-magnet-styles)\.tsx$/.test(id)) return null;
    return { code: code.replace(/\/\*[\s\S]*?\*\//g, ""), map: null };
  },
};

export default defineConfig({
  plugins: [stripStyleComments, react(), tailwindcss(), viteSingleFile()],
  build: { cssCodeSplit: false },
});
