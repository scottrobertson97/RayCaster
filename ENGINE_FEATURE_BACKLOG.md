# Engine Feature Backlog

This file tracks architecture, modularity, and tooling improvements that would move the project from a single raycasting game toward a reusable browser game engine.

Each backlog item is shaped as an implementation ticket. Acceptance criteria should describe observable completion conditions, not internal intent alone.

## High Priority

### ENG-001: Split Bootstrap From Engine Runtime

**Status:** Backlog

**Goal:** Keep `src/main.js` focused on wiring one game instance while reusable startup and runtime coordination move into engine-owned modules.

**Why:** The current composition root directly creates canvases, map, player, entities, controls, update order, and draw order. That makes it hard to create another game, scene, level, or test harness without copying `main.js`.

**Scope:**
- Extract reusable startup/runtime construction into a new engine/app module.
- Keep DOM lookup and current game-specific defaults in `src/main.js`.
- Preserve the current load behavior and frame order.

**Acceptance Criteria:**
- `src/main.js` only performs DOM lookup, game-specific config assembly, and runtime start.
- Reusable runtime setup lives outside `src/main.js`.
- Current gameplay, controls, rendering, doors, pickups, bullets, and enemies behave the same.
- Static GitHub Pages deployment still works with explicit `.js` module imports.

**Notes:**
- This should be an early refactor before deeper system registry work.
- Avoid changing gameplay behavior in this ticket.

### ENG-002: Introduce `Game` or `Engine` Runtime Object

**Status:** Backlog

**Goal:** Add a runtime object that owns state, update systems, render systems, lifecycle start/stop, and frame ordering.

**Why:** The frame loop currently calls a callback that mutates a loose state object. A runtime object gives the project a stable place for lifecycle and orchestration as it becomes more engine-like.

**Scope:**
- Create a runtime class or factory with `start()`, `stop()`, `update()`, and `render()` responsibilities.
- Keep the existing update order intact.
- Keep RAF ownership clear and avoid multiple active loops for one runtime.

**Acceptance Criteria:**
- Runtime can be constructed with current state and system lists or equivalent config.
- Runtime can start and stop without leaving an active RAF loop behind.
- Update order remains: delta time, player, keycards, doors, enemies, bullets, bullet collisions, draw, keyboard snapshot.
- Existing UI controls still affect the active runtime state.

**Notes:**
- This may build on ENG-001.
- Stop support is useful for future scene swaps and tests.

### ENG-003: Replace Ad Hoc Global State With Explicit State Slices

**Status:** Backlog

**Goal:** Reshape game state into named slices for world, entities, rendering, input, UI, assets, and runtime timing.

**Why:** `createGameState` currently returns a broad object where unrelated responsibilities sit at the same level. That makes ownership unclear and increases coupling between systems.

**Scope:**
- Define explicit top-level state slices.
- Move existing fields into the most appropriate slice.
- Update systems and renderers to use the new paths.

**Acceptance Criteria:**
- State has clear slices for `world`, `entities`, `render`, `input`, `ui`, `assets`, and `runtime` or equivalent names.
- Existing systems no longer depend on unrelated top-level fields when a slice exists.
- All current gameplay behavior is preserved.
- Any compatibility aliases are temporary and documented if needed.

**Notes:**
- Keep this mechanical and behavior-preserving.
- Consider doing this after runtime extraction so state ownership is clearer.

### ENG-004: Add Ordered System Registry

**Status:** Backlog

**Goal:** Create a registry or pipeline so update and render systems can be registered in order instead of hardcoding every system call in `main.js`.

**Why:** A modular engine needs new systems to be added without editing the composition root every time.

**Scope:**
- Define update and render system registration shapes.
- Preserve fixed ordering for gameplay-critical systems.
- Make system order easy to inspect in code.

**Acceptance Criteria:**
- Update systems are registered as ordered entries.
- Render systems are registered as ordered entries.
- The current update and render ordering is unchanged.
- Adding a new system requires adding it to a registry/config, not manually editing the frame callback body.

**Notes:**
- The registry can be simple arrays of named functions at first.
- Do not overbuild dependency graphs until the project needs them.

