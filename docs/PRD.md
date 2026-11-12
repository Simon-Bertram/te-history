# Product Requirements Document: TEHS Public Site

**Product:** Tredyffrin Easttown Historical Society public website  
**Repo:** `te-history`  
**Status:** Living requirements — full replacement of [tehistory.org](https://www.tehistory.org)  
**Stack:** Astro 7, Sanity Content Lake, Cloudflare Workers (`@astrojs/cloudflare`), Bun  
**Design:** [DESIGN.md](DESIGN.md) — The Curated Manuscript  
**Engineering:** [AGENTS.md](../AGENTS.md), [FETCHING.md](FETCHING.md), [SEARCH.md](SEARCH.md), [TYPES.md](TYPES.md)

---

## 1. Overview

This site is the Society’s public face: a digital archive, community calendar, publications store, and membership/donation funnel in one Astro application. Visitors should feel like scholars in a private vault, not users of a database.

The product replaces the legacy `tehistory.org` end to end — archives, community engagement, commerce, and conversion — rather than remaining a catalog-only satellite.

### Out of stack

Do not introduce Next.js, a React SPA shell, shadcn, Astro content collections for CMS content, or an embedded Sanity Studio on the public site. Content is authored in the external Studio (`studio-tehs-document-db`) and fetched via GROQ. See [AGENTS.md](../AGENTS.md).

---

## 2. Problem and opportunity

### Legacy information architecture

The legacy site mixed visual discovery (aerial photos, then-and-now) with deep academic databases (deed history, tax lists) under organization-centric tabs such as “Publications.” Casual browsers and deep researchers shared the same cognitive load; neurodivergent and first-time visitors faced a wall of equal-weight links.

### Current Astro footprint

Today this app publishes History Quarterly digital archives, the image and document collections, township research, and entity hubs (people, places, subjects, organizations, properties, families). Membership, events, and the store still live on `tehistory.org` ([`src/pages/about.astro`](../src/pages/about.astro)). Navigation is catalog-flat: Home, Quarterly, Images, Documents, Research, plus footer entity links ([`src/lib/navFallback.ts`](../src/lib/navFallback.ts)).

### Opportunity

An intent-driven hierarchy separates highly visual, cache-friendly discovery from faceted research data sets. That split reduces cognitive load and lets edge routing optimize Explore (CDN image and map tiles) differently from Research Archives (URL-first GROQ, SSR facets, WCAG-compliant tables).

---

## 3. Personas and jobs-to-be-done

| Persona | Primary intent | Primary nav pillar |
| --- | --- | --- |
| Casual browser, educator, nostalgic local | Visual storytelling, low-friction discovery | Explore |
| Historian, genealogist, deep researcher | Faceted search across primary sources | Research Archives |
| Local resident, heritage tourist | Upcoming programs and Society news | News & Events |
| Local resident, researcher buying print | Current issue, books, back issues | Publications & Store |
| Joiner, donor, artifact contributor | Membership, gifts, collecting policies | Get Involved |

---

## 4. Proposed site navigation structure

To serve casual browsers, deep researchers, and community contributors, the information architecture shifts from a flat, organization-centric model (everything listed equally) to a user-centric, intent-driven hierarchy.

By grouping content by user intent — separating highly visual, fast-loading discovery from deep, faceted data sets — we optimize both edge-native routing performance and cognitive load for neurodivergent or casual visitors.

### 4.1 Global header and utility navigation

| Element | Requirement | Suggested route / behavior |
| --- | --- | --- |
| Primary CTA | High-contrast Join / Donate button (Curated Manuscript primary) | `/get-involved` or `/get-involved/membership` |
| Global search | Prominent omnibar powered by edge-native GROQ (and later Pagefind); users can select collection filters (e.g. Images, Deeds, Articles) from the header | `/search?q=&type=` — see [SEARCH.md](SEARCH.md) |
| Utility links | Cart / Store, Contact Us | `/store`, `/contact` |

### 4.2 Main navigation hierarchy

#### 1. Explore

**Target:** Random browsers, educators, nostalgic locals  
**Focus:** Visual storytelling, fast initial paints, low-friction discovery

| Item | Description | Suggested route |
| --- | --- | --- |
| Then & Now | Interactive image sliders of local landmarks | `/explore/then-and-now`, `/explore/then-and-now/[slug]` |
| Interactive Maps | MapLibre-powered historical overlays (Tredyffrin, Easttown, Charlestown) | `/explore/maps` |
| Aerial Photographs | The Dallin Aerial Photo Sampler | `/explore/aerial` |
| Curated Exhibits | Thematic, component-driven learning pathways (e.g. “The Revolutionary War in Tredyffrin,” “Railroad Expansion”) for students and educators | `/explore/exhibits`, `/explore/exhibits/[slug]` |

#### 2. Research Archives

**Target:** Historians, genealogists, deep researchers  
**Focus:** Primary sources and deep databases in one searchable hub

| Item | Description | Suggested route |
| --- | --- | --- |
| Archive Search Hub | Main interface for faceted, complex queries across collections | `/search` (and/or `/research-archives`) |
| History Quarterly Digital Archives (HQDA) | Searchable HTML (and PDF where available) back issues | `/quarterly`, `/quarterly/[slug]` |
| Image Database | Gallery of historic photographs with URL-first facets | `/images`, `/images/[archiveId]` |
| Document & Deed Records | Easttown Deed History, tax lists, census returns, primary sources | `/documents`, `/documents/[archiveId]`; deeds under `/deeds` or documents facets |
| Physical Archives & Policies | Visiting the Berwyn facility, finding aids, TEHS Library Book List | `/research-archives/visit`, `/research-archives/policies`, `/research-archives/library` |
| Entity hubs | People, places, families, subjects, organizations, properties | `/people`, `/places`, `/families`, `/subjects`, `/organizations`, `/properties` |
| Township research articles | Existing research article catalog | `/research`, `/research/[slug]` |

#### 3. News & Events

**Target:** Local residents, heritage tourists  
**Focus:** Community engagement and real-world interaction

| Item | Description | Suggested route |
| --- | --- | --- |
| Event Calendar | Public presentations, guest speakers, meetings | `/events` |
| Community Excursions | Historic walking tours and library exhibits; registration | `/events/excursions` |
| Society News & Awards | Announcements and S. Paul Teamer Awards gallery | `/news`, `/news/teamer-awards` |

#### 4. Publications & Store

**Target:** Local residents, researchers  
**Focus:** Streamlined purchase of physical media

| Item | Description | Suggested route |
| --- | --- | --- |
| The History Quarterly | Current issue details and local distributor list | `/publications/quarterly` (links into `/quarterly` archive) |
| Special Publications | e.g. *The History of Tredyffrin Township*, *Rediscovering Devon* | `/publications` |
| Online Store | Frictionless checkout for back issues and books | `/store` |

#### 5. Get Involved

**Target:** Contributors, joiners  
**Focus:** Membership, financial support, artifact preservation

| Item | Description | Suggested route |
| --- | --- | --- |
| Become a Member | Multi-step progressive forms for household and patron memberships | `/get-involved/membership` |
| Support the Society | General donation gateways | `/get-involved/donate` |
| Donate Artifacts | Collecting policies, Deed of Gift forms, photographic release | `/get-involved/artifacts` |
| About the Society | Board of directors, bylaws, history of the 501(c)(3) | `/about` |

### 4.3 UX and architectural rationale

**Intent-based separation.** The legacy site mixed visual treats (Aerial Photos) with deep academic databases (Deed History) under generic tabs like “Publications.” Splitting into Explore (visual, casual) and Research Archives (text-heavy, academic) lets routing and pre-fetching diverge: Explore aggressively caches optimized images and map tiles via CDN; Research prioritizes fast database queries and WCAG 2.1 AA data tables.

**Streamlined conversions.** Moving Membership, Donate, and Donate to Archives under Get Involved creates a clear pathway for the Joiner/Contributor profile. Progressive web forms replace static PDFs and reduce abandonment.

**Progressive disclosure.** With headless CMS structures, Research Archives lands genealogists on a clean, faceted search hub. They drill into deeds, documents, or images as needed instead of confronting a wall of links.

---

## 5. Current state vs target

Status reflects the Astro public site and Sanity types visible in this repo (`schema.json` from Studio). Studio-only types without public routes count as partial or not started.

| Pillar | Shipped or partial today | Gaps |
| --- | --- | --- |
| **Explore** | Homepage featured images and research; `thenAndNow` in schema (titles only on some hubs); `featuredOnSite` / selected-collection fields | Then & Now pages and sliders; MapLibre overlays; aerial sampler route; curated exhibit document type and routes |
| **Research Archives** | `/search`, `/quarterly`, `/images`, `/documents`, `/research`, entity hubs; URL-first facets on SSR collection pages | Deed UI (`deed` schema unused on frontend); physical archives / policies / library list; header omnibar type filters; Pagefind; document detail prerender alignment |
| **News & Events** | None on this site | Event / excursion / news content models and pages; registration flows |
| **Publications & Store** | Latest Quarterly on homepage; full HQDA at `/quarterly` | Current-issue landing and distributors; special publications; cart and checkout |
| **Get Involved** | Minimal `/about` stub linking back to tehistory.org | Membership forms; donation gateway; artifact intake UX; board, bylaws, contact |

**Navigation migration.** Replace catalog-flat primary links with five-pillar `navMenu` items in the Sanity `siteNavigation` singleton and update [`src/lib/navFallback.ts`](../src/lib/navFallback.ts). Header already supports menus and a search control ([`src/lib/siteNavigation.ts`](../src/lib/siteNavigation.ts), [`SiteHeader.astro`](../src/components/SiteHeader.astro)).

---

## 6. Functional requirements

Rendering stance follows [AGENTS.md](../AGENTS.md): static by default; `prerender = false` only for URL-first faceted GET routes; detail hubs use `getStaticPaths` where practical.

### 6.1 Global chrome

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| G1 | Five-pillar primary navigation | Header shows Explore, Research Archives, News & Events, Publications & Store, Get Involved (menus or hubs); CMS-editable via `siteNavigation` with code fallbacks |
| G2 | Join / Donate CTA | Persistent high-contrast primary button in header; links into Get Involved |
| G3 | Omnibar with collection filters | Header search submits to `/search` with optional `type` (or equivalent) filter; filters include at least Images, Documents/Deeds, Articles (Quarterly + Research); remains URL-first GET — no TanStack/SWR/React search island |
| G4 | Utility: Store and Contact | Cart/Store and Contact Us reachable from header utility area |
| G5 | Design system | All new UI follows [DESIGN.md](DESIGN.md); WCAG 2.1 AA for interactive chrome and Research tables |

### 6.2 Explore

| ID | Requirement | Content source | Rendering |
| --- | --- | --- | --- |
| E1 | Then & Now index and detail with interactive before/after | Sanity `thenAndNow` | Static detail; CDN-optimized images |
| E2 | Interactive maps with historical overlays for Tredyffrin, Easttown, Charlestown | MapLibre + geodata / overlay assets; optional Sanity copy | Mostly static shell; map tiles via CDN |
| E3 | Aerial photograph sampler (Dallin) | `historicalImage` with aerial origin / curated collection | Static or lightly SSR; image CDN |
| E4 | Curated exhibits as thematic learning pathways | New Sanity exhibit type (or equivalent) | Static pathways; embedded catalog refs |

### 6.3 Research Archives

| ID | Requirement | Content source | Rendering |
| --- | --- | --- | --- |
| R1 | Archive search hub with progressive disclosure into collections | Existing GROQ search; later Pagefind on prerendered HTML | SSR `/search` |
| R2 | HQDA index and article pages | `quarterlyIssue`, `quarterlyArticle` | Static (existing) |
| R3 | Image database with facets | `historicalImage` | SSR index; static detail (existing) |
| R4 | Primary source documents | `primarySource` | SSR index; prefer prerendered detail |
| R5 | Deed / title-chain records browsable and linkable from properties | `deed`, `property.titleChain` | Faceted SSR list + static or SSR detail |
| R6 | Entity hubs remain under Research | `person`, `location`, `township`, `category`, `organization`, `business`, `property`, `familyLine` | Existing patterns |
| R7 | Physical archives: visit info, finding aids, library book list | New Sanity pages or document types | Static |
| R8 | Township research articles | `researchArticle` | Existing |

### 6.4 News & Events

| ID | Requirement | Content source | Rendering |
| --- | --- | --- | --- |
| N1 | Event calendar (presentations, speakers, meetings) | New `event` (or equivalent) type | Static or SSR by date filters |
| N2 | Community excursions with details and registration | Event subtype or linked form/gateway | Static detail + external or embedded registration |
| N3 | Society news and S. Paul Teamer Awards gallery | New news/award types or portable pages | Static |

### 6.5 Publications & Store

| ID | Requirement | Content source | Rendering |
| --- | --- | --- | --- |
| P1 | Current History Quarterly landing (issue meta, distributors) | `quarterlyIssue` + site settings | Static |
| P2 | Special publications catalog | New product/publication type | Static |
| P3 | Online store with cart and frictionless checkout | Product catalog in Sanity or commerce provider; payment via third-party gateway (e.g. Stripe or PayPal) | Mostly static product pages; checkout hosted or redirected — no Cloudflare KV/D1/Durable Objects unless later approved |

### 6.6 Get Involved

| ID | Requirement | Content source | Rendering |
| --- | --- | --- | --- |
| I1 | Multi-step membership forms (household, patron) | Sanity copy + payment/membership gateway | Progressive forms (Astro + minimal islands if needed) |
| I2 | General donation gateway | Payment provider | Static landing + gateway |
| I3 | Artifact donation: policies, Deed of Gift, photo release | Sanity pages + downloadable or progressive forms; legal review | Static + forms |
| I4 | About: board, bylaws, 501(c)(3) history | Sanity or portable pages | Static (expand `/about`) |
| I5 | Contact Us | Form and/or published contacts | Static + form endpoint or third-party |

### 6.7 Cross-cutting product decisions

- **Search:** Keep URL-first GROQ as the system of record for Archive IDs and typed groups. Add Pagefind alongside GROQ for full-text over prerendered detail HTML when document (and other) detail pages are reliably static — see [SEARCH.md](SEARCH.md).
- **Payments:** Third-party gateways for membership, donations, and store; do not invent Workers-native commerce storage unless explicitly approved.
- **Legacy cutover:** Map legacy tehistory.org URLs to the new IA with permanent redirects; decommission the legacy site after parity.
- **Studio ownership:** New document types (events, exhibits, products, membership copy) are defined in the external Studio and pulled into this repo via `schema.json` / TypeGen ([FETCHING.md](FETCHING.md), [TYPES.md](TYPES.md)).

---

## 7. Non-goals

These remain out of scope unless a later PRD revision says otherwise:

- Embedding Sanity Studio on the public site
- React SPA search islands, TanStack Query, or SWR for catalog search
- Astro i18n (English-only)
- Cloudflare Durable Objects, D1, or KV as a default for search or cart
- Big-bang same-day launch of every pillar — replacement is phased (Section 9)

---

## 8. Success metrics

| Area | Signals |
| --- | --- |
| Research | Successful faceted queries; Archive ID exact-match prominence; time-to-first relevant result |
| Explore | Sessions on Then & Now, maps, aerial, exhibits; engagement depth without bounce to Research wall |
| Conversion | Membership form starts and completions; donation completions; artifact inquiry submissions |
| Store | Checkout completion rate; cart abandonment |
| Quality | Explore LCP; SSR Research TTFB / edge cache behavior; WCAG 2.1 AA audit on Research tables and forms |

---

## 9. Phased rollout

Full replacement is the goal; delivery is sequenced so the catalog stays useful while community and commerce move on-site.

| Phase | Focus | Exit criteria |
| --- | --- | --- |
| **1. IA and chrome** | Five-pillar nav in Sanity + fallbacks; Join/Donate CTA; Contact stub; About expansion; deep-link Store/Membership/Events to tehistory.org until later phases | New IA live; no broken primary paths |
| **2. Research complete** | Deeds UI; physical archives / policies / library; omnibar type filters; Pagefind when details are static; entity hubs nested under Research in nav | Genealogist can complete a deed/document/image workflow without legacy site |
| **3. Explore** | Then & Now; aerial sampler; MapLibre overlays; curated exhibits | Educators can assign an exhibit or Then & Now without leaving the site |
| **4. News & Events** | Calendar, excursions, news/awards content model and pages | Residents can find next public program on this domain |
| **5. Publications & Store** | Current-issue landing; special pubs; cart/checkout | Back issues and books purchasable without tehistory.org |
| **6. Get Involved** | Membership, donate, artifact progressive forms; board/bylaws complete | Join/Donate CTA completes on this domain |
| **7. Cutover** | DNS, redirects from legacy paths, decommission tehistory.org | Single public origin; redirect map documented and verified |

Phases 2 and 3 may overlap after Phase 1 if staffing allows; Phases 5–6 should not block Research/Explore polish.

---

## 10. Risks and open questions

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Studio schema ownership for new types (event, exhibit, product, membership) | Blocks Phases 3–6 | Coordinate Studio PRs before frontend routes; follow [FETCHING.md](FETCHING.md) |
| Payment and legal (Deed of Gift, membership terms) | Blocks Get Involved and Store | Society counsel + provider choice before building forms |
| Map tile licensing and historical overlay assets | Blocks Interactive Maps | Confirm license and host overlays on CDN early in Phase 3 |
| Content migration from legacy CMS | Incomplete cutover | Inventory legacy URLs in Phase 1; redirect map in Phase 7 |
| Scope creep into Workers storage (KV/D1/DO) | Architecture drift | Default to Sanity + third-party gateways; bind new Cloudflare storage only with explicit approval |

---

## 11. Document history

| Date | Change |
| --- | --- |
| 2026-11-12 | Initial PRD: full tehistory.org replacement; intent-driven IA; gap matrix and phased rollout |
