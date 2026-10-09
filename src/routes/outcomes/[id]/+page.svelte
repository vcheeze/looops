<script lang="ts">
	import { page } from '$app/state'
	import Wordmark from '#lib/components/wordmark.svelte'
	import { Button } from '#lib/components/ui/button/index.js'
	import * as Field from '#lib/components/ui/field/index.js'
	import { Input } from '#lib/components/ui/input/index.js'
	import {
		derivedStatus,
		formatTouchDate,
		nudgeLine,
		openThreads,
		statusLabel,
		story,
		threadContext,
		today,
		type When
	} from '#lib/today.svelte.js'

	const textLink =
		'focus-visible:outline-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2'

	const starts: { id: When; label: string }[] = [
		{ id: 'today', label: 'Today' },
		{ id: 'tomorrow', label: 'Tomorrow' }
	]

	let notice = $state('')
	let adding = $state(false)
	let person = $state('')
	let ask = $state('')
	let formError = $state('')
	let justFinished = $state(false)

	let view = $derived.by(() => {
		const outcome = today.find(page.params.id ?? '')
		if (!outcome) return null
		const status = derivedStatus(outcome)
		return {
			id: outcome.id,
			title: outcome.title,
			status,
			label: statusLabel(status),
			open: openThreads(outcome),
			lines: story(outcome),
			isOpen: outcome.status === 'open'
		}
	})

	function addPerson(event: SubmitEvent) {
		event.preventDefault()
		if (!view) return
		const when = (event.submitter as HTMLButtonElement | null)?.value as When | undefined
		if (!person.trim() || !ask.trim()) {
			formError = 'Name who you’re looping in, and what they owe you.'
			return
		}
		if (!when) {
			formError = 'Choose when to loop back.'
			return
		}
		notice = today.addThread(view.id, person, ask, when)
		person = ''
		ask = ''
		formError = ''
		adding = false
		justFinished = false
	}

	function finish() {
		if (!view) return
		notice = today.finish(view.id)
		adding = false
		formError = ''
		justFinished = true
	}

	function pause() {
		if (!view) return
		notice = today.pause(view.id)
		adding = false
		formError = ''
		justFinished = false
	}

	function resume() {
		if (!view) return
		notice = today.resume(view.id)
		justFinished = false
	}
</script>

<svelte:head>
	<title>{view ? `${view.title} · Looops` : 'Looops'}</title>
</svelte:head>

