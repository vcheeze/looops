<script lang="ts">
	import { page } from '$app/state'
	import { ArrowLeft01Icon, Calendar01Icon, LeftToRightListDashIcon } from '@hugeicons/core-free-icons'
	import { HugeiconsIcon } from '@hugeicons/svelte'
	import favicon from '$lib/assets/favicon.svg'
	import './layout.css'

	let { children } = $props()

	const path = $derived(page.url.pathname)
	const back = $derived.by(() => {
		const reply = path.match(/^\/outcomes\/([^/]+)\/reply\//)
		if (reply) return { href: `/outcomes/${reply[1]}`, label: 'Outcome' }
		if (/^\/outcomes\/[^/]+$/.test(path)) return { href: '/outcomes', label: 'Outcomes' }
		return null
	})
	const onOutcomes = $derived(path === '/outcomes' || path.startsWith('/outcomes/'))
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div data-has-back={back ? '' : undefined}>
	{#if back}
		<a
			class="hidden phone:sticky phone:top-0 phone:z-20 phone:flex phone:min-h-11 phone:items-center phone:gap-[0.35rem] phone:border-b phone:border-border phone:bg-background phone:pt-[env(safe-area-inset-top)] phone:pr-[max(1rem,env(safe-area-inset-right))] phone:pl-[max(0.75rem,env(safe-area-inset-left))] phone:text-[1.0625rem] phone:font-semibold phone:text-foreground phone:no-underline phone:active:bg-muted phone:focus-visible:z-40 phone:focus-visible:outline-2 phone:focus-visible:-outline-offset-2 phone:focus-visible:outline-ring"
			href={back.href}
		>
			<HugeiconsIcon icon={ArrowLeft01Icon} class="size-5" />
			{back.label}
		</a>
	{/if}
	{@render children()}
	<nav
		class="hidden phone:fixed phone:inset-x-0 phone:bottom-0 phone:z-30 phone:grid phone:grid-cols-2 phone:border-t phone:border-border phone:bg-background phone:px-3 phone:pt-[0.15rem] phone:pb-[env(safe-area-inset-bottom)]"
		aria-label="Places"
	>
		<a
			class="flex min-h-12 flex-col items-center justify-center gap-[0.15rem] rounded-none text-[0.9375rem] font-semibold text-muted-foreground no-underline aria-[current=page]:text-foreground active:bg-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
			href="/"
			aria-current={path === '/' ? 'page' : undefined}
		>
			<HugeiconsIcon icon={Calendar01Icon} class="size-5" />
			Today
		</a>
		<a
			class="flex min-h-12 flex-col items-center justify-center gap-[0.15rem] rounded-none text-[0.9375rem] font-semibold text-muted-foreground no-underline aria-[current=page]:text-foreground active:bg-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
			href="/outcomes"
			aria-current={onOutcomes ? 'page' : undefined}
		>
			<HugeiconsIcon icon={LeftToRightListDashIcon} class="size-5" />
			Outcomes
		</a>
	</nav>
</div>
