# Discord member submissions

## Recommended flow

Discord should collect submissions, but it should not publish directly to the live website.

1. A member opens a `/submit-airline` form in the dedicated Discord channel.
2. The form asks for the airline name, code, country, hubs, short description and optional history, routes, fleet and livery image.
3. A small bot turns the answers into one `content/airlines/*.json` file and stores the livery in `assets/img/members/`.
4. The bot opens a **pull request** on GitHub. A pull request is a proposed change, not a live change.
5. GitHub automatically validates the codes, hubs, routes and images and builds a temporary preview.
6. An alliance editor checks the writing and facts, asks questions if needed, and approves it.
7. Only after approval is the change merged and published by GitHub Pages.

## Why this boundary matters

GitHub Pages is deliberately static: it can show HTML, CSS, JavaScript and images, but it cannot safely keep a Discord or GitHub secret. A Discord bot therefore needs a tiny separate home such as a Cloudflare Worker, Railway service or existing always-on bot.

The bot should receive permission only to create a branch and pull request. It should not be able to publish directly to `main`.

## A sensible first version

Start with the Discord form, JSON generation and pull request. Keep livery cropping and editorial rewriting as a human review step. Later, the bot can add:

- automatic airline-code and airport-code suggestions;
- a private preview link in the Discord thread;
- status messages when a submission needs clarification, is approved or is published;
- amendments from the same Discord thread without creating duplicate submissions.

## Information still needed

- the Discord server and dedicated channel;
- who may submit (everyone, a role, or selected members);
- who may approve;
- where the bot will be hosted;
- whether submissions and previews should be public before approval.
