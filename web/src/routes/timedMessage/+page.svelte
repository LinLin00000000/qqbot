<script context="module" lang="ts">
	import Swal from 'sweetalert2'
</script>

<script lang="ts">
	import { ApiTimedMessage } from '$lib/api'
	import BoxWrapper from '$lib/boxWrapper.svelte'
	import SelectBot from '$lib/selectBot.svelte'
	import TargetGroups from '$lib/targetGroups.svelte'
	import Timed from '$lib/timed.svelte'

	let botId: string

	let start: number
	let interval = 10

	let targetType = 'private'
	let targetIds = ['729046847']
	let message = 'QAQ'

	function submit() {
		fetch(ApiTimedMessage, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ botId, start, interval, targetType, targetIds, message })
		}).then(async (res) => {
			if (res.status === 200) {
				Swal.fire({
					title: 'Submit success!',
					icon: 'success',
					showConfirmButton: false,
					timer: 1000,
					timerProgressBar: true
				})
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

<SelectBot bind:botId />

<Timed bind:interval bind:dateTime={start} />

<TargetGroups title="目标群体" bind:radioValue={targetType} bind:inputValue={targetIds} />

<BoxWrapper title="消息内容" width="40">
	<textarea class="textarea" bind:value={message} />
</BoxWrapper>

<button class="button is-success is-light" on:click={submit}>提交</button>
