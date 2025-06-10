<template>
	<view class="me-page">
		<!-- 用户信息区 -->
		<view class="user-info-section">
			<view class="user-profile">
				<view class="avatar-wrapper">
					<image :src="userInfo.avatar" mode="aspectFill" class="user-avatar" />
					<view class="level-badge" :class="getLevelClass(userInfo.level)">
						{{ userInfo.level }}
					</view>
				</view>
				<view class="user-details">
					<text class="user-name">{{ userInfo.name }}</text>
					<text class="user-id">ID: {{ userInfo.id }}</text>
					<view class="user-badges">
						<view v-if="userInfo.creditLevel" class="badge credit-badge">
							<text class="badge-icon">⭐</text>
							<text class="badge-text">信用等级{{ userInfo.creditLevel }}</text>
						</view>
						<view v-if="userInfo.memberType" class="badge member-badge">
							<text class="badge-icon">👑</text>
							<text class="badge-text">{{ userInfo.memberType }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 快捷入口 -->
			<view class="quick-entries">
				<view class="entry-item" @tap="navigateTo('/pages/friends/friends')">
					<text class="entry-icon">👥</text>
					<text class="entry-text">我的好友</text>
					<text class="entry-count" v-if="userInfo.friendsCount">{{ userInfo.friendsCount }}</text>
				</view>
				<view class="entry-item" @tap="navigateTo('/pages/settings/settings')">
					<text class="entry-icon">⚙️</text>
					<text class="entry-text">设置</text>
				</view>
				<view class="entry-item" @tap="contactSupport">
					<text class="entry-icon">💬</text>
					<text class="entry-text">联系客服</text>
				</view>
			</view>
		</view>

		<!-- 功能列表 -->
		<scroll-view class="function-list" scroll-y="true">
			<!-- 我的内容 -->
			<view class="section">
				<text class="section-title">我的内容</text>
				<view class="function-items">
					<view class="function-item" @tap="navigateTo('/pages/myGroups/myGroups')">
						<view class="item-left">
							<text class="item-icon">🏠</text>
							<text class="item-text">我的社群</text>
						</view>
						<view class="item-right">
							<text class="item-count" v-if="statsData.myGroups">{{ statsData.myGroups }}</text>
							<text class="item-arrow">></text>
						</view>
					</view>
					<view class="function-item" @tap="navigateTo('/pages/myTasks/myTasks')">
						<view class="item-left">
							<text class="item-icon">📝</text>
							<text class="item-text">我的任务</text>
						</view>
						<view class="item-right">
							<text class="item-count" v-if="statsData.myTasks">{{ statsData.myTasks }}</text>
							<text class="item-arrow">></text>
						</view>
					</view>
					<view class="function-item" @tap="navigateTo('/pages/schedule/schedule')">
						<view class="item-left">
							<text class="item-icon">📅</text>
							<text class="item-text">日程表</text>
						</view>
						<view class="item-right">
							<text class="item-arrow">></text>
						</view>
					</view>
				</view>
			</view>

			<!-- 社交功能 -->
			<view class="section">
				<text class="section-title">社交功能</text>
				<view class="function-items">
					<view class="function-item" @tap="navigateTo('/pages/invite/invite')">
						<view class="item-left">
							<text class="item-icon">🎁</text>
							<text class="item-text">邀请好友</text>
						</view>
						<view class="item-right">
							<text class="item-badge">有奖励</text>
							<text class="item-arrow">></text>
						</view>
					</view>
					<view class="function-item" @tap="navigateTo('/pages/achievements/achievements')">
						<view class="item-left">
							<text class="item-icon">🏆</text>
							<text class="item-text">成就徽章</text>
						</view>
						<view class="item-right">
							<text class="item-count" v-if="statsData.achievements">{{ statsData.achievements }}</text>
							<text class="item-arrow">></text>
						</view>
					</view>
					<view class="function-item" @tap="navigateTo('/pages/following/following')">
						<view class="item-left">
							<text class="item-icon">❤️</text>
							<text class="item-text">我的关注</text>
						</view>
						<view class="item-right">
							<text class="item-count" v-if="statsData.following">{{ statsData.following }}</text>
							<text class="item-arrow">></text>
						</view>
					</view>
				</view>
			</view>

			<!-- 工具与帮助 -->
			<view class="section">
				<text class="section-title">工具与帮助</text>
				<view class="function-items">
					<view class="function-item" @tap="navigateTo('/pages/feedback/feedback')">
						<view class="item-left">
							<text class="item-icon">💡</text>
							<text class="item-text">反馈建议</text>
						</view>
						<view class="item-right">
							<text class="item-arrow">></text>
						</view>
					</view>
					<view class="function-item" @tap="navigateTo('/pages/help/help')">
						<view class="item-left">
							<text class="item-icon">❓</text>
							<text class="item-text">帮助中心</text>
						</view>
						<view class="item-right">
							<text class="item-arrow">></text>
						</view>
					</view>
					<view class="function-item" @tap="navigateTo('/pages/about/about')">
						<view class="item-left">
							<text class="item-icon">ℹ️</text>
							<text class="item-text">关于我们</text>
						</view>
						<view class="item-right">
							<text class="item-arrow">></text>
						</view>
					</view>
				</view>
			</view>

			<!-- 账号管理 -->
			<view class="section">
				<text class="section-title">账号管理</text>
				<view class="function-items">
					<view class="function-item" @tap="navigateTo('/pages/privacy/privacy')">
						<view class="item-left">
							<text class="item-icon">🔒</text>
							<text class="item-text">隐私设置</text>
						</view>
						<view class="item-right">
							<text class="item-arrow">></text>
						</view>
					</view>
					<view class="function-item" @tap="navigateTo('/pages/security/security')">
						<view class="item-left">
							<text class="item-icon">🛡️</text>
							<text class="item-text">账号安全</text>
						</view>
						<view class="item-right">
							<text class="item-arrow">></text>
						</view>
					</view>
					<view class="function-item" @tap="switchAccount">
						<view class="item-left">
							<text class="item-icon">🔄</text>
							<text class="item-text">切换账号</text>
						</view>
						<view class="item-right">
							<text class="item-arrow">></text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 登出按钮 -->
		<view class="logout-section">
			<button class="logout-btn" @tap="logout">退出登录</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {
				name: '用户昵称',
				id: '123456789',
				avatar: 'https://picsum.photos/200/200?random=999',
				level: 'Lv.5',
				creditLevel: 'A',
				memberType: '黄金会员',
				friendsCount: 128
			},
			statsData: {
				myGroups: 8,
				myTasks: 15,
				achievements: 12,
				following: 45
			}
		}
	},
	onLoad() {
		this.loadUserData()
	},
	onShow() {
		// 页面显示时刷新数据
		this.loadUserData()
	},
	methods: {
		// 加载用户数据
		async loadUserData() {
			try {
				// 模拟API调用获取用户信息和统计数据
				// const userData = await this.fetchUserData()
				// const stats = await this.fetchUserStats()
				// this.userInfo = userData
				// this.statsData = stats
				
				// 模拟数据已在data中定义
			} catch (error) {
				console.error('加载用户数据失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		},
		
		// 导航到指定页面
		navigateTo(url) {
			uni.navigateTo({
				url: url,
				fail: (err) => {
					console.warn('页面跳转失败:', url, err)
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					})
				}
			})
		},
		
		// 联系客服
		contactSupport() {
			uni.showActionSheet({
				itemList: ['在线客服', '电话客服', '邮件反馈'],
				success: (res) => {
					switch (res.tapIndex) {
						case 0:
							// 打开在线客服
							this.navigateTo('/pages/chat/chat?type=support')
							break
						case 1:
							// 拨打客服电话
							uni.makePhoneCall({
								phoneNumber: '400-123-4567'
							})
							break
						case 2:
							// 发送邮件
							this.navigateTo('/pages/feedback/feedback?type=email')
							break
					}
				}
			})
		},
		
		// 切换账号
		switchAccount() {
			uni.showModal({
				title: '切换账号',
				content: '确定要切换到其他账号吗？',
				success: (res) => {
					if (res.confirm) {
						// 清除当前登录状态
						uni.removeStorageSync('userToken')
						// 跳转到登录页
						uni.reLaunch({
							url: '/pages/login/login'
						})
					}
				}
			})
		},
		
		// 退出登录
		logout() {
			uni.showModal({
				title: '退出登录',
				content: '确定要退出当前账号吗？',
				confirmColor: '#ff4757',
				success: (res) => {
					if (res.confirm) {
						// 清除用户数据
						uni.clearStorageSync()
						
						// 显示退出成功提示
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						})
						
						// 延迟跳转到登录页
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/login'
							})
						}, 1500)
					}
				}
			})
		},
		
		// 获取等级样式类
		getLevelClass(level) {
			const levelNum = parseInt(level.replace('Lv.', ''))
			if (levelNum >= 10) return 'level-high'
			if (levelNum >= 5) return 'level-medium'
			return 'level-low'
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.me-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: $background-color;
}