### ENG-005: Add Input Action Map

**Status:** Backlog

**Goal:** Let gameplay systems consume named actions like `moveForward`, `turnLeft`, `interact`, and `fire` instead of raw key codes.

**Why:** Direct `Keyboard.KEYBOARD` checks are spread into gameplay code. Action mapping makes controls configurable and enables future mouse, gamepad, remapping, and menu input.

**Scope:**
- Introduce a single action mapping layer.
- Keep existing keyboard bindings working.
- Provide pressed, held, and released or just-pressed style queries.

**Acceptance Criteria:**
- Player movement, turning, pitch look, firing, and door interaction read action state rather than raw key codes.
- Existing WASD, arrow keys, Space, E, R, and F bindings still work.
- Edge-triggered actions like firing and interaction still fire once per press.
- Keyboard snapshot behavior remains reliable.

**Notes:**
- Keep browser key handling in one module.
- Use action names that can survive future control remapping.

### ENG-006: Move Hardcoded Entity Spawning Into Level Data

**Status:** Backlog

**Goal:** Move current enemy and decorative entity spawning out of `src/main.js` into level data or a level loader.

**Why:** A reusable engine should load entities from content definitions rather than compiling them into bootstrap code.

**Scope:**
- Define a small level data shape for player start and entity spawns.
- Move current hardcoded spawns into that data.
- Load the same entities at startup through a level initialization path.

**Acceptance Criteria:**
- `seedEntities` or equivalent hardcoded spawn code is removed from `src/main.js`.
- Current enemies and sprite entities still spawn at the same positions with the same assets.
- Level data is separate from runtime code.
- Adding a spawn does not require changing bootstrap logic.

**Notes:**
- This can start as an ES module data file before external JSON loading exists.
- Avoid mixing this with full map-file loading unless that ticket is active.

### ENG-007: Define Asset Manifest Layer

**Status:** Backlog

**Goal:** Introduce stable asset IDs for walls, sprites, pickups, bullets, and UI assets instead of direct URLs inside gameplay classes.

**Why:** Asset filenames and URLs currently act as public API. A manifest makes assets replaceable, preloadable, and level-addressable.

**Scope:**
- Create an asset manifest data structure.
- Resolve manifest IDs to loaded `Image` objects or asset records.
- Remove direct remote sprite URLs from entity constructors where practical.

**Acceptance Criteria:**
- Wall textures and sprite images can be referenced by stable IDs.
- Existing wall, enemy, pickup, bullet, and decorative sprites still render.
- Gameplay classes no longer need to know remote asset URLs.
- Missing asset IDs fail visibly or fall back in a predictable way.

**Notes:**
- Preloading can be a later ticket; this ticket is primarily about ID indirection.
- Keep CORS behavior intact for current remote images.

### ENG-008: Separate Simulation Entities From Renderable Sprite Data

**Status:** Backlog

**Goal:** Decouple entity logic from image loading and canvas drawing.

**Why:** `Entity` currently combines position, bounds, animation frames, image loading, raycast sprite rendering, minimap drawing, and base update behavior. That limits reuse and makes tests harder.

**Scope:**
- Move sprite/image data into render components or render descriptors.
- Keep simulation data focused on transform, size/bounds, velocity, health/state, and behavior.
- Keep rendering systems responsible for drawing.

**Acceptance Criteria:**
- Entity simulation objects do not instantiate `Image` directly.
- Renderers can draw entities using render data or asset IDs.
- Enemy, bullet, pickup, and decorative entity behavior is preserved.
- Collision and update logic no longer depend on sprite loading state.

**Notes:**
- This should follow asset manifest work.
- Avoid a full ECS rewrite unless it is explicitly chosen.

### ENG-009: Add Tile Metadata System

**Status:** Backlog

**Goal:** Let tile IDs declare behavior such as solid, door, locked door, pickup spawn, texture, and interaction type.

**Why:** Tile behavior is currently encoded through constants and system-specific checks. Metadata makes the map format extensible and easier for level tooling.

