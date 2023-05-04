<script lang="ts">
	import { page } from '$app/stores'
	import { ApiGetBots } from '$lib/api'
	import { bots } from '$lib/stores'
	import { onMount } from 'svelte'

	const sidebars = [
		{ route: '/', name: '机器人登录' },
		{ route: '/timedMessage', name: '定时消息' },
		{ route: '/forward', name: '消息转发' },
		{ route: '/timedHealthCode', name: '定时健康码检测' },
		{ route: '/subscribe', name: '疫情消息订阅' },
		{ route: '/docs', name: 'API开发文档' },
		{ route: '/restart', name: '后端服务器重启' }
	]

	onMount(async () => {
		$bots = await (await fetch(ApiGetBots)).json()
		console.log($bots)
	})
</script>

<div class="global-cover" />

<div class="columns m-0">
	<div class="column is-2">
		<nav class="menu">
			<ul class="menu-list">
				{#each sidebars as { route, name }}
					<li>
						<a class:is-active={$page.url.pathname === route} href={route}
							>{name}</a
						>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
	<div class="column my-2">
		<slot />
	</div>
</div>

<style>
	:global(input[type='number']) {
		-moz-appearance: textfield;
	}

	:global(.global-cover) {
		mask-image: linear-gradient(
			to top,
			transparent,
			rgba(0, 0, 0, 0.013) 8.1%,
			rgba(0, 0, 0, 0.049) 15.5%,
			rgba(0, 0, 0, 0.104) 22.5%,
			rgba(0, 0, 0, 0.175) 29%,
			rgba(0, 0, 0, 0.259) 35.3%,
			rgba(0, 0, 0, 0.352) 41.2%,
			rgba(0, 0, 0, 0.45) 47.1%,
			rgba(0, 0, 0, 0.55) 52.9%,
			rgba(0, 0, 0, 0.648) 58.8%,
			rgba(0, 0, 0, 0.741) 64.7%,
			rgba(0, 0, 0, 0.825) 71%,
			rgba(0, 0, 0, 0.896) 77.5%,
			rgba(0, 0, 0, 0.951) 84.5%,
			rgba(0, 0, 0, 0.987) 91.9%,
			black
		);
		position: absolute;
		z-index: -1;
		top: 0;
		right: 0;
		left: 0;
		height: 100vh;
		opacity: 0.4;
		background: no-repeat center center/cover;
		background-image: url('https://rss3.fun/content/images/size/w1600/2021/10/photo-1550859492-d5da9d8e45f3.jpeg');
	}

	:global(.menu-list a.is-active) {
		background-color: transparent;
		color: black;
		box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.02);
		border-width: 0 0 0 4px;
		border-color: #f14668;
		border-style: solid;
	}

	:global(.box) {
		background-color: transparent;
	}

	:global(.transparent) {
		background-color: transparent;
	}

	:global(.center) {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>
