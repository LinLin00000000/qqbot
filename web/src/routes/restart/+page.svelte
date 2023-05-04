<script context="module" lang="ts">
	import { ApiServerRestart } from '$lib/api'
	import Swal from 'sweetalert2'

	function restart() {
		fetch(ApiServerRestart).then(async (res) => {
			if (res.status === 200) {
				Swal.fire({
					title: 'Restart success!',
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

<div class="center" style="height:100vh">
	<button class="button is-danger is-large" on:click={restart}>RESTART</button>
</div>
