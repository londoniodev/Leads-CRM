# Graph Report - .  (2026-08-23)

## Corpus Check
- 283 files · ~173,028 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 291 nodes · 553 edges · 14 communities (11 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Lead Detail & UI Primitives
- Lead Core Actions & Queries
- Production Dependencies
- TypeScript Config & Libs
- DevDependencies & Tooling
- Social Conflicts & Quarantine
- Shadcn & Path Config
- Scraper Ingestion & Triggers
- Drawer & Sheet Modals
- Scraper Hub & Status Monitoring
- App Root Layout & Notifications
- ESLint Configuration
- Next.js Build Configuration
- PostCSS & Styling Config

## God Nodes (most connected - your core abstractions)
1. `cn()` - 90 edges
2. `compilerOptions` - 16 edges
3. `react` - 11 edges
4. `Button()` - 11 edges
5. `Badge()` - 9 edges
6. `DataTable()` - 7 edges
7. `include` - 7 edges
8. `tailwind` - 6 edges
9. `aliases` - 6 edges
10. `scripts` - 6 edges

## Surprising Connections (you probably didn't know these)
- `QuarantineList()` --references--> `react`  [EXTRACTED]
  src/components/scraper/quarantine-list.tsx → package.json
- `ScraperHub()` --references--> `react`  [EXTRACTED]
  src/components/scraper/scraper-hub.tsx → package.json
- `DataTable()` --references--> `react`  [EXTRACTED]
  src/components/data-table/data-table.tsx → package.json
- `ScraperDrawerForm()` --references--> `react`  [EXTRACTED]
  src/components/scraper/scraper-drawer-form.tsx → package.json
- `ScraperTrigger()` --references--> `react`  [EXTRACTED]
  src/components/scraper/scraper-trigger.tsx → package.json

## Import Cycles
- None detected.

## Communities (14 total, 3 thin omitted)

### Community 0 - "Lead Detail & UI Primitives"
Cohesion: 0.09
Nodes (37): LeadDetailPage(), PageProps, Button(), buttonVariants, ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants (+29 more)

### Community 1 - "Lead Core Actions & Queries"
Cohesion: 0.09
Nodes (38): react, react, deleteLead(), deleteLeadsBulk(), enrichLeadSocials(), getLeads(), updateLeadsStatusBulk(), updateLeadStatus() (+30 more)

### Community 2 - "Production Dependencies"
Cohesion: 0.06
Nodes (35): apify-client, @base-ui/react, class-variance-authority, clsx, cmdk, libphonenumber-js, lucide-react, next (+27 more)

### Community 3 - "TypeScript Config & Libs"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "DevDependencies & Tooling"
Cohesion: 0.07
Nodes (26): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+18 more)

### Community 5 - "Social Conflicts & Quarantine"
Cohesion: 0.13
Nodes (19): ScraperInputOptions, CandidateLead, ConflictedProfileWithCandidates, getConflictedProfilesWithCandidates(), resolveConflictedProfile(), QuarantineList(), ScraperDrawerFormProps, Label() (+11 more)

### Community 6 - "Shadcn & Path Config"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 7 - "Scraper Ingestion & Triggers"
Cohesion: 0.23
Nodes (11): buildWebhookUrl(), cleanUrlString(), ingestManualDataset(), triggerGoogleMapsScraper(), ScraperDrawerShell(), Tabs(), TabsContent(), TabsList() (+3 more)

### Community 8 - "Drawer & Sheet Modals"
Cohesion: 0.23
Nodes (9): ScraperDrawerShellProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+1 more)

### Community 9 - "Scraper Hub & Status Monitoring"
Cohesion: 0.25
Nodes (9): getScraperRunStatus(), ActiveScraperJob, ScraperHub(), Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle() (+1 more)

### Community 10 - "App Root Layout & Notifications"
Cohesion: 0.33
Nodes (4): geistMono, metadata, poppins, Toaster()

## Knowledge Gaps
- **94 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Production Dependencies` to `Lead Core Actions & Queries`, `DevDependencies & Tooling`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **Why does `cn()` connect `Lead Detail & UI Primitives` to `Lead Core Actions & Queries`, `Social Conflicts & Quarantine`, `Scraper Ingestion & Triggers`, `Drawer & Sheet Modals`, `Scraper Hub & Status Monitoring`?**
  _High betweenness centrality (0.271) - this node is a cross-community bridge._
- **Why does `react` connect `Lead Core Actions & Queries` to `Scraper Hub & Status Monitoring`, `Production Dependencies`, `Social Conflicts & Quarantine`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Lead Detail & UI Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.09098039215686274 - nodes in this community are weakly interconnected._
- **Should `Lead Core Actions & Queries` be split into smaller, more focused modules?**
  _Cohesion score 0.08687943262411348 - nodes in this community are weakly interconnected._
- **Should `Production Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._