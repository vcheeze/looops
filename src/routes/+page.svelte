<script lang="ts">
	import { tick } from 'svelte'
	import { ArrowRight02Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
	import { HugeiconsIcon } from '@hugeicons/svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Field from '$lib/components/ui/field'
	import { Input } from '$lib/components/ui/input'
	import Wordmark from '$lib/components/wordmark.svelte'
	import { daysWaiting, leadOpen, nudgedSummary, today, waitLabel, type Outcome } from '$lib/today.svelte'

	const now = new Date()
	const heading = new Intl.DateTimeFormat(undefined, {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	}).format(now)
	const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(now)
	const month = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(now)
	const day = new Intl.DateTimeFormat(undefined, { day: 'numeric' }).format(now)
	const year = new Intl.DateTimeFormat(undefined, { year: 'numeric' }).format(now)

	const rowAction = 'min-h-11 px-4 phone:h-12 phone:text-base'
	const textLink =
		'focus-visible:outline-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2'

	let pending = $derived(today.pending)
	let nudged = $derived(today.nudgedToday)
	let notice = $state('')
	let announcement = $state('')
	let adding = $state(false)
	let saving = $state(false)
	let addTitle = $state('')
	let addPerson = $state('')
	let addAsk = $state('')
	let errors = $state({ title: '', person: '', ask: '' })
	let queue = $state<HTMLElement | null>(null)
	let addAction = $state<HTMLElement | null>(null)
	let outcomeInput = $state<HTMLInputElement | null>(null)
	let personInput = $state<HTMLInputElement | null>(null)
	let askInput = $state<HTMLInputElement | null>(null)
	let lastNudge = { id: '', at: 0 }
	let recentlyNudged = $state('')

	function attempt(action: () => string): string {
		try {
			return action()
		} catch (error) {
			if (error instanceof DOMException) {
				return 'That change is on this page, but it could not be saved on this device.'
			}
			return 'That could not be saved. Try again.'
		}
	}

	async function say(message: string) {
		notice = message
		announcement = ''
		await tick()
		announcement = message
	}

	async function focusOutcome(id: string | undefined) {
		await tick()
		const link = id
			? queue?.querySelector<HTMLElement>(`[data-outcome="${CSS.escape(id)}"] a`)
			: null
		;(link ?? addAction)?.focus()
	}

	function neighbor(outcomeId: string): string | undefined {
		const index = pending.findIndex((item) => item.id === outcomeId)
		return pending[index + 1]?.id ?? pending[index - 1]?.id
	}

	async function nudge(outcomeId: string) {
		const now = Date.now()
		if (lastNudge.id === outcomeId && now - lastNudge.at < 400) return
		lastNudge = { id: outcomeId, at: now }
		const next = neighbor(outcomeId)
		adding = false
		recentlyNudged = outcomeId
		await tick()
		let result = ''
		const commit = async () => {
			result = attempt(() => today.nudgeOutcome(outcomeId))
			await tick()
		}
		const transitions = document as Document & {
			startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void> }
		}
		if (transitions.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			await transitions.startViewTransition(commit).finished
		} else {
			await commit()
		}
		await say(result)
		if (!today.pending.some((item) => item.id === outcomeId)) await focusOutcome(next)
	}

	async function defer(outcomeId: string) {
		const next = neighbor(outcomeId)
		adding = false
		await say(attempt(() => today.deferOutcome(outcomeId)))
		await focusOutcome(next)
	}

	async function closeOutcome(outcomeId: string) {
		const next = neighbor(outcomeId)
		adding = false
		await say(attempt(() => today.finish(outcomeId)))
		await focusOutcome(next)
	}

	async function clearSample() {
		adding = false
		await say(
			attempt(() => {
				today.clearSample()
				return 'Sample cleared.'
			})
		)
		await focusOutcome(undefined)
	}

	async function openAdd() {
		adding = true
		errors = { title: '', person: '', ask: '' }
		notice = ''
		await tick()
		outcomeInput?.focus()
	}

	async function closeAdd() {
		adding = false
		errors = { title: '', person: '', ask: '' }
		await focusOutcome(undefined)
	}

	async function startWaiting(event: SubmitEvent) {
		event.preventDefault()
		if (saving) return
		errors = {
			title: addTitle.trim() ? '' : 'Name the outcome.',
			person: addPerson.trim() ? '' : 'Name who has it.',
			ask: addAsk.trim() ? '' : 'Name what they owe you.'
		}
		if (errors.title || errors.person || errors.ask) {
			await tick()
			if (errors.title) outcomeInput?.focus()
			else if (errors.person) personInput?.focus()
			else askInput?.focus()
			return
		}
		saving = true
		const before = new Set(today.outcomes.map((item) => item.id))
		const result = attempt(() => today.add(addTitle, addPerson, addAsk))
		const created = today.outcomes.find((item) => !before.has(item.id))
		addTitle = ''
		addPerson = ''
		addAsk = ''
		adding = false
		saving = false
		await say(result)
		await focusOutcome(created?.id)
	}
