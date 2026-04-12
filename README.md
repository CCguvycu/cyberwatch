# CyberWatch

**Real-time cybersecurity intelligence hub** — live CVE tracking, threat actor profiles, interactive security education, and a curated threat intel feed. All in a dark-themed, Twitter/TikTok-style interface.

**[Launch CyberWatch](https://ccguvycu.github.io/cyberwatch/)** | **[Website](https://ccguvycu.github.io/cyberwatch/site/)** | **[Privacy Policy](https://ccguvycu.github.io/cyberwatch/privacy.html)**

---

## What Is It

CyberWatch is a single-page web app that aggregates live cybersecurity data from public APIs and combines it with interactive learning modules, threat actor dossiers, and CTF challenges. No backend, no tracking, no ads — everything runs client-side.

**Invite-only access** — codes are SHA-256 hashed and validated entirely in the browser. No user database, no registration form, no email collection.

## Features

- **Live CVE Feed** — real-time HIGH and CRITICAL vulnerabilities from the NVD/NIST API
- **Threat Intel Feed** — curated posts from Hacker News and Reddit r/netsec
- **Threat Actor Profiles** — APT28, APT29, APT41, Lazarus Group, Sandworm, Conti/BlackSuit with TTPs, campaigns, and attribution
- **Interactive Lessons** — SQL injection, XSS, phishing, zero trust, OWASP Top 10, homeland security, and more
- **CTF Challenges** — hands-on capture-the-flag exercises with XP tracking
- **Crypto Tracker** — live BTC/ETH prices via CoinGecko (ransomware payments are measured in crypto)
- **XP & Levelling** — quiz scores, lesson completions, and CTF solves earn XP with level progression
- **Profile System** — customisable profiles with client-side image resize (Canvas API, 256x256)
- **Offline Mode** — service worker caches the full app after first load
- **Dark Theme** — always-on, CyberWatch is built for the dark

## Live Data Sources

| Source | API | What |
|---|---|---|
| NVD/NIST | `services.nvd.nist.gov/rest/json/cves/2.0` | CVEs with CVSS scoring |
| Hacker News | `hacker-news.firebaseio.com` | Top cybersec stories |
| Reddit | `reddit.com/r/netsec/new.json` | r/netsec latest posts |
| CoinGecko | `api.coingecko.com/api/v3` | Live crypto prices |

All requests go directly from the browser to the public API. No intermediary server.

## Android APK

A native Android app wraps the full CyberWatch experience in a WebView with:
- **Background CVE polling** via WorkManager (60-min interval)
- **Local push notifications** for new HIGH/CRITICAL CVEs and r/netsec posts
- **Two notification channels** — CVE Alerts (default priority) and r/netsec Posts (low priority)
- **Offline support** via the same service worker
- **Auto-updates** — the APK loads the live GitHub Pages URL, so pushing to this repo updates the app instantly

APK project: [`cyberwatch-apk/`](https://github.com/CCguvycu) (separate repo)

## Tech Stack

- **Frontend**: Single HTML file, vanilla JavaScript, zero dependencies
- **Hosting**: GitHub Pages (this repo)
- **Auth**: SHA-256 hashed invite codes, client-side validation
- **Storage**: `localStorage` for all user data (profile, XP, progress, preferences)
- **Offline**: Service worker with 3-strategy caching (cache-first for static, network-first for API, stale-while-revalidate for assets)
- **Security**: Content Security Policy headers, no inline eval, no external scripts

## Project Structure

```
cyberwatch/
  index.html        # The entire app (5,600+ lines)
  sw.js             # Service worker v2.0.0 (offline mode)
  manifest.json     # PWA manifest
  privacy.html      # Privacy policy (hosted)
  site/
    index.html      # Landing page / marketing site
  assets/
    app-icon.svg    # 512x512 app icon
    feature-graphic.svg  # 1024x500 Play Store graphic
```

## Security

CyberWatch practises what it teaches:

- **Zero backend** — no server, no database, no user accounts
- **No tracking** — no analytics, no cookies, no fingerprinting
- **SHA-256 invite codes** — plaintext never stored or transmitted
- **Content Security Policy** — strict CSP blocks XSS and injection
- **localStorage only** — user data never leaves the device
- **Offline capable** — works without internet after first load

## Stats

| Metric | Value |
|---|---|
| Lines of code | 5,600+ |
| Dependencies | 0 |
| Live API feeds | 4 |
| Trackers | 0 |
| Lessons | 10+ |
| Threat actors | 6 |
| CTF challenges | 5+ |

## Screenshots

*Coming soon — dark-themed feed view, threat actor profile, CTF challenge, live CVE alerts.*

## Development

This is a single HTML file. Edit `index.html`, push to `master`, and GitHub Pages deploys automatically.

```bash
# Local preview
python -m http.server 8000
# then open http://localhost:8000
```

## Invite Codes

CyberWatch is invite-only. Share invite links as:
```
https://ccguvycu.github.io/cyberwatch/#invite=YOUR-CODE
```

## Author

Built by **[ArukuX](https://github.com/CCguvycu)** — cybersecurity student, full-stack developer, builder of things that work.

## License

All rights reserved. Source visible for educational reference.
