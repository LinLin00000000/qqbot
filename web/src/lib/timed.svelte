<script lang="ts">
	import BoxWrapper from '$lib/boxWrapper.svelte'

	const pad = (n) => (n < 10 ? '0' : '') + n
	const dateNow = new Date()
	let date = `${dateNow.getFullYear()}-${pad(dateNow.getMonth() + 1)}-${pad(dateNow.getDate())}`
	dateNow.setMinutes(dateNow.getMinutes() + 1)
	let time = `${pad(dateNow.getHours())}:${pad(dateNow.getMinutes())}`

	export let title = '定时设置'
	export let interval: number
	export let dateTime: number
	$: dateTime = Date.parse(`${date} ${time}`)
</script>

<BoxWrapper bind:title width="35"
	><div class="field">
		<label class="label">起始日期<input class="ml-3" type="date" value={date} min={date} /></label>
	</div>

	<div class="field">
		<label class="label">起始时间<input class="ml-3" type="time" value={time} /></label>
	</div>

	<div class="field">
		<label class="label"
			>重复间隔时间（秒）<input class=" ml-3" type="number" value={interval} /></label
		>
	</div></BoxWrapper
>
