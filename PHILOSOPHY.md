# Philosophy

## Problem

Digital Pine has 50+ high-quality Claude Code skills with no public distribution path. The AI coding skill ecosystem is in its early phase — community directories index 96k+ skills, but most are low quality with no curation. There's no premium brand in the space yet.

## Appetite

**Sketch.** Ship the free public marketplace with 5 framework skills. Learn what resonates, then shape the premium tier separately.

## Priorities

1. Get published and discoverable — users can `/plugin marketplace add` and install
2. Skills work correctly in the plugin format (not just the symlink format)
3. Clean, professional presentation (README, descriptions, keywords)
4. Establish Digital Pine as a credible skill publisher

## Trade-offs

- **Choosing** separate repo over monorepo integration **because** the published marketplace is a product, not a development tool. Manual sync is acceptable at this scale.
- **Choosing** framework skills over methodology skills for launch **because** they're easier to evaluate and have a broader audience. Methodology skills (orchestrate, design-taste) are premium candidates.
- **Choosing** MIT license for free skills **because** maximum adoption matters more than control right now.

## Boundaries

### In Scope
- Public marketplace repo with 5 framework plugins (biome, vitest, nextjs-16, docker, golang)
- Plugin format packaging (plugin.json manifests, marketplace.json catalog)
- README with install instructions
- GitHub repo under DigitalPine org

### Out of Scope
- Premium marketplace (designed, not built — separate shape)
- Payment integration (Polar.sh setup)
- GitHub API automation for collaborator access
- Landing page or marketing site
- Cross-platform testing (Codex CLI, Cursor, etc.)
- Automated sync from agent-skills monorepo

### Maybe Later
- Premium skills publishing via private repo + payment gating
- Kindling Pages pitch page for the marketplace
- Community engagement (social proof, blog posts, Hacker News)
- Additional free skills beyond the launch 5
- Automated build/sync pipeline

## Rabbit Holes (Mitigated)

- **Plugin format compatibility**: Study Anthropic's official plugins repo structure before packaging. Test with `claude --plugin-dir` locally.
- **Scope creep into premium**: Free marketplace first. Premium is a separate shape that starts after we learn from this launch.
- **Maintenance overhead**: Skills are manually synced. Accept some drift — update when skills get meaningful changes, not on every edit.

## Quality Bar

Sketch: works correctly, looks professional, but rough edges are fine. Skills should install and load without errors. Descriptions should be accurate. README should be clear. No need for perfect polish.
