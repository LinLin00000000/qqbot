<script context="module" lang="ts">
	import Swal from 'sweetalert2'
	enum BotState {
		Prelude,
		InputID,
		QrcodeLogin,
		Online,
		Offline
	}
</script>

<script lang="ts">
	import { ApiBotLogout, ApiGetBots, WSApiQrcodeLogin } from '$lib/api'
	import { createEventDispatcher } from 'svelte'
	import { bots } from './stores'

	const dispatch = createEventDispatcher()

	let buffer: string

	export let initBotId = ''
	let botId = initBotId

	export let initState: BotState
	let state = initState || (botId ? BotState.InputID : BotState.Prelude)

	function qrcodeLogin() {
		if (botId) {
			const ws = new WebSocket(WSApiQrcodeLogin)
			ws.onopen = () => ws.send(botId)
			ws.onmessage = async (message) => {
				console.log(message)

				const { data } = message
				if (typeof data == 'string') {
					switch (data) {
						case 'online':
							$bots = await (await fetch(ApiGetBots)).json()
							Swal.fire({
								title: 'Logged in!',
								icon: 'success',
								showConfirmButton: false,
								timer: 1000,
								timerProgressBar: true
							})
							state = BotState.Online
							break
						case 'timeout':
							Swal.fire({
								title: 'Timeout!',
								icon: 'error',
								showConfirmButton: false,
								timer: 1000,
								timerProgressBar: true
							})
							state = BotState.InputID
							break
					}
				}

				if (data instanceof Blob) {
					buffer = URL.createObjectURL(data)
					state = BotState.QrcodeLogin
				}
			}
			ws.onclose = () => (buffer = '')
		}
	}

	function addBot() {
		state = BotState.InputID
		dispatch('addBot')
	}

	function logout() {
		fetch(ApiBotLogout, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				botId
			})
		}).then(async (res) => {
			if (res.status === 200) {
				Swal.fire({
					title: 'Logout success!',
					icon: 'success',
					showConfirmButton: false,
					timer: 1000,
					timerProgressBar: true
				})
				state = BotState.InputID
			} else {
				Swal.fire({
					title: 'Failed',
					text: await res.text(),
					icon: 'error',
					showConfirmButton: false,
					timer: 1000,
					timerProgressBar: true
				})
			}
		})
	}
</script>

{#if state === BotState.Prelude}
	<div class="center">
		<button class="delete" style="transform: scale(4) rotate(45deg);" on:click={addBot} />
	</div>
{:else if state === BotState.InputID || state === BotState.QrcodeLogin}
	<div class="field has-addons">
		<div class="control">
			<input class="input" type="text" bind:value={botId} placeholder="QQ Number" />
		</div>
		<div class="control">
			<button class="button is-success is-light" on:click={qrcodeLogin}>二维码登录</button>
		</div>
	</div>
	{#if state === BotState.QrcodeLogin}
		<figure class="image is-square">
			<img class="" src={buffer} alt="登录二维码" />
		</figure>
	{/if}
{:else if state === BotState.Online}
	<div class="center is-flex-direction-column is-align-items-center">
		<div class="is-size-1">{botId}</div>
		<div class="has-text-success is-size-1">Online</div>
		<button class="button is-danger mt-4" on:click={logout}>Logout</button>
	</div>
{/if}
