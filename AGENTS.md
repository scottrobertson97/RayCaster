# AGENTS Guide

## Project Summary
- This is a browser-based JavaScript raycasting FPS inspired by Wolfenstein 3D.
- It uses native browser ES modules and HTML canvas.
- It is deployed as a static site on GitHub Pages.

## Environment
- Static files only.
- No runtime environment or local toolchain is required for deployment.
- No formal automated gameplay tests are present.

## Common Commands
- Trigger deployment: push to `main` (or run workflow manually in GitHub Actions).

## Core File Map
- `src/main.js`: Composition root and game bootstrap.
- `src/state/game-state.js`: Central mutable runtime state.
- `src/systems/frame-loop.js`: Delta-time calculation and RAF loop.
- `src/systems/player-system.js`: Player update call.
- `src/systems/enemy-system.js`: Enemy updates.
- `src/systems/bullet-system.js`: Bullet updates.
- `src/systems/collision-system.js`: Bullet-wall and bullet-enemy collision resolution.
- `src/systems/raycast-system.js`: Ray generation and ray-map intersection logic.
- `src/render/background-renderer.js`: Sky/floor backdrop.
- `src/render/wall-renderer.js`: Wall slice rendering.
- `src/render/entity-renderer.js`: Sprite ray participation and draw ordering.
- `src/render/ui-renderer.js`: HUD/crosshair/FPS text.
- `src/entities/player.js`: Movement, turning, shooting.
- `src/entities/entity.js`: Base billboard sprite rendering.
- `src/entities/enemy.js`: Enemy chase behavior.
- `src/entities/bullet.js`: Bullet movement and life state.
- `src/map/game-map.js`: Tile grid and optional 2D map draw cache.
- `src/input/keyboard-state.js`: Input tracking and edge-trigger support.
- `src/math/geometry.js`: Intersection and vector math helpers.
- `src/math/vec2.js`: Vector helper class.
- `src/assets/textures.js`: Wall texture loading.
- `src/data/map-matrix.js`: Initial map tiles.
- `src/ui/controls.js`: Quality, map toggle, and fog toggle bindings.
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
- Keep module import paths relative with explicit `.js` extensions (GitHub Pages-safe).
- Keep UI control wiring in `src/ui/controls.js` instead of globals on `window`.

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
