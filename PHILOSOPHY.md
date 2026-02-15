# Philosophy

## Problem

Digital Pine has 50+ high-quality Claude Code skills with no public distribution path. The AI coding skill ecosystem is in its early phase — community directories index 96k+ skills, but most are low quality with no curation. There's no premium brand in the space yet.

## Appetite

**Free marketplace: Sketch (shipped).** 5 framework skills, published and discoverable.

**Premium tier: Sketch.** Get one pack live, wire the payment→access flow, test with real buyers. Learn before scaling.

## Priorities

1. Get published and discoverable — users can `/plugin marketplace add` and install
2. Skills work correctly in the plugin format (not just the symlink format)
3. Clean, professional presentation (README, descriptions, keywords)
4. Establish Digital Pine as a credible skill publisher

## Pricing Thesis

**Individual packs: $29 each. Lifetime all-access: $99.**

The $99 lifetime position works because:

1. **Under the two-digit barrier** — No procurement, no manager approval. Personal expense territory.
2. **Clean upgrade math** — By the third $29 pack ($87), lifetime ($99) is obvious. The upsell moment is built into the pricing structure.
3. **Appreciating asset** — Unlike courses that depreciate with framework versions, the catalog grows. Early buyers get the best deal retroactively.
4. **Anti-subscription positioning** — Every dev tool charges monthly. "Pay once, own forever" is a statement. $99 once < 5 months of any AI subscription.
5. **Trust economics** — Soft enforcement (no DRM, just repo access). Some sharing happens. Sharing creates awareness. At this price point, social friction prevents broad redistribution.

Launch discount: $79 for first 2-4 weeks. No more than 20% off — deeper discounts anchor the "real" price at the discount.

## Skill Packs

| Pack | Skills | Price |
|------|--------|-------|
| Builder's Workflow | project-conventions, pre-flight, context-engineer, bug-detective | $29 |
| Agent Orchestration | orchestrate, skill-builder, template-builder, framework-skill-builder | $29 |
| Go-to-Market | copysmith, editorial, voice-clone, pitch-page, visual-alchemist | $29 |
| Design | design-taste | $29 |
| **Lifetime All-Access** | **All current + future packs** | **$99** |

## Trade-offs

- **Choosing** separate repo over monorepo integration **because** the published marketplace is a product, not a development tool. Manual sync is acceptable at this scale.
- **Choosing** framework skills over methodology skills for launch **because** they're easier to evaluate and have a broader audience. Methodology skills (orchestrate, design-taste) are premium candidates.
- **Choosing** MIT license for free skills **because** maximum adoption matters more than control right now.
- **Choosing** $29 flat per pack over variable pricing **because** simplicity reduces purchase friction. No comparison shopping between packs.
- **Choosing** soft enforcement over DRM **because** trust scales better than control. Git access is the gate. Sharing creates organic distribution.
- **Choosing** Polar.sh over Gumroad/Lemon Squeezy **because** lowest fees (4% + $0.40), developer-first, and webhook API for GitHub collaborator automation.

## Boundaries

### In Scope
- Public marketplace repo with 5 framework plugins (biome, vitest, nextjs-16, docker, golang)
- Plugin format packaging (plugin.json manifests, marketplace.json catalog)
- README with install instructions
- GitHub repo under DigitalPine org

### Out of Scope
- Landing page or marketing site
- Cross-platform testing (Codex CLI, Cursor, etc.)
- Automated sync from agent-skills monorepo
- Multiple payment tiers beyond pack/lifetime
- Per-customer forks or license keys

### In Progress
- Premium marketplace (`DigitalPine/claude-skills-pro`, private repo)
- Polar.sh product setup (per-pack + lifetime)
- GitHub webhook for collaborator access on purchase

### Maybe Later
- Kindling Pages pitch page for the marketplace
- Community engagement (social proof, blog posts, Hacker News)
- Additional free skills beyond the launch 5
- Automated build/sync pipeline
- Price increase to $149 when catalog reaches 8+ packs

## Rabbit Holes (Mitigated)

- **Plugin format compatibility**: Study Anthropic's official plugins repo structure before packaging. Test with `claude --plugin-dir` locally.
- **Webhook reliability**: Polar.sh webhook fires → GitHub API adds collaborator. If it fails, buyer has no access. Mitigation: manual fallback via email, add retry logic later.
- **Pack granularity**: Don't agonize over which skill goes in which pack. Ship the first grouping, adjust based on what people actually buy.
- **Maintenance overhead**: Skills are manually synced. Accept some drift — update when skills get meaningful changes, not on every edit.
- **Scope creep into marketing**: The product is the skills, not the website. Kindling Pages pitch page is "maybe later."

## Quality Bar

Sketch: works correctly, looks professional, but rough edges are fine. Skills should install and load without errors. Descriptions should be accurate. README should be clear. No need for perfect polish.
