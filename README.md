# Looops

A personal waiting-and-follow-up manager. Looops tracks outcomes that depend on other people, and records each follow-up as its own activity.

This is not a task list. The work is not the next checkbox. The work is an outcome blocked on someone else: who still has it, when you will ask again, and what the outcome becomes once they respond.

> Every open loop should name who still has it, and when you’ll loop back.

The name is the model. You **open a loop** for something you want done, **loop in** the person who has it, and **loop back** with them until they move. Each follow-up is one more pass around the loop. When the outcome is achieved, you **close the loop**.

## The problem

Some goals stall on approvals, confirmations, and input from other people. Following up is repeated and irregular. A traditional to-do either hides that history inside one task, or turns every nudge into a disconnected item that loses the outcome.

Looops keeps both layers:

- the ultimate outcome and its status
- each individual follow-up, as its own record

Most loops are waiting on a specific person. A response usually does not finish the outcome. It reveals the next person, the next ask, or the next time to check in.

## Model

Three objects. No dependency graph.

**Outcome** — what you ultimately want to achieve.

**Thread** — one person and one specific ask. An outcome can have more than one open thread at a time.

**Touch** — one follow-up attempt, or one response.

```text
Outcome: Finalize renovation permit
Thread:  Get revised plans from Alex
Touches: Asked Sep 3 → followed up Sep 8 → replied Sep 10
```

When Alex replies, that thread closes. The outcome then either completes, gains the next thread, schedules another follow-up, or waits until a known date.

## Today

The home screen is a calm daily queue of follow-ups that are due. Nothing pings you. You open the app and see what needs a decision.

**Needs your attention**

- Nudge Alex for the revised plans
- Check whether Sam has reviewed the contract
- Mia replied. Name who has it next

Each item has four actions:

- **Nudged** — records a Touch and asks when to check on them again. Two taps: the action, then Tomorrow, Next Monday, or In a week.
- **They replied** — opens the response flow.
- **Snooze** — moves it without pretending you nudged them.
- **Open outcome** — the full picture.

## Outcome

An outcome answers four questions:

1. What am I trying to achieve?
2. Who still has it?
3. What happens next?
4. What has happened so far?

The screen shows the title and current status, the active threads, the next follow-up date, and a chronological timeline of touches. From here you add the next dependency or complete the outcome.

Parallel threads stay a short list. There is no graph to maintain.

## Response flow

**They replied** is the moment that updates the outcome, not just the thread.

What does their response mean?

- Outcome achieved
- They are done; name the next person who has it
- They have not finished; nudge again later
- No longer relevant

## Status

Status is derived. You do not set it by hand.

| Status | Meaning |
| --- | --- |
| Waiting | They still have it, and it is not yet time to nudge |
| Follow-up due | It is time to nudge the person who still has it |
| Paused | Deliberately set aside |
| Closed | The outcome is achieved; the loop is closed |

## MVP

1. Create an outcome
2. Add a person and an ask
3. Schedule the next follow-up
4. Show today’s queue
5. Log each touch
6. Turn their response into the next person who has it
7. Complete or archive the outcome

## Not in the first version

Message sending, contact sync, collaboration, AI drafting, analytics, dependency diagrams, streaks, and complex recurrence rules.

## Delight

- Remember how long you usually wait before nudging a given person.
- Offer Tomorrow, Next Monday, and In a week instead of a date picker as the default.
- Show quiet context on a row: “Waiting 9 days · 2 follow-ups.”
- Keep the finished outcome as a short narrative of what it took.
- A small closing motion when an outcome completes.
- No streaks, and no overdue counts designed to create guilt.

## Developing

```sh
pnpm install
pnpm dev
```

```sh
pnpm build
pnpm preview
```
