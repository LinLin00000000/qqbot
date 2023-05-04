<script context="module" lang="ts">
	import Swal from 'sweetalert2'
</script>

<script lang="ts">
	import { ApiMessageForward } from '$lib/api'
	import SelectBot from '$lib/selectBot.svelte'
	import TargetGroups from '$lib/targetGroups.svelte'

	let botId: string

	let sourceType = 'group'
	let sourceIds: string[]  = []

	let forwardRule = 'include'
	let selectIds = []

	let targetType = 'group'
	let targetIds: string[]  = []

	function submit() {
		fetch(ApiMessageForward, {
			method: 'POST',
			body: JSON.stringify({
				botId,
				sourceType,
				sourceIds,
				forwardRule,
				selectIds,
				targetType,
				targetIds
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

<TargetGroups
	title="消息来源"
	bind:radioValue={sourceType}
	bind:inputValue={sourceIds}
	groupOption
	bind:groupFilter={forwardRule}
	bind:selectIds
	prefix="Source"
	groupOptionLabel="转发规则"
/>

<TargetGroups title="转发目标" bind:radioValue={targetType} bind:inputValue={targetIds} />

<button class="button is-success is-light" on:click={submit}>提交</button>
