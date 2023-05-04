<script context="module" lang="ts">
	import Swal from 'sweetalert2'
</script>

<script lang="ts">
	import BoxWrapper from '$lib/boxWrapper.svelte'
	import TargetGroups from '$lib/targetGroups.svelte'
	import Timed from '$lib/timed.svelte'
	import { ApiSubscribe } from '$lib/api'
	import SelectBot from '$lib/selectBot.svelte'
	import Svelecte from 'svelecte'

	let botId: string

	let start
	let interval = 10

	let targetType = 'private'
	let targetIds = ['1973489124']

	const provinceList = [
		'北京',
		'湖北',
		'广东',
		'浙江',
		'河南',
		'湖南',
		'重庆',
		'安徽',
		'四川',
		'山东',
		'吉林',
		'福建',
		'江西',
		'江苏',
		'上海',
		'广西',
		'海南',
		'陕西',
		'河北',
		'黑龙江',
		'辽宁',
		'云南',
		'天津',
		'山西',
		'甘肃',
		'内蒙古',
		'台湾',
		'澳门',
		'香港',
		'贵州',
		'西藏',
		'青海',
		'新疆',
		'宁夏'
	]

	let provinces = ['浙江']

	function submit() {
		fetch(ApiSubscribe, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				start,
				interval,
				targetType,
				targetIds,
				botId,
				provinces
			})
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

<BoxWrapper title="选择地区（可多选）" width="50">
	<Svelecte
		multiple
		options={provinceList.map((e) => ({ value: e, label: e }))}
		bind:value={provinces}
	/>
</BoxWrapper>

<button class="button is-success is-light" on:click={submit}>提交</button>
