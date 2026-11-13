# OMECO Concern Intelligence

A standalone Angular 22 frontend demonstration for electrical cooperative member concerns, dispatcher intelligence, and field operations. The app uses centralized simulated records only; it does not connect to a backend or trained machine learning model.

## Requirements

- Node.js `^22.22.3` or `^24.15.0` (Angular 22 supported lines)
- npm 11

## Run locally

```powershell
npm install
npm start
```

Open `http://localhost:4200/login` and select one of the role demo accounts. The development login uses email only:

- `admin@omeco.demo` — dispatcher command center
- `member@omeco.demo` — member app
- `staff@omeco.demo` — field operations app

Demo authentication and frontend route guards are for development navigation only. They are not production security and do not replace server-side authentication or authorization.

## Workflows

- Admin: dashboard, complaint search/filter and review, bilingual NLP review interface, simulated XGBoost priority interface, dispatcher-approved crew dispatch, Leaflet/OSM incident map, temporal and spatial research panels, estimation and model monitoring screens.
- Member: mobile-first home, concern submission with validation, Filipino/English language choice, household count, browser geolocation, photo previews, report tracking, updates, and profile.
- Field Worker: mobile-first shift dashboard, assignments, assignment detail with work progress controls, GIS map, work-order and history screens.

All numbers, records, model outputs, forecasts, locations without GPS, crew matches, and notices are simulated. The interface does not claim models are trained or validated. AI recommendations remain advisory; a dispatcher must explicitly approve every dispatch.

## Architecture

- `src/app/core` — demo auth, guards, services, API interceptor
- `src/app/data/mock` — centralized simulated concern data
- `src/app/data/repositories` — repository abstraction and mock implementation
- `src/app/features/admin`, `member`, `field-worker` — isolated role feature screens
- `src/app/layouts` — separate admin, member, and field operations shells
- `src/app/shared/components` — reusable buttons, headers, cards, status and notifications
- `src/app/models` — domain and auth types
- `src/styles` — centralized SCSS tokens, mixins, themes, reset, utilities
- `src/environments` — API integration configuration

Each page uses a lazy-loaded route. Replace `MockConcernRepository` with an API-backed repository when a backend is ready; keep presentation components independent of data transport.

## Quality commands

```powershell
npm run build
npm run lint
npm test
npm run format
```

## Integration notes

The demo persists its role session in `sessionStorage` and theme in `localStorage`. The API prefix interceptor is prepared for future ASP.NET Core API integration. Leaflet uses OpenStreetMap tiles; tile availability requires internet access. Avoid using demo data as operational or research evidence.

## Admin research workspaces and GIS

All Admin navigation destinations now have dedicated interfaces backed by 96 connected fictional seed incidents. The shared Leaflet foundation displays 139 supplied barangay features across OMECO's nine listed service municipalities. The unchanged national source copy and province subset are retained under `public/assets/geo`; operational views load the smaller service subset.

See [ADMIN_IMPLEMENTATION_REPORT.md](ADMIN_IMPLEMENTATION_REPORT.md) for geographic provenance, route functionality, simulation limits, persistence, browser evidence and the exact file inventory. Regenerate and validate data with `node scripts/prepare-geo.cjs`, `node scripts/seed-admin.cjs` and `node scripts/verify-demo-geo.cjs`; then run Prettier on generated TypeScript.
