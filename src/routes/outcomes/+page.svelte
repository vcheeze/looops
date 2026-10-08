<script lang="ts">
	import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
	import { HugeiconsIcon } from '@hugeicons/svelte'
	import Wordmark from '$lib/components/wordmark.svelte'
	import { Button } from '$lib/components/ui/button'
	import {
		backupFilename,
		backupSummary,
		createBackup,
		parseBackup,
		serializeBackup,
		type Backup
	} from '$lib/backup'
	import { outcomeGroups, outcomeSummary, today } from '$lib/today.svelte'

	const textLink =
		'focus-visible:outline-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2'

	let groups = $derived(outcomeGroups(today.outcomes))
	let file = $state<HTMLInputElement | null>(null)
	let pending = $state<Backup | null>(null)
	let notice = $state('')
	let fileError = $state('')

	function exportBackup() {
		const backup = createBackup(today.outcomes, today.sample)
		const blob = new Blob([serializeBackup(backup)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = backupFilename()
		link.click()
		setTimeout(() => URL.revokeObjectURL(url), 1000)
		pending = null
		fileError = ''
		notice = 'Backup saved.'
	}

	async function chooseFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement
		const chosen = input.files?.[0]
		input.value = ''
		if (!chosen) return
		try {
			pending = parseBackup(await chosen.text())
			fileError = ''
			notice = ''
		} catch (error) {
			pending = null
			fileError = error instanceof Error ? error.message : 'This file is not a Looops backup.'
		}
	}

	function replace() {
		if (!pending) return
		notice = today.applyBackup(pending.outcomes, pending.sample)
		pending = null
		fileError = ''
	}
</script>

<svelte:head>
	<title>Outcomes · Looops</title>
</svelte:head>

<main class="min-h-screen px-4 pt-5 pb-28 sm:px-6 sm:pt-7 lg:px-10 lg:pt-10 lg:pb-16">
	<div class="mx-auto grid w-full max-w-[90rem] gap-10 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:gap-14 xl:gap-24">
		<header class="lg:sticky lg:top-10 lg:self-start">
			<div class="flex items-center justify-between border-b border-foreground/15 pb-3 sm:pb-4">
				<Wordmark class={textLink} />
				<a href="/" class="text-muted-foreground hover:text-foreground hidden text-sm lg:block {textLink}">Today</a>
			</div>
			<h1 class="mt-9 text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.04em]">Outcomes</h1>
			<p class="text-muted-foreground mt-4 max-w-[24rem] text-[0.9375rem] leading-6">
				{today.outcomes.length === 1 ? 'One open loop on this device.' : `${today.outcomes.length} loops on this device.`}
			</p>
			<a href="/" class="mt-8 hidden min-h-11 items-center justify-between border-y border-border py-3 text-sm font-semibold lg:flex {textLink}">
				Today’s dispatch
				<HugeiconsIcon icon={ArrowRight02Icon} class="size-4" aria-hidden="true" />
			</a>
		</header>

		<div class="min-w-0">
			{#if groups.length === 0}
				<section aria-labelledby="outcomes-empty">
					<div class="flex min-h-12 items-end justify-between border-b border-foreground pb-3">
						<h2 id="outcomes-empty" class="text-lg font-semibold tracking-[-0.02em]">All outcomes</h2>
						<span class="text-muted-foreground text-xs tabular-nums">0 lines</span>
					</div>
					<div class="border-b border-border py-12 sm:py-16">
						<p class="text-2xl font-medium tracking-[-0.03em]">No outcomes yet.</p>
						<p class="text-muted-foreground mt-3 text-sm">Start one from Today when someone else has the next move.</p>
					</div>
				</section>
			{:else}
				{#each groups as group, index (group.status)}
					<section class={index === 0 ? '' : 'mt-12 sm:mt-16'} aria-labelledby="group-{group.status}">
						<div class="flex min-h-12 items-end justify-between gap-4 border-b border-foreground/70 pb-3">
							<h2 id="group-{group.status}" class="text-lg font-semibold tracking-[-0.02em]">{group.label}</h2>
							<span class="text-muted-foreground text-xs tabular-nums">
								{group.items.length} {group.items.length === 1 ? 'line' : 'lines'}
							</span>
						</div>
						<ul>
							{#each group.items as outcome (outcome.id)}
								<li class="border-b border-border">
									<a
										href="/outcomes/{outcome.id}"
										class="group grid min-h-18 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-sm py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-3"
									>
										<span class="min-w-0">
											<span class="block text-[1.0625rem] leading-6 font-semibold tracking-[-0.02em] group-hover:underline group-hover:underline-offset-4">
												{outcome.title}
											</span>
											<span class="text-muted-foreground mt-1 block text-sm [overflow-wrap:anywhere]">{outcomeSummary(outcome)}</span>
										</span>
										<span class="text-muted-foreground group-hover:text-foreground flex items-center gap-2 text-sm font-semibold">
											<span class="hidden sm:inline">Open</span>
											<HugeiconsIcon icon={ArrowRight02Icon} class="size-4" aria-hidden="true" />
										</span>
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			{/if}

			<section class="mt-14 sm:mt-20" aria-labelledby="backup-heading">
				<div class="flex min-h-11 items-end justify-between border-b border-foreground/25 pb-3">
					<h2 id="backup-heading" class="text-sm font-semibold">Device backup</h2>
					<span class="text-muted-foreground text-xs">JSON</span>
				</div>
				<div class="bg-card border-b border-border py-5 sm:px-3 sm:py-6">
					<p class="max-w-xl text-sm leading-6">Save or replace the complete local record on this device.</p>
					{#if today.sample}
						<p class="text-muted-foreground mt-1 text-sm">The current record is still the sample.</p>
					{/if}
					{#if notice}
						<p class="border-primary/30 bg-primary/5 mt-4 border-y py-3 text-sm" aria-live="polite">{notice}</p>
					{/if}
					{#if pending}
						<p class="mt-4 text-sm font-medium">{backupSummary(pending)}</p>
						<p class="text-muted-foreground mt-1 text-sm">Restoring replaces everything currently on this device.</p>
						<div class="mt-4 flex flex-wrap items-center gap-2">
							<Button onclick={replace}>Replace local data</Button>
							<Button variant="ghost" onclick={() => (pending = null)}>Cancel</Button>
						</div>
					{:else}
						<div class="mt-4 flex flex-wrap items-center gap-2">
							<Button variant="outline" onclick={exportBackup}>Export backup</Button>
							<Button variant="ghost" onclick={() => file?.click()}>Restore a backup</Button>
						</div>
					{/if}
					{#if fileError}
						<p class="text-destructive mt-4 text-sm font-semibold" role="alert">{fileError}</p>
					{/if}
					<input bind:this={file} class="sr-only" type="file" accept="application/json,.json" onchange={chooseFile} />
				</div>
			</section>
		</div>
	</div>
</main>
