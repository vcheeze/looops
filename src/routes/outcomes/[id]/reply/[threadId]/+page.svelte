<script lang="ts">
	import { page } from '$app/state'
	import Wordmark from '#lib/components/wordmark.svelte'
	import { Button } from '#lib/components/ui/button/index.js'
	import * as Field from '#lib/components/ui/field/index.js'
	import { Input } from '#lib/components/ui/input/index.js'
	import { today, type When } from '#lib/today.svelte.js'

	type Step = 'ask' | 'next'

	const textLink =
		'focus-visible:outline-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2'

	const starts: { id: When; label: string }[] = [
		{ id: 'today', label: 'Today' },
		{ id: 'tomorrow', label: 'Tomorrow' }
	]

	let step = $state<Step>('ask')
	let notice = $state('')
	let person = $state('')
	let ask = $state('')
	let formError = $state('')

	let view = $derived.by(() => {
		const outcome = today.find(page.params.id ?? '')
		const thread = outcome?.threads.find((item) => item.id === page.params.threadId)
		if (!outcome || !thread) return null
		return {
			outcomeId: outcome.id,
			title: outcome.title,
			threadId: thread.id,
			person: thread.person,
			ask: thread.ask,
			open: outcome.status === 'open' && !thread.resolved
		}
	})

	function done() {
		if (!view) return
		notice = today.repliedDone(view.outcomeId)
	}

	function irrelevant() {
		if (!view) return
		notice = today.setAside(view.outcomeId)
	}

	function later() {
		if (!view) return
		notice = today.repliedLater(view.outcomeId, view.threadId)
	}

	function handOff(event: SubmitEvent) {
		event.preventDefault()
		if (!view) return
		const when = (event.submitter as HTMLButtonElement | null)?.value as When | undefined
		if (!person.trim() || !ask.trim()) {
			formError = 'Name who you’re looping in next, and what they owe you.'
			return
		}
		if (!when) {
			formError = 'Choose when to loop back.'
			return
		}
		notice = today.handOff(view.outcomeId, view.threadId, person, ask, when)
		person = ''
		ask = ''
		formError = ''
	}
</script>

<svelte:head>
	<title>{view ? `${view.person} replied · Looops` : 'Looops'}</title>
</svelte:head>

