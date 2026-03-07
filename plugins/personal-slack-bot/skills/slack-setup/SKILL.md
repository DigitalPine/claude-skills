---
name: slack-setup
description: Interactive setup wizard for creating a personal Slack bot. Creates the Slack app, configures scopes, stores the token, and verifies the connection.
tools: [Read, Write, Edit, Bash, AskUserQuestion]
---

# Slack Bot Setup Wizard

Walk the user through creating their personal Slack bot from scratch. This is an interactive setup — ask questions, guide decisions, and verify each step.

## Flow

### 1. Choose a Bot Name

Ask the user what they want their bot to be called in Slack. Examples: "Joel (Claude)", "Art's Assistant", "Claude Bot". This becomes the display name in the workspace.

### 2. Generate the App Manifest

Read the manifest template from `skills/slack-setup/assets/slack-app-manifest.json` (relative to the plugin root). Replace `{{BOT_NAME}}` with the user's chosen name.

Present the manifest and explain what the 16 scopes enable:
- **Read**: channels, groups, IMs, users, files
- **Write**: messages, files, pins, reactions
- **Manage**: channel creation, joining channels

### 3. Create the Slack App

Guide the user to create the app at https://api.slack.com/apps:

**Option A — Chrome automation available:**
If browser tools are available, offer to co-pilot the setup:
1. Navigate to https://api.slack.com/apps?new_app=1
2. Select "From a manifest"
3. Pick their workspace
4. Paste the manifest JSON
5. Create the app
6. Navigate to OAuth & Permissions
7. Install to workspace
8. Copy the Bot User OAuth Token (xoxb-...)

**Option B — Manual walkthrough:**
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From a manifest"
3. Select your workspace
4. Switch to JSON tab, paste the manifest
5. Click "Create"
6. Go to "OAuth & Permissions" in the sidebar
7. Click "Install to Workspace" and authorize
8. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 4. Store the Token

Once the user provides their token:

```bash
# Add to shell profile
echo '\nexport SLACK_BOT_TOKEN="xoxb-..."' >> ~/.zshrc
source ~/.zshrc
```

Explain: The token is stored in their shell profile so it's available to all Claude Code sessions. The MCP server reads it via `${SLACK_BOT_TOKEN}` environment variable.

### 5. Verify Connection

Use `list_channels` (from the slack-bot MCP server) to verify the token works. If it returns channels, the setup is complete.

If it fails:
- Check the token starts with `xoxb-`
- Verify the app is installed to the workspace
- Check the bot has the required scopes

### 6. Quick Start

Once verified, show the user what they can do:

> Your bot is live! Here's what you can do:
>
> - **Post a message**: "Post 'Hello team!' to #general"
> - **Read context**: "What's happening in #dev?"
> - **React**: "Add a thumbsup to that message"
> - **Upload files**: "Upload this screenshot to #design"
>
> All messages are formatted through the `slack-format` agent for correct Block Kit rendering.
> Channel messages should be concise headlines. Put details in thread replies.

## Important Notes

- Never hardcode the token in any file that could be committed
- The `SLACK_BOT_TOKEN` env var is the only supported authentication method
- If the user already has a token set, skip to step 5 (verify)
- Check `echo $SLACK_BOT_TOKEN` first to see if they're already set up
