---
name: slack-setup
description: Set up a personal Slack bot — create the app, configure scopes, store the token, verify the connection.
tools: [Read, Write, Edit, Bash, AskUserQuestion]
---

# Slack Bot Setup

## Goal

Get the user from zero to a working personal Slack bot. By the end, they have a Slack app installed in their workspace, a bot token in their shell profile, and a verified connection.

## What Needs to Happen

1. **Choose a bot display name** — this becomes the app name and bot username in Slack
2. **Create a Slack app from manifest** — the template is at `skills/slack-setup/assets/slack-app-manifest.json` (relative to plugin root). Replace `{{BOT_NAME}}` with their chosen name. The manifest includes 16 bot scopes covering read/write for messages, channels, users, files, pins, and reactions.
3. **Install the app to their workspace** — this happens in the Slack admin UI at api.slack.com
4. **Store the Bot User OAuth Token** — goes in `~/.zshrc` as `export SLACK_BOT_TOKEN="xoxb-..."`. This is the only auth method the MCP server supports.
5. **Verify the connection** — DM the user in Slack (not a public channel). Use `post_message` to their user's DM channel. This proves the token works and they see the bot come alive.

## Constraints

- Never hardcode the token in any committed file
- Check `echo $SLACK_BOT_TOKEN` first — skip to verify if they're already set up
- The manifest has 16 scopes. Don't add or remove scopes without explaining why.
- Chrome automation is available for co-piloting the Slack admin UI if the user wants help navigating it — offer but don't assume

## After Setup

Show them what they can do. The plugin gives them 15 tools across messaging, reactions, channels, users, and files. All messages go through the `slack-format` agent automatically.
