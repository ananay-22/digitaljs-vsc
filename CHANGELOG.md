# Changelog

All notable changes to the DigitalJS VS Code Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.3] - 2026-03-02
### Fixed
- Fixed critical `ReferenceError: tmpDir is not defined` bug during sandbox initialization that broke the entire `run_yosys` pipeline. Properly re-declared isolated namespace IO paths (`ysScriptPath`, `outJsonPath`, `randId`) that were accidentally dropped in previous refactors.


## [0.8.2] - 2026-03-02
### Added
- Added a dedicated VSCode Output Channel (`DigitalJS`) for telemetry and verbose logging.
- Wrapped `Yosys` AST conversions cleanly to propagate compilation errors to the user UI instead of ambiguous "Unknown Error" toasts.

### Fixed
- Fixed critical bug where the `webview-ui-toolkit` JS and `codicons` CSS would fail to bundle into the packaged `.vsix` installer, resulting in the Synthesis UI components rendering as raw text.


## [0.8.1] - 2026-03-02
### Added
- Added `.agents/workflows/release-workflow.md` agent directive prompt to enforce automated version bumping upon release.
- Bootstrapped `CHANGELOG.md` file system for semantic tracking.
- Implemented actual `digitaljs` VSCode initialization and command integration verification tests.

### Changed
- Switched standard `requests.mjs` synthesis block into a clean, flat `/tmp/yosys_sandbox_<id>` folder layout, removing global `-I` include bindings. Only modules explicitly defined in the VSCode DigitalJS Files tab will successfully compile now.

### Fixed
- Fixed bug where clicking on schematic components would fail to highlight the related Verilog code within the VSCode editor (resolved by feeding non-absolute `info.name` maps down into the Yosys compilation sandbox strings).

## [0.8.0] - 2026-03-02
### Fixed
- Fixed UI options panel rendering by reverting `@vscode/webview-ui-toolkit` to `0.9.3`.

## [0.7.3] - 2026-03-02
### Changed
- Replaced WebAssembly Yosys with local `yosys` binaries for faster synthesis.
- Upgraded multiple NPM dependencies and Webpack configs.
- Replaced direct VS Code Marketplace publishing with automated GitHub Actions `.vsix` packaging on `main` branch.
- Added a dedicated "Save Image" button to the UI for exporting PNG/SVG vectors of the circuitry.
### Fixed
- Resolved Verilog `include` pathing logic during offline synthesis runs.
- Fixed `digitaljs` OpenSSL build errors during `npm ci` environments.
