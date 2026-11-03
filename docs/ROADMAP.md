# Roadmap

This file is the plan of ste-lint. The Status page of the site reads it.

| ID | Item | Status | Summary |
| --- | --- | --- | --- |
| S1 | The conventions check in CI | in progress | CI starts `pnpm check:conventions` of `@mark1russell7/conventions` 0.22.0. A run of `main` then ends, and a newer push cancels only the run of a pull request. |
| S2 | No build output in git | not started | Git keeps `dist/`, because a git dependency needs no build at install. When each user installs the package from npm, `dist/` goes out of git. Until then, the rules `no-build-output` and `typed-scripts` keep an exception for `dist/`. |
| S3 | The site probe in TypeScript | not started | The probe of the site check, `site/check-probe.js`, is JavaScript. The site check can start a TypeScript probe. The probe needs type declarations for the helpers of the site check. Then its exception of `typed-scripts` goes. |
