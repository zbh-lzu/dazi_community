<template>
	<view class="container">
		<view class="header">
			<text class="title">我的社群</text>
		</view>
		
		<view class="content">
			<view class="groups-list">
				<view class="group-item" v-for="group in myGroups" :key="group.id" @tap="viewGroupDetail(group)">
					<image class="group-avatar" :src="group.avatar" mode="aspectFill"></image>
					<view class="group-info">
						<text class="group-name">{{ group.name }}</text>
						<text class="group-desc">{{ group.description }}</text>
						<view class="group-meta">
							<text class="member-count">{{ group.memberCount }}人</text>
							<text class="last-message">{{ group.lastMessage }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="empty-state" v-if="myGroups.length === 0">
				<text class="empty-text">还没有加入任何社群</text>
				<button class="explore-btn" @tap="exploreGroups">去发现社群</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			myGroups: []
		}
	},
	onLoad() {
		this.loadMyGroups()
	},
	methods: {
		loadMyGroups() {
			// 模拟加载数据
			this.myGroups = [
				{
					id: 1,
					name: '产品设计交流群',
					description: '分享设计心得，探讨产品趋势',
					avatar: 'https://via.placeholder.com/60x60/00D4AA/FFFFFF?text=设',
					memberCount: 156,
					lastMessage: '有新的设计分享'
				},
				{
					id: 2,
					name: '前端开发学习',
					description: '一起学习前端技术',
					avatar: 'https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=前',
					memberCount: 89,
					lastMessage: '新的技术文章推荐'
				}
			]
		},
		viewGroupDetail(group) {
			uni.navigateTo({
				url: `/pages/groupDetail/groupDetail?id=${group.id}`
			})
		},
		exploreGroups() {
			uni.switchTab({
				url: '/pages/groups/groups'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.container {
	min-height: 100vh;
	background-color: $background-color;
}

.header {
	background: white;
	padding: $spacing-lg;
	border-bottom: 1px solid $border-color;
	
	.title {
		font-size: $font-size-title;
		font-weight: bold;
		color: $text-primary;
	}
}

.content {
	flex: 1;
	padding: $spacing-md;
}

.groups-list {
	.group-item {
		display: flex;
		align-items: center;
		padding: $spacing-md;
		margin-bottom: $spacing-md;
		background: white;
		border-radius: $border-radius-card;
		
		.group-avatar {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			margin-right: $spacing-md;
		}
		
		.group-info {
			flex: 1;
			
			.group-name {
				font-size: $font-size-content;
				font-weight: 500;
				color: $text-primary;
				display: block;
				margin-bottom: $spacing-xs;
			}
			
			.group-desc {
				font-size: $font-size-helper;
				color: $text-secondary;
				display: block;
				margin-bottom: $spacing-xs;
			}
			
			.group-meta {
				display: flex;
				gap: $spacing-md;
				
				.member-count,
				.last-message {
					font-size: $font-size-small;
					color: $text-disabled;
				}
			}
		}
	}
}

.empty-state {
	text-align: center;
	padding: $spacing-xl;
	
	.empty-text {
		font-size: $font-size-content;
		color: $text-secondary;
		display: block;
		margin-bottom: $spacing-lg;
	}
	
	.explore-btn {
		background: $primary-color;
		color: white;
		border: none;
		padding: $spacing-sm $spacing-lg;
		border-radius: $border-radius-button;
	}
}
</style> 