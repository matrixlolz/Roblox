# Roblox

## Studio website (`site/`)

A static landing page for a Roblox game studio. It has no build step and no dependencies apart from Google Fonts.

Open `site/index.html` in a browser, or serve it locally:

```sh
cd site && python3 -m http.server 8000
```

To customise it:
- **Games:** edit the `GAMES` array at the top of `site/main.js` (title, genre, stats, colours). The card art is generated from each game's palette and seed.
- **Studio name:** "Riftworks" is a placeholder. Search and replace it in `site/index.html`.
- **Contact form:** it validates input but has no backend yet. Hook up the submit handler in `main.js` to Formspree or your own API.
- **Live player counts:** these are simulated. Replace `tickPlayers()` with a call to a proxy for the Roblox games API if you want real numbers.
