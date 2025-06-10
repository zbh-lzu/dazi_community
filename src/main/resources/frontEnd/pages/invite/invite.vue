<template>
	<view class="container">
		<view class="header">
			<text class="title">邀请好友</text>
		</view>
		
		<view class="content">
			<view class="invite-card">
				<view class="reward-section">
					<text class="reward-title">邀请奖励</text>
					<view class="reward-list">
						<view class="reward-item">
							<text class="reward-icon">🎁</text>
							<text class="reward-text">每邀请1人注册获得10积分</text>
						</view>
						<view class="reward-item">
							<text class="reward-icon">💰</text>
							<text class="reward-text">好友完成首个任务您获得5元奖励</text>
						</view>
						<view class="reward-item">
							<text class="reward-icon">👑</text>
							<text class="reward-text">累计邀请10人升级VIP会员</text>
						</view>
					</view>
				</view>
				
				<view class="invite-code-section">
					<text class="section-title">我的邀请码</text>
					<view class="invite-code">
						<text class="code-text">{{ inviteCode }}</text>
						<button class="copy-btn" @tap="copyInviteCode">复制</button>
					</view>
				</view>
				
				<view class="share-section">
					<text class="section-title">分享给好友</text>
					<view class="share-buttons">
						<button class="share-btn wechat" @tap="shareToWechat">
							<text class="share-icon">💬</text>
							<text class="share-text">微信</text>
						</button>
						<button class="share-btn moments" @tap="shareToMoments">
							<text class="share-icon">📱</text>
							<text class="share-text">朋友圈</text>
						</button>
						<button class="share-btn copy" @tap="copyShareLink">
							<text class="share-icon">🔗</text>
							<text class="share-text">复制链接</text>
						</button>
					</view>
				</view>
				
				<view class="stats-section">
					<text class="section-title">邀请统计</text>
					<view class="stats-grid">
						<view class="stat-item">
							<text class="stat-number">{{ inviteStats.total }}</text>
							<text class="stat-label">累计邀请</text>
						</view>
						<view class="stat-item">
							<text class="stat-number">{{ inviteStats.registered }}</text>
							<text class="stat-label">成功注册</text>
						</view>
						<view class="stat-item">
							<text class="stat-number">{{ inviteStats.rewards }}</text>
							<text class="stat-label">获得积分</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			inviteCode: 'ALPHA2024',
			shareLink: 'https://alpha.example.com/invite/ALPHA2024',
			inviteStats: {
				total: 5,
				registered: 3,
				rewards: 150
			}
		}
	},
	methods: {
		copyInviteCode() {
			uni.setClipboardData({
				data: this.inviteCode,
				success: () => {
					uni.showToast({
						title: '邀请码已复制',
						icon: 'success'
					})
				}
			})
		},
		copyShareLink() {
			uni.setClipboardData({
				data: this.shareLink,
				success: () => {
					uni.showToast({
						title: '链接已复制',
						icon: 'success'
					})
				}
			})
		},
		shareToWechat() {
			// 分享到微信好友
			uni.share({
				provider: 'weixin',
				scene: 'WXSceneSession',
				type: 0,
				href: this.shareLink,
				title: 'Alpha - 任务驱动的轻社交应用',
				summary: '和我一起在Alpha完成有趣的任务，提升自己！',
				imageUrl: 'https://via.placeholder.com/200x200/00D4AA/FFFFFF?text=Alpha',
				success: () => {
					uni.showToast({
						title: '分享成功',
						icon: 'success'
					})
				},
				fail: () => {
					uni.showToast({
						title: '分享失败',
						icon: 'none'
					})
				}
			})
		},
		shareToMoments() {
			// 分享到微信朋友圈
			uni.share({
				provider: 'weixin',
				scene: 'WXSceneTimeline',
				type: 0,
				href: this.shareLink,
				title: 'Alpha - 任务驱动的轻社交应用',
				imageUrl: 'https://via.placeholder.com/200x200/00D4AA/FFFFFF?text=Alpha',
				success: () => {
					uni.showToast({
						title: '分享成功',
						icon: 'success'
					})
				},
				fail: () => {
					uni.showToast({
						title: '分享失败',
						icon: 'none'
					})
				}
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

.invite-card {
	background: white;
	border-radius: $border-radius-card;
	padding: $spacing-lg;
}

.reward-section {
	margin-bottom: $spacing-xl;
	
	.reward-title {
		font-size: $font-size-title;
		font-weight: bold;
		color: $text-primary;
		display: block;
		margin-bottom: $spacing-md;
	}
	
	.reward-list {
		.reward-item {
			display: flex;
			align-items: center;
			margin-bottom: $spacing-md;
			
			.reward-icon {
				font-size: 24px;
				margin-right: $spacing-md;
			}
			
			.reward-text {
				font-size: $font-size-content;
				color: $text-secondary;
			}
		}
	}
}

.invite-code-section,
.share-section,
.stats-section {
	margin-bottom: $spacing-xl;
	
	.section-title {
		font-size: $font-size-content;
		font-weight: bold;
		color: $text-primary;
		display: block;
		margin-bottom: $spacing-md;
	}
}

.invite-code {
	display: flex;
	align-items: center;
	background: $background-color;
	padding: $spacing-md;
	border-radius: $border-radius-button;
	
	.code-text {
		flex: 1;
		font-size: $font-size-title;
		font-weight: bold;
		color: $primary-color;
		letter-spacing: 2px;
	}
	
	.copy-btn {
		background: $primary-color;
		color: white;
		border: none;
		padding: $spacing-xs $spacing-md;
		border-radius: $border-radius-button;
		font-size: $font-size-helper;
	}
}

.share-buttons {
	display: flex;
	gap: $spacing-md;
	
	.share-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: $spacing-lg;
		border: 1px solid $border-color;
		border-radius: $border-radius-card;
		background: white;
		
		&.wechat {
			border-color: #07c160;
		}
		
		&.moments {
			border-color: #ff6b35;
		}
		
		&.copy {
			border-color: $primary-color;
		}
		
		.share-icon {
			font-size: 32px;
			margin-bottom: $spacing-xs;
		}
		
		.share-text {
			font-size: $font-size-helper;
			color: $text-secondary;
		}
	}
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: $spacing-md;
	
	.stat-item {
		text-align: center;
		background: $background-color;
		padding: $spacing-lg;
		border-radius: $border-radius-card;
		
		.stat-number {
			font-size: $font-size-title;
			font-weight: bold;
			color: $primary-color;
			display: block;
			margin-bottom: $spacing-xs;
		}
		
		.stat-label {
			font-size: $font-size-helper;
			color: $text-secondary;
		}
	}
}
</style> 