</script>

<svelte:head>
	<title>Today · Looops</title>
</svelte:head>

<main class="min-h-screen px-4 pt-5 pb-28 sm:px-6 sm:pt-7 lg:px-10 lg:pt-10 lg:pb-16">
	<div class="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

	<div class="mx-auto grid w-full max-w-[90rem] gap-7 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:gap-14 xl:gap-24">
		<header class="lg:sticky lg:top-10 lg:self-start">
			<div class="flex items-center justify-between border-b border-foreground/15 pb-3 sm:pb-4">
				<Wordmark href="/outcomes" class={textLink} />
				<a href="/outcomes" class="text-muted-foreground hover:text-foreground hidden items-center gap-1 text-sm lg:inline-flex {textLink}">
					All outcomes
					<HugeiconsIcon icon={ArrowRight02Icon} class="size-3.5" aria-hidden="true" />
				</a>
			</div>

			<div class="mt-5 grid grid-cols-[auto_1fr] items-end gap-x-4 lg:mt-12 lg:block">
				<p class="text-primary text-[4rem] leading-[0.75] font-semibold tracking-[-0.07em] tabular-nums lg:text-[clamp(4.75rem,10vw,7.75rem)]" aria-hidden="true">
					{day}
				</p>
				<div class="pb-1 lg:mt-5 lg:pb-0">
					<p class="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{weekday}</p>
					<p class="mt-1 text-sm font-medium">{month} {year}</p>
				</div>
			</div>

			<h1 class="mt-6 text-[2.25rem] leading-[0.92] font-semibold tracking-[-0.045em] lg:mt-14 lg:text-[clamp(2.25rem,5vw,4.25rem)]">Today</h1>
			<p class="text-muted-foreground mt-2 max-w-[26rem] text-[0.9375rem] leading-6 lg:mt-4">
				{#if pending.length === 0}
					Your dispatch is clear.
				{:else if pending.length === 1}
					One follow-up is ready for you.
				{:else}
					{pending.length} follow-ups are ready for you.
				{/if}
			</p>

			<div class="mt-7 hidden lg:block">
				<Button variant="secondary" class="min-h-11 w-full justify-between px-4" bind:ref={addAction} onclick={openAdd}>
					Add an outcome
					<HugeiconsIcon icon={PlusSignIcon} aria-hidden="true" />
				</Button>
			</div>
		</header>

		<div class="min-w-0">
			{#if notice}
				<p class="border-primary/30 bg-primary/5 mb-6 border-y py-3 text-sm text-foreground" aria-hidden="true">{notice}</p>
			{/if}

			<section aria-labelledby="follow-ups-heading">
				<div class="flex min-h-12 items-end justify-between gap-4 border-b border-foreground pb-3">
					<h2 id="follow-ups-heading" class="text-lg font-semibold tracking-[-0.02em]">Follow-ups</h2>
					<p class="text-muted-foreground text-xs font-medium tabular-nums">
						{pending.length} {pending.length === 1 ? 'open line' : 'open lines'}
					</p>
				</div>

				{#if pending.length === 0}
					<div class="border-b border-border py-12 sm:py-16">
						<p class="max-w-md text-2xl leading-tight font-medium tracking-[-0.03em]">Nothing needs a nudge today.</p>
						<p class="text-muted-foreground mt-3 max-w-md text-sm leading-6">When a follow-up is due, it will return here with the person and ask attached.</p>
					</div>
				{:else}
					<div class="text-muted-foreground hidden grid-cols-[minmax(9rem,0.85fr)_minmax(12rem,1.1fr)_5.5rem_auto] gap-x-6 border-b border-border px-3 py-2.5 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase xl:grid">
						<span>Outcome</span>
						<span>With</span>
						<span>Waiting</span>
						<span class="text-right">Next move</span>
					</div>
					<ol bind:this={queue} aria-label="Follow-ups ready today">
						{#each pending as outcome (outcome.id)}
							{@render outcomeRow(outcome)}
						{/each}
					</ol>
				{/if}
			</section>

			{#if nudged.length > 0}
				<section class="mt-12 sm:mt-16" aria-labelledby="nudged-today">
					<div class="flex min-h-11 items-end justify-between gap-4 border-b border-foreground/25 pb-3">
						<h2 id="nudged-today" class="text-sm font-semibold">Sent today</h2>
						<span class="text-muted-foreground text-xs tabular-nums">{nudged.length}</span>
					</div>
					<ul>
						{#each nudged as outcome (outcome.id)}
							<li
								class:dispatch-arrival={recentlyNudged === outcome.id}
								class="border-b border-border"
								style:view-transition-name={recentlyNudged === outcome.id ? `dispatch-${outcome.id}` : 'none'}
							>
								<a
									href="/outcomes/{outcome.id}"
									class="group grid min-h-14 grid-cols-[1fr_auto] items-center gap-4 py-3 text-sm {textLink}"
								>
									<span class="min-w-0 [overflow-wrap:anywhere]">
										<span class="font-medium">{outcome.title}</span>
										<span class="text-muted-foreground"> · {nudgedSummary(outcome)}</span>
									</span>
									<span class="text-secondary text-xs font-semibold">Sent</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if today.sample}
				<div class="text-muted-foreground mt-8 flex items-center justify-between gap-4 border-y border-border py-2 text-xs">
					<span>Sample dispatch</span>
					<Button class="min-h-11" variant="ghost" size="sm" onclick={clearSample}>Clear sample</Button>
				</div>
			{/if}

			<section class="mt-10 sm:mt-14">
				{#if adding}
					<form class="border-secondary bg-card border p-5 sm:p-7" novalidate onsubmit={startWaiting}>
						<Field.Set>
							<Field.Legend>Start a new wait</Field.Legend>
							<Field.Group class="mt-6 grid gap-5 sm:grid-cols-2">
								<div class="sm:col-span-2">{@render textField('add-outcome', 'Outcome', 'outcome', 'title')}</div>
								{@render textField('add-person', 'Who has it', 'person', 'person')}
								{@render textField('add-ask', 'What they owe you', 'ask', 'ask')}
								<Field.Field orientation="horizontal" class="flex flex-col gap-2 pt-2 sm:col-span-2 sm:flex-row">
									<Button type="submit" variant="secondary" class="min-h-11 sm:min-w-28" disabled={saving}>
										{saving ? 'Adding…' : 'Add outcome'}
									</Button>
									<Button variant="ghost" class="min-h-11" onclick={closeAdd}>Cancel</Button>
								</Field.Field>
							</Field.Group>
						</Field.Set>
					</form>
				{:else}
					<Button variant="secondary" class="min-h-12 w-full justify-between px-4 lg:hidden" bind:ref={addAction} onclick={openAdd}>
						Add an outcome
						<HugeiconsIcon icon={PlusSignIcon} aria-hidden="true" />
					</Button>
				{/if}
			</section>
		</div>
	</div>
</main>

{#snippet textField(id: string, label: string, name: string, key: 'title' | 'person' | 'ask')}
	<Field.Field data-invalid={errors[key] ? 'true' : undefined}>
		<Field.Label for={id}>{label}</Field.Label>
		{#if key === 'title'}
			<Input
				{id}
				{name}
				bind:ref={outcomeInput}
				bind:value={addTitle}
				autocomplete="off"
				aria-required="true"
				aria-invalid={errors.title ? 'true' : undefined}
				aria-describedby={errors.title ? `${id}-error` : undefined}
				oninput={() => (errors.title = '')}
			/>
		{:else if key === 'person'}
			<Input
				{id}
				{name}
				bind:ref={personInput}
				bind:value={addPerson}
				autocomplete="off"
				aria-required="true"
				aria-invalid={errors.person ? 'true' : undefined}
				aria-describedby={errors.person ? `${id}-error` : undefined}
				oninput={() => (errors.person = '')}
			/>
		{:else}
			<Input
				{id}
				{name}
				bind:ref={askInput}
				bind:value={addAsk}
				autocomplete="off"
				aria-required="true"
				aria-invalid={errors.ask ? 'true' : undefined}
				aria-describedby={errors.ask ? `${id}-error` : undefined}
				oninput={() => (errors.ask = '')}
			/>
		{/if}
		{#if errors[key]}
			<Field.Error id="{id}-error">{errors[key]}</Field.Error>
		{/if}
	</Field.Field>
{/snippet}

{#snippet outcomeRow(outcome: Outcome)}
	{@const thread = leadOpen(outcome)}
	<li
		data-outcome={outcome.id}
		class="group grid min-w-0 border-b border-border py-3.5 transition-colors hover:bg-card/70 sm:px-3 xl:grid-cols-[minmax(9rem,0.85fr)_minmax(12rem,1.1fr)_5.5rem_auto] xl:items-center xl:gap-x-6 xl:py-6"
		style:view-transition-name={recentlyNudged === outcome.id ? `dispatch-${outcome.id}` : 'none'}
	>
		<div class="flex min-w-0 items-baseline justify-between gap-3">
			<a href="/outcomes/{outcome.id}" class="text-[1.0625rem] leading-6 font-semibold tracking-[-0.02em] [overflow-wrap:anywhere] {textLink}">
				{outcome.title}
			</a>
			{#if thread}
				<span class="text-muted-foreground shrink-0 text-xs font-medium tabular-nums xl:hidden">
					{daysWaiting(thread) > 0 ? waitLabel(daysWaiting(thread)) : 'Today'}
				</span>
			{/if}
		</div>
		{#if thread}
			<p class="mt-1 min-w-0 text-sm leading-5 [overflow-wrap:anywhere] xl:mt-0">
				<span class="font-medium">{thread.person}</span>
				<span class="text-muted-foreground"> · {thread.ask}</span>
			</p>
			<p class="text-muted-foreground hidden text-xs font-medium tabular-nums xl:block">
				{daysWaiting(thread) > 0 ? waitLabel(daysWaiting(thread)) : 'Due today'}
			</p>
		{/if}
		<div class="mt-3 flex items-center gap-1 sm:gap-2 xl:mt-0 xl:justify-end" role="group" aria-label="What to do about {outcome.title}">
			<Button class={rowAction} variant="ghost" onclick={() => defer(outcome.id)}>Defer</Button>
			<Button class={rowAction} variant="ghost" onclick={() => closeOutcome(outcome.id)}>Done</Button>
			<Button class="{rowAction} ml-auto xl:ml-2" onclick={() => nudge(outcome.id)}>Nudge</Button>
		</div>
	</li>
{/snippet}

<style>
	.dispatch-arrival {
		animation: dispatch-arrival 420ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes dispatch-arrival {
		from {
			opacity: 0;
			filter: blur(4px);
			transform: translateY(-0.4rem);
		}
		to {
			opacity: 1;
			filter: blur(0);
			transform: translateY(0);
		}
	}

	:global(::view-transition-group(*)) {
		animation-duration: 440ms;
		animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.dispatch-arrival {
			animation: none;
		}
	}
</style>
