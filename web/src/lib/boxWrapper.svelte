<script>
	export let width = '30'
	export let title = ''
</script>

<div class="box" style={`width: ${width}%`}>
	<div class="field"><p class="is-size-3">{title}</p></div>
	
	<slot />
</div>