<main class="min-h-screen px-4 pt-5 pb-28 sm:px-6 sm:pt-7 lg:px-10 lg:pt-10 lg:pb-16">
	<div class="mx-auto grid w-full max-w-[90rem] gap-10 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:gap-14 xl:gap-24">
		<header class="min-w-0 lg:sticky lg:top-10 lg:self-start">
			<div class="flex items-center justify-between border-b border-foreground/15 pb-3 sm:pb-4">
				<Wordmark class={textLink} />
				<a href="/outcomes" class="text-muted-foreground hover:text-foreground hidden text-sm lg:block {textLink}">Loops</a>
			</div>

			{#if view}
				<h1 class="mt-9 text-[clamp(2.25rem,3vw,2.875rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
					{view.title}
				</h1>
				<p class="text-muted-foreground mt-4 text-sm font-medium {justFinished ? 'animate-done' : ''}">
					{view.label}
				</p>

				{#if view.status === 'paused'}
					<div class="mt-8">
						<p class="text-muted-foreground mb-3 text-sm">Set aside, not closed. It stays off Today until you reopen it.</p>
						<Button class="min-h-11 w-full justify-between" onclick={resume}>Reopen</Button>
					</div>
				{:else if view.isOpen && !adding}
					<div class="mt-8 grid gap-2">
						<Button
							variant="secondary"
							class="min-h-11 w-full justify-between"
							onclick={() => { adding = true; formError = ''; notice = '' }}
						>
							Loop someone in
						</Button>
						<div class="flex gap-2">
							<Button variant="outline" class="min-h-11 flex-1" onclick={finish}>Close loop</Button>
							<Button variant="ghost" class="min-h-11 flex-1" onclick={pause}>Set aside</Button>
						</div>
					</div>
				{/if}
			{:else}
				<h1 class="mt-9 text-[clamp(2.5rem,5vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.04em]">Loop</h1>
				<p class="text-muted-foreground mt-4 text-sm">Not found on this device.</p>
			{/if}
		</header>

		<div class="min-w-0">
			{#if !view}
				<section aria-labelledby="missing-outcome">
					<div class="border-b border-foreground pb-3">
						<h2 id="missing-outcome" class="text-lg font-semibold tracking-[-0.02em]">This loop is not here</h2>
					</div>
					<div class="border-b border-border py-12">
						<p class="text-muted-foreground text-sm">It is not stored on this device.</p>
						<a href="/outcomes" class="mt-4 inline-flex min-h-11 items-center text-sm font-semibold {textLink}">Return to loops</a>
					</div>
				</section>
			{:else}
				{#if notice}
					<p class="border-primary/30 bg-primary/5 mb-7 border-y py-3 text-sm" aria-live="polite">{notice}</p>
				{/if}

				{#if adding}
					<form class="border-secondary bg-card mb-10 border p-5 sm:p-7" onsubmit={addPerson}>
						<Field.Set>
							<Field.Legend>{view.open.length ? 'Loop in someone else' : 'Loop in who has it next'}</Field.Legend>
							<Field.Group class="mt-6 grid gap-5 sm:grid-cols-2">
								<Field.Field>
									<Field.Label for="who-person">Who</Field.Label>
									<Input id="who-person" bind:value={person} name="person" autocomplete="off" aria-required="true" />
								</Field.Field>
								<Field.Field>
									<Field.Label for="who-ask">What they owe you</Field.Label>
									<Input id="who-ask" bind:value={ask} name="ask" autocomplete="off" aria-required="true" />
								</Field.Field>
								{#if formError}
									<Field.Error class="sm:col-span-2">{formError}</Field.Error>
								{/if}
								<Field.Field orientation="horizontal" class="flex flex-wrap gap-2 pt-2 sm:col-span-2">
									{#each starts as when (when.id)}
										<Button type="submit" variant="outline" class="min-h-11" value={when.id}>{when.label}</Button>
									{/each}
									<Button variant="ghost" class="min-h-11" onclick={() => { adding = false; formError = '' }}>Cancel</Button>
								</Field.Field>
							</Field.Group>
						</Field.Set>
					</form>
				{/if}

				{#if view.open.length > 0 || view.isOpen}
					<section aria-labelledby="holders-heading">
						<div class="flex min-h-12 items-end justify-between gap-4 border-b border-foreground pb-3">
							<h2 id="holders-heading" class="text-lg font-semibold tracking-[-0.02em]">In the loop</h2>
							<span class="text-muted-foreground text-xs tabular-nums">{view.open.length}</span>
						</div>
						{#if view.open.length === 0}
							<div class="border-b border-border py-10">
								<p class="text-muted-foreground text-sm">No one yet. Loop in the next person who has to move.</p>
							</div>
						{:else}
							<ul>
								{#each view.open as thread (thread.id)}
									<li class="grid gap-3 border-b border-border py-5 sm:px-3 xl:grid-cols-[minmax(8rem,0.7fr)_minmax(12rem,1fr)_minmax(11rem,0.9fr)_auto] xl:items-center xl:gap-6">
										<p class="text-[1.0625rem] leading-6 font-semibold tracking-[-0.02em]">{thread.person}</p>
										<p class="text-muted-foreground text-sm [overflow-wrap:anywhere]">{thread.ask}</p>
										<div>
											{#if view.isOpen}
												<p class="text-sm">{nudgeLine(thread)}</p>
											{/if}
											<p class="text-muted-foreground mt-1 text-xs tabular-nums">{threadContext(thread)}</p>
										</div>
										{#if view.isOpen}
											<Button class="min-h-11 justify-self-end" href="/outcomes/{view.id}/reply/{thread.id}">
												They replied
											</Button>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</section>
				{/if}

				<section class={view.open.length > 0 || view.isOpen ? 'mt-12 sm:mt-16' : ''} aria-labelledby="history-heading">
					<div class="flex min-h-11 items-end justify-between border-b border-foreground/25 pb-3">
						<h2 id="history-heading" class="text-sm font-semibold">History</h2>
						<span class="text-muted-foreground text-xs tabular-nums">{view.lines.length}</span>
					</div>
					{#if view.lines.length === 0}
						<p class="text-muted-foreground border-b border-border py-8 text-sm">Nothing is recorded yet.</p>
					{:else}
						<ol>
							{#each view.lines as line (line.id)}
								<li class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 border-b border-border py-4 text-sm sm:px-3">
									<time class="text-muted-foreground tabular-nums" datetime={line.at}>{formatTouchDate(line.at)}</time>
									<span>
										<span class="block font-medium">{line.label}</span>
										{#if line.detail}
											<span class="text-muted-foreground mt-0.5 block">{line.detail}</span>
										{/if}
									</span>
								</li>
							{/each}
						</ol>
					{/if}
				</section>
			{/if}
		</div>
	</div>
</main>
