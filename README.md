# Digital Pine — Claude Code Skills

Curated Claude Code plugins built from real-world production experience. Framework setup, auditing, and modernization skills that save you hours of configuration research.

## Install

Add the Digital Pine marketplace to Claude Code:

```
/plugin marketplace add DigitalPine/claude-skills
```

Then install individual plugins:

```
/plugin install biome@digitalpine
/plugin install vitest@digitalpine
/plugin install nextjs-16@digitalpine
/plugin install docker@digitalpine
/plugin install golang@digitalpine
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| **biome** | Setup, configure, audit, and optimize Biome linter/formatter. Covers ESLint+Prettier migration, unsafe fix workflows, and team configuration. |
| **vitest** | Setup, configure, audit, and modernize Vitest testing. v4.0+ best practices, Jest migration, browser mode, and CI integration. |
| **nextjs-16** | Setup, configure, audit, and modernize Next.js 16 projects. Cache Components, proxy.ts, Turbopack, and Vercel flags. |
| **docker** | Docker guidance for fast-moving teams. Decision trees, multi-stage builds, security hardening, and BuildKit optimization. |
| **golang** | Setup, audit, and modernize Go projects. Quick start or full production-ready setup with linting, testing, and CI. |

## How Skills Work

Each plugin contains one or more **skills** — structured knowledge that Claude Code loads into context when relevant. Skills aren't scripts or automation — they're expert-level guidance that helps Claude make better decisions about your project.

When you install a skill like `biome`, Claude Code will automatically reference it when you're working with Biome configuration, migrating from ESLint, or setting up a new project.

## About Digital Pine

We build developer tools and infrastructure. These skills are extracted from patterns we use daily across our own projects.

## License

MIT
