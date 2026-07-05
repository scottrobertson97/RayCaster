# AGENTS Guide

## Project Summary
- This is a browser-based TypeScript raycasting FPS inspired by Wolfenstein 3D.
- It uses Vite, native browser ES modules, and HTML canvas.
- It is deployed as a static site on GitHub Pages from Vite's `dist/` output.

## Environment
- Vite is the local development server and production build tool.
- Node/npm are required for local development and deployment builds.
- No formal automated gameplay tests are present.

## Common Commands
- Install dependencies: `npm install`
- Run locally: `npm run dev`
- Typecheck only: `npm run typecheck`
- Production build: `npm run build`
- Preview built output: `npm run preview`
- Trigger deployment: push to `main` (or run workflow manually in GitHub Actions).

## Core File Map
- `src/main.ts`: Composition root and game bootstrap.
- `src/state/game-state.ts`: Central mutable runtime state.
- `src/systems/frame-loop.ts`: Delta-time calculation and RAF loop.
- `src/systems/player-system.ts`: Player update call.
- `src/systems/enemy-system.ts`: Enemy updates.
- `src/systems/bullet-system.ts`: Bullet updates.
- `src/systems/collision-system.ts`: Bullet-wall and bullet-enemy collision resolution.
- `src/systems/raycast-system.ts`: Ray generation and ray-map intersection logic.
- `src/render/background-renderer.ts`: Sky/floor backdrop.
- `src/render/wall-renderer.ts`: Wall slice rendering.
- `src/render/entity-renderer.ts`: Sprite ray participation and draw ordering.
- `src/render/ui-renderer.ts`: HUD/crosshair/FPS text.
- `src/entities/player.ts`: Movement, turning, shooting.
- `src/entities/entity.ts`: Base billboard sprite data.
- `src/entities/enemy.ts`: Enemy chase behavior.
- `src/entities/bullet.ts`: Bullet movement and life state.
- `src/map/game-map.ts`: Tile grid and optional 2D map draw cache.
- `src/input/keyboard-state.ts`: Input tracking and edge-trigger support.
- `src/math/geometry.ts`: Intersection and vector math helpers.
- `src/math/vec2.ts`: Vector helper class.
- `src/assets/textures.ts`: Wall texture loading.
- `src/data/map-matrix.ts`: Initial map tiles.
- `src/ui/controls.ts`: Quality, map toggle, and fog toggle bindings.
- `index.html`: Canvas layout and module entrypoint.

## Gameplay/Data Contracts
- Tile size is fixed at `64` world units (`GameMap.size`).
- Map indexing and world-to-tile conversion rely on `Math.trunc(value) >> 6`.
- Update order must stay:
1. delta time update
2. player update
3. enemy updates
4. bullet updates
5. bullet collision resolution
6. draw pass
7. keyboard snapshot update
- Entity rendering depends on distance-sorted rays; do not reorder sprite/wall draw mixing without intent.

## Safe Change Guidance
- Preserve axis-separated collision checks in `Player.move`.
- Keep `state.entityStore` as the single source for bullet/enemy arrays.
- If runtime map data changes, use `map.setTile(...)` to invalidate cached minimap image.
- Keep TypeScript source imports compatible with Vite's ESM build.
- Keep UI control wiring in `src/ui/controls.ts` instead of globals on `window`.

## Manual Smoke Test (Required After Gameplay Changes)
1. Open the deployed GitHub Pages URL.
2. Verify movement with `WASD` and arrow keys.
3. Verify turning, wall collisions, and no map-edge crash.
4. Press `SPACE` and verify bullets spawn and despawn on impact.
5. Verify enemies chase and are removed when hit by bullets.
6. Toggle 2D map and verify overlays still render.
7. Switch quality radio options and verify horizontal resolution changes.

## Known Gaps / Backlog Context
- `todo.txt` items include map file loading, texture tiling improvements, richer AI, directional sprites, and doors.
