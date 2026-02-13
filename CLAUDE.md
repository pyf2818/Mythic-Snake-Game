# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mythic Snake** (神话贪吃蛇) is a roguelike snake game built with vanilla JavaScript and HTML5 Canvas. The game features:
- Wave-based enemy spawning system
- Boss battles (every 3 waves)
- Equipment and inventory systems
- Organ evolution mechanics
- Weather/disaster systems with particle effects
- Time management (day/night cycles, seasons)
- localStorage-based save system
- No external dependencies or build tools required

## Quick Start

**Running the game:**
- Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge)
- No build step, compilation, or server required
- Game runs entirely client-side

**Running tests:**
- Open `test.html` in a browser to run the test suite
- Tests use a custom test framework defined in `js/test/GameTests.js`

## Development Commands

Since this is a pure HTML/JS/CSS project with no build system:

```bash
# Open the game in default browser (Windows)
start index.html

# Open the game in default browser (Linux/Mac)
xdg-open index.html  # or open index.html on Mac

# Run tests
# Open test.html in browser manually
```

## Code Architecture

### Directory Structure

```
js/
├── core/              # Core game engine components
│   ├── GameManager.js    # Main game loop, object management, state
│   ├── Snake.js          # Player-controlled snake logic
│   └── TimeManager.js    # Time tracking anddelta calculations
├── entities/          # Game entity classes
│   ├── Boss.js           # Boss enemy behavior and phases
│   ├── DroppedItem.js    # Loot and pickup items
│   └── EnemySprites.js   # Enemy visual definitions and animations
├── systems/           # Independent feature systems
│   ├── AudioManager.js       # Sound effects and music
│   ├── BossManager.js        # Boss spawning, phases, drops
│   ├── BulletSystem.js       # Player and enemy projectile handling
│   ├── CardSystem.js         # Roguelike cardUpgrade system
│   ├── EnergySystem.js       # Player energy management
│   ├── FlashSkill.js         # Dash/blink ability
│   ├── GameUIManager.js      # HUD and game UI
│   ├── InventorySystem.js    # Equipment management
│   ├── NotificationManager.js # UI notifications
│   ├── OrganEvolution.js     # Skill tree/organ upgrades
│   ├── SaveManager.js        # localStorage persistence
│   ├── WeatherDisasterManager.js # Dynamic weather events
│   ├── Wormhole.js           # Teleportation mechanics
│   └── [other systems]
├── environment/       # World and terrain systems
│   ├── DayNight.js       # Lighting and visibility
│   ├── Season.js         # Seasonal effects
│   ├── Terrain.js        # Map generation and obstacles
│   ├── LiquidPhysics.js  # Water/magma handling
│   └── EnvironmentalZones.js # Area-based effects
├── visuals/           # Rendering
│   └── Renderer.js       # Canvas rendering, particles
├── ai/                # Artificial intelligence
│   └── AIController.js   # Enemy AI behavior
└── game.js            # Additional game classes (Food, Enemy, EnemyBullet, GameDataManager)

css/
└── style.css          # All styles (100KB, heavily commented)

assets/                # Game assets (images, sounds if any)
docs/                  # Development documentation and optimization plans
```

### Key Architectural Patterns

**1. System-Based Architecture**
- `GameManager` acts as the central orchestrator (dependency injection pattern)
- All systems registered in `this.systems` object
- Systems receive `gameManager` reference on construction
- Systems have optional `reset()` method called on new game

**2. Game Loop**
- RequestAnimationFrame-based loop in `GameManager.startGameLoop()`
- Systems update via `system.update(deltaTime)` calls
- Rendering delegated to `Renderer` system

**3. Entity Management**
- All game objects stored in `gameManager.gameObjects` array
- Objects have `type` property for filtering
- Systems use `getObjectsByType(type)` to query entities
- Objects removed via `removeGameObject(obj)`

**4. Event-Driven Input**
- Global event listeners in `GameManager.setupEventListeners()`
- Input state tracked in `this.input` with `keys` and `mouse`
- Systems poll input state rather than receiving events directly

**5. localStorage Persistence**
- `SaveManager` handles all serialization
- Multiple save slots supported (3 slots)
- Auto-save on major events

## Important Files

### Core Entry Points
- `index.html:775-820` - All script tags defining load order
- `js/core/GameManager.js` - Main class, initialization and game loop
- `js/game.js` - Contains Food, Enemy, EnemyBullet, GameDataManager classes

