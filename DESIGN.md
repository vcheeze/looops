---
name: Looops
description: A cool-mist dispatch ledger for follow-ups other people still hold.
colors:
  dispatch: "#2e6658"
  forest: "#183f35"
  loop: "#8da99d"
  ink: "#17211d"
  mist: "#f4f5f2"
  paper: "#fbfcf9"
  on-fill: "#f7faf7"
  moss: "#53635c"
  wash: "#e3e9e4"
  seam: "#ced8d1"
  field: "#d9e1dc"
  brick: "#9c352f"
typography:
  display:
    fontFamily: '"Timeless Sans", sans-serif'
    fontSize: "clamp(4.75rem, 10vw, 7.75rem)"
    fontWeight: 600
    lineHeight: 0.75
    letterSpacing: "-0.07em"
    fontFeature: "tabular-nums"
  masthead:
    fontFamily: '"Timeless Sans", sans-serif'
    fontSize: "clamp(2.75rem, 5vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Timeless Sans", sans-serif'
    fontSize: "clamp(2.25rem, 5vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.045em"
  title:
    fontFamily: '"Timeless Sans", sans-serif'
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.5rem"
    letterSpacing: "-0.02em"
  body:
    fontFamily: '"Timeless Sans", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    letterSpacing: "normal"
  label:
    fontFamily: '"Timeless Sans", sans-serif'
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.08em"
  action:
    fontFamily: '"Timeless Sans", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "normal"
rounded:
  link: "0.225rem"
  control: "0.375rem"
  field: "0.825rem"
spacing:
  action: "0.25rem"
  row: "0.875rem"
  stack: "1.75rem"
  section: "3rem"
  page: "1rem"
  page-wide: "2.5rem"
  touch: "2.75rem"
  phone: "3rem"
components:
  button-nudge:
    backgroundColor: "{colors.dispatch}"
    textColor: "{colors.on-fill}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "{spacing.touch}"
  button-nudge-hover:
    backgroundColor: "color-mix(in oklab, {colors.dispatch} 80%, transparent)"
    textColor: "{colors.on-fill}"
    rounded: "{rounded.control}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "{spacing.touch}"
  button-quiet-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  button-outline:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 0.75rem"
    height: "{spacing.touch}"
  button-outline-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  button-add:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-fill}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "{spacing.touch}"
    width: "100%"
  button-add-hover:
    backgroundColor: "color-mix(in oklch, {colors.forest}, {colors.ink} 5%)"
    textColor: "{colors.on-fill}"
    rounded: "{rounded.control}"
    width: "100%"
  field:
    backgroundColor: "color-mix(in srgb, {colors.field} 50%, transparent)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  back-bar:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "0 1rem 0 0.75rem"
    height: "{spacing.touch}"
---

# Design System: Looops

## Overview

**Creative North Star: "The Dispatch Ledger"**

Looops is a cool-mist ledger for work other people still hold. Forest ink does the reading, one dispatch green marks the next move, and pale seams separate the lines. Density stays low, and a wait never changes color to manufacture urgency.

Every route uses the same frame. From the wide breakpoint a sticky masthead sits beside a flush ledger; below that, the masthead stacks and the rows run the width of the page. Today’s masthead is the date. Outcomes, the outcome, and a reply use a title. Archive state is a ruled group, never a badge. History is a quiet date column. A reply is a ruled decision, and its action stays on the far edge when the row stacks.

A dispatched line transfers into the sent record; the rest of the page stays still. When reduced motion is requested, the line changes place with no transfer and no arrival blur. On the phone, a sticky back bar appears only on the outcome and the reply. The bottom tabs are the two places, and their focus ring sits inside the bar.

**Key Characteristics:**

- Cool mist ground, forest ink, and one dispatch green for the decisive fill
- Timeless Sans throughout: an oversized tabular date, or a tight title masthead
- Flush ruled rows, square frames, and no status badges
- One filled action at the terminal edge, even when the row stacks
- A shared colored wordmark, an inset focus ring on phone chrome, and a dispatch the reduced-motion setting removes