.user-info-section {
	background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
	padding: $spacing-xl $spacing-lg $spacing-lg;
	color: white;
}

.user-profile {
	display: flex;
	align-items: center;
	margin-bottom: $spacing-lg;
	
	.avatar-wrapper {
		position: relative;
		margin-right: $spacing-md;
		
		.user-avatar {
			width: 80px;
			height: 80px;
			border-radius: 50%;
			border: 3px solid rgba(255, 255, 255, 0.3);
		}
		
		.level-badge {
			position: absolute;
			bottom: -5px;
			right: -5px;
			padding: 2px 6px;
			border-radius: 10px;
			font-size: $font-size-small;
			font-weight: bold;
			border: 2px solid white;
			
			&.level-low {
				background-color: #95a5a6;
			}
			
			&.level-medium {
				background-color: #f39c12;
			}
			
			&.level-high {
				background-color: #e74c3c;
			}
		}
	}
	
	.user-details {
		flex: 1;
		
		.user-name {
			font-size: $font-size-title;
			font-weight: bold;
			margin-bottom: 4px;
			display: block;
		}
		
		.user-id {
			font-size: $font-size-helper;
			opacity: 0.8;
			margin-bottom: $spacing-sm;
			display: block;
		}
		
		.user-badges {
			display: flex;
			gap: $spacing-xs;
			
			.badge {
				display: flex;
				align-items: center;
				padding: 4px $spacing-xs;
				border-radius: 12px;
				background-color: rgba(255, 255, 255, 0.2);
				
				.badge-icon {
					font-size: $font-size-small;
					margin-right: 2px;
				}
				
				.badge-text {
					font-size: $font-size-small;
				}
			}
			
			.member-badge {
				background-color: rgba(255, 215, 0, 0.3);
			}
		}
	}
}

