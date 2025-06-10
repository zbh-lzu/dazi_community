<template>
	<view class="container">
		<view class="header">
			<text class="title">我的好友</text>
			<button class="add-btn" @tap="addFriend">+</button>
		</view>
		
		<view class="tabs">
			<view class="tab-item" 
				  :class="{ active: currentTab === 'friends' }" 
				  @tap="switchTab('friends')">
				<text>好友</text>
				<text class="count" v-if="friendsList.length">({{ friendsList.length }})</text>
			</view>
			<view class="tab-item" 
				  :class="{ active: currentTab === 'requests' }" 
				  @tap="switchTab('requests')">
				<text>申请</text>
				<text class="count" v-if="friendRequests.length">({{ friendRequests.length }})</text>
			</view>
		</view>
		
		<view class="content">
			<!-- 好友列表 -->
			<view class="friends-list" v-if="currentTab === 'friends'">
				<view class="friend-item" v-for="friend in friendsList" :key="friend.id" @tap="viewFriendProfile(friend)">
					<image class="friend-avatar" :src="friend.avatar" mode="aspectFill"></image>
					<view class="friend-info">
						<text class="friend-name">{{ friend.name }}</text>
						<text class="friend-status">{{ friend.isOnline ? '在线' : friend.lastSeen }}</text>
						<text class="friend-desc">{{ friend.description }}</text>
					</view>
					<view class="friend-actions">
						<button class="action-btn chat" @tap.stop="chatWithFriend(friend)">💬</button>
						<button class="action-btn more" @tap.stop="showFriendMenu(friend)">⋯</button>
					</view>
				</view>
			</view>
			
			<!-- 好友申请列表 -->
			<view class="requests-list" v-if="currentTab === 'requests'">
				<view class="request-item" v-for="request in friendRequests" :key="request.id">
					<image class="request-avatar" :src="request.avatar" mode="aspectFill"></image>
					<view class="request-info">
						<text class="request-name">{{ request.name }}</text>
						<text class="request-message">{{ request.message }}</text>
						<text class="request-time">{{ formatTime(request.time) }}</text>
					</view>
					<view class="request-actions">
						<button class="accept-btn" @tap="acceptRequest(request)">接受</button>
						<button class="reject-btn" @tap="rejectRequest(request)">拒绝</button>
					</view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view class="empty-state" v-if="getCurrentList().length === 0">
				<text class="empty-text">
					{{ currentTab === 'friends' ? '还没有好友，快去添加吧' : '暂无好友申请' }}
				</text>
				<button class="explore-btn" v-if="currentTab === 'friends'" @tap="exploreUsers">发现新朋友</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentTab: 'friends',
			friendsList: [],
			friendRequests: []
		}
	},
	onLoad() {
		this.loadFriends()
		this.loadFriendRequests()
	},
	methods: {
		loadFriends() {
			this.friendsList = [
				{
					id: 1,
					name: '张小明',
					avatar: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=张',
					isOnline: true,
					description: '热爱运动的程序员',
					mutualFriends: 5
				},
				{
					id: 2,
					name: '李小红',
					avatar: 'https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=李',
					isOnline: false,
					lastSeen: '2小时前',
					description: '设计师，喜欢美食和旅行',
					mutualFriends: 8
				},
				{
					id: 3,
					name: '王大力',
					avatar: 'https://via.placeholder.com/60x60/50E3C2/FFFFFF?text=王',
					isOnline: true,
					description: '健身达人，马拉松爱好者',
					mutualFriends: 3
				},
				{
					id: 4,
					name: '赵小美',
					avatar: 'https://via.placeholder.com/60x60/FFE66D/FFFFFF?text=赵',
					isOnline: false,
					lastSeen: '1天前',
					description: '摄影师，记录生活美好',
					mutualFriends: 12
				}
			]
		},
		loadFriendRequests() {
			this.friendRequests = [
				{
					id: 101,
					name: '陈小华',
					avatar: 'https://via.placeholder.com/60x60/9B59B6/FFFFFF?text=陈',
					message: '你好，我们在同一个学习群里，想和你交个朋友',
					time: Date.now() - 2 * 60 * 60 * 1000
				},
				{
					id: 102,
					name: '刘小强',
					avatar: 'https://via.placeholder.com/60x60/E67E22/FFFFFF?text=刘',
					message: '看到你的跑步记录很棒，一起运动吧！',
					time: Date.now() - 5 * 60 * 60 * 1000
				}
			]
		},
		switchTab(tab) {
			this.currentTab = tab
		},
		getCurrentList() {
			return this.currentTab === 'friends' ? this.friendsList : this.friendRequests
		},
		viewFriendProfile(friend) {
			uni.showToast({ title: '功能开发中', icon: 'none' })
		},
		chatWithFriend(friend) {
			uni.navigateTo({
				url: `/pages/chat/chat?friendId=${friend.id}&friendName=${friend.name}`
			})
		},
		showFriendMenu(friend) {
			uni.showActionSheet({
				itemList: ['查看资料', '删除好友', '设置备注'],
				success: (res) => {
					if (res.tapIndex === 1) {
						this.deleteFriend(friend)
					} else {
						uni.showToast({ title: '功能开发中', icon: 'none' })
					}
				}
			})
		},
		deleteFriend(friend) {
			uni.showModal({
				title: '删除好友',
				content: `确定要删除好友 ${friend.name} 吗？`,
				success: (res) => {
					if (res.confirm) {
						const index = this.friendsList.findIndex(f => f.id === friend.id)
						if (index > -1) {
							this.friendsList.splice(index, 1)
							uni.showToast({
								title: '已删除好友',
								icon: 'success'
							})
						}
					}
				}
			})
		},
		acceptRequest(request) {
			const newFriend = {
				id: request.id,
				name: request.name,
				avatar: request.avatar,
				isOnline: Math.random() > 0.5,
				lastSeen: '刚刚',
				description: '新朋友',
				mutualFriends: 0
			}
			
			this.friendsList.unshift(newFriend)
			const index = this.friendRequests.findIndex(r => r.id === request.id)
			if (index > -1) {
				this.friendRequests.splice(index, 1)
			}
			
			uni.showToast({
				title: '已添加好友',
				icon: 'success'
			})
		},
		rejectRequest(request) {
			const index = this.friendRequests.findIndex(r => r.id === request.id)
			if (index > -1) {
				this.friendRequests.splice(index, 1)
				uni.showToast({
					title: '已拒绝申请',
					icon: 'success'
				})
			}
		},
		addFriend() {
			uni.showActionSheet({
				itemList: ['扫一扫', '通过手机号添加', '从通讯录添加'],
				success: (res) => {
					uni.showToast({ title: '功能开发中', icon: 'none' })
				}
			})
		},
		exploreUsers() {
			uni.switchTab({
				url: '/pages/discover/discover'
			})
		},
		formatTime(timestamp) {
			const now = Date.now()
			const diff = now - timestamp
			const minutes = Math.floor(diff / (1000 * 60))
			const hours = Math.floor(diff / (1000 * 60 * 60))
			const days = Math.floor(diff / (1000 * 60 * 60 * 24))
			
			if (minutes < 60) {
				return `${minutes}分钟前`
			} else if (hours < 24) {
				return `${hours}小时前`
			} else {
				return `${days}天前`
			}
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
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: white;
	padding: $spacing-lg;
	border-bottom: 1px solid $border-color;
	
	.title {
		font-size: $font-size-title;
		font-weight: bold;
		color: $text-primary;
	}
	
	.add-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: $primary-color;
		color: white;
		border: none;
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.tabs {
	display: flex;
	background: white;
	border-bottom: 1px solid $border-color;
	
	.tab-item {
		flex: 1;
		text-align: center;
		padding: $spacing-md;
		position: relative;
		
		&.active {
			color: $primary-color;
			
			&:after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 60%;
				height: 2px;
				background: $primary-color;
			}
		}
		
		.count {
			font-size: $font-size-small;
			opacity: 0.7;
		}
	}
}

.content {
	flex: 1;
}

.friends-list,
.requests-list {
	padding: $spacing-md;
}

.friend-item,
.request-item {
	display: flex;
	align-items: center;
	background: white;
	padding: $spacing-md;
	margin-bottom: $spacing-md;
	border-radius: $border-radius-card;
	
	.friend-avatar,
	.request-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		margin-right: $spacing-md;
	}
	
	.friend-info,
	.request-info {
		flex: 1;
		
		.friend-name,
		.request-name {
			font-size: $font-size-content;
			font-weight: 500;
			color: $text-primary;
			display: block;
			margin-bottom: 4px;
		}
		
		.friend-status {
			font-size: $font-size-small;
			color: $primary-color;
			display: block;
			margin-bottom: 4px;
		}
		
		.friend-desc,
		.request-message {
			font-size: $font-size-helper;
			color: $text-secondary;
			display: block;
			margin-bottom: 4px;
		}
		
		.request-time {
			font-size: $font-size-small;
			color: $text-disabled;
		}
	}
	
	.friend-actions {
		display: flex;
		gap: 8px;
		
		.action-btn {
			width: 32px;
			height: 32px;
			border-radius: 50%;
			border: 1px solid $border-color;
			background: white;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 16px;
			
			&.chat {
				background: $primary-color;
				color: white;
				border-color: $primary-color;
			}
		}
	}
	
	.request-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
		
		.accept-btn {
			background: $primary-color;
			color: white;
			border: none;
			padding: 8px 16px;
			border-radius: $border-radius-button;
			font-size: $font-size-helper;
		}
		
		.reject-btn {
			background: transparent;
			color: $text-secondary;
			border: 1px solid $border-color;
			padding: 8px 16px;
			border-radius: $border-radius-button;
			font-size: $font-size-helper;
		}
	}
}

.empty-state {
	text-align: center;
	padding: 40px;
	
	.empty-text {
		font-size: $font-size-content;
		color: $text-secondary;
		display: block;
		margin-bottom: 20px;
	}
	
	.explore-btn {
		background: $primary-color;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: $border-radius-button;
	}
}
</style> 