## Colors

The palette is a cool gray-green mist, a deep forest for structure, and one green reserved for the move that matters.

### Primary

- **Dispatch green** (`dispatch`): The date numeral, the decisive filled action, text selection, the caret, and the focus ring.

### Secondary

- **Deep forest** (`forest`): The structural action (Add, bring back, confirm a recorded reply), the entry form’s stroke, and the quiet “Sent” mark. It is darker than dispatch.

### Tertiary

- **Loop sage** (`loop`): The third stroke of the wordmark and favicon, beside dispatch green and deep forest. The favicon sits on a mist plate; the wordmark is the strokes alone.

### Neutral

- **Cool mist** (`mist`): The page ground, the browser `theme-color`, the favicon plate, the phone tabs, and the back bar.
- **Ledger paper** (`paper`): Entry forms, the backup band, and the row hover washed to 70%.
- **Forest ink** (`ink`): Text, and the heaviest rule under a primary ledger.
- **On-fill** (`on-fill`): Text on dispatch green and deep forest, including selected text.
- **Moss** (`moss`): Secondary text, column labels, counts, dates, and waiting age.
- **Wash** (`wash`): The ghost-control and outline-control hover.
- **Pale seam** (`seam`): Row rules, the sample strip, the phone nav, and the back bar.
- **Field** (`field`): The input’s solid token. Fields paint it at 50% strength.
- **Brick** (`brick`): Invalid fields, their error text, and a backup file that cannot be read.

**The One Green Rule.** Dispatch green is the date numeral, text selection, the caret, the focus ring, and the single decisive fill on a row or decision. It is not a status color.

**The Quiet Wait Rule.** Waiting age stays moss and tabular. Brick marks an invalid field or a backup that cannot be read, never a wait.

**The Mark Rule.** Loop sage is the third stroke of the mark. It is not a fill for buttons, rows, or status.

Selection is dispatch green with on-fill text. The scrollbar is moss on mist. Placeholder text is moss mixed 18% toward transparent.

## Typography

**Display / UI font:** Timeless Sans (sans-serif). The family is a variable face from 300 to 800, with a separate 420 cut. The shipped ramp uses 400, 500, and 600.

**Character:** One precise grotesk. The date is an oversized numeral; titles and rows stay compact, flush left, and tightly tracked at display sizes.

### Hierarchy

- **Display** (600, `clamp(4.75rem, 10vw, 7.75rem)`, line-height 0.75, tracking -0.07em, tabular): The date numeral on the wide masthead. In the stacked masthead it locks to 4rem with the same weight, leading, and tracking. It is dispatch green.
- **Masthead** (600, `clamp(2.75rem, 5vw, 4.5rem)`, line-height 0.92, tracking -0.04em): The Outcomes title and the reply’s person. A long outcome name steps down to `clamp(2.25rem, 3vw, 2.875rem)` with line-height 0.98 and the same tracking, so it stays in the masthead column.
- **Headline** (600, `clamp(2.25rem, 5vw, 4.25rem)`, line-height 0.92, tracking -0.045em): The word “Today”. The clamp’s minimum is also the stacked size.
- **Title** (600, 1.0625rem, 1.5rem leading, tracking -0.02em): The outcome name, the holder’s name, and a routing decision. The open-ledger heading is the same weight and tracking at 1.125rem. The empty queue speaks at 1.5rem, weight 500, tracking -0.03em.
- **Body** (400, 0.875rem, 1.25rem leading): The person, the ask, and history detail. The sentence under a masthead title is a half step larger, 0.9375rem with 1.5rem leading, in moss. An outcome’s state is moss at this size, weight 500. Buttons use this size at weight 600, and Today’s phone row actions rise to 1rem.
- **Label** (600, 0.6875rem, tracking 0.08em, uppercase): Ledger column heads. The weekday uses the same size and weight at tracking 0.14em. Counts, dates, and waiting age are 0.75rem, weight 500, tabular, sentence case, in moss. Quiet section titles (Sent today, History, Device backup) are 0.875rem, weight 600, sentence case.

