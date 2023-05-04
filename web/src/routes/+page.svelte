<script context="module" lang="ts">
	enum BotState {
		Prelude,
		InputID,
		QrcodeLogin,
		Online,
		Offline
	}
</script>

<script lang="ts">
	import BotLogin from '$lib/botLogin.svelte'
	import { bots } from '$lib/stores'

	function addBot() {
		botStates = [...botStates, {}]
	}

	$: botStates = $bots.length
		? [...$bots.map((e) => ({ id: e.id, state: BotState.Online })) as any[], {}]
		: [{ id: '729046847' }, {}]
</script>

<div class="columns is-multiline center">
	{#each [...botStates] as bot (bot)}
		<div class="column is-3 box m-2" style="height: 50vh">
			<BotLogin initBotId={bot.id} initState={bot.state} on:addBot={addBot} />
		</div>
	{/each}
</div>
