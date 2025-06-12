<template>
	<view class="container">
		<view class="header">
			<text class="title">我的任务</text>
		</view>
		
		<view class="tabs">
			<view class="tab-item" 
				  :class="{ active: currentTab === 'ongoing' }" 
				  @tap="switchTab('ongoing')">
				<text>进行中</text>
				<text class="count" v-if="ongoingTasks.length">({{ ongoingTasks.length }})</text>
			</view>
			<view class="tab-item" 
				  :class="{ active: currentTab === 'completed' }" 
				  @tap="switchTab('completed')">
				<text>已完成</text>
				<text class="count" v-if="completedTasks.length">({{ completedTasks.length }})</text>
			</view>
		</view>
		
		<view class="content">
			<view class="tasks-list" v-if="currentTab === 'ongoing'">
				<view class="task-item" v-for="task in ongoingTasks" :key="task.id" @tap="viewTaskDetail(task)">
					<view class="task-header">
						<text class="task-name">{{ task.name }}</text>
						<view class="task-progress">
							<text class="progress-text">{{ task.progress }}%</text>
						</view>
					</view>
					<text class="task-desc">{{ task.description }}</text>
					<view class="task-meta">
						<text class="deadline">截止：{{ formatDate(task.deadline) }}</text>
						<text class="location">{{ task.location }}</text>
					</view>
				</view>
			</view>
			
			<view class="tasks-list" v-if="currentTab === 'completed'">
				<view class="task-item completed" v-for="task in completedTasks" :key="task.id" @tap="viewTaskDetail(task)">
					<view class="task-header">
						<text class="task-name">{{ task.name }}</text>
						<text class="completed-tag">已完成</text>
					</view>
					<text class="task-desc">{{ task.description }}</text>
					<view class="task-meta">
						<text class="completed-time">完成时间：{{ formatDate(task.completedTime) }}</text>
					</view>
				</view>
			</view>
			
			<view class="empty-state" v-if="getCurrentTasks().length === 0">
				<text class="empty-text">{{ currentTab === 'ongoing' ? '暂无进行中的任务' : '暂无已完成的任务' }}</text>
				<button class="explore-btn" @tap="exploreTasks">去发现任务</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentTab: 'ongoing',
			ongoingTasks: [],
			completedTasks: []
		}
	},
	onLoad() {
		this.loadMyTasks()
	},
	methods: {
		loadMyTasks() {
			// 模拟加载数据
			this.ongoingTasks = [
				{
					id: 1,
					name: '学习Vue3新特性',
					description: '深入学习Vue3的Composition API',
					progress: 75,
					deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
					location: '线上'
				},
				{
					id: 2,
					name: '晨跑锻炼',
					description: '每天早上7点晨跑30分钟',
					progress: 60,
					deadline: Date.now() + 3 * 24 * 60 * 60 * 1000,
					location: '公园'
				}
			]
			
			this.completedTasks = [
				{
					id: 3,
					name: '阅读《设计心理学》',
					description: '完整阅读并做读书笔记',
					completedTime: Date.now() - 2 * 24 * 60 * 60 * 1000
				}
			]
		},
		switchTab(tab) {
			this.currentTab = tab
		},
		getCurrentTasks() {
			return this.currentTab === 'ongoing' ? this.ongoingTasks : this.completedTasks
		},
		viewTaskDetail(task) {
			uni.navigateTo({
				url: `/pages/taskDetail/taskDetail?id=${task.id}`
			})
		},
		exploreTasks() {
			uni.switchTab({
				url: '/pages/tasks/tasks'
			})
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
	padding: $spacing-md;
}

.tasks-list {
	.task-item {
		background: white;
		padding: $spacing-md;
		margin-bottom: $spacing-md;
		border-radius: $border-radius-card;
		
		&.completed {
			opacity: 0.8;
		}
		
		.task-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: $spacing-xs;
			
			.task-name {
				font-size: $font-size-content;
				font-weight: 500;
				color: $text-primary;
				flex: 1;
			}
			
			.task-progress {
				background: rgba(0, 212, 170, 0.1);
				color: $primary-color;
				padding: 4px $spacing-xs;
				border-radius: 12px;
				
				.progress-text {
					font-size: $font-size-small;
				}
			}
			
			.completed-tag {
				background: rgba(0, 200, 0, 0.1);
				color: #00c800;
				padding: 4px $spacing-xs;
				border-radius: 12px;
				font-size: $font-size-small;
			}
		}
		
		.task-desc {
			font-size: $font-size-helper;
			color: $text-secondary;
			margin-bottom: $spacing-sm;
			display: block;
		}
		
		.task-meta {
			display: flex;
			gap: $spacing-md;
			
			.deadline,
			.location,
			.completed-time {
				font-size: $font-size-small;
				color: $text-disabled;
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