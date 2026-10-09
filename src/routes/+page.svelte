<script lang="ts">
	import { tick } from 'svelte'
	import { ArrowRight02Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
	import { HugeiconsIcon } from '@hugeicons/svelte'
	import { Button } from '#lib/components/ui/button/index.js'
	import * as Field from '#lib/components/ui/field/index.js'
	import { Input } from '#lib/components/ui/input/index.js'
	import Wordmark from '#lib/components/wordmark.svelte'
	import { daysWaiting, leadOpen, nudgedSummary, today, waitLabel, type Outcome } from '#lib/today.svelte.js'

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
	let saving = $state(false)
	let addTitle = $state('')
	let addPerson = $state('')
	let addAsk = $state('')
	let errors = $state({ title: '', person: '', ask: '' })
	let queue = $state<HTMLElement | null>(null)
	let addAction = $state<HTMLElement | null>(null)
	let revealEl = $state<HTMLElement | null>(null)
	let outcomeInput = $state<HTMLInputElement | null>(null)
	let present = $state(false)
	let revealed = $state(false)
	let placed = $state(false)
	let floating = $state(false)
	let slipEl = $state<HTMLFormElement | null>(null)
	let slipBox = $state({ top: 0, left: 0, width: 0, maxHeight: 0 })
	let slipNow = { top: 0, left: 0, width: 0, maxHeight: 0 }
	let above = $state(false)
	let aboveNow = false
	let closeToken = 0
	let personInput = $state<HTMLInputElement | null>(null)
	let askInput = $state<HTMLInputElement | null>(null)
	let lastNudge = { id: '', at: 0 }
	let recentlyNudged = $state('')
	let playArrival = $state(false)
	let morphing = $state(false)

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
		dismissAdd()
		const reduce = prefersReducedMotion()
		const shared = Boolean(document.startViewTransition) && !reduce
		playArrival = !shared && !reduce
		recentlyNudged = outcomeId
		morphing = shared
		await tick()
		let result = ''
		const commit = async () => {
			result = attempt(() => today.nudgeOutcome(outcomeId))
			await tick()
		}
		if (shared) {
			const root = document.documentElement
			root.dataset.transition = 'nudge'
			try {
				await document.startViewTransition(commit).finished
			} finally {
				delete root.dataset.transition
				morphing = false
			}
		} else {
			await commit()
		}
		await say(result)
		if (!today.pending.some((item) => item.id === outcomeId)) await focusOutcome(next)
	}

	async function defer(outcomeId: string) {
		const next = neighbor(outcomeId)
		dismissAdd()
		await say(attempt(() => today.deferOutcome(outcomeId)))
		await focusOutcome(next)
	}

	async function closeOutcome(outcomeId: string) {
		const next = neighbor(outcomeId)
		dismissAdd()
		await say(attempt(() => today.finish(outcomeId)))
		await focusOutcome(next)
	}

	async function clearSample() {
		dismissAdd()
		await say(
			attempt(() => {
				today.clearSample()
				return 'Sample cleared.'
			})
		)
		await focusOutcome(undefined)
	}

	function isWide() {
		return window.matchMedia('(min-width: 64rem)').matches
	}

	function prefersReducedMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches
	}

	function dismissAdd() {
		closeToken += 1
		present = false
		revealed = false
		placed = false
		floating = false
		errors = { title: '', person: '', ask: '' }
	}

	function placeSlip() {
		if (!addAction || !isWide()) return
		const rect = addAction.getBoundingClientRect()
		const edge = 16
		const gap = 12
		const width = Math.min(576, window.innerWidth - edge * 2, window.innerWidth - rect.left - edge)
		const left = Math.max(edge, Math.min(rect.left, window.innerWidth - edge - width))
		const formHeight = Math.max(slipEl?.scrollHeight ?? 0, 280)
		const spaceBelow = window.innerHeight - rect.bottom - gap - edge
		const spaceAbove = rect.top - gap - edge
		const openBelow = spaceBelow >= Math.min(formHeight, 320) || spaceBelow >= spaceAbove
		const nextAbove = !openBelow
		const maxHeight = Math.max(160, Math.floor(openBelow ? spaceBelow : spaceAbove))
		const used = Math.min(formHeight, maxHeight)
		const top = openBelow ? rect.bottom + gap : Math.max(edge, rect.top - gap - used)
		const next = {
			top: Math.round(top),
			left: Math.round(left),
			width: Math.round(width),
			maxHeight
		}
		if (aboveNow !== nextAbove) {
			aboveNow = nextAbove
			above = nextAbove
		}
		if (
			slipNow.top !== next.top ||
			slipNow.left !== next.left ||
			slipNow.width !== next.width ||
			slipNow.maxHeight !== next.maxHeight
		) {
			slipNow = next
			slipBox = next
		}
		placed = true
	}

	async function openAdd() {
		const token = ++closeToken
		floating = isWide()
		present = true
		revealed = false
		placed = false
		errors = { title: '', person: '', ask: '' }
		notice = ''
		await tick()
		if (token !== closeToken) return
		if (isWide()) placeSlip()
		await new Promise((resolve) => {
			requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined)))
		})
		if (token !== closeToken) return
		revealed = true
		await tick()
		if (token !== closeToken) return
		outcomeInput?.focus({ preventScroll: true })
	}

	function waitForComposerExit(): Promise<void> {
		const el = isWide() ? slipEl : revealEl
		if (!el || prefersReducedMotion()) return Promise.resolve()
		return new Promise((resolve) => {
			let settled = false
			const finish = () => {
				if (settled) return
				settled = true
				resolve()
			}
			const onEnd = (event: TransitionEvent) => {
				if (event.target !== el) return
				el.removeEventListener('transitionend', onEnd)
				finish()
			}
			el.addEventListener('transitionend', onEnd)
			setTimeout(() => {
				el.removeEventListener('transitionend', onEnd)
				finish()
			}, 240)
		})
	}

	async function closeAdd() {
		const token = ++closeToken
		revealed = false
		addAction?.focus()
		await tick()
		await waitForComposerExit()
		if (token !== closeToken) return
		present = false
		placed = false
		floating = false
		errors = { title: '', person: '', ask: '' }
	}

	async function toggleAdd() {
		if (saving) return
		if (revealed) await closeAdd()
		else await openAdd()
	}

	function onWindowKey(event: KeyboardEvent) {
		if (!present || event.key !== 'Escape') return
		event.preventDefault()
		closeAdd()
	}

	function trapSlip(event: KeyboardEvent) {
		if (event.key !== 'Tab' || !placed) return
		const root = event.currentTarget as HTMLElement
		const items = [...root.querySelectorAll<HTMLElement>('input, button, textarea, select, a[href]')].filter(
			(item) => !item.hasAttribute('disabled') && item.tabIndex !== -1
		)
		const first = items[0]
		const last = items[items.length - 1]
		if (!first || !last) return
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault()
			last.focus()
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault()
			first.focus()
		}
	}

	async function startWaiting(event: SubmitEvent) {
		event.preventDefault()
		if (saving) return
		errors = {
			title: addTitle.trim() ? '' : 'Name the outcome.',
			person: addPerson.trim() ? '' : 'Name who you’re looping in.',
			ask: addAsk.trim() ? '' : 'Name what they owe you.'
		}
		if (errors.title || errors.person || errors.ask) {
			await tick()
			const field = errors.title ? outcomeInput : errors.person ? personInput : askInput
			field?.focus({ preventScroll: true })
			if (placed && field) {
				const form = field.closest('form')
				const fieldRect = field.getBoundingClientRect()
				const formRect = form?.getBoundingClientRect()
				if (form && formRect && fieldRect.bottom > formRect.bottom) {
					form.scrollTop += fieldRect.bottom - formRect.bottom + 12
				}
			}
			return
		}
		saving = true
		const before = new Set(today.outcomes.map((item) => item.id))
		const result = attempt(() => today.add(addTitle, addPerson, addAsk))
		const created = today.outcomes.find((item) => !before.has(item.id))
		addTitle = ''
		addPerson = ''
		addAsk = ''
		dismissAdd()
		saving = false
		await say(result)
		await focusOutcome(created?.id)
	}

	$effect(() => {
		if (!present) return
		const form = slipEl
		const wide = window.matchMedia('(min-width: 64rem)')
		let frame = 0
		const onLayout = () => {
			if (!wide.matches) {
				floating = false
				placed = false
				return
			}
			floating = true
			placeSlip()
		}
		onLayout()
		const schedule = () => {
			cancelAnimationFrame(frame)
			frame = requestAnimationFrame(onLayout)
		}
		const observer = new ResizeObserver(schedule)
		if (form) observer.observe(form)
		wide.addEventListener('change', schedule)
		window.addEventListener('resize', schedule)
		window.addEventListener('scroll', schedule, true)
		return () => {
			cancelAnimationFrame(frame)
			observer.disconnect()
			wide.removeEventListener('change', schedule)
			window.removeEventListener('resize', schedule)
			window.removeEventListener('scroll', schedule, true)
		}
	})
