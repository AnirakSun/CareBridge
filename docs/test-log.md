# CareBridge test log

Last updated during Phase 4/5 implementation. Status values: **Implemented**, **Tested (passed)**, **Untested**, **Incomplete**.

| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 1 | Submitter registers and logs in | Tested (passed) | Covered by Vitest validation + E2E register flow |
| 2 | Uploads valid synthetic document | Tested (passed) | E2E uses `tests/fixtures/synthetic.pdf` |
| 3 | Selects organization and creates submission | Tested (passed) | E2E submission form |
| 4 | Submission saved in database | Tested (passed) | Verified via admin queue visibility after submit |
| 5 | Appears in correct admin dashboard only | Tested (passed) | Seed CB-000002 scoped to Northlake; Riverside admin E2E sees Riverside org submit |
| 6 | Admin views authorized details/files | Implemented | Manual + E2E detail page |
| 7 | Admin updates status, timeline records | Tested (passed) | E2E status update toast |
| 8 | Admin sends message | Tested (passed) | E2E message send |
| 9 | Submitter reads and replies | Implemented | E2E verifies read; reply path same API |
| 10 | Messages persist after refresh | Tested (passed) | E2E reload assertion |
| 11 | Statuses persist on dashboards | Tested (passed) | E2E + seed data |
| 12 | Unauthorized access blocked | Tested (passed) | E2E `/admin` denied for submitter; authz unit tests |
| 13 | Invalid files/forms handled | Tested (passed) | Vitest `validateFileMeta` |
| 14 | Clear error messages | Implemented | Toast + API `{ error.message }` shape |
| 15 | Desktop and mobile layouts | Tested (passed) | Playwright desktop + Pixel 7 projects |

## Open issues

| ID | Priority | Description | Status |
|----|----------|-------------|--------|
| — | — | No P0/P1 issues open at handoff | — |

## Regression commands

```bash
npm run test
npm run test:e2e
npm run build
```
