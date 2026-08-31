# Change Log

All notable changes to the "archipelacode" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Changed

- Submitting is now done on leetcode.com instead of from inside the editor.
  `Submit current code to LeetCode` opens the problem in your browser and waits
  for you to submit it there, then picks the result up automatically and sends
  the check. LeetCode's `interpret_solution` and `check` routes sit behind a
  Cloudflare rule that challenges the TLS fingerprint of the VS Code extension
  host, and no combination of headers, cookies or ciphers reachable from the
  extension gets past it. GraphQL reads are unaffected, so the submission list
  is polled instead.

### Fixed

- Solutions are now verified against the code LeetCode actually judged rather
  than against the editor buffer, so submitting in the browser can't be used to
  get around the language features your slot hasn't unlocked yet.

## [0.0.1] - 2026-01-01

### Added

- All of the base logic.