**Scope:**
- Create tile definitions keyed by tile ID.
- Move solid/door/keycard semantics into metadata.
- Update systems to query metadata instead of hardcoded tile ID checks where practical.

**Acceptance Criteria:**
- Walls, empty space, unlocked doors, red locked doors, and red keycard spawn tiles have metadata entries.
- Door and keycard initialization use tile metadata.
- Collision and raycasting can determine solidity through metadata or a shared query.
- Current map behavior remains unchanged.

**Notes:**
- Keep numeric tile IDs for current maps.
- This pairs well with level format work.

### ENG-010: Centralize World/Tile Conversion Helpers

**Status:** Backlog

**Goal:** Replace repeated `Math.trunc(value) >> 6` logic with shared conversion helpers.

**Why:** World-to-tile math is a core engine contract. Repeating bit-shift conversion makes future tile-size or map-boundary work risky.

**Scope:**
- Add helpers for world-to-tile, tile-to-world, tile center, bounds checks, and tile keys.
- Replace repeated conversion logic in movement, collision, doors, bullets, and raycasting where safe.
- Preserve `GameMap.size === 64`.

**Acceptance Criteria:**
- Repeated `Math.trunc(value) >> 6` usages are replaced with shared helpers.
- Existing movement, wall collision, bullet collision, raycasting, and door interaction behavior remains unchanged.
- Helpers are documented or named clearly enough to preserve the tile-size contract.
- Map-edge handling remains safe.

**Notes:**
- This is a good low-risk first refactor.
- Keep performance-sensitive raycasting loops simple and readable.

## Medium Priority

### ENG-011: Introduce Scene or Level Lifecycle

**Status:** Backlog

**Goal:** Add lifecycle hooks for load, enter, update, render, pause, resume, and unload.

**Why:** The current app assumes one permanent level. A scene lifecycle enables menus, level transitions, restarts, loading screens, and test scenes.

**Scope:**
- Define a scene/level interface.
- Route runtime update/render calls through the active scene.
- Keep the current gameplay as the initial scene.

**Acceptance Criteria:**
- The active scene receives lifecycle calls in a predictable order.
- Current game starts into the same playable level.
- Restarting or replacing a scene can be done without reloading the page.
- Runtime stop/start behavior remains stable.

**Notes:**
- This likely depends on ENG-002.
- Keep pause semantics simple at first.

### ENG-012: Add Level Definition Format

**Status:** Backlog

**Goal:** Define a level format containing map tiles, spawn points, entities, doors, pickups, textures, and player start data.

**Why:** Engine consumers need content data to describe a level without editing source logic.

**Scope:**
- Create a level definition schema as plain JavaScript data or JSON-compatible data.
- Migrate the current map and entity spawn data into one level definition.
- Include enough metadata for current doors and keycard pickups.

**Acceptance Criteria:**
- One level definition can recreate the current playable level.
- Player start position, enemies, pickups, decorative sprites, and map tiles come from level data.
- Level data is separate from engine runtime code.
- Future external file loading can reuse the same shape.

**Notes:**
- Do not require network loading in this ticket.
- Keep the format small and explicit.

### ENG-013: Create Reusable Collision and Query APIs

**Status:** Backlog

**Goal:** Provide shared APIs for solid tiles, entity bounds, ray checks, nearby entities, and line-of-sight tests.

**Why:** Collision and spatial queries are currently scattered across player movement, enemies, bullets, doors, and raycasting.

**Scope:**
- Define query functions for tile solidity, bounds checks, entity overlap, and map bounds.
- Move duplicated checks into shared functions.
- Keep current collision behavior intact.

**Acceptance Criteria:**
- Player, enemy, bullet, and door logic use shared query APIs where appropriate.
- Map bounds are handled consistently across systems.
- Bullet-enemy collision still removes both entities correctly.
- Existing wall collision behavior remains axis-separated for the player.

**Notes:**
- Preserve the player movement contract from `AGENTS.md`.
- Avoid introducing broad physics abstractions prematurely.

### ENG-014: Split Raycasting Into Renderer-Facing Service

**Status:** Backlog

**Goal:** Make raycasting return wall hit data without directly touching minimap drawing or entity visibility flags.