<main class="min-h-screen px-4 pt-5 pb-28 sm:px-6 sm:pt-7 lg:px-10 lg:pt-10 lg:pb-16">
	<div class="mx-auto grid w-full max-w-[90rem] gap-10 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:gap-14 xl:gap-24">
		<header class="min-w-0 lg:sticky lg:top-10 lg:self-start">
			<div class="flex items-center justify-between border-b border-foreground/15 pb-3 sm:pb-4">
				<Wordmark class={textLink} />
				{#if view}
					<a href="/outcomes/{view.outcomeId}" class="text-muted-foreground hover:text-foreground hidden text-sm lg:block {textLink}">Loop</a>
				{/if}
			</div>

			{#if view}
				<h1 class="mt-9 text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.04em]">
					{view.person}
				</h1>
				<p class="text-muted-foreground mt-4 text-[0.9375rem] leading-6 [overflow-wrap:anywhere]">{view.ask}</p>
				<a href="/outcomes/{view.outcomeId}" class="mt-4 inline-flex min-h-11 items-center text-sm font-semibold {textLink}">{view.title}</a>
			{:else}
				<h1 class="mt-9 text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.04em]">Reply</h1>
				<p class="text-muted-foreground mt-4 text-sm">Not found on this device.</p>
			{/if}
		</header>

		<div class="min-w-0">
			{#if !view}
				<section aria-labelledby="missing-reply">
					<div class="border-b border-foreground pb-3">
						<h2 id="missing-reply" class="text-lg font-semibold tracking-[-0.02em]">This reply is not here</h2>
					</div>
					<div class="border-b border-border py-12">
						<p class="text-muted-foreground text-sm">It is not stored on this device.</p>
						<a href="/" class="mt-4 inline-flex min-h-11 items-center text-sm font-semibold {textLink}">Return to Today</a>
					</div>
				</section>
			{:else if notice}
				<section aria-labelledby="reply-recorded">
					<div class="border-b border-foreground pb-3">
						<h2 id="reply-recorded" class="text-lg font-semibold tracking-[-0.02em]">Reply recorded</h2>
					</div>
					<div class="border-b border-border py-8">
						<p class="max-w-xl text-lg leading-7" aria-live="polite">{notice}</p>
						<Button variant="secondary" class="mt-6 min-h-11" href="/outcomes/{view.outcomeId}">View loop</Button>
					</div>
				</section>
			{:else if !view.open}
				<section aria-labelledby="already-recorded">
					<div class="border-b border-foreground pb-3">
						<h2 id="already-recorded" class="text-lg font-semibold tracking-[-0.02em]">Already recorded</h2>
					</div>
					<div class="border-b border-border py-8">
						<p class="text-muted-foreground text-sm">This reply has already moved it along.</p>
						<Button variant="secondary" class="mt-6 min-h-11" href="/outcomes/{view.outcomeId}">View loop</Button>
					</div>
				</section>
			{:else if step === 'ask'}
				<section aria-labelledby="reply-meaning">
					<div class="flex min-h-12 items-end justify-between gap-4 border-b border-foreground pb-3">
						<h2 id="reply-meaning" class="text-lg font-semibold tracking-[-0.02em]">What changed?</h2>
						<span class="text-muted-foreground text-xs">Choose one</span>
					</div>
					<ul>
						<li class="grid gap-4 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-3">
							<div>
								<p class="text-[1.0625rem] font-semibold tracking-[-0.02em]">Someone else has it now</p>
								<p class="text-muted-foreground mt-1 text-sm">Their part is done. Loop in the next person and their ask.</p>
							</div>
							<Button class="min-h-11 justify-self-end" onclick={() => { formError = ''; step = 'next' }}>
								Loop in who’s next
							</Button>
						</li>
						<li class="grid gap-4 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-3">
							<div>
								<p class="text-[1.0625rem] font-semibold tracking-[-0.02em]">{view.person} still has it</p>
								<p class="text-muted-foreground mt-1 text-sm">Record the reply and loop back tomorrow.</p>
							</div>
							<Button variant="outline" class="min-h-11 justify-self-end" onclick={later}>Loop back later</Button>
						</li>
						<li class="grid gap-4 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-3">
							<div>
								<p class="text-[1.0625rem] font-semibold tracking-[-0.02em]">The outcome is achieved</p>
								<p class="text-muted-foreground mt-1 text-sm">Nothing is left to chase. Record the reply and close the loop.</p>
							</div>
							<Button variant="outline" class="min-h-11 justify-self-end" onclick={done}>Close loop</Button>
						</li>
						<li class="grid gap-4 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-3">
							<div>
								<p class="text-[1.0625rem] font-semibold tracking-[-0.02em]">It no longer matters</p>
								<p class="text-muted-foreground mt-1 text-sm">Set it aside without closing it. You can reopen it later.</p>
							</div>
							<Button variant="ghost" class="min-h-11 justify-self-end" onclick={irrelevant}>Set aside</Button>
						</li>
					</ul>
				</section>
			{:else}
				<form class="border-secondary bg-card border p-5 sm:p-7" onsubmit={handOff}>
					<Field.Set>
						<Field.Legend>Who are you looping in next?</Field.Legend>
						<Field.Group class="mt-6 grid gap-5 sm:grid-cols-2">
							<Field.Field>
								<Field.Label for="reply-person">Who</Field.Label>
								<Input id="reply-person" bind:value={person} name="person" autocomplete="off" aria-required="true" />
							</Field.Field>
							<Field.Field>
								<Field.Label for="reply-ask">What they owe you</Field.Label>
								<Input id="reply-ask" bind:value={ask} name="ask" autocomplete="off" aria-required="true" />
							</Field.Field>
							{#if formError}
								<Field.Error class="sm:col-span-2">{formError}</Field.Error>
							{/if}
							<Field.Field orientation="horizontal" class="flex flex-wrap gap-2 pt-2 sm:col-span-2">
								{#each starts as when (when.id)}
									<Button type="submit" variant="outline" class="min-h-11" value={when.id}>{when.label}</Button>
								{/each}
								<Button variant="ghost" class="min-h-11" onclick={() => { formError = ''; step = 'ask' }}>Back</Button>
							</Field.Field>
						</Field.Group>
					</Field.Set>
				</form>
			{/if}
		</div>
	</div>
</main>
