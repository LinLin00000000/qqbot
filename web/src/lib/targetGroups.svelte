<script lang='ts'>
	import { capitalize } from '$lib/util'
	import RadioAndInput from '$lib/RadioAndInput.svelte'
	import BoxWrapper from '$lib/boxWrapper.svelte'
	import Svelecte from 'svelecte'

	const SvelecteConfig = {
		empty: 'Please input',
		createRowLabel: (value) => `Add ${value}`
	}

	const groupFilters = ['all', 'include', 'exclude']
	const radioOptions = ['group', 'private']

	export let title = ''

	export let groupOption = false
	export let groupOptionLabel = 'GroupOption'
	export let prefix = 'Target'

	export let radioValue
	export let inputValue: string[]  = []
	export let groupFilter = 'include'

	export let selectIds: string[]   = []
</script>

<BoxWrapper bind:title width="40">
	<RadioAndInput
		radioLabel={prefix + 'Type'}
		inputLabel={prefix + 'Id'}
		{radioOptions}
		bind:radioValue
		bind:inputValue
	/>

	{#if groupOption && radioValue === 'group'}
		<div class="field">
			<div class="label">{groupOptionLabel}</div>
			<div class="control">
				{#each groupFilters as rule}
					<label class="radio"
						><input class="mr-1" type="radio" bind:group={groupFilter} value={rule} />{capitalize(
							rule
						)}</label
					>
				{/each}
			</div>
		</div>

		{#if groupFilter !== 'all'}
			<Svelecte
				multiple
				creatable
				creatablePrefix=""
				clearable
				disableSifter
				placeholder="Add QQ Number"
				i18n={SvelecteConfig}
				bind:value={selectIds}
			/>
		{/if}
	{/if}
</BoxWrapper>