**Why:** `castSceneRays` currently casts walls, mutates entity draw flags, and draws debug rays. That blends simulation queries, visibility, rendering, and debugging.

**Scope:**
- Make raycasting produce data-only ray results.
- Move minimap debug ray drawing into a debug/render layer.
- Move sprite visibility/ray participation into a renderer-specific pass.

**Acceptance Criteria:**
- Raycast functions do not draw directly to canvas.
- Raycast functions do not mutate entity render state such as `drawn`.
- Wall rendering receives equivalent ray hit data and still renders the same scene.
- Minimap ray overlay still works when enabled.

**Notes:**
- This is a key rendering boundary refactor.
- Keep door-behind-wall ray behavior intact.

### ENG-015: Move Toward Composable Entity Behavior Data

**Status:** Backlog

**Goal:** Replace entity subclasses with composable behavior data where practical.

**Why:** Subclasses currently mix rendering and behavior. Composition will make it easier to create new entity types without inheritance chains.

**Scope:**
- Identify core reusable data pieces: transform, sprite, collider, health, AI, pickup, projectile.
- Convert at least one simple entity type to composable data as a pilot.
- Keep old classes only where still useful during migration.

**Acceptance Criteria:**
- At least one entity type is defined through composable data rather than a dedicated subclass.
- Existing rendering, collision, and updates still work.
- The chosen pattern is documented enough for adding a new entity type.
- No broad rewrite is required to add a new pickup or projectile.

**Notes:**
- This should follow ENG-008 or be done alongside it.
- Start with pickups or decorative sprites before enemies.

### ENG-016: Add Event or Message Layer

**Status:** Backlog

**Goal:** Add an event/message layer for interactions such as pickup collected, door locked, door opened, enemy hit, entity removed, and notice shown.

**Why:** Systems currently call each other or mutate shared state directly. Events reduce coupling and make UI/audio/debug hooks easier.

**Scope:**
- Add a simple event queue or pub/sub service scoped to the runtime.
- Emit events from gameplay systems.
- Consume events for UI notices where practical.

**Acceptance Criteria:**
- Pickup collection, locked door attempts, door unlock/open, enemy hit, and entity removal can emit events.
- UI notices can be driven from events instead of direct calls from gameplay systems.
- Events are processed deterministically within the frame.
- Existing user-visible behavior remains unchanged.

**Notes:**
- Keep the first implementation simple and synchronous.
- This will support future audio and analytics hooks.

### ENG-017: Move HUD Notices and Debug Overlays Behind UI Service

**Status:** Backlog

**Goal:** Put HUD notices and debug overlay state behind a UI state/service boundary.

**Why:** Gameplay systems currently mutate `uiNotice` directly or via helpers in unrelated systems. UI should be a consumer of game state/events, not a dependency for core rules.

**Scope:**
- Create a UI-facing state/service for notices and debug toggles.
- Move notice timer behavior into the UI layer or a UI system.
- Keep the existing HUD renderer working.

**Acceptance Criteria:**
- Gameplay systems do not directly mutate HUD notice fields.
- Notices still appear and expire at the same visible timing.
- Debug toggles remain available to renderers.
- UI state ownership is clearly separated from gameplay state.

**Notes:**
- This pairs well with ENG-016.
- Keep the current canvas HUD unless a DOM HUD ticket is added later.

### ENG-018: Add Debug Configuration Surface

**Status:** Backlog

**Goal:** Add a central debug configuration surface for map overlay, rays, FPS, entity counts, collision bounds, and current tile position.

**Why:** Debug flags are currently mixed with runtime and render state. A central debug surface will make diagnostics easier without polluting gameplay logic.

**Scope:**
- Define debug settings in one place.
- Add render support for selected debug overlays.
- Keep existing map and ray toggles working.

**Acceptance Criteria:**
- Debug settings include map overlay, ray overlay, FPS, entity count, collision bounds, and player tile position.
- Existing 2D map toggle still works.
- Debug rendering can be enabled/disabled without affecting gameplay simulation.
- Debug settings are easy to extend.

