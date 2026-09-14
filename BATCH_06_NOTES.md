# Flood Nexus Source Batch 06

This batch adds persistent route and shelter operations to the Dharali Command Pack.

A new `operationalResources` table stores route or shelter identity, current status, operational owner, notes, updating operator, and timestamp. The reviewed migration is `drizzle/0002_cuddly_kylun.sql` and was applied successfully without destructive operations.

The protected backend now supports resource listing, status updates, and ownership assignment. Status updates are available to administrators, operators, approvers, and field officers. Ownership assignment is restricted to administrators, operators, and approvers in both the tRPC policy and the visible UI. Every resource update writes an audit event.

The Command Pack now hydrates route and shelter cards from persisted state, supports Close/Reopen and Ready/Standby actions, shows assignment restrictions, and displays a shared recent operational audit feed alongside the checklist history. Anonymous users retain the seeded demo presentation and receive an explicit sign-in message for shared state.

Verification: `pnpm run check`, `pnpm test`, and `pnpm run build` all pass. Migration 0002 was applied successfully. The build retains only the existing Vite chunk-size advisory.
