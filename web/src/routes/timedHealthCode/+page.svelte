<script context="module" lang="ts">
	import Swal from 'sweetalert2'
</script>

<script lang="ts">
	import Timed from '$lib/timed.svelte'
	import TargetGroups from '$lib/targetGroups.svelte'
	import { ApiTimedHealthCode } from '$lib/api'
	import SelectBot from '$lib/selectBot.svelte'

	let botId: string

	let start
	let interval = 10 * 60

	let targetType = 'private'
	let targetIds = ['729046847']

	let groupFilter
	let selectIds :string[]= []

	let noticeTargetType = 'private'
	let noticeTargetId = ['729046847']

	function submit() {
		fetch(ApiTimedHealthCode, {
			method: 'POST',
			body: JSON.stringify({
				botId,
				start,
				interval,
				targetType,
				targetIds,
				groupFilter,
				selectIds,
				noticeTargetType,
				noticeTargetId
			}),
			headers: {
				'Content-Type': 'application/json'
			}
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

<TargetGroups
	title="目标群体"
	bind:radioValue={targetType}
	bind:inputValue={targetIds}
	groupOption
	bind:groupFilter
	bind:selectIds
/>

<TargetGroups
	title="预警通知目标"
	bind:radioValue={noticeTargetType}
	bind:inputValue={noticeTargetId}
/>

<button class="button is-success is-light" on:click={submit}>提交</button>