**Notes:**
- A UI for every debug option is not required in the first pass.
- This should not replace player-facing settings.

### ENG-019: Add Deterministic Frame Stepping

**Status:** Backlog

**Goal:** Support deterministic frame stepping for debugging update order and future automated tests.

**Why:** RAF-driven timing makes it harder to reproduce bugs. A controlled step API enables headless-ish tests and frame-by-frame debugging.

**Scope:**
- Allow runtime update to run with a supplied `dt`.
- Separate one-frame simulation stepping from RAF scheduling.
- Preserve normal RAF behavior for actual play.

**Acceptance Criteria:**
- A caller can advance the game by one fixed timestep without starting RAF.
- Runtime can still run normally with RAF.
- Keyboard snapshot timing remains correct in both modes.
- Existing gameplay does not change during normal play.

**Notes:**
- This depends on clearer runtime ownership.
- Use fixed-step support for future smoke tests.

### ENG-020: Add Lightweight Smoke-Test Harness Documentation or Scripts

**Status:** Backlog

**Goal:** Add a simple local verification path for manual or scripted smoke checks without changing the static deployment model.

**Why:** The project has no formal automated gameplay tests. A lightweight harness can catch obvious runtime errors while preserving the no-toolchain deployment path.

**Scope:**
- Document a local smoke-test checklist or add a small browser smoke script if a toolchain is introduced later.
- Cover startup, movement, turning, collision, shooting, enemies, pickups/doors, map toggle, and quality options.
- Keep deployment static.

**Acceptance Criteria:**
- Contributors can follow a documented smoke-test process locally.
- The process includes all manual smoke-test items from `AGENTS.md`.
- No required build step is added for GitHub Pages deployment.
- Any optional tooling is clearly marked optional.

**Notes:**
- Documentation-only is acceptable for the first version.
- Browser automation can be added later if the project gains tooling.

## Low Priority

### ENG-021: Add Save/Load Boundaries

**Status:** Backlog

**Goal:** Define boundaries for serializable simulation state and user settings.

**Why:** Save/load becomes difficult if renderer objects, DOM nodes, images, and gameplay state are mixed.

**Scope:**
- Identify which state is serializable.
- Separate user settings from level/session state.
- Define restore behavior for the current level.

**Acceptance Criteria:**
- Serializable state excludes canvas contexts, DOM nodes, `Image` objects, and RAF handles.
- User settings such as quality, fog, and debug preferences have a clear storage path.
- A future save/load implementation has documented state boundaries.
- Current runtime behavior remains unchanged.

**Notes:**
- Actual persistent saves can be a later ticket.
- This depends on explicit state slices.

### ENG-022: Add Plugin-Style Extension Points

**Status:** Backlog

**Goal:** Provide extension points for registering new tile types, entity types, systems, and render layers.

**Why:** A game engine should allow new game features without editing core engine modules.

**Scope:**
- Define registration APIs or config shapes.
- Support tile, entity, update system, and render layer registration.
- Keep default game registration explicit.

**Acceptance Criteria:**
- New tile and entity types can be registered outside core engine modules.
- New update/render systems can be added through the extension mechanism.
- Existing game content is registered through the same path where practical.
- Core engine modules do not need hardcoded knowledge of every game-specific type.

**Notes:**
- This should come after system registry and tile metadata work.
- Keep extension points local and simple; no package/plugin loader is needed.

### ENG-023: Add Namespaced Config Files

**Status:** Backlog

**Goal:** Split configuration into engine defaults, game defaults, renderer settings, controls, and debug flags.

**Why:** `src/config/constants.js` currently contains math constants, renderer settings, HUD settings, door tuning, key IDs, and look controls together.

**Scope:**
- Group constants by ownership.
- Preserve public imports or update callers cleanly.
- Keep project-wide defaults easy to find.

**Acceptance Criteria:**
- Engine, game, renderer, input, debug, and interaction constants are separated or clearly namespaced.
- Existing imports are updated without behavior changes.
- Door, keycard, FOV, quality, HUD, and look-pitch settings retain their current values.
- New config locations are documented by file names and structure.

