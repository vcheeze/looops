<script lang="ts">
	let {
		href = '/',
		class: className = ''
	}: {
		href?: string
		class?: string
	} = $props()
</script>

<a {href} class="vt-wordmark text-sm font-semibold tracking-[-0.01em] {className}">
	L<span class="text-primary">o</span><span class="text-secondary">o</span><span class="text-chart-3">o</span>ps
</a>