### Named Rules

**The Grotesk Rule.** Timeless Sans is the only face, from the date numeral through the title, the row, and the controls.

## Layout

The page is a centered frame at most 90rem wide. Inline padding is 1rem, 1.5rem from 40rem, and 2.5rem from 64rem. Top padding follows 1.25rem, 1.75rem, then 2.5rem. Bottom padding is 7rem while the phone tab bar is in play, and 4rem from 64rem. The body never goes below 20rem wide.

From 64rem the frame is two columns: a sticky masthead (`minmax(15rem, 18rem)`, offset 2.5rem from the top) and the ledger. The column gap is 3.5rem from 64rem and 6rem from 80rem. Stacked, Today is 1.75rem and the other routes are 2.5rem. The date numeral sits beside the weekday and month; from 64rem the numeral stacks above them. A title masthead starts 2.25rem under the wordmark rule.

The open queue is one list. From 80rem each Today row is four aligned tracks — outcome `minmax(9rem, 0.85fr)`, with `minmax(12rem, 1.1fr)`, waiting `5.5rem`, actions `auto` — with a 1.5rem column gap and a matching header. Below that, the row stacks: name and waiting age, then person and ask, then the actions. Holder rows use the same 80rem break, with tracks person `minmax(8rem, 0.7fr)`, ask `minmax(12rem, 1fr)`, context `minmax(11rem, 0.9fr)`, and the action. Routing decisions become two columns from 40rem. Rows are flush to the column; from 40rem they take 0.75rem of horizontal padding.

A following section — another archive group, sent today, history — starts 3rem below, or 4rem from 40rem. Device backup sits further down, 3.5rem, or 5rem from 40rem. Add an outcome lives in the masthead from 64rem and is a full-width control under the ledger below that.

The phone variant is `max-width: 40rem`, and also a coarse pointer with `max-height: 34rem`. It shows the bottom nav and raises Today’s row actions to 3rem and 1rem type. Outcome detail and reply, and only those, add a sticky back bar; Today and the outcomes index use the tabs alone. The wide parent link in the masthead (hidden below 64rem) is the same trip. The nav and the back bar respect the safe-area insets.

Row actions, masthead actions, return links, and the back bar are at least 2.75rem tall. Phone row actions and the bottom tabs are 3rem. Archive lines are at least 4.5rem.

**The Masthead Rule.** From 64rem a sticky masthead sits beside the ledger, offset 2.5rem from the top. Today carries the date; the other routes carry a title. Below that, the masthead stacks and the rows run edge to edge.

**The Terminal Edge Rule.** The decisive action is the last control and sits on the far edge, including when the row stacks. Quiet and outline actions stay unfilled beside it.

**The Archive Rule.** Derived state is a ruled group heading and a moss count. A line does not wear a badge.

## Elevation & Depth

The ledger is flat. Nothing casts a drop shadow. Separation is rule weight and a change of tone.

Primary ledger heads — follow-ups, current holders, the reply question — use a solid forest-ink rule. Archive groups use that ink at 70%. Sent today, history, and device backup use ink at 25%. The masthead’s brand rule is ink at 15%. Rows, the sample strip, the phone nav, and the back bar use the pale seam. A status notice is a full-width band with dispatch green at 30% for the rules and 5% for the fill. Row hover washes in ledger paper at 70%. Entry forms are ledger paper inside a 1px deep-forest stroke. The backup band is ledger paper with only the bottom seam.

**The Flat Ledger Rule.** Surfaces cast no shadow. Separation comes from rule weight and from paper tone on hover and on entry forms.

## Shapes

Rows, entry forms, the backup band, the phone nav, and the back bar are square. Buttons are a compact machined corner (0.375rem), the same as the base radius. Text links and row links use a slightly tighter corner (0.225rem) so the focus outline follows the word. Fields use the wider step of that same base (0.825rem): low, continuous, and still short of a pill. Pressed buttons move 1px down.