### System Initialization
`GameManager.initSystems()` (line 150) shows all systems and their dependencies:
```javascript
this.systems.timeManager = new TimeManager(this);
this.systems.organSystem = new OrganEvolution(this);
this.systems.terrain = new Terrain(this);
this.systems.dayNight = new DayNight(this);
this.systems.season = new Season(this);
this.systems.liquidPhysics = new LiquidPhysics(this);
this.systems.wormhole = new WormholeSystem(this);
this.systems.environmentalZones = new EnvironmentalZones(this);
this.systems.jetEffectManager = new JetEffectManager(this);
this.systems.audioManager = new AudioManager(this);
this.systems.notificationManager = new NotificationManager(this);
this.systems.saveManager = new SaveManager(this);
this.systems.environmentalObjects = new EnvironmentalObjectsManager(this);
this.systems.seasonalFallingObjects = new SeasonalFallingObjectsManager(this);
this.systems.weatherDisaster = new WeatherDisasterManager(this);
this.systems.renderer = new Renderer(this);
this.systems.uiSystems = new UISystems(this);
this.systems.bulletSystem = new BulletSystem(this);
this.systems.cardSystem = new CardSystem(this);
this.systems.inventorySystem = new InventorySystem(this);
```

### Testing
- `js/test/GameTests.js` - Test framework and test cases
- `test.html` - Test runner interface
- Run tests by opening `test.html` in browser

## Script Loading Order (Critical)

The load order in `index.html` matters due to dependencies:

1. Core classes first (TimeManager, Terrain, DayNight, Season, LiquidPhysics, EnvironmentalZones, EnvironmentalObjects)
2. Systems that depend on core (OrganEvolution, EnergySystem, Wormhole, etc.)
3. Entity classes (DroppedItem)
4. High-level systems (InventorySystem, FireRateEnhancer, GameUIManager, UIAnimations, UISystems, LeaderboardManager, ScoreCoinUI)
5. Finally, `game.js` which contains Food, Enemy, EnemyBullet, and GameDataManager

**Note**: The Boss system uses global `window.BossManager` check, so `BossManager.js` must define that global before `GameManager.initSystems()` runs.

## Wave System

The wave system (`GameManager.waveSystem`) is central to progression:
- Starts at wave 0
- Increases difficulty every 25 seconds
- Every wave: +1 enemy spawn count, +10% difficulty
- Every 3rd wave: Boss fight + card draw
- Every 5th wave: +15% elite enemy chance

Configuration in `GameManager` constructor (lines 36-46).

## Performance Considerations

**Known performance areas:**
- Particle systems in `WeatherDisasterManager.js` and `DisasterVisuals.js`
- Large number of game objects can impact FPS
- Canvas rendering batches effects where possible
- Performance scaling based on FPS monitoring (thresholds: 30 and 45 FPS)

See `docs/particle_optimization_plan.md` and `docs/enemy_optimization_plan.md` for improvement plans.

## State Management

Game state stored in:
- `GameManager.gameState` ('menu', 'playing', 'paused', 'gameOver')
- `localStorage` keys:
  - `highScore`
  - `saveSlot_0`, `saveSlot_1`, `saveSlot_2` (full game state JSON)
  - `achievements`
  - `leaderboard`

## Code Style Conventions

- ES6+ JavaScript with classes
- CamelCase for methods and variables
- PascalCase for classes
- 2-space indentation
- Semicolons required
- Single quotes preferred
- Console logging used for debugging (can be removed in production)

## Common Development Tasks

**Adding a new enemy type:**
1. Add sprite definition in `js/entities/EnemySprites.js`
2. Add enemy creation logic in `GameManager.spawnWave()` or boss patterns
3. Configure stats (size, speed, health, damage) in spawn code
4. Add AI behavior in `js/ai/AIController.js` if special behavior needed

**Adding a new system:**
1. Create file in `js/systems/`
2. Add instantiation in `GameManager.initSystems()`
3. If it needs reset, add `reset()` method and call in `startGame()`
4. Register UI elements in `GameManager.initUI()` or UISystems

**Modifying game balance:**
- Enemy spawn rates: `GameManager.waveSystem` and `enemySpawnInterval`
- Difficulty scaling: `GameManager.spawnWave()` multiplier
- Item/equipment stats: `js/systems/` (e.g., CardSystem.js, InventorySystem.js)

**Debugging:**
- Browser DevTools Console for logs
- Game has built-in debug panel (accessible via debug panel UI in game)
- FPS counter displayed in top-right corner
- Network tab to verify localStorage operations

## Browser Compatibility

Tested on:
- Chrome (recommended)
- Firefox
- Edge
- Safari (partial)

Requires:
- ES6 class support
- `localStorage` API
- `requestAnimationFrame`
- HTML5 Canvas

## Project-Specific Notes

- Game uses `window.gameManager` global for debugging access
- All system errors logged to console; some displayed in-game via `NotificationManager`
- No external CDN dependencies - everything self-contained
- Chinese (Simplified) UI text - maintain localization when adding features
- Scores and coins tracked separately (see `ScoreCoinUI.js`)

## Known Issues

- BossManager depends on global; ensure proper script order
- Large particle counts can cause FPS drops on low-end devices
- localStorage may fail in private browsing mode
- No touch/mobile support currently
