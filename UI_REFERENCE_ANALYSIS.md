# OMECO UI Reference Analysis

**Reviewed:** 8 November 2026  
**Purpose:** Extract interaction and layout patterns for a utility concern system. These references informed the interface; their branding, markup, and visual assets were not copied.

## Admin / dispatcher

- **TailAdmin Angular** — [repository](https://github.com/TailAdmin/free-angular-tailwind-dashboard). Its current project describes itself as Angular 22+, with a sidebar dashboard, charts, tables, forms, and component coverage. The useful patterns are the persistent workspace navigation and reusable operational widgets. The repository uses Tailwind, so OMECO uses its layout ideas only and keeps SCSS.
- **CoreUI Angular** — [Angular components and templates](https://coreui.io/angular/). The catalog groups buttons, badges, breadcrumbs, sidebars, cards, tables, form controls, progress, and toasts. OMECO follows that component taxonomy, while retaining its own tokens and styling rather than adopting a Bootstrap theme.
- **ngx-admin** — [demo](https://akveo.github.io/ngx-admin/). The demo endpoint exposed only an embedded shell to the research browser, so no screen-specific observations were used. Its modular dashboard concept is reflected in keeping analytics and operations screens behind distinct routes.

## Member / consumer

- **Customer support mobile patterns** — [Dribbble search](https://dribbble.com/search/customer-support-mobile-app). The results emphasize mobile navigation, clear task CTAs, and support status. OMECO applies those ideas through a single report action, a concise report timeline, readable update cards, and a five-item bottom bar.
- **Mobbin** — [mobile and web app reference library](https://mobbin.com/). Its focus on shipped app screens is useful for checking familiar interaction patterns. OMECO keeps the service workflow familiar: a short concern form, a confirmation reference, and a visible progress history.
- **Electricity mobile app search** — [Behance](https://www.behance.net/search/projects/electricity%20mobile%20app). The search page could not be retrieved in the research browser; no project-specific claims or copied patterns are attributed to it.

## Field worker

- **Field service and device management** — [Dribbble project by Qala Studio](https://dribbble.com/shots/27109556-Field-Service-Device-Management-Mobile-App). The project description calls out assignment overview, status tracking, photo/video feedback, and direct “start work” actions. OMECO uses those concepts for assignment cards, work-order state, and on-site evidence capture, with larger touch targets for outdoor use.
- **Field service mobile search** — [Behance](https://www.behance.net/search/projects/field%20service%20mobile%20app). The search page was inaccessible to the research browser, so only the accessible Dribbble case is used for specific observations.

## GIS and analytics

- **GIS dashboard search** — [Dribbble](https://dribbble.com/search/gis-dashboard). The result taxonomy links maps with cartography, charts, analytics, and stats. OMECO combines the Leaflet incident map with filters, priority markers, and nearby crew summaries so the map remains tied to a dispatch decision.
- **Utility dashboard search** — [Behance](https://www.behance.net/search/projects/utility%20dashboard). The search page was inaccessible to the research browser. No project-specific visual claims are made from it.

## OMECO design decisions

- Keep the dispatcher sidebar and topbar persistent on wide screens; let filters and tables sit close to the operational summaries they control.
- Give members and field staff separate mobile navigation and task-first pages rather than compressing the dispatcher dashboard.
- Use priority color only for urgency, reserve red for critical concerns, and label sample data and model demonstrations in place.
- Keep the field-worker primary action visible on assignment cards and map controls large enough for touch.
- Present model explanations alongside predictions, and keep a dispatcher approval action explicit before a recommended crew is assigned.

The provided OMECO palette and DM Sans / Space Grotesk typography remain the source of truth for the product’s visual identity.
