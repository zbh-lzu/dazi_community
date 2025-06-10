<template>
	<view class="container">
		<view class="header">
			<text class="title">成就徽章</text>
		</view>
		
		<view class="content">
			<view class="achievement-grid">
				<view class="achievement-item" 
					  v-for="achievement in achievements" 
					  :key="achievement.id"
					  :class="{ unlocked: achievement.unlocked }">
					<view class="achievement-icon">{{ achievement.icon }}</view>
					<text class="achievement-name">{{ achievement.name }}</text>
					<text class="achievement-desc">{{ achievement.description }}</text>
					<view class="achievement-progress" v-if="!achievement.unlocked">
						<text class="progress-text">{{ achievement.progress }}/{{ achievement.target }}</text>
					</view>
					<view class="unlock-date" v-if="achievement.unlocked">
						<text>{{ formatDate(achievement.unlockDate) }}</text>
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
			achievements: []
		}
	},
	onLoad() {
		this.loadAchievements()
	},
	methods: {
		loadAchievements() {
			this.achievements = [
				{
					id: 1,
					name: '初来乍到',
					description: '完成第一个任务',
					icon: '🎯',
					unlocked: true,
					unlockDate: Date.now() - 7 * 24 * 60 * 60 * 1000
				},
				{
					id: 2,
					name: '社交达人',
					description: '加入5个社群',
					icon: '👥',
					unlocked: true,
					unlockDate: Date.now() - 3 * 24 * 60 * 60 * 1000
				},
				{
					id: 3,
					name: '坚持不懈',
					description: '连续7天完成任务',
					icon: '🔥',
					unlocked: false,
					progress: 3,
					target: 7
				},
				{
					id: 4,
					name: '学习达人',
					description: '完成10个学习类任务',
					icon: '📚',
					unlocked: false,
					progress: 6,
					target: 10
				},
				{
					id: 5,
					name: '运动健将',
					description: '完成20个运动类任务',
					icon: '🏃',
					unlocked: false,
					progress: 8,
					target: 20
				},
				{
					id: 6,
					name: '人气王',
					description: '获得100个赞',
					icon: '⭐',
					unlocked: false,
					progress: 45,
					target: 100
				}
			]
		},
		formatDate(timestamp) {
			const date = new Date(timestamp)
			return date.toLocaleDateString('zh-CN')
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

.achievement-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: $spacing-md;
	
	.achievement-item {
		background: white;
		padding: $spacing-lg;
		border-radius: $border-radius-card;
		text-align: center;
		position: relative;
		transition: all 0.3s ease;
		
		&:not(.unlocked) {
			opacity: 0.6;
		}
		
		&.unlocked {
			box-shadow: 0 4px 12px rgba(0, 212, 170, 0.15);
		}
		
		.achievement-icon {
			font-size: 48px;
			margin-bottom: $spacing-sm;
		}
		
		.achievement-name {
			font-size: $font-size-content;
			font-weight: bold;
			color: $text-primary;
			display: block;
			margin-bottom: $spacing-xs;
		}
		
		.achievement-desc {
			font-size: $font-size-helper;
			color: $text-secondary;
			display: block;
			margin-bottom: $spacing-sm;
		}
		
		.achievement-progress {
			background: rgba(0, 212, 170, 0.1);
			color: $primary-color;
			padding: 4px $spacing-xs;
			border-radius: 12px;
			display: inline-block;
			
			.progress-text {
				font-size: $font-size-small;
				font-weight: 500;
			}
		}
		
		.unlock-date {
			position: absolute;
			top: $spacing-xs;
			right: $spacing-xs;
			background: rgba(0, 212, 170, 0.1);
			color: $primary-color;
			padding: 2px 6px;
			border-radius: 8px;
			font-size: $font-size-small;
		}
	}
}
</style> 