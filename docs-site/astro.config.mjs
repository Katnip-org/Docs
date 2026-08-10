// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

/** TextMate grammar vendored from packages/vscode/syntaxes in the Katnip repo. */
const katnipGrammar = JSON.parse(
	readFileSync(new URL('./src/grammars/katnip.tmLanguage.json', import.meta.url), 'utf8'),
);

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.katnip.org',
	markdown: {
		shikiConfig: {
			// The `name` is what a fence tag must match; the grammar calls itself 'Katnip'.
			langs: [{ ...katnipGrammar, name: 'katnip' }],
		},
	},
	integrations: [
		starlight({
			title: 'Katnip',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Katnip-org/Katnip' }],
			sidebar: [
				{
					label: "Introduction",
					items: [
						{ label: "What is Katnip?", link: "/" },
						{ label: "Getting started", slug: "introduction/getting-started" },
						{ label: "How the compiler works", slug: "introduction/how-it-works" },
					],
				},
				{
					label: "Your first projects",
					items: [
						{ label: "Before you start", slug: "projects" },
						{ label: "1. Draw a square", slug: "projects/01-draw-a-square" },
						{ label: "2. A clicking game", slug: "projects/02-a-clicking-game" },
						{ label: "3. Falling treats", slug: "projects/03-falling-treats" },
						{ label: "Where to go next", slug: "projects/next-steps" },
					],
				},
				{
					label: "The language",
					items: [
						{ label: "Program structure", slug: "language" },
						{ label: "Comments", slug: "language/comments" },
						{ label: "Types", slug: "language/types" },
						{ label: "Variables", slug: "language/variables" },
						{ label: "Operators and expressions", slug: "language/operators" },
						{ label: "Control flow", slug: "language/control-flow" },
						{ label: "Procedures", slug: "language/procedures" },
						{ label: "Sprites and events", slug: "language/sprites-and-events" },
						{ label: "Lists and dicts", slug: "language/collections" },
						{ label: "Enums and structs", slug: "language/enums-and-structs" },
						{ label: "Decorators", slug: "language/decorators" },
						{ label: "Modules and imports", slug: "language/modules" },
					],
				},
				{
					label: "Standard library",
					items: [
						{ label: "Overview", slug: "stdlib" },
						{ label: "prelude", slug: "stdlib/prelude" },
						{ label: "events", slug: "stdlib/events" },
						{ label: "motion", slug: "stdlib/motion" },
						{ label: "looks", slug: "stdlib/looks" },
						{ label: "sensing", slug: "stdlib/sensing" },
						{ label: "pen", slug: "stdlib/pen" },
						{ label: "clone", slug: "stdlib/clone" },
						{ label: "list, dict, str", slug: "stdlib/collections" },
						{ label: "math and console", slug: "stdlib/math-console" },
					],
				},
				{
					label: "Toolchain",
					items: [
						{ label: "CLI", slug: "toolchain/cli" },
						{ label: "VS Code extension", slug: "toolchain/vscode" },
						{ label: "Embedding the compiler", slug: "toolchain/api" },
					],
				},
				{
					label: "Reference",
					items: [
						{ label: "Known gaps", slug: "reference/known-gaps" },
						{ label: "Feature status", slug: "reference/feature-status" },
					],
				},
			],
		}),
	],
});
