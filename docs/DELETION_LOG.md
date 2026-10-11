# Code Deletion Log

## [2026-10-11] Refactor & Dead Code Cleanup Session

Detection tools: `knip`, `depcheck`, `ts-prune`, `eslint`, `tsc`.
Baseline before changes: typecheck ✅ · lint ✅ · tests 62/62 ✅.

### Unused Dependencies Removed

- `prettier-plugin-tailwindcss@^0.8.1` — **never loaded**. Prettier only activates a
  plugin when it is listed in a Prettier _config_ file, and this repo has no
  `.prettierrc*`, no `prettier.config.*`, and no `prettier` key in `package.json`
  (only `.prettierignore`, which cannot load plugins). Flagged by both `knip` and
  `depcheck`.
  - **To re-add later:** create a Prettier config that lists the plugin
    (`{ "plugins": ["prettier-plugin-tailwindcss"] }`) and reinstall it. Until then
    it did nothing for `npm run format`.

### Unused Exports Removed (definitions deleted — zero references)

| File               | Symbol          | Kind       | Evidence                                 |
| ------------------ | --------------- | ---------- | ---------------------------------------- |
| `src/lib/site.ts`  | `NavItem`       | type alias | Only occurrence was its own declaration. |
| `src/lib/types.ts` | `MusicType`     | type alias | Only occurrence was its own declaration. |
| `src/lib/types.ts` | `ArticleSchema` | zod schema | No runtime consumer (see note below).    |

**`ArticleSchema` note:** the schema was only ever used to derive the `Article`
type (`z.infer<typeof ArticleSchema>`); nothing calls `.parse()` on it — articles
are always constructed in code (`src/lib/feeds.ts`, `src/lib/articles.ts`). It was
replaced with an equivalent `export interface Article` of the **exact same shape**,
so consumer types are unchanged. Expressing it as a type (rather than a schema)
is also required to keep ESLint's `@typescript-eslint/no-unused-vars` happy, which
flags a non-exported binding used only in a type position.

### Unused Exports De-exported (definitions kept — used only inside their own module)

These symbols were only referenced within the file that declared them, so the
`export` keyword was redundant. Finer-grained public surface; no behaviour change.

| File                         | Symbol                                   | Used by                              |
| ---------------------------- | ---------------------------------------- | ------------------------------------ |
| `src/components/section.tsx` | `SectionHeading`                         | `Section` (same file)                |
| `src/lib/anilist.ts`         | `MediaSource`                            | `MediaListResult.source` (same file) |
| `src/lib/types.ts`           | `mediaStatusValues`, `MediaStatusSchema` | `MediaEntrySchema` (same file)       |
| `src/lib/types.ts`           | `gameStatusValues`, `GameStatusSchema`   | `GameSchema` (same file)             |
| `src/lib/types.ts`           | `musicTypeValues`, `MusicTypeSchema`     | `MusicEntrySchema` (same file)       |

### Duplicate Code Consolidated

None this session. One opportunity was **identified but deliberately not actioned**
(see _Consolidation Opportunities_ below) because it would change runtime behaviour
of a security-sensitive allow-list.

### Files Deleted

None.

### Impact

- Files deleted: **0**
- Dependencies removed: **1** (`prettier-plugin-tailwindcss`)
- Exports removed / de-exported: **11** — exactly the set flagged by `knip`
  (8 unused exports + 3 unused exported types)
- Lines of code removed: **~13** (2 type aliases + `ArticleSchema` body); the
  `Article` interface replacement is net-neutral in size
- Public API surface reduced: 11 exports → non-public
- `knip`: **12 findings → 0 findings** (11 unused exports/types + 1 unused
  dependency; verified independently with `npx knip` after the change — exit code 0)
- `depcheck`: 1 genuine finding removed; remaining entries are config/tooling
  false positives (see below)

### Verification

| Gate                           | Result                                     |
| ------------------------------ | ------------------------------------------ |
| `npm run typecheck` (`tsc`)    | ✅ exit 0                                  |
| `npm run lint` (`eslint .`)    | ✅ exit 0 — 0 errors, **0 warnings**       |
| `npm test` (`vitest run`)      | ✅ 5 files, 62/62 tests passed             |
| `npm run build` (`next build`) | ✅ compiled, 14/14 static routes generated |
| `npx knip`                     | ✅ exit 0 — no unused files/exports/deps   |

### Remaining (manual review / intentionally kept)

- `src/lib/anilist.ts` → `MediaListResult` and `src/lib/articles.ts` →
  `ArticlesResult`: exported **return types of public functions**. `knip` correctly
  treats both as used; `ts-prune` flags them only because no module imports them by
  name. **Kept** — they document the public return shape.
- **`depcheck` false positives (not removed — all are used via config/tooling, not
  imports):** `@tailwindcss/postcss`, `postcss`, `tailwindcss` (PostCSS/Tailwind v4
  config), `@types/react-dom` (ambient type resolution).

### Consolidation Opportunities (recommend a separate, reviewed change)

The **URL allow-list** logic is implemented in three places with subtly different
semantics:

1. `src/lib/utils.ts` → `safeHref()` — runtime; allows `mailto:`, trims whitespace.
2. `src/lib/types.ts` → `safeUrl()` / `imageUrl` zod refinements — schema-level.
3. `src/lib/anilist.ts` → `safeUrlValue()` — normalises semi-trusted API values.

They overlap but deliberately differ (mailto handling, trimming, relative-path
rules), so a naive merge would **change security-relevant behaviour**. Recommended
future direction: extract a single predicate, e.g.
`isAllowedUrl(value, { allowMailto?: boolean; allowRelative?: boolean })`, and have
all three call sites delegate to it — with tests pinning the existing semantics
first.

### Rollback

All changes are additive/reversible: restore the removed `export` keywords, restore
`ArticleSchema`, and `npm install prettier-plugin-tailwindcss`.
