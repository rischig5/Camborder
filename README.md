# Camborder

A configurable camera border overlay for OBS / Twitch. It's a transparent page you layer on top of your webcam source in OBS, plus a settings panel to tweak color, thickness, corner style, glow, animation, and an optional label.

## Quick start

You need [Node.js](https://nodejs.org) installed (no other dependencies — nothing to `npm install`).

**Windows — one-click launcher (recommended, no terminal needed):**

Double-click **`Start Camborder.bat`**. A small purple popup window opens with a circular **START** button — click it. It launches the server in the background (no console window), waits for it to come up, and automatically opens the settings panel in your browser. The button turns into a red **STOP** you can click to shut the server down; closing the popup window does *not* stop the server, so you can safely close it once things are running.

Tip: right-click `Start Camborder.bat` → **Send to** → **Desktop (create shortcut)** so it's one click from your desktop every time, no need to open this folder or VS Code again. If Windows SmartScreen warns about an unrecognized app the first time (normal for any unsigned local script), click **More info** → **Run anyway**.

**Any OS — manual start:**

```
node server.js
```

Either way, this starts a small local server and prints two URLs:

- `http://localhost:5173/overlay.html` — the actual border, point OBS at this one.
- `http://localhost:5173/settings.html` — the control panel, open this in your normal browser.

Leave the server running while you stream.

### Why a server instead of just opening the HTML files?

OBS's Browser Source uses its own separate, embedded browser engine — it does **not** share storage with Chrome/Firefox/Edge on your machine. If the settings panel only saved to browser local storage, changes you make there would never actually reach the overlay running inside OBS. The server keeps settings in a small JSON file and pushes updates live to every connected page (your browser and OBS's) over Server-Sent Events, so edits actually show up in OBS in real time.

You *can* still open `overlay.html` directly as a local file (no server) if you just want a static border with no live editing — it'll use its last-saved settings from that browser's local storage — but the live-sync workflow above is what makes the settings panel actually useful.

## Setup in OBS

1. In your scene, add your webcam as a **Video Capture Device** source, sized/positioned how you want it.
2. Add a new **Browser Source**:
   - Set **URL** to `http://localhost:5173/overlay.html` (leave "Local file" unchecked).
   - Set **Width** and **Height** to exactly match your webcam source's size.
   - Leave the background as-is — the page has no background of its own, so OBS composites it as transparent automatically.
3. Move the Browser Source **above** the webcam source in the source list so the border renders on top of the video.
4. Position/resize both sources together (group them if you like) so the border lines up with the edges of your webcam feed.

## Configuring the look

Open `http://localhost:5173/settings.html` in any browser. You'll see:

- A live preview of the overlay on the right (checkerboard = transparent).
- Controls on the left for border color/gradient, thickness, corner style (rounded / square / cut), glow, animation, and an optional text label (e.g. your channel name) with position and color controls.

Changes apply instantly to any open `overlay.html`, including the one running in OBS — no refresh needed.

Presets (Twitch Purple, Neon Cycle, Minimal White, Fire) are available as a starting point; every value can then be fine-tuned.

Settings can be exported/imported as JSON from the "Manage" section, useful for backing up a look or moving it to another machine.

## Notes

- The label text field is empty/off by default and fully editable, so you're not locked into any specific channel name — type whatever you want (or leave it off) and change it any time without touching code.
- Current settings live in `camborder-settings.json` (created automatically, gitignored — it's local machine state, not something to commit).
- No external npm dependencies, no network calls beyond localhost, no camera/microphone permissions requested anywhere.
- To run on a different port: `PORT=5555 node server.js`.
