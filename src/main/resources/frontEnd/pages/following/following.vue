<template>
	<view class="container">
		<view class="header">
			<text class="title">我的关注</text>
		</view>
		
		<view class="content">
			<view class="following-list">
				<view class="user-item" v-for="user in followingUsers" :key="user.id">
					<image class="user-avatar" :src="user.avatar" mode="aspectFill"></image>
					<view class="user-info">
						<text class="user-name">{{ user.name }}</text>
						<text class="user-desc">{{ user.description }}</text>
					</view>
					<button class="follow-btn" @tap="toggleFollow(user)">
						{{ user.isFollowing ? '已关注' : '关注' }}
					</button>
				</view>
			</view>
			
			<view class="empty-state" v-if="followingUsers.length === 0">
				<text class="empty-text">还没有关注任何人</text>
				<button class="explore-btn" @tap="exploreUsers">去发现更多用户</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			followingUsers: []
		}
	},
	onLoad() {
		this.loadFollowingUsers()
	},
	methods: {
		loadFollowingUsers() {
			this.followingUsers = [
				{
					id: 1,
					name: '设计师小王',
					description: '专注UI/UX设计',
					avatar: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=王',
					isFollowing: true
				},
				{
					id: 2,
					name: '前端开发者',
					description: 'Vue.js技术分享者',
					avatar: 'https://via.placeholder.com/60x60/50E3C2/FFFFFF?text=前',
					isFollowing: true
				}
			]
		},
		toggleFollow(user) {
			user.isFollowing = !user.isFollowing
			if (!user.isFollowing) {
				uni.showModal({
					title: '确认取消关注',
					content: `确定要取消关注 ${user.name} 吗？`,
					success: (res) => {
						if (!res.confirm) {
							user.isFollowing = true
						}
					}
				})
			}
		},
		exploreUsers() {
			uni.switchTab({
				url: '/pages/discover/discover'
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
	padding: $spacing-md;
}

.following-list {
	.user-item {
		display: flex;
		align-items: center;
		background: white;
		padding: $spacing-md;
		margin-bottom: $spacing-md;
		border-radius: $border-radius-card;
		
		.user-avatar {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			margin-right: $spacing-md;
		}
		
		.user-info {
			flex: 1;
			
			.user-name {
				font-size: $font-size-content;
				font-weight: 500;
				color: $text-primary;
				display: block;
				margin-bottom: $spacing-xs;
			}
			
			.user-desc {
				font-size: $font-size-helper;
				color: $text-secondary;
			}
		}
		
		.follow-btn {
			background: $primary-color;
			color: white;
			border: none;
			padding: $spacing-xs $spacing-md;
			border-radius: $border-radius-button;
			font-size: $font-size-helper;
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