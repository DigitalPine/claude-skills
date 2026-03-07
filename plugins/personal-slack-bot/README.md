# Personal Slack Bot Plugin

Give Claude Code a Slack identity. 15 MCP tools for messaging, reactions, channels, users, and file uploads — all with automatic Block Kit formatting.

## What You Get

- **MCP Server**: `@digitalpine/slack-api-mcp` with 15 Slack tools
- **Format Agent**: Automatic Block Kit + mrkdwn formatting (no more broken messages)
- **Setup Wizard**: `/slack-setup` walks you through creating a Slack app and connecting it
- **Conventions**: Threading best practices, compact format defaults, notification-safe fallbacks

## Install

```bash
# Add the Digital Pine marketplace (once)
claude plugin marketplace add DigitalPine/claude-skills

# Install the plugin
claude plugin install personal-slack-bot@digitalpine
```

Then run `/slack-setup` to create your Slack app and connect it.

## Requirements

- A Slack workspace where you can create apps
- `SLACK_BOT_TOKEN` environment variable (the setup wizard handles this)

## Tools

| Category | Tools |
|----------|-------|
| Messaging | post_message, update_message, delete_message |
| Reactions | add_reaction |
| Management | pin_message, create_channel, join_channel, invite_users |
| Context | get_channel_context, get_user_info, list_channels, list_users |
| Files | upload_snippet, upload_image, get_image_from_slack |

## How It Works

Messages go through a formatting pipeline:
1. You describe what to post
2. The `slack-format` agent converts it to Block Kit with correct mrkdwn
3. Claude posts via the MCP server

Channel messages are kept concise (headline style). Structured content goes in thread replies.

## License

MIT
