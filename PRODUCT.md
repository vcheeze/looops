# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner. They use Looops alone to follow up with specific people whose approvals, confirmations, or input are blocking something they want finished.

Opening the product to other users later is undecided. That possibility is not permission to add accounts, sharing, or collaboration now.

## Product Purpose

Looops is a personal waiting-and-follow-up manager. It tracks an outcome that depends on other people, records every follow-up as its own activity, and updates the outcome when a reply arrives.

The user is waiting on other people. Looops does not track people waiting on the user.

Success is a calm daily queue of nudges that are due. Each row names the person who still has the thing, and when the user will ask again. A reply usually does not finish the outcome. It reveals the next person who now has to move.

## Positioning

A to-do list records work the user must do. Looops records work that is stuck on someone else, and keeps the repeated nudges attached to the outcome they serve.

The mechanism is three objects:

- **Outcome** — the result the user wants.
- **Thread** — one person and one specific ask. An outcome may have more than one open thread.
- **Touch** — one follow-up attempt, or one response.

There is no dependency graph.

## Operating Context

The user opens a daily queue of follow-ups that are due. The app does not send reminders or notifications.

The same product is used in a desktop browser and as an installed PWA on a phone. Both must stay simple and uncrowded.

Data stays on the device. The user can export a backup. The export format is undecided. Nothing is stored in an account or on a server.

## Capabilities and Constraints

Confirmed for the first version:

- Create an outcome.
- Add a person and an ask as a thread.
- Schedule the next follow-up.
- Show today's queue.
- Log each touch.
- Turn a response into the next person who owes something, another nudge later, completion, or a cancellation.
- Complete or archive an outcome.
- Derive status: Waiting, Follow-up due, Paused, Complete. Waiting means they still have it and the nudge is not due. Follow-up due means it is time to nudge them.
- Install and use the app as a PWA.
- Export a backup of local data.

Confirmed exclusions:

- Message sending, contact sync, collaboration, AI drafting, analytics, dependency diagrams, streaks, and complex recurrence rules.
- Push notifications and reminder nags.
- Accounts and sync.
- Overdue counts or other UI meant to create guilt.

## Brand Commitments

The product name is Looops.

The voice is calm and direct. It does not scold, streak, or manufacture urgency.

## Evidence on Hand

`README.md` is the written product plan. There is no real personal dataset in the repo. Names used as examples in that plan are illustrative. Future work must not present them as real records, testimonials, or case studies.

## Product Principles

- Every open loop names who still has it, and when the user will ask again.
- The dependency sits with the other person. A follow-up is a nudge, not a task the user owes.
- Each follow-up is its own record, attached to the outcome it serves.
- A response updates the outcome, and usually opens the next dependency.
- The daily queue stays calm: no notifications, streaks, or guilt.
- Keep the interface simple enough for a phone. If a screen feels crowded, it is wrong.
