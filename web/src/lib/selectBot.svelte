<script lang="ts">
	import BoxWrapper from '$lib/boxWrapper.svelte'
	import Svelecte from 'svelecte'
	import { bots } from './stores'

	export let botId: string = $bots.length ? $bots[0].id : ''
</script>

<BoxWrapper title="选择机器人">
	{#if !$bots.length}
		<div class="my-1 has-text-danger">请先登录！</div>
	{/if}

	<Svelecte options={$bots.map((e) => ({ value: e.id, label: e.id }))} bind:value={botId} />
</BoxWrapper>
