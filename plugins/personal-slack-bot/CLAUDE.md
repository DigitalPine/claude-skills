# Personal Slack Bot

## Format Agent Workflow [REQUIRED]

**All Slack messages MUST go through the `slack-format` agent before posting.** Never hand-write Block Kit JSON or mrkdwn directly. The agent handles formatting, emoji verification, and mrkdwn syntax (which differs from markdown in ways that cause silent rendering bugs).

**Workflow:**
1. Call `slack-format` agent with: what to say, tone, context
2. Agent returns `{ blocks, text }` JSON
3. Post using `post_message` with that JSON

## Threading Conventions [REQUIRED]

**Channel messages are headlines** — one or two sentences max that give people enough to decide whether to click in. Everything else goes in the thread: context, tradeoffs, code snippets, questions.

Think of it as subject line vs email body. If you're posting something with structure (bullets, tables, multiple paragraphs), that's a thread, not a channel message.

Post the hook first, then immediately reply in-thread with the details.

## Block Kit Enforcement

`post_message` and `update_message` ONLY accept Block Kit objects. The `text` parameter is for brief notification fallbacks (1-2 sentences), not full message duplication. It's invisible in rich Slack clients.

## Compact Format Default

Use `format: "compact"` (default) on read tools (`get_channel_context`, `get_user_info`, `list_channels`, `list_users`) to strip 60-90% of Slack API bloat.

## Tool Reference (15 tools)

**Messaging:** post_message, update_message, delete_message
**Reactions:** add_reaction
**Management:** pin_message, create_channel, join_channel, invite_users
**Context:** get_channel_context, get_user_info, list_channels, list_users
**Files:** upload_snippet, upload_image, get_image_from_slack

## Setup

Run `/slack-setup` if you don't have a `SLACK_BOT_TOKEN` configured.
