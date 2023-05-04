<script lang="ts">
	import { capitalize } from '$lib/util'
	import Svelecte from 'svelecte'

	const SvelecteConfig = {
		empty: 'Please input',
		createRowLabel: (value) => `Add ${value}`
	}

	export let radioLabel = 'RadioLabel'
	export let radioValue = ''
	export let radioOptions: string[] = []
	export let inputLabel = 'InputLabel'
	export let inputValue: string[] = []
</script>

<div class="field">
	<div class="label">{radioLabel}</div>
	<div class="control">
		{#each radioOptions as option}
			<label class="radio"
				><input class="mr-1" type="radio" bind:group={radioValue} value={option} />{capitalize(option)}</label
			>
		{/each}
	</div>
</div>

<div class="field">
	<div class="label">{inputLabel}</div>
	<div class="control">
		<!-- <input class="input transparent" style="width: 15vw" bind:value={inputValue} /> -->
		<Svelecte
				multiple
				creatable
				creatablePrefix=""
				clearable
				disableSifter
				placeholder="Add QQ Number"
				i18n={SvelecteConfig}
				bind:value={inputValue}
			/>
	</div>
</div>
