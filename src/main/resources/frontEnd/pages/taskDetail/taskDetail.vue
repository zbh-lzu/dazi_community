<template>
	<view class="task-detail-page">
		<!-- 加载状态 -->
		<view v-if="isLoading" class="loading-container">
			<text>加载中...</text>
		</view>

		<!-- 任务详情 -->
		<view v-else-if="taskDetail" class="task-content">
			<!-- 任务头部信息 -->
			<view class="task-header">
				<view class="task-title">{{ taskDetail.name }}</view>
				<view class="task-meta">
					<view class="meta-item">
						<text class="meta-icon">⏰</text>
						<text>{{ formatTime(taskDetail.time) }}</text>
					</view>
					<view class="meta-item">
						<text class="meta-icon">👥</text>
						<text>{{ taskDetail.participantCount }}人参与</text>
					</view>
					<view class="meta-item" v-if="taskDetail.location">
						<text class="meta-icon">📍</text>
						<text>{{ taskDetail.location }}</text>
					</view>
				</view>
				<view class="task-type-badge" :class="getTypeClass(taskDetail.type)">
					{{ taskDetail.type }}
				</view>
			</view>

			<!-- 任务描述 -->
			<view class="task-description">
				<text class="section-title">任务描述</text>
				<text class="description-text">{{ taskDetail.description }}</text>
			</view>

			<!-- 附件列表 -->
			<view v-if="taskDetail.attachments && taskDetail.attachments.length > 0" class="attachments-section">
				<text class="section-title">相关附件</text>
				<view class="attachment-list">
					<view 
						v-for="attachment in taskDetail.attachments" 
						:key="attachment.id"
						class="attachment-item"
						@tap="previewAttachment(attachment)"
					>
						<text class="attachment-icon">📎</text>
						<text class="attachment-name">{{ attachment.name }}</text>
						<text class="attachment-size">{{ attachment.size }}</text>
					</view>
				</view>
			</view>

			<!-- 节点打卡 -->
			<view v-if="taskDetail.checkpoints && taskDetail.checkpoints.length > 0" class="checkpoints-section">
				<text class="section-title">任务节点</text>
				<view class="checkpoint-list">
					<view 
						v-for="(checkpoint, index) in taskDetail.checkpoints" 
						:key="checkpoint.id"
						class="checkpoint-item"
						:class="{ completed: checkpoint.completed }"
					>
						<view class="checkpoint-index">{{ index + 1 }}</view>
						<view class="checkpoint-content">
							<text class="checkpoint-title">{{ checkpoint.title }}</text>
							<text class="checkpoint-desc">{{ checkpoint.description }}</text>
						</view>
						<view class="checkpoint-status">
							<text v-if="checkpoint.completed">✅</text>
							<text v-else>⭕</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 参与者列表 -->
			<view v-if="taskDetail.participants && taskDetail.participants.length > 0" class="participants-section">
				<text class="section-title">参与者（{{ taskDetail.participants.length }}人）</text>
				<view class="participants-grid">
					<view 
						v-for="participant in taskDetail.participants" 
						:key="participant.id"
						class="participant-item"
					>
						<image :src="participant.avatar" mode="aspectFill" class="participant-avatar" />
						<text class="participant-name">{{ participant.name }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<button 
				class="action-btn chat-btn" 
				@tap="openChat"
			>
				💬 进入聊天室
			</button>
			<button 
				class="action-btn join-btn"
				:class="{ joined: taskDetail && taskDetail.joined }"
				@tap="toggleJoin"
			>
				{{ (taskDetail && taskDetail.joined) ? '已参与' : '参与任务' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isLoading: true,
			taskId: '',
			taskDetail: null
		}
	},
	onLoad(options) {
		this.taskId = options.id
		this.loadTaskDetail()
	},
	methods: {
		// 加载任务详情
		async loadTaskDetail() {
			this.isLoading = true
			try {
				// 模拟API调用
				this.taskDetail = {
					id: this.taskId,
					name: 'Vue3 实战项目开发',
					type: '学习',
					description: '通过实际项目开发学习Vue3的新特性，包括Composition API、Teleport、Fragments等。我们将一起构建一个完整的Web应用，从项目搭建到部署上线。适合有一定Vue基础的开发者参与。',
					time: Date.now() + 2 * 24 * 60 * 60 * 1000,
					participantCount: 28,
					location: '线上',
					joined: false,
					attachments: [
						{
							id: 1,
							name: 'Vue3开发指南.pdf',
							size: '2.5MB'
						},
						{
							id: 2,
							name: '项目需求文档.docx',
							size: '1.2MB'
						}
					],
					checkpoints: [
						{
							id: 1,
							title: '环境搭建',
							description: '安装Node.js、Vue CLI等开发环境',
							completed: true
						},
						{
							id: 2,
							title: '项目初始化',
							description: '创建Vue3项目，配置路由和状态管理',
							completed: true
						},
						{
							id: 3,
							title: '组件开发',
							description: '使用Composition API开发核心组件',
							completed: false
						},
						{
							id: 4,
							title: '功能测试',
							description: '编写单元测试和集成测试',
							completed: false
						}
					],
					participants: [
						{
							id: 1,
							name: '张三',
							avatar: 'https://picsum.photos/100/100?random=1'
						},
						{
							id: 2,
							name: '李四',
							avatar: 'https://picsum.photos/100/100?random=2'
						},
						{
							id: 3,
							name: '王五',
							avatar: 'https://picsum.photos/100/100?random=3'
						}
					]
				}
			} catch (error) {
				console.error('加载任务详情失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				this.isLoading = false
			}
		},
		
		// 格式化时间
		formatTime(time) {
			const date = new Date(time)
			return date.toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			})
		},
		
		// 获取任务类型样式类
		getTypeClass(type) {
			const typeClasses = {
				'学习': 'type-study',
				'运动': 'type-sport',
				'娱乐': 'type-entertainment',
				'工作': 'type-work',
				'生活': 'type-life'
			}
			return typeClasses[type] || 'type-default'
		},
		
		// 预览附件
		previewAttachment(attachment) {
			uni.showToast({
				title: `预览${attachment.name}`,
				icon: 'none'
			})
		},
		
		// 打开聊天室
		openChat() {
			uni.navigateTo({
				url: `/pages/chat/chat?taskId=${this.taskId}&type=task`
			})
		},
		
		// 切换参与状态
		toggleJoin() {
			if (this.taskDetail.joined) {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出这个任务吗？',
					success: (res) => {
						if (res.confirm) {
							this.taskDetail.joined = false
							this.taskDetail.participantCount--
							uni.showToast({
								title: '已退出任务',
								icon: 'success'
							})
						}
					}
				})
			} else {
				this.taskDetail.joined = true
				this.taskDetail.participantCount++
				uni.showToast({
					title: '参与成功',
					icon: 'success'
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.task-detail-page {
	min-height: 100vh;
	background-color: $background-color;
	padding-bottom: 80px; // 为底部操作栏留出空间
}

.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
	color: $text-secondary;
}

.task-content {
	padding: $spacing-lg;
}

.task-header {
	background-color: $card-background;
	border-radius: $border-radius-card;
	padding: $spacing-lg;
	margin-bottom: $spacing-md;
	
	.task-title {
		font-size: $font-size-title;
		font-weight: bold;
		color: $text-primary;
		margin-bottom: $spacing-md;
	}
	
	.task-meta {
		display: flex;
		flex-wrap: wrap;
		gap: $spacing-md;
		margin-bottom: $spacing-md;
		
		.meta-item {
			display: flex;
			align-items: center;
			font-size: $font-size-helper;
			color: $text-secondary;
			
			.meta-icon {
				margin-right: $spacing-xs;
			}
		}
	}
	
	.task-type-badge {
		display: inline-block;
		padding: 4px $spacing-sm;
		border-radius: 12px;
		font-size: $font-size-small;
		
		&.type-study {
			background-color: rgba(74, 144, 226, 0.1);
			color: #4a90e2;
		}
		
		&.type-sport {
			background-color: rgba(255, 99, 132, 0.1);
			color: #ff6384;
		}
		
		&.type-entertainment {
			background-color: rgba(255, 206, 84, 0.1);
			color: #ffce54;
		}
		
		&.type-work {
			background-color: rgba(153, 102, 255, 0.1);
			color: #9966ff;
		}
		
		&.type-life {
			background-color: rgba(75, 192, 192, 0.1);
			color: #4bc0c0;
		}
	}
}

.task-description,
.attachments-section,
.checkpoints-section,
.participants-section {
	background-color: $card-background;
	border-radius: $border-radius-card;
	padding: $spacing-lg;
	margin-bottom: $spacing-md;
	
	.section-title {
		font-size: $font-size-content;
		font-weight: 500;
		color: $text-primary;
		margin-bottom: $spacing-md;
		display: block;
	}
}

.description-text {
	font-size: $font-size-content;
	color: $text-primary;
	line-height: 1.6;
}

.attachment-list {
	.attachment-item {
		display: flex;
		align-items: center;
		padding: $spacing-sm 0;
		border-bottom: 1px solid $border-color;
		
		&:last-child {
			border-bottom: none;
		}
		
		.attachment-icon {
			margin-right: $spacing-sm;
			font-size: 18px;
		}
		
		.attachment-name {
			flex: 1;
			font-size: $font-size-content;
			color: $text-primary;
		}
		
		.attachment-size {
			font-size: $font-size-helper;
			color: $text-secondary;
		}
	}
}

.checkpoint-list {
	.checkpoint-item {
		display: flex;
		align-items: flex-start;
		padding: $spacing-md 0;
		border-bottom: 1px solid $border-color;
		
		&:last-child {
			border-bottom: none;
		}
		
		&.completed {
			opacity: 0.7;
			
			.checkpoint-title {
				text-decoration: line-through;
			}
		}
		
		.checkpoint-index {
			width: 24px;
			height: 24px;
			background-color: $primary-color;
			color: white;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: $font-size-small;
			margin-right: $spacing-sm;
			flex-shrink: 0;
		}
		
		.checkpoint-content {
			flex: 1;
			
			.checkpoint-title {
				font-size: $font-size-content;
				color: $text-primary;
				margin-bottom: 4px;
				display: block;
			}
			
			.checkpoint-desc {
				font-size: $font-size-helper;
				color: $text-secondary;
			}
		}
		
		.checkpoint-status {
			margin-left: $spacing-sm;
			font-size: 18px;
		}
	}
}

.participants-grid {
	display: flex;
	flex-wrap: wrap;
	gap: $spacing-md;
	
	.participant-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 60px;
		
		.participant-avatar {
			width: 40px;
			height: 40px;
			border-radius: 50%;
			margin-bottom: 4px;
		}
		
		.participant-name {
			font-size: $font-size-small;
			color: $text-secondary;
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			width: 100%;
		}
	}
}

.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: $card-background;
	padding: $spacing-md $spacing-lg;
	border-top: 1px solid $border-color;
	display: flex;
	gap: $spacing-md;
	
	.action-btn {
		flex: 1;
		height: 44px;
		border-radius: $border-radius-button;
		font-size: $font-size-content;
		font-weight: 500;
		border: none;
		
		&.chat-btn {
			background-color: $background-color;
			color: $text-primary;
			border: 1px solid $border-color;
		}
		
		&.join-btn {
			background-color: $primary-color;
			color: white;
			
			&.joined {
				background-color: $text-secondary;
			}
		}
	}
}
</style> 