</script>

<svelte:head>
	<title>Today · Looops</title>
</svelte:head>

<svelte:window onkeydown={onWindowKey} />

<main id="today-page" class="min-h-screen px-4 pt-5 pb-28 sm:px-6 sm:pt-7 lg:px-10 lg:pt-10 lg:pb-16">
	<div class="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

	<div class="mx-auto grid w-full max-w-[90rem] gap-7 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:gap-14 xl:gap-24">
		<header class="lg:sticky lg:top-10 lg:self-start">
			<div class="flex items-center justify-between border-b border-foreground/15 pb-3 sm:pb-4">
				<Wordmark class={textLink} />
				<a href="/outcomes" class="text-muted-foreground hover:text-foreground hidden items-center gap-1 text-sm lg:inline-flex {textLink}">
					All loops
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
				Track outcomes waiting on other people, and see when it’s time to follow up.
				{#if pending.length === 0}
					{' '}No loops come back around today.
				{:else if pending.length === 1}
					{' '}One loop is back around for a follow-up.
				{:else}
					{' '}{pending.length} loops are back around for a follow-up.
				{/if}
			</p>
			<details class="mt-3 max-w-[26rem]">
				<summary class="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1 text-sm font-semibold {textLink}">
					How Looops works
					<span class="works-mark">
						<HugeiconsIcon icon={ArrowRight02Icon} class="size-3.5" aria-hidden="true" />
					</span>
				</summary>
				<ol class="text-muted-foreground marker:text-foreground mb-1 list-decimal space-y-2 pl-5 text-sm leading-6">
					<li>Open a loop for the outcome you want.</li>
					<li>Loop in the person, and name what they owe you.</li>
					<li>When it comes back around, nudge them.</li>
				</ol>
			</details>

			<div class="relative mt-5">
				<Button
					variant="secondary"
					class="min-h-12 w-full justify-between px-4 lg:min-h-11 lg:aria-expanded:relative lg:aria-expanded:z-40"
					bind:ref={addAction}
					aria-expanded={revealed}
					aria-controls="open-loop"
					onclick={toggleAdd}
				>
					Open a loop
					<span class="open-mark" data-open={revealed ? '' : undefined}>
						<HugeiconsIcon icon={PlusSignIcon} aria-hidden="true" />
					</span>
				</Button>
				{#if present && !floating}
					<div class="composer-reveal" data-open={revealed ? '' : undefined} bind:this={revealEl}>
						<div class="composer-clip">
							{@render openLoopForm()}
						</div>
					</div>
				{/if}
			</div>
		</header>

		<div class="min-w-0">
			{#if notice}
				<p class="border-primary/30 bg-primary/5 mb-6 border-y py-3 text-sm text-foreground" aria-hidden="true">{notice}</p>
			{/if}

			{#if today.sample}
				<div class="mb-8 flex flex-col items-start gap-2 border-y border-border py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
					<p class="max-w-xl text-sm leading-6">
						<span class="font-medium">These are sample loops.</span>
						<span class="text-muted-foreground"> A loop is an outcome you’re waiting on someone else to move forward.</span>
					</p>
					<Button class="min-h-11 shrink-0 self-end sm:self-center" variant="ghost" onclick={clearSample}>Clear sample</Button>
				</div>
			{/if}

			<section aria-labelledby="follow-ups-heading">
				<div class="flex min-h-12 items-end justify-between gap-4 border-b border-foreground pb-3">
					<h2 id="follow-ups-heading" class="text-lg font-semibold tracking-[-0.02em]">Follow-ups</h2>
					<p class="text-muted-foreground text-xs font-medium tabular-nums">
						{pending.length} due
					</p>
				</div>

				{#if pending.length === 0}
					<div class="border-b border-border py-12 sm:py-16">
						<p class="max-w-md text-2xl leading-tight font-medium tracking-[-0.03em]">Nothing needs a nudge today.</p>
						<p class="text-muted-foreground mt-3 max-w-md text-sm leading-6">When it’s time to loop back, the person and ask come around here.</p>
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
						<h2 id="nudged-today" class="text-sm font-semibold">Nudged today</h2>
						<span class="text-muted-foreground text-xs tabular-nums">{nudged.length}</span>
					</div>
					<ul>
						{#each nudged as outcome (outcome.id)}
							<li
								class:dispatch-arrival={playArrival && recentlyNudged === outcome.id}
								class="border-b border-border"
								style:view-transition-name={morphing && recentlyNudged === outcome.id ? `dispatch-${outcome.id}` : 'none'}
							>
								<a
									href="/outcomes/{outcome.id}"
									class="group grid min-h-14 grid-cols-[1fr_auto] items-center gap-4 py-3 text-sm {textLink}"
								>
									<span class="min-w-0 [overflow-wrap:anywhere]">
										<span class="font-medium">{outcome.title}</span>
										<span class="text-muted-foreground"> · {nudgedSummary(outcome)}</span>
									</span>
									<span class="text-secondary text-xs font-semibold">Nudged</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

		</div>
	</div>
	{#if present && floating}
		<button
			type="button"
			tabindex="-1"
			class="fixed inset-0 z-30 cursor-default bg-transparent"
			aria-label="Close"
			onclick={closeAdd}
		></button>
		{@render openLoopForm()}
	{/if}
</main>

{#snippet openLoopForm()}
	<form
		id="open-loop"
		class="composer border-secondary bg-card z-40 border p-5 sm:p-7"
		bind:this={slipEl}
		data-open={revealed ? '' : undefined}
		data-placed={placed ? '' : undefined}
		data-above={above ? '' : undefined}
		style:--slip-top="{slipBox.top}px"
		style:--slip-left="{slipBox.left}px"
		style:--slip-width="{slipBox.width}px"
		style:--slip-max="{slipBox.maxHeight}px"
		novalidate
		aria-labelledby="open-loop-legend"
		role={placed ? 'dialog' : undefined}
		aria-modal={placed ? 'true' : undefined}
		inert={!floating && !revealed}
		onsubmit={startWaiting}
		onkeydown={trapSlip}
	>
		<Field.Set>
			<Field.Legend id="open-loop-legend">Open a loop</Field.Legend>
			<Field.Group class="mt-6 grid gap-5 sm:grid-cols-2">
				<div class="sm:col-span-2">{@render textField('add-outcome', 'Outcome', 'outcome', 'title')}</div>
				{@render textField('add-person', 'Who you’re looping in', 'person', 'person')}
				{@render textField('add-ask', 'What they owe you', 'ask', 'ask')}
				<Field.Field orientation="vertical" class="gap-2 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:*:w-auto">
					<Button type="submit" variant="secondary" class="min-h-11 w-full sm:w-auto sm:min-w-28" disabled={saving}>
						{saving ? 'Opening…' : 'Open'}
					</Button>
					<Button variant="ghost" class="min-h-11 w-full sm:w-auto" onclick={closeAdd}>Cancel</Button>
				</Field.Field>
			</Field.Group>
		</Field.Set>
	</form>
{/snippet}

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
		class="group pointer-fine:hover:bg-card/70 pointer-fine:transition-colors grid min-w-0 border-b border-border py-3.5 sm:px-3 xl:grid-cols-[minmax(9rem,0.85fr)_minmax(12rem,1.1fr)_5.5rem_auto] xl:items-center xl:gap-x-6 xl:py-6"
		style:view-transition-name={morphing && recentlyNudged === outcome.id ? `dispatch-${outcome.id}` : 'none'}
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
			<Button class={rowAction} variant="ghost" onclick={() => closeOutcome(outcome.id)}>Close loop</Button>
			<Button class="{rowAction} ml-auto xl:ml-2" onclick={() => nudge(outcome.id)}>Nudge</Button>
		</div>
	</li>
{/snippet}

<style>
	:global(#today-page),
	:global(#today-page *) {
		overflow-anchor: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	:global(.works-mark) {
		display: inline-flex;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global(details[open] .works-mark) {
		transform: rotate(90deg);
	}

	.open-mark {
		display: inline-flex;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.open-mark[data-open] {
		transform: rotate(45deg);
	}

	.composer-reveal {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 180ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.composer-reveal[data-open] {
		grid-template-rows: 1fr;
		transition-duration: 240ms;
	}

	.composer-clip {
		min-height: 0;
		overflow: hidden;
	}

	.composer {
		margin-top: 0.75rem;
	}

	@media (min-width: 64rem) {
		.composer-reveal,
		.composer-reveal[data-open] {
			position: absolute;
			display: block;
			width: 0;
			height: 0;
			margin: 0;
			overflow: visible;
			grid-template-rows: none;
			transition: none;
		}

		.composer-clip {
			overflow: visible;
		}

		.composer {
			position: fixed;
			z-index: 40;
			top: var(--slip-top);
			left: var(--slip-left);
			width: var(--slip-width);
			max-height: var(--slip-max);
			margin-top: 0;
			overflow-y: auto;
			overscroll-behavior: contain;
			clip-path: inset(0 0 100% 0);
			opacity: 0;
			transition: clip-path 180ms cubic-bezier(0.16, 1, 0.3, 1);
		}

		.composer[data-above] {
			clip-path: inset(100% 0 0 0);
		}

		.composer[data-placed] {
			opacity: 1;
		}

		.composer[data-placed][data-open] {
			clip-path: inset(0 0 0 0);
			transition-duration: 240ms;
		}
	}

	.dispatch-arrival {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 220ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 220ms cubic-bezier(0.16, 1, 0.3, 1);

		@starting-style {
			opacity: 0;
			transform: translateY(-0.35rem);
		}
	}

	:global(:root[data-transition='nudge']::view-transition-group(*)) {
		animation-duration: 280ms;
		animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
	}

	:global(:root[data-transition='nudge']::view-transition-old(root)),
	:global(:root[data-transition='nudge']::view-transition-new(root)) {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.open-mark,
		:global(.works-mark),
		.composer-reveal,
		.composer,
		.dispatch-arrival {
			transition: none;
		}

		.dispatch-arrival {
			opacity: 1;
			transform: none;
		}

		:global(:root[data-transition='nudge']::view-transition-group(*)),
		:global(:root[data-transition='nudge']::view-transition-old(*)),
		:global(:root[data-transition='nudge']::view-transition-new(*)) {
			animation-duration: 0s;
		}
	}
</style>
