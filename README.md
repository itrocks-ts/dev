[![npm version](https://img.shields.io/npm/v/@itrocks/dev?logo=npm)](https://www.npmjs.org/package/@itrocks/dev)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/dev)](https://www.npmjs.org/package/@itrocks/dev)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/dev?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/dev)
[![issues](https://img.shields.io/github/issues/itrocks-ts/dev)](https://github.com/itrocks-ts/dev/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# dev

Facilitates developments on the it.rocks framework's source code within a single project.

These CLI tools allow you to work on @itrocks/* modules from sources inside a single app,
with Git checkout + local builds and a watcher that rebuilds dependencies as you edit.

## Requirements

- Node.js ≥ 18
- An application depending on one or more `@itrocks/*` packages under `node_modules/@itrocks`.

## Installation

```bash
npm i --save-dev @itrocks/dev
```

Run via `npx`, or declare project scripts.

Every command accepts `-h` or `--help`. Help exits before scanning packages, querying
remote services, changing files, starting a watcher or publishing anything.

## Commands

### `npx check-majors [upgrade]`

Checks **available major version updates** for all `@itrocks/*` modules inside your project.

**What it does:**

- Scans installed `@itrocks/*` packages.
- Queries npm for newer **major** / **minor** / **patch** versions.
- Prints a summary:

```
module-a    1.x → 2.x  available
module-b    up-to-date
```

- If the `upgrade` argument is passed: upgrades version numbers, without installing anything.

Example:

```bash
npx check-majors upgrade
```

Output will clearly show the changes:

```
module-a   updated: 1.2.3 → 2.0.0
module-b   updated: 3.4.1 → 3.6.0
module-c   unchanged
```

The package.json files are modified to get the new version numbers.

**Notes:**

- Requires `vcs-modules` to be run first in order to update the source Git repositories.
- Does not install anything.
- Useful before and to make a mass upgrade.
- Works well together with `npx it-publish` and large Git commits directly from your WebStorm IDE.

### `npx it-publish`

Publishes local `@itrocks/*` packages whose **local version is ahead of npm**.

**What it does:**

- Compares local vs published version using:
  - if the package is **not found** in the search index → treated as **not yet published**;
  - if local version is **greater** than published → **update will be published**;
  - otherwise → reported as **unchanged**.
- Runs `npm publish` (or `npm publish --access public` for packages not yet in the index) in each package directory.

At the end, it prints how many `@itrocks` packages were checked and how many were published successfully.

**Dry-run: `--dry`**

Add `--dry` to **see exactly what would be published**, without touching npm.

```bash
npx it-publish --dry
```

In this mode, the command only prints the intended `npm publish` calls.

The final summary reports how many packages would be published.

**Notes**

- Does not change any `package.json`.
- Does not build your modules.
- Uses the npm search index; very new publications might briefly appear as "not yet published" or "unchanged".

### `npx vcs-modules`

Replaces any `@itrocks/*` package installed from npm with its **Git repository** checkout,
**builds** it locally, and updates WebStorm configuration so the IDE recognises each module as a proper project.

**What it does:**

- Before installing development dependencies, checks existing `node_modules/@itrocks/*` Git checkouts. If any contain
  staged, unstaged, or untracked files, local stashes, or commits absent from known remote branches, dependency
  installation is skipped while the remaining operations continue.
- Scans `node_modules/@itrocks/*` in your app.
- Before cloning, consolidates the modules' development dependencies into the app, using `^major.minor` constraints.
  Existing dependencies are installed only when their required major or minor version increases. The command runs
  `npm install` directly, which may replace existing checkouts; the following cloning step restores the repositories.
- Updates WebStorm configuration file `.idea/vcs.xml` that each `@itrocks/*` module appears
  as a distinct Git root and project module inside WebStorm.
- For each module that’s not already a Git checkout,
  removes the package folder and replaces it with the repository sources, so you can edit them.
- Pulls each Git checkout with `git pull --ff-only` before building it. Repositories with pending changes or commits to
  push are skipped with their Git status and a resolution request, without stopping updates for other repositories.
- Runs the module’s build if a build script exists in its package.json.
- Builds modules in dependency order so shared libraries are ready before dependent ones.

**Notes:**

- Requires each `@itrocks/*` module to have a build script.
- Safe to run multiple times: it will only rebuild or update modules as needed.
- Intended for **local development**, not **CI**.

### `npx wsbuild`

Watches all `@itrocks/*` modules for file changes and rebuild them automatically.

**What it does:**

- Watches all `.ts`  and `.scss` source files under `node_modules/@itrocks/**`.
- On change: detects the modified module, runs its `npm run build` script.

**Notes:**

- Perfect for editing multiple @itrocks/* modules at once in a single environment.
- Your app rebuilds itself using the freshly compiled outputs.
- The build status is displayed in the console.
- Debounces rapid edits to avoid overlapping builds.

## Shared agent instructions

The package stores the common instructions for AI coding agents in
`AGENTS.@itrocks.md`. Running the package build:

```bash
npm run build
```

compiles the TypeScript sources, then copies `AGENTS.@itrocks.md` to
`../AGENTS.md`. From an installed package, this places the generated file at
`node_modules/@itrocks/AGENTS.md`, where its instructions apply to the
`@itrocks` package tree.

Edit `AGENTS.@itrocks.md`, not the generated file. The shared instructions
reference the task-specific guidelines published in the `docs` directory.

## Recommended setup

Add those commands to your `package.json` scripts for convenience:

```json
{
  "scripts": {
    "itrocks:check": "check-majors",
    "itrocks:publish": "it-publish",
    "itrocks:setup": "vcs-modules",
    "itrocks:watch": "wsbuild"
  }
}
```

Then run:

```bash
npm run itrocks:check
npm run itrocks:publish
npm run itrocks:setup
npm run itrocks:watch
```

## Troubleshooting

| Symptom                          | Cause / Fix                                                   |
|----------------------------------|---------------------------------------------------------------|
| No build script for a module     | Add `"build": "tsc"` (or similar) in its package.json.        |
| Changes don’t reflect in the app | Ensure `wsbuild` is running and outputs are used by your app. |
| Watcher does nothing             | Edit files inside `node_modules/@itrocks/<module>/src`.       |
| Command not found                | Run `npm rebuild @itrocks/dev` to restore links.              |