.quick-entries {
	display: flex;
	justify-content: space-around;
	
	.entry-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		
		.entry-icon {
			font-size: 24px;
			margin-bottom: 4px;
		}
		
		.entry-text {
			font-size: $font-size-helper;
			opacity: 0.9;
		}
		
		.entry-count {
			position: absolute;
			top: -5px;
			right: -5px;
			background-color: #ff4757;
			color: white;
			font-size: $font-size-small;
			padding: 2px 6px;
			border-radius: 10px;
			min-width: 18px;
			text-align: center;
		}
	}
}

.function-list {
	flex: 1;
	padding: $spacing-md 0;
}

.section {
	margin-bottom: $spacing-lg;
	
	.section-title {
		font-size: $font-size-content;
		font-weight: 500;
		color: $text-secondary;
		padding: 0 $spacing-lg;
		margin-bottom: $spacing-sm;
		display: block;
	}
}

.function-items {
	background-color: $card-background;
	border-radius: $border-radius-card;
	margin: 0 $spacing-lg;
	overflow: hidden;
}

.function-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: $spacing-md $spacing-lg;
	border-bottom: 1px solid $border-color;
	transition: background-color 0.2s ease;
	
	&:last-child {
		border-bottom: none;
	}
	
	&:active {
		background-color: #f8f8f8;
	}
	
	.item-left {
		display: flex;
		align-items: center;
		
		.item-icon {
			font-size: 20px;
			margin-right: $spacing-md;
		}
		
		.item-text {
			font-size: $font-size-content;
			color: $text-primary;
		}
	}
	
	.item-right {
		display: flex;
		align-items: center;
		
		.item-count {
			font-size: $font-size-helper;
			color: $text-secondary;
			margin-right: $spacing-xs;
		}
		
		.item-badge {
			font-size: $font-size-small;
			color: $primary-color;
			background-color: rgba(0, 212, 170, 0.1);
			padding: 2px 6px;
			border-radius: 8px;
			margin-right: $spacing-xs;
		}
		
		.item-arrow {
			font-size: $font-size-helper;
			color: $text-disabled;
		}
	}
}

.logout-section {
	padding: $spacing-lg;
	background-color: $card-background;
	border-top: 1px solid $border-color;
	
	.logout-btn {
		width: 100%;
		height: 44px;
		background-color: transparent;
		border: 1px solid #ff4757;
		border-radius: $border-radius-button;
		color: #ff4757;
		font-size: $font-size-content;
		font-weight: 500;
		
		&:active {
			background-color: rgba(255, 71, 87, 0.1);
		}
	}
}
</style> 