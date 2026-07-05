# RayCaster

RayCaster is a browser-based TypeScript raycasting FPS inspired by Wolfenstein 3D. It uses Vite, native browser ES modules, and HTML canvas.

The project is currently both a playable raycasting prototype and the starting point for a more modular browser game engine.

## Current Gameplay

- First-person raycast wall rendering with textured wall slices.
- WASD and arrow-key movement/turning.
- Basic vertical look with keyboard pitch controls.
- Bullet spawning, movement, wall impact despawn, and enemy hit removal.
- Enemy chase behavior with simple wall collision.
- Doors, locked red doors, and red keycard pickup flow.
- Optional 2D map overlay with player, rays, entities, and map tiles.
- Quality controls that change horizontal ray/render resolution.
- Canvas HUD for crosshair, FPS, and short UI notices.

## Controls

- `W` / `Up Arrow`: Move forward.
- `S` / `Down Arrow`: Move backward.
- `A` / `Left Arrow`: Turn left.
- `D` / `Right Arrow`: Turn right.
- `R`: Look up.
- `F`: Look down.
- `Space`: Fire.
- `E`: Interact with doors.
- `Toggle 2D map`: Show or hide the minimap/debug overlay.
- Quality radio buttons: Change horizontal render resolution.

## Running Locally

Install dependencies once:

```sh
npm install
```

Start the Vite dev server:

```sh
npm run dev
```

Then open the printed local URL, usually `http://127.0.0.1:5173/`.

Run the production build used by GitHub Pages:

```sh
npm run build
```

The app entrypoint is:

- `index.html`
- `src/main.ts`

The build output is written to `dist/`.

## Project Structure

- `src/main.ts`: Composition root and game bootstrap.
- `src/state/game-state.ts`: Central mutable runtime state.
- `src/systems/`: Gameplay and frame systems for player, enemies, bullets, collisions, doors, keycards, raycasting, and RAF timing.
- `src/render/`: Canvas renderers for background, walls, billboard entities, HUD, and raycast scene composition.
- `src/entities/`: Player, enemy, bullet, pickup, and base billboard entity classes.
- `src/map/`: Tile map model and cached 2D map drawing.
- `src/input/`: Keyboard state and edge-trigger tracking.
- `src/math/`: Geometry and vector helpers.
- `src/assets/`: Texture/image loading.
- `src/data/`: Current hardcoded map matrix and default level data.
- `src/config/`: Shared constants for rendering, controls, doors, and gameplay tuning.
- `src/ui/`: DOM control bindings.

## Backlogs

- `FEATURE_BACKLOG.md`: Gameplay and content-facing features such as map loading, enemy AI, weapons, ammo, sound, score, and progression.
- `ENGINE_FEATURE_BACKLOG.md`: Engine architecture work such as runtime extraction, system registration, input actions, asset manifests, level data, tile metadata, scene lifecycle, events, debugging, and save boundaries.
- `todo.txt`: Older short-form notes that have mostly been expanded into the backlog files.

## Engine Direction

The intended direction is to preserve the current static-browser simplicity while gradually separating engine concerns from game-specific content:

- Keep simulation, rendering, input, assets, UI, and runtime lifecycle boundaries explicit.
- Preserve the existing update order unless a ticket intentionally changes it.
- Keep runtime modules TypeScript-first and let Vite build the browser bundle.
- Treat `GameMap.size === 64` as a core world-unit contract until an engine ticket changes it deliberately.
- Keep GitHub Pages/static-site deployment viable as the default.

## Manual Smoke Test

After gameplay changes:

1. Open the app in a browser.
2. Verify movement with WASD and arrow keys.
3. Verify turning, wall collisions, and no map-edge crash.
4. Press `Space` and verify bullets spawn and despawn on impact.
5. Verify enemies chase and are removed when hit by bullets.
6. Pick up the red keycard and verify locked-door interaction.
7. Toggle the 2D map and verify overlays still render.
8. Switch quality radio options and verify horizontal resolution changes.

Documentation-only changes do not require a gameplay smoke test.

## Deployment

GitHub Pages is built by `.github/workflows/deploy-pages.yml`.

On pushes to `main`, GitHub Actions runs `npm ci`, `npm run build`, uploads `dist/` as a Pages artifact, and deploys it through the official GitHub Pages Actions flow.