**The Square Frame Rule.** Rows, the phone nav, the back bar, and entry forms are square. Add, the next holder, and handoff are ledger paper inside a 1px deep-forest stroke. The backup band is square paper under a quiet rule. Buttons use the 6px control radius; fields use the wider field radius.

## Components

### Buttons

Words, not icon buttons. One filled dispatch action per row or decision. Deep forest is the structural action, not a second green.

- **Shape:** Machined corner (0.375rem). Ledger actions are at least 2.75rem tall. Today’s row actions take 1rem of horizontal padding and, on the phone variant, are 3rem tall at 1rem type. Weight 600.
- **Decisive fill:** Dispatch green, on-fill text, last on the row. This is Nudge, They replied, Name who’s next, and Replace local data. Hover mixes the green to 80%. Press shifts 1px down. Focus is a 2px dispatch outline, offset 2px.
- **Defer and Done:** Ghost. Transparent on ink, wash on hover, the same size as Nudge. They sit ahead of Nudge. On a stacked Today row, Nudge keeps `margin-left: auto` so it still closes the line.
- **Outline:** Mist fill, 1px pale seam, wash on hover. Used for a secondary decision (Nudge later, Mark done), for Export backup, and for the Today / Tomorrow choice on an entry form. It is not a second fill.
- **Add and the other structural actions:** Deep forest, on-fill text. Add is full width, label at the start. Hover mixes 5% ink into the forest. Add is 2.75rem in the masthead and 3rem when it sits under the stacked ledger. Bring back matches that full-width control.
- **Disabled:** 50% opacity, no pointer.

### Fields

Add, the next holder, and handoff are the same square paper panel: a deep-forest stroke, padded 1.25rem, or 1.75rem from 40rem. The legend is 1rem at weight 500. Labels are 0.875rem at weight 500. Two fields sit side by side from 40rem.

- **Style:** 2.25rem tall, 0.75rem horizontal padding, field color at 50%, transparent border, 0.825rem corner. Type is 1rem, and 0.875rem from 48rem. The caret is dispatch green.
- **Focus:** Border becomes dispatch green, with a 3px ring at 30% strength.
- **Error:** Brick border, a 3px brick ring at 20%, and brick error text at 0.875rem. The invalid field takes focus. A backup that cannot be read is brick text at 0.875rem, weight 600.

### Ledger rows

A Today row is a rule, a name, the person and the ask, the waiting age, and three words. The name links to the outcome. Hover underlines the link and washes the row. The open queue’s header is the strongest rule on the page; its count is moss, tabular, and sentence case. Column labels appear only with the four-track layout. An empty queue is one ruled block: a 1.5rem line, then a moss explanation. A status notice above the queue is a ruled band, visually duplicated and hidden from the live region.

### Holder rows

Current holders use that same strong rule and a moss tabular count. Each line is the person’s name, the ask in moss, the nudge context, and one decisive action, They replied, at the far edge. Below 80rem the line stacks and the action stays `justify-self: end`. An outcome with nobody named yet is one moss line inside the ruled block.

### History

History is the quiet register under the holders. Its head matches Sent today: a 0.875rem title, ink at 25%, and a moss count. Each line is two columns, a 5.5rem moss tabular date and the touch. The label is weight 500; the detail is moss. There is no timeline rail and no card.

### Routing decisions

A reply is one ruled list under a strong head, not a stack of equal buttons. Each meaning is a title, a moss sentence, and one action at the terminal edge. The primary consequence is the dispatch fill; the others are outline or ghost. Below 40rem the copy and the action stack, and the action still sits on the far edge. Choosing the next holder replaces the list with the square handoff form. The recorded result is a ruled block and one deep-forest action back to the outcome.

### Archive groups

Outcomes are grouped by derived state — Follow-up due, Waiting, Paused, Complete — in that order, omitting empty groups. Each group is a 1.125rem head, a moss line count, and ink at 70%. The line is the outcome title, a moss summary, and Open at the terminal edge from 40rem. The line is at least 4.5rem, focuses with the text-link outline, and carries no badge. An empty archive uses the strong rule and the empty-queue voice.

### Backup

