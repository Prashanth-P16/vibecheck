# 🔮 VibeCheck

> *Sit in your system tray. Click when you have an idea. Get brutally honest report.*

![VibeCheck demo](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-purple?style=flat-square)

---

## What it does

VibeCheck lives in your system tray. When you have a startup idea:

1. **Click the 🔮 tray icon**
2. **Survive the roast screen** (a brutal loading sequence that prepares you for honesty)
3. **Answer 10 questions** in the popup — your idea, your answers, nothing else
4. **Get your Vibe Report** — a scored, structured verdict with kill shots and a real recommendation
5. **Copy the report** and paste it anywhere — Claude.ai, ChatGPT, Notion, your co-founder's face

No browser tabs. No web app. No separate window. Just tray → popup → verdict.

---

## The 10 Questions

| # | Question | What it catches |
|---|----------|-----------------|
| 1 | Who specifically pays for this? | "Everyone is my customer" trap |
| 2 | How do they solve it today? | Fake problem detection |
| 3 | Why would they switch to yours? | Generic differentiator trap |
| 4 | How many people have this problem? | Fantasy market sizing |
| 5 | How do you make money? | "We'll figure it out later" |
| 6 | What's the hardest part to build? | Iceberg complexity underestimation |
| 7 | Can one person run this? | Ops complexity blindspot |
| 8 | What if 10,000 users show up? | Scaling cliff detection |
| 9 | Name one similar company | "No competition" delusion |
| 10 | Why are YOU right for this? | Founder-market fit check |

---

## Vibe Scores

| Score | Verdict |
|-------|---------|
| 🟢 80–100 | **Strong Vibe** — Build this. |
| 🟡 60–79 | **Risky Vibe** — Fixable, but here's what could kill it. |
| 🟠 40–59 | **Weak Vibe** — Pivot before building. |
| 🔴 0–39 | **Dead on Arrival** — Don't build this. Build this instead. |

---

## Install

### Requirements
- Node.js 18+
- An Anthropic API key ([get one free](https://console.anthropic.com))

### Run

```bash
git clone https://github.com/yourusername/vibecheck
cd vibecheck
npm install
npm start
```

The tray icon appears. Click it. That's it.

### Build a distributable

```bash
npm run build:win   # Windows .exe
npm run build:mac   # macOS .dmg
npm run build:linux # Linux AppImage
```

---

## Linux note

On Linux, if the tray icon doesn't appear, install a tray extension for your desktop environment:

```bash
# GNOME
sudo apt install gnome-shell-extension-appindicator

# Or just run from terminal and use Alt+F2 to trigger
```

---

## FAQ

**Does it store my API key?**
Yes, locally in Electron's localStorage. It never leaves your machine except for Anthropic's API.

**Does it store my ideas?**
No. Nothing is persisted except your API key. Your ideas stay in memory only.

**Can I use it without an API key?**
The prompt is in [`prompts/validator-v1.md`](prompts/validator-v1.md) — copy it into any AI manually.

**What model does it use?**
Claude Haiku by default (fast, cheap, ~₹0.10/check). You can change it in `src/main.js`.

---

## Repo structure

```
vibecheck/
├── src/
│   ├── main.js          ← Electron main process + Claude API call
│   ├── preload.js       ← IPC bridge
│   ├── roast.html       ← Brutal loading screen
│   ├── questions.html   ← 10-question flow
│   ├── result.html      ← Vibe Report window
│   └── tray-icon.png    ← System tray icon
├── prompts/
│   └── validator-v1.md  ← The core system prompt (the real product)
├── scripts/
│   └── gen_icon.py      ← Regenerate tray icon if needed
├── package.json
└── README.md
```

---

## Roadmap

- [x] System tray app
- [x] Brutal roast loading screen
- [x] 10-question flow
- [x] Scored Vibe Report
- [x] Copy to clipboard
- [ ] PRD generator (step 2 after passing vibecheck)
- [ ] Cost estimator
- [ ] Share as image card
- [ ] Saved history

---

## Contributing

The prompt is the product. Better questions = better tool. Open a PR or issue.

See [`prompts/validator-v1.md`](prompts/validator-v1.md) for the system prompt.

---

*Free forever. MIT licensed. Made for vibe coders who want the truth before they waste 6 months.*
