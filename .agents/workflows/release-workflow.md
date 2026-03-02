---
description: Before pushing commits, verify the package version and update the CHANGELOG
---

When the USER asks you to prepare a new release, commit changes, or finalize a set of tasks before pushing to GitHub, you MUST perform the following checks:

1. **Verify `package.json` Version Bump:**
   - Read the current `version` string in `package.json`.
   - Determine if a Major, Minor, or Patch version bump is appropriate based on the tasks you just completed.
   - Use the `replace_file_content` tool to bump the version string in `package.json`.

2. **Update `CHANGELOG.md`:**
   - Read `CHANGELOG.md`.
   - Move any completed items under `## [Unreleased]` into a new version header matching the bumped version (e.g., `## [0.8.1] - <current-date>`).
   - Clearly summarize the tasks and bug fixes completed in this block using Keep A Changelog formatting (`### Added`, `### Changed`, `### Fixed`, `### Removed`).
   - Use the `replace_file_content` tool to apply these changes.

3. **Verify Build Process Locally:**
   - Use the `run_command` tool to execute `npm run compile`.
   - Use the `run_command` tool to execute `npx vsce package --no-dependencies`.
   - Only proceed with the `git commit` and `git push` if these terminal commands succeed without throwing Webpack errors or packaging constraint errors.
