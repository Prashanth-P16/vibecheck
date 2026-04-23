const { app, Tray, Menu, BrowserWindow, ipcMain, clipboard, screen } = require('electron');
const path = require('path');

let tray = null;
let roastWindow = null;
let questionWindow = null;
let resultWindow = null;

app.whenReady().then(() => {
  // Hide from dock on mac
  if (process.platform === 'darwin') app.dock.hide();

  createTray();
});

function createTray() {
  // Use a simple emoji-based tray — no icon file needed
  tray = new Tray(path.join(__dirname, 'tray-icon.png'));
  tray.setToolTip('VibeCheck — Does your idea actually slap?');

  const menu = Menu.buildFromTemplate([
    {
      label: '🔮 Check My Idea',
      click: () => openRoastScreen()
    },
    { type: 'separator' },
    {
      label: '📋 Copy Last Report',
      click: () => copyLastReport()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(menu);

  // Left click also opens roast screen
  tray.on('click', () => openRoastScreen());
}

function openRoastScreen() {
  if (roastWindow) { roastWindow.focus(); return; }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  roastWindow = new BrowserWindow({
    width: 480,
    height: 320,
    x: Math.floor(width / 2 - 240),
    y: Math.floor(height / 2 - 160),
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  roastWindow.loadFile(path.join(__dirname, 'roast.html'));

  roastWindow.on('closed', () => { roastWindow = null; });
}

function openQuestionWindow() {
  if (roastWindow) { roastWindow.close(); roastWindow = null; }
  if (questionWindow) { questionWindow.focus(); return; }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  questionWindow = new BrowserWindow({
    width: 560,
    height: 620,
    x: Math.floor(width / 2 - 280),
    y: Math.floor(height / 2 - 310),
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  questionWindow.loadFile(path.join(__dirname, 'questions.html'));
  questionWindow.on('closed', () => { questionWindow = null; });
}

function openResultWindow(report) {
  if (questionWindow) { questionWindow.close(); questionWindow = null; }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  resultWindow = new BrowserWindow({
    width: 600,
    height: 700,
    x: Math.floor(width / 2 - 300),
    y: Math.floor(height / 2 - 350),
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  resultWindow.loadFile(path.join(__dirname, 'result.html'));
  resultWindow.webContents.on('did-finish-load', () => {
    resultWindow.webContents.send('report-data', report);
  });

  resultWindow.on('closed', () => { resultWindow = null; });
}

let lastReport = '';

function copyLastReport() {
  if (lastReport) {
    clipboard.writeText(lastReport);
  }
}

// IPC handlers
ipcMain.on('roast-done', () => openQuestionWindow());

ipcMain.on('close-window', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.on('submit-answers', async (event, { idea, answers, apiKey }) => {
  try {
    const prompt = buildPrompt(idea, answers);
    const report = await callClaude(prompt, apiKey);
    lastReport = report;
    openResultWindow(report);
  } catch (err) {
    event.sender.send('api-error', err.message);
  }
});

ipcMain.on('copy-report', (event, text) => {
  clipboard.writeText(text);
});

ipcMain.on('restart', () => {
  openRoastScreen();
});

function buildPrompt(idea, answers) {
  const questions = [
    "Who specifically pays for this?",
    "How do they solve this problem today?",
    "Why would they switch to yours?",
    "How many people actually have this problem?",
    "How do you make money?",
    "What's the hardest part to build?",
    "Can one person run this alone?",
    "What happens if 10,000 users show up overnight?",
    "Name one company that already does something similar.",
    "Why are YOU the right person to build this?"
  ];

  const answersText = questions.map((q, i) =>
    `Q${i+1}: ${q}\nA: ${answers[i] || '(skipped)'}`
  ).join('\n\n');

  return `You are VibeCheck — a brutally honest startup idea analyst. No sugarcoating. No "great idea!" garbage. Real talk only.

Analyze this idea and the founder's answers to 10 questions. Produce a VIBE REPORT.

IDEA: ${idea}

${answersText}

---

Respond EXACTLY in this format:

## VIBE SCORE: [0-100]/100

[One of these based on score:]
🟢 STRONG VIBE — Build this. (80-100)
🟡 RISKY VIBE — Fixable, but here's what could kill it. (60-79)
🟠 WEAK VIBE — Needs a serious pivot. (40-59)
🔴 DEAD ON ARRIVAL — Don't build this. Build this instead. (0-39)

## THE GOOD STUFF ✅
[2-3 real strengths. Be specific.]

## THE KILL SHOTS ☠️
[Top 2-3 things most likely to kill this idea. Each one: what, why, fix.]

## THE ONE QUESTION THAT MATTERS 🎯
[One specific real-world test they can run in 7 days.]

## IF YOU PIVOT 🔄
[Only if score < 60: one specific, actionable pivot idea.]

## SCORE BREAKDOWN
| Factor | Score | Note |
|--------|-------|------|
| Customer clarity | X/10 | note |
| Problem pain level | X/10 | note |
| Differentiation | X/10 | note |
| Market size | X/10 | note |
| Monetization | X/10 | note |
| Build complexity | X/10 | note |
| Founder-market fit | X/10 | note |

Keep it tight. Brutal. Useful.`;
}

async function callClaude(prompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API call failed');
  }

  const data = await response.json();
  return data.content[0].text;
}
