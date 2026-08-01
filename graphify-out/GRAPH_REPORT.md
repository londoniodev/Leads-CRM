# Graph Report - .  (2026-08-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 271 nodes · 479 edges · 14 communities (11 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bbe6ee0b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- dependencies
- dropdown-menu.tsx
- scraper-drawer-form.tsx
- compilerOptions
- devDependencies
- components.json
- utils.ts
- sheet.tsx
- scraper-hub.tsx
- layout.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 89 edges
2. `compilerOptions` - 16 edges
3. `Button()` - 10 edges
4. `Badge()` - 8 edges
5. `include` - 7 edges
6. `tailwind` - 6 edges
7. `aliases` - 6 edges
8. `react` - 6 edges
9. `buttonVariants` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `DataTable()` --references--> `react`  [EXTRACTED]
  src/components/data-table/data-table.tsx → package.json
- `ScraperHub()` --references--> `react`  [EXTRACTED]
  src/components/scraper/scraper-hub.tsx → package.json
- `ScraperDrawerForm()` --references--> `react`  [EXTRACTED]
  src/components/scraper/scraper-drawer-form.tsx → package.json
- `ScraperTrigger()` --references--> `react`  [EXTRACTED]
  src/components/scraper/scraper-trigger.tsx → package.json
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (14 total, 3 thin omitted)

### Community 0 - "cn"
Cohesion: 0.11
Nodes (33): DataTableProps, statusOptions, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+25 more)

### Community 1 - "dependencies"
Cohesion: 0.06
Nodes (33): apify-client, @base-ui/react, class-variance-authority, clsx, cmdk, lucide-react, next, next-themes (+25 more)

### Community 2 - "dropdown-menu.tsx"
Cohesion: 0.10
Nodes (21): getLeads(), updateLeadStatus(), HomePage(), ActionsCell(), columns, LeadWithRelations, DataTable(), Badge() (+13 more)

### Community 3 - "scraper-drawer-form.tsx"
Cohesion: 0.10
Nodes (23): react, react, cleanUrlString(), ingestManualDataset(), ScraperInputOptions, triggerGoogleMapsScraper(), ScraperDrawerForm(), ScraperDrawerFormProps (+15 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 6 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 7 - "utils.ts"
Cohesion: 0.16
Nodes (13): LeadDetailPage(), PageProps, Button(), buttonVariants, InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants (+5 more)

### Community 8 - "sheet.tsx"
Cohesion: 0.23
Nodes (9): ScraperDrawerShellProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+1 more)

### Community 9 - "scraper-hub.tsx"
Cohesion: 0.25
Nodes (9): getScraperRunStatus(), ActiveScraperJob, ScraperHub(), Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle() (+1 more)

### Community 10 - "layout.tsx"
Cohesion: 0.33
Nodes (4): geistMono, metadata, poppins, Toaster()

## Knowledge Gaps
- **88 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `dropdown-menu.tsx`, `scraper-drawer-form.tsx`, `utils.ts`, `sheet.tsx`, `scraper-hub.tsx`?**
  _High betweenness centrality (0.321) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scraper-drawer-form.tsx`, `devDependencies`?**
  _High betweenness centrality (0.271) - this node is a cross-community bridge._
- **Why does `react` connect `scraper-drawer-form.tsx` to `dependencies`, `dropdown-menu.tsx`, `scraper-hub.tsx`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.10975609756097561 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `dropdown-menu.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0967741935483871 - nodes in this community are weakly interconnected._