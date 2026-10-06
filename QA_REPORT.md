# Final local verification

Verified on Windows with Node.js 24.19 and the pnpm dependency lockfile, most recently on 6 October 2026 after adding Japanese/English switching. This report describes software behavior, not real-world traffic accuracy or emergency safety.

## Automated checks

| Check                                    | Result                                              |
| ---------------------------------------- | --------------------------------------------------- |
| Dependency installation, frozen lockfile | Passed                                              |
| ESLint, zero warnings permitted          | Passed                                              |
| Prettier source formatting               | Passed                                              |
| Strict TypeScript, no emit               | Passed                                              |
| Vitest unit and dataset audit            | 28 passed across 5 files                            |
| Playwright, production server            | 20 passed: 10 desktop and 10 mobile Chromium checks |
| Optimized Next.js production build       | Passed                                              |

The browser checks use the actual production application, not a simulated UI. They cover the seven-step earthquake sequence, changing computed KPIs, three closed SVG links, direct map-link selection and facility popups, normal/scenario route overlays, custom closures and restoration, same-origin routing, all disruption presets, conditional stress testing, clear/reset, dialogs and Escape, JSON downloads, narrow layout overflow, blocked map tiles, isolated origins, trusted API recomputation, Skip and cancellation of stale demo timers. The main demo records page errors and requires none.

The data audit checks unique IDs, valid endpoints, reference connectivity and facility reachability, conserved demand and finite link costs. Graph tests cover one-way links, nonnegative custom weights, closed edges and unreachable nodes. AI provider tests mock structured outputs and failures.

The later publication-safeguard verification adds four passing tests: anonymous author/committer history and empty templates, blocked private files and personal information with redacted output, older personal commit metadata, and credentials deleted from the current tree but still present in history. These tooling changes do not alter the app's simulation or interface; the production browser results above describe the last app verification.

Localization checks cover all static UI translations, dataset names and scenario descriptions; Japanese local evidence, Japanese provider prompts/output validation and fallback language; preserved closures, route endpoints and KPIs when switching; translated map labels, legends and Methodology; saved language after reload; separate API language caches and invalid locale rejection. Browser tests also switch languages during a running demo with browser storage disabled and check both languages at 320px width. The narrow English timeline originally overflowed; removing connector arrows at that breakpoint fixes it while retaining every numbered step.

## Reproducible model evidence

| Indicator             |      Normal |  Earthquake |
| --------------------- | ----------: | ----------: |
| Average assigned trip | 14.2284 min | 20.8575 min |
| Essential access      |    94.4266% |    78.8853% |
| Efficiency            |     43.7606 |     37.5281 |
| Congestion delay      |    11.9492% |    29.3037% |
| Resilience            |         100 |     69.4471 |
| Disconnected demand   |           0 |           0 |

The earthquake closes Harbor Bridge, East Rail Connector and Coastal Road. Port Bypass receives about 3,674 person-trips per model hour, compared with 426 before disruption. East district's average trip grows from 14.8 to 29.2 minutes. Independently reopening Harbor Bridge improves resilience by 16.2177 points and access by 6.5380 points. None of these is a hardcoded display value.

## Visual and interactive verification

Inspected the production application in the in-app browser at desktop and narrow mobile sizes. Confirmed map fit, closed-link styling, route overlays, source-labeled local brief, Japanese controls and translated network names. Browser regression checks require no page errors in the demo and language-switch flows. Reviewed the actual overview, chart, critical/recovery and analyst captures; ten images are included in `docs/screenshots/`, including Japanese desktop, analyst and mobile captures.

Production-only verification caught missing Leaflet path CSS classes. They are now provided at path construction rather than in later style updates. The passing production browser checks retain regression coverage for closures, overlays and dotted rail patterns. Map resize callbacks also stop after component cleanup. The API origin check uses the external request host rather than Next's internal localhost URL; unit and browser checks cover legitimate same-origin requests and rejection of unrelated origins.

## Repeat the checks

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start --port 3001
```

In a second terminal, set `RESILIROUTE_URL=http://127.0.0.1:3001` using your shell's environment-variable syntax, then run `pnpm test:e2e` and `pnpm screenshots`. In PowerShell, use `$env:RESILIROUTE_URL='http://127.0.0.1:3001'`. Without that variable, E2E uses a dev server on port 3000.

## Verification boundaries

- No real OpenAI key was supplied. The live paid API path is implemented and mock-tested; a real upstream model response remains unverified.
- No public web deployment or Devpost form submission is claimed. The completed 3:50 product film, bilingual subtitles, narration, thumbnail and video checks are provided in `video/deliverables/`; large media is kept outside Git. See `video/README.md` for the editable source and reproduction steps.
- Tests do not establish regulatory compliance, validated traffic prediction, convergence to equilibrium, real infrastructure safety or mobile Safari compatibility. Mobile automation uses Chromium.
- Background OpenStreetMap availability is external; intentional tile failures were tested and the schematic network remains functional.
- Production AI cost controls are per server process. A substantial public deployment requires shared limiting and hosting/account configuration.
