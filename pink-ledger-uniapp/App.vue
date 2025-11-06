<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	
	/* 全局隐藏滚动条样式 - 适用于所有页面 */
	::-webkit-scrollbar {
		display: none !important;
		width: 0 !important;
		height: 0 !important;
		color: transparent !important;
	}
	
	::-webkit-scrollbar-track {
		display: none !important;
	}
	
	::-webkit-scrollbar-thumb {
		display: none !important;
	}
	
	/* scroll-view组件特定样式 */
	scroll-view {
		-ms-overflow-style: none !important; /* IE和Edge */
		scrollbar-width: none !important; /* Firefox */
	}
	
	/* 针对常见组件的滚动条隐藏 */
	page {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* Internet Explorer 10+ */
	}
	
	view {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* Internet Explorer 10+ */
	}
	
	page::-webkit-scrollbar,
	view::-webkit-scrollbar {
		display: none; /* WebKit */
	}
</style>
