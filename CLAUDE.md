# Digital Pine Skills Marketplace

Claude Code plugin marketplace by Digital Pine. Curated framework skills published for public use.

## Structure

```
.claude-plugin/
  marketplace.json          # Marketplace catalog (the thing users add)
plugins/
  <plugin-name>/
    .claude-plugin/
      plugin.json           # Plugin manifest
    skills/
      <skill-name>/
        SKILL.md            # Skill definition (YAML frontmatter + instructions)
        references/         # Optional supporting docs
        assets/             # Optional templates, configs
```

## Adding a New Plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` with name, version, description, author, keywords
2. Create `plugins/<name>/skills/<name>/SKILL.md` with proper frontmatter
3. Add entry to `.claude-plugin/marketplace.json` plugins array
4. Test: `claude --plugin-dir ./plugins/<name>`

## Source of Truth

Skills are **manually synced** from `~/Code/agent-skills/skills/`. This repo is the published artifact, not the source. When updating skills:

1. Make changes in agent-skills first
2. Copy updated files here
3. Bump version in both plugin.json and marketplace.json
4. Commit and push

## Repo Names

- **Local**: `~/Code/digitalpine-skills`
- **GitHub**: `DigitalPine/claude-skills`
- **Marketplace name**: `digitalpine`
- **User install**: `/plugin marketplace add DigitalPine/claude-skills`

## Future: Premium Skills

Architecture designed but not built:
- `DigitalPine/claude-skills-pro` (private repo)
- Polar.sh for one-time purchase
- Webhook adds buyer as GitHub collaborator
- No DRM, no license keys — Git access control is the gate

@import PHILOSOPHY.md