**Notes:**
- Do this after larger boundaries are clearer to avoid churn.
- Avoid splitting into too many tiny files.

### ENG-024: Add Asset Preloading

**Status:** Backlog

**Goal:** Add asset preloading with loading progress, failed asset fallbacks, and cache reuse across scenes.

**Why:** Images currently load as entities are constructed. That can cause incomplete rendering and makes scene transitions harder.

**Scope:**
- Load assets from the manifest before gameplay starts.
- Track load progress and failures.
- Reuse loaded assets across scenes or restarts.

**Acceptance Criteria:**
- Gameplay starts after required assets are loaded or fallback assets are ready.
- Failed assets produce predictable fallback visuals or errors.
- Entities and renderers receive loaded assets by ID.
- Current remote textures and sprites still render.

**Notes:**
- This should follow asset manifest work.
- A loading screen can be minimal at first.

### ENG-025: Add Audio Service Abstraction

**Status:** Backlog

**Goal:** Add an audio service boundary before adding many sound effects.

**Why:** Audio tends to spread quickly through gameplay systems. A service keeps playback, volume, muting, and asset IDs centralized.

**Scope:**
- Define an audio service API.
- Support event-driven playback.
- Include basic master volume/mute settings.

**Acceptance Criteria:**
- Gameplay systems can request sounds without directly constructing audio elements.
- Audio assets are referenced by IDs.
- Mute and volume can be controlled centrally.
- No gameplay behavior depends on audio playback success.

**Notes:**
- This can wait until event and asset systems exist.
- Actual sound content is a gameplay/content backlog concern.

### ENG-026: Add Camera Abstraction

**Status:** Backlog

**Goal:** Add a camera abstraction so future games can swap first-person raycast, minimap, or other camera/render modes.

**Why:** Rendering currently assumes the player is the camera. A camera boundary enables cutscenes, spectator views, editor views, and alternate render modes.

**Scope:**
- Define camera state separately from player state.
- Let renderers read camera data through a stable interface.
- Keep the current player-driven camera as the default.

**Acceptance Criteria:**
- Raycast rendering can use a camera object instead of directly reading all view data from the player.
- Current camera position, angle, pitch, and FOV behavior remains unchanged.
- Minimap/player rendering still works.
- Future camera modes can be added without rewriting player movement.

**Notes:**
- This should follow state slicing and renderer boundary work.
- Keep first-person camera behavior identical initially.

### ENG-027: Add Engine Documentation

**Status:** Backlog

**Goal:** Document engine concepts, module boundaries, system order, entity data contracts, and level authoring.

**Why:** Refactors only help if future contributors understand the architecture and extension points.

**Scope:**
- Add docs for runtime lifecycle, state slices, systems, rendering, input, assets, tile metadata, and levels.
- Include examples for adding a tile, entity, system, and level.
- Keep docs aligned with actual code.

**Acceptance Criteria:**
- Documentation explains the current engine architecture after refactors.
- System order and state ownership are explicit.
- Level and asset authoring examples are included.
- Docs do not describe aspirational APIs that do not exist yet.

**Notes:**
- This should be updated incrementally as engine tickets land.
- Could live in `docs/` once docs grow beyond one file.

### ENG-028: Consider Optional Build/Test Toolchain

**Status:** Backlog

**Goal:** Evaluate an optional build/test toolchain only after engine boundaries stabilize, while keeping GitHub Pages-safe static output as the default.

**Why:** Tooling can help tests, bundling, and linting, but premature tooling would distract from the current static-site simplicity.

**Scope:**
- Evaluate whether a toolchain is needed for tests, linting, bundling, or asset processing.
- Keep plain static deployment as the primary path.
- Document tradeoffs before adopting anything.

**Acceptance Criteria:**
- Any proposed toolchain has a written rationale and migration path.
- Static GitHub Pages deployment remains supported.
- Source modules continue to use explicit `.js` imports or have an equivalent deploy-safe build output.
- Tooling is optional unless the project explicitly decides otherwise.

**Notes:**
- Do not add dependencies as part of this ticket unless a separate implementation ticket approves it.
- This is intentionally low priority.
