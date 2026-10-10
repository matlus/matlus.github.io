# Feedback Worker

A Cloudflare Worker that receives the "Send a message" form on matlus.com and
files each message as an issue in the private repository `matlus/site-inbox`.

GitHub Pages serves static files only, so the form needs something else to
receive it. The browser cannot write to GitHub itself, because the token would
then be readable by every visitor. The Worker holds the token and is the only
thing that writes to the inbox.

```
browser form ──POST JSON──▶ Worker ──verify──▶ Cloudflare Turnstile
                              │
                              └──create issue──▶ matlus/site-inbox (private)
                                                   └─ email notification
```

## What each issue contains

- **Title:** the kind, the sender, and the first line of the message.
- **Label:** `question`, `suggestion`, `opportunity` or `other`.
- **Table:** name, email, the page the message was sent from, its title, the
  first referrer of the visit, the landing page, any `utm_` parameters, the
  time received, the visitor's country and their browser.
- **Message:** quoted in full.
- **Raw submission:** the same data as JSON in a collapsed block, for import
  into a local database later.

The site records the first referrer and landing page once per browser tab, in
`sessionStorage` (`src/lib/visit-source.ts`), so a visitor who arrives from
LinkedIn and later writes from the About page is still recorded as arriving
from LinkedIn. Browsers usually send only the referring site's origin, and some
apps send nothing. When you share a link, add `?utm_source=linkedin` (or
similar) for a reliable record.

## One-time setup

### 1. Create the inbox repository

1. Create a **private** repository named `site-inbox` under `matlus`.
2. Under **Issues → Labels**, create four labels: `question`, `suggestion`,
   `opportunity`, `other`.
3. Turn on email for your own activity. The Worker creates issues with your
   token, so GitHub treats each one as your own action and normally sends no
   notification. Go to **Settings → Notifications → Customize email updates**
   and check **Include your own updates**. Make sure you are watching the
   repository, which owners are by default.

### 2. Create a GitHub token for the Worker

**Settings → Developer settings → Personal access tokens → Fine-grained tokens
→ Generate new token.**

- Resource owner: `matlus`
- Repository access: **Only select repositories** → `site-inbox`
- Permissions: **Issues: Read and write**. Nothing else.
- Expiration: the longest allowed. Put a reminder in your calendar a week
  before it expires. An expired token makes every submission fail.

Keep the token for step 4. Do not commit it anywhere.

### 3. Create the Turnstile widget

Turnstile is Cloudflare's free spam check. Most visitors never see it.

In the Cloudflare dashboard, open **Turnstile → Add widget**:

- Name: `matlus.com feedback`
- Hostname: `matlus.com`
- Widget mode: **Managed**

Keep the **site key** (public) and the **secret key** (private).

### 4. Deploy the Worker

From this folder:

```bash
npm install
npx wrangler login            # opens a browser to sign in to Cloudflare
npx wrangler deploy           # first deploy prints the Worker URL
npx wrangler secret put GITHUB_TOKEN           # paste the token from step 2
npx wrangler secret put TURNSTILE_SECRET_KEY   # paste the secret key from step 3
```

The first deploy asks you to choose a `workers.dev` subdomain. The Worker URL
then looks like `https://matlus-feedback.<subdomain>.workers.dev`.

### 5. Turn the form on

In `src/data/feedback.ts`, set:

```ts
const PRODUCTION_ENDPOINT = 'https://matlus-feedback.<subdomain>.workers.dev/';
const PRODUCTION_TURNSTILE_SITE_KEY = '<site key from step 3>';
```

Both values are public. Until both are set, the site builds without the form,
so nothing changes for visitors.

Push to `main`, then send yourself a test message from the About page.

## When something goes wrong

- **The visitor sees "Your message didn't send".** Their text stays in the
  form. If GitHub refused the issue (for example, an expired token), the
  Worker logs the full message first. Find it under **Workers & Pages →
  matlus-feedback → Logs** in the Cloudflare dashboard.
- **No email arrives.** Check step 1.3, and check that the issue exists in
  `site-inbox`.
- **Spam gets through.** Turnstile and the hidden form field stop most bots.
  If they don't stop enough, add a Workers rate-limiting binding keyed on
  `cf-connecting-ip`.

## Configuration

| Name | Kind | Purpose |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | var (`wrangler.toml`) | Sites allowed to post, comma-separated |
| `GITHUB_OWNER`, `GITHUB_REPO` | var | The inbox repository |
| `GITHUB_TOKEN` | secret | Fine-grained token, Issues read and write on the inbox only |
| `TURNSTILE_SECRET_KEY` | secret | Verifies the spam-check token |

## Testing

```bash
npm test                      # from this folder; or `npm run test:feedback` from the repo root
```

To try the Worker locally against a local build of the site, create
`.dev.vars` (ignored by git) with Cloudflare's always-pass test secret and a
real or throwaway token:

```
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
GITHUB_TOKEN=<token>
ALLOWED_ORIGINS=http://localhost:4321
```

Then run `npx wrangler dev` here, and in the repo root:

```bash
PUBLIC_FEEDBACK_ENDPOINT=http://localhost:8787/ \
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA \
npm run dev
```
