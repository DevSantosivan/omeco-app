# Admin module implementation

The existing Angular 22 standalone application now has dedicated lazy-loaded Admin research workspaces. Business repositories, role routing, Member intake and Field Worker map integration remain connected. This is a frontend demonstration, not a deployed operational system or validated research implementation.

## Routes and implemented interactions

| Route                           | Interface and actions                                                                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/dashboard`              | Six repository-derived KPIs, dated concern chart, category distribution, real boundary map preview, recent incidents, crew availability, dispatch queue, service-area summary, repairs and activity timeline. |
| `/admin/complaints` and `/:id`  | Existing review/list workflow preserved; shared map foundation upgraded. Classification approval now preserves operational status.                                                                            |
| `/admin/dispatch`               | Pending queue, selected incident, crew expertise/availability, map connection, explicit dispatcher confirmation and approval audit. No automatic AI dispatch.                                                 |
| `/admin/map`                    | Dedicated incident map, geography/category/priority/status/date filters, incident queue/detail panel, polygon details and unmapped-record count.                                                              |
| `/admin/nlp-review`             | Bilingual review queue, search/language/review filters, preprocessing explanation, simulated confidence/category distribution, approve/override and history.                                                  |
| `/admin/priority-prediction`    | Routine/Urgent/Critical summaries, distribution, ranking, household/severity factors, explanation, human override with reason and history.                                                                    |
| `/admin/temporal-trends`        | Daily/weekly/monthly observations, date/category filters, seasonal comparison, reporting peaks, category series, historical table and separate illustrative forecast/model selectors.                         |
| `/admin/spatial-hotspots`       | Interactive real boundaries, count-based density styling, geography/category/priority filters, affected barangays, recurrence and selected area information.                                                  |
| `/admin/restoration-estimation` | Incident selection, duration/factor demonstration, crew/progress information, seeded completion comparisons, estimate-versus-actual charts and review log.                                                    |
| `/admin/reports`                | Shared filters, KPI/category/monthly summaries, incident history, filtered CSV export and print stylesheet. `/admin/analytics` preserves its URL as an alias.                                                 |
| `/admin/users`                  | Member/staff/admin directory, query/role/status filters, pagination, details, confirmed demo role/status changes. Directory edits do not alter the three fixed demo login fixtures.                           |
| `/admin/model-monitoring`       | Four untrained model readiness cards, dataset requirements, unavailable evaluation/version fields, illustrative UI runs and history. No fabricated measured metrics.                                          |
| `/admin/audit-trail`            | Chronological events, actor/action/date/query filters, selected details, seeded-versus-demo-action labels.                                                                                                    |
| `/admin/settings`               | Profile/display/notification preferences, light/dark theme, compact density, persistence, prototype information, session controls and confirmed sample restoration.                                           |

The generic Admin insight page was removed. Its ten research/management destinations (NLP, priority, temporal, spatial, restoration, reports, users, monitoring, audit and settings) now use individual components, templates, nested SCSS and typed view models. The incident-map destination also has a dedicated workspace. Field Worker placeholder routes outside this Admin task were preserved.

## Geographic validation

Source inspected and copied without modification:

`C:\Ivan-dev\PROJECTS\TYPHOONIMPACT-MIN\frontend\public\assets\barangays.geojson`

Destination: `public/assets/geo/barangays.geojson`. The two files have SHA-256 `10606e46cd7b4b34a61f4975f3568bb3c11a48fa355cbe3c4d78c3737e0fcfa9` (66,937,084 bytes).

- Valid FeatureCollection: 42,026 features, 40,910 Polygons and 1,116 MultiPolygons; 243,730 coordinate positions. No nonfinite/out-of-range coordinates or unclosed rings found.
- GeoJSON coordinates remain `[longitude, latitude]`; Leaflet receives `[latitude, longitude]`.
- National extent: longitude 114.277901686–126.602407634, latitude 4.587390601–21.121755276. Properties include `ADM4_EN`, `ADM4_PCODE`, `ADM3_EN`, `ADM2_EN`; metadata date 2022-11-09 and validOn 2023-11-06.
- Province subset preserves 164 available Occidental Mindoro barangay features across 11 municipalities.
- Operational subset preserves 139 available features across OMECO's nine listed service municipalities: Abra de Ilog, Calintaan, Magsaysay, Mamburao, Paluan, Rizal, Sablayan, San Jose and Santa Cruz. Looc/Lubang's 25 features are excluded from operational demo maps and seeds. Service-list source: [OMECO About Us](https://www.omeco.com.ph/about-us).
- This validates the supplied file's structure and available coverage, not current legal boundary accuracy or complete contemporary PSGC coverage. Original polygon geometry is retained; no boundaries invented.
- Reproducible scripts: `node scripts/prepare-geo.cjs`, `node scripts/seed-admin.cjs`, `node scripts/verify-demo-geo.cjs`. The latter verifies every seeded incident lies inside its associated polygon, with matching municipality, member, crew and valid timestamp.

Leaflet now provides OSM attribution, polygon hover/selection/details, priority markers, screen-space low-zoom clustering, simulated crew markers, layer controls, bounds reset and ResizeObserver invalidation. Dashboard, incidents, spatial analytics, complaint review, dispatch and Field Worker map share this foundation. Optional crew-to-incident lines explicitly say **Illustrative connection — not a road route**. No road routing provider, driving distance or travel ETA is fabricated.

## Connected demo data and persistence

Deterministic seed: 96 fictional incidents, 33 directory users, four crews, review flags, seeded restoration durations, 15 simulated audit events and four untrained model readiness records. All KPIs, incident charts, hotspot counts and queues derive from shared records. Crew availability derives from unresolved assignments. New Member reports appear in Admin views; reports without actual coordinates remain unmapped rather than receiving invented GPS positions.

Incident changes/audit records and directory changes survive refresh in this tab through sessionStorage. Display preferences and theme use localStorage. Notification read state is in memory. Photo object-URL previews are transient and are not durable file storage. Corrupted incident session data exposes a recoverable error state. Restoring sample data resets the incident/audit demonstration. Frontend demo authentication and route guards are not production security or backend authorization.

Classification confidence, priority factors, restoration factors, historical records and crew positions are simulated. Forecast selectors illustrate arithmetic mean/multiplier series labelled LSTM/ARIMA/SARIMA demonstrations; they do not execute trained algorithms. Evaluation metrics remain unavailable pending actual training and validation. Counts represent this fictional sample, not actual OMECO statistics. Barangay density is an incident-count visualization, not area-normalized population risk.

## Verification and evidence

Browser interaction checks completed: classification approval and category override; priority override with reason; municipality/barangay map filtering and visible original polygons; layer/illustrative connection toggles; dispatcher confirmation; paginated user enable confirmation; model-demo audit logging and event filtering; restoration review; temporal category/month/model selection; compact preference save/reload; filtered CSV download; Member submission appearing in Admin totals. The QA session contains one additional fictional Member record, so screenshots show 97 records while fresh seeds contain 96.

Final responsive sweep covered all 14 Admin navigation destinations at **360, 375, 390, 430, 768, 1024, 1366 and 1440 pixels**: 112 checks, zero document-level horizontal overflow. Tables intentionally scroll inside their containers. Screenshots at 390 and 1440 are saved per route in `artifacts/admin-module-review`; `viewports.json` records the checks. Desktop/mobile screenshots were inspected, including the actual polygon layer. Boxicons render through the existing genuine local SVG-mask wrapper; DM Sans and Space Grotesk remain locally bundled.

Production build, Angular ESLint, Prettier and relevant Vitest checks were run. The final test suite contains nine tests across four files, including repository persistence/recovery, crew availability, connected review data, filters and existing authentication. Geo verification passes for all 96 seed incidents and four crew positions. Physical print/PDF pagination and a real routing service were not verified; print-friendly CSS is implemented. This is browser prototype validation, not a comprehensive accessibility, security or production load audit.

Detailed file inventory: [ADMIN_FILES_CHANGED.md](ADMIN_FILES_CHANGED.md). Local review server: `http://127.0.0.1:4320/admin/dashboard` while its development process remains running.