Device backup is the quiet utility under the archive. Its head matches history. The band is square ledger paper with a bottom seam, not the deep-forest entry stroke. Export is outline; Restore is ghost; Replace local data is the one dispatch fill, with Cancel as a ghost beside it. A short notice uses the same ruled dispatch band as a status notice.

### Sent record

Sent today is a quieter list under a lighter rule. Each line is at least 3.5rem, the outcome and its summary in body type, and the word “Sent” in deep forest at 0.75rem, weight 600.

### Dispatch motion

Nudge names the leaving row and the arriving sent line with the same view-transition name (`dispatch-` plus the outcome id). The group moves over 440ms on `cubic-bezier(0.16, 1, 0.3, 1)`. The page snapshot itself does not crossfade. The arriving line also fades in over 420ms on that same curve, from 4px of blur and -0.4rem. If the viewer prefers reduced motion, the view transition is not started and the arrival animation is none. Color and press on controls use a 150ms standard curve. When an outcome’s state has just changed, that moss status line fades in over 220ms on the dispatch curve, and only when motion is allowed.

**The Still Page Rule.** The root view transition does not crossfade. Only the named line moves, and reduced motion removes even that.

### Navigation

The wordmark is a shared control on every masthead: “Looops” at 0.875rem, weight 600, tracking -0.01em. Its three o’s use the logo strokes in order: dispatch green, deep forest, then loop sage. It sits on the brand rule (ink at 15%) with a moss parent link that shows from 64rem. Text links underline on hover and take a 2px dispatch outline, offset 2px, on a 0.225rem corner.

On the phone variant a fixed two-place nav sits on the bottom edge: Today and Outcomes, 0.9375rem, weight 600, square, 3rem tall. The current place is forest ink; the other is moss. The bar is mist, with a pale seam along the top and padding for the safe area.

The back bar is phone-only, sticky to the top, mist, with a pale seam underneath and at least 2.75rem of height plus the safe area. Outcome detail returns to Outcomes; a reply returns to Outcome. Pressing it washes the bar. It is absent on Today and on the outcomes index.

### Focus and browser chrome

Buttons and links use a 2px solid dispatch outline, offset 2px. Phone tabs and the back bar use that same outline inset by 2px, and the focused control stacks above the bar so the ring is not clipped. Fields use the 3px ring described above. A polite live region announces the result of a nudge, defer, done, or add; focus then moves to the next row, or back to Add.

**The Inset Chrome Rule.** Phone tabs and the back bar take a 2px dispatch outline inset by 2px. Buttons and text links keep that outline offset 2px outside.

The browser chrome is cool mist (`theme-color` and the favicon plate). `color-scheme` is light. The scrollbar is moss on mist.

## Do's and Don'ts

### Do:

- **Do** set the page on cool mist, read it in forest ink, and keep dispatch green to the decisive fill, the numeral, selection, the caret, and focus.
- **Do** set follow-ups and holders as flush ruled rows, history as a quiet date column, and the archive as ruled groups with a moss count and no badge on the line.
- **Do** keep the one filled action at the terminal edge, including when the row stacks.
- **Do** keep entry forms square — ledger paper inside a 1px deep-forest stroke — and the backup band square paper under a quiet rule.
- **Do** use the shared wordmark. On the phone, detail and reply get a sticky back bar; tabs and that bar take an inset 2px dispatch outline.
- **Do** transfer a dispatched line over 440ms on `cubic-bezier(0.16, 1, 0.3, 1)`, and skip that transfer when reduced motion is requested.

### Don't:

- **Don't** restyle a follow-up, a holder, or a routing decision as a stacked card, a stat tile, or a dashboard widget.
- **Don't** give Defer, Done, and Nudge the same fill, and don't turn archive state into a badge.
- **Don't** set display type in a serif, and don't paint with the warm parchment palette or the unused dark-theme tokens.
- **Don't** color a wait as overdue, and don't add streaks or guilt counts.
- **Don't** put a drop shadow on a row, a form, a tab, or a button.
- **Don't** crossfade the whole page when a line is dispatched.
