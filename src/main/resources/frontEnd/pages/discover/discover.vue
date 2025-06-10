<template>
	<view class="discover-page">
		<!-- 顶部工具栏 -->
		<view class="header-toolbar">
			<button class="btn btn-text" @click="resetSort">
				<text class="iconfont icon-refresh"></text>
				恢复初始排序
			</button>
			<button class="btn btn-text" @click="showSearch">
				<text class="iconfont icon-search"></text>
				搜索
			</button>
		</view>

		<!-- 搜索框 -->
		<view class="search-container" v-if="isSearchVisible">
			<input 
				class="search-input" 
				type="text" 
				placeholder="搜索任务或社群..." 
				v-model="searchKeyword"
				@input="onSearch"
				@confirm="onSearch"
			/>
			<button class="btn btn-text" @click="hideSearch">取消</button>
		</view>

		<!-- 筛选器 -->
		<view class="filter-container">
			<button class="filter-btn" @click="showFilterModal">
				<text class="iconfont icon-filter"></text>
				筛选
			</button>
			<view class="active-filters" v-if="activeFilters.length > 0">
				<view 
					v-for="filter in activeFilters" 
					:key="filter.key"
					class="filter-tag"
					@tap="removeFilter(filter)"
				>
					{{ filter.label }}
					<text class="remove-icon">×</text>
				</view>
			</view>
		</view>

		<scroll-view class="content-scroll" scroll-y="true" @scrolltolower="loadMore">
			<!-- 推荐社群 -->
			<view class="recommend-section">
				<view class="section-header">
					<text class="section-title">推荐社群</text>
					<text class="section-more" @tap="viewMoreGroups">更多 ></text>
				</view>
				<scroll-view class="recommend-groups" scroll-x="true" show-scrollbar="false">
					<view class="group-card" v-for="group in recommendGroups" :key="group.id" @tap="viewGroupDetail(group)">
						<image :src="group.cover" mode="aspectFill" class="group-cover"/>
						<view class="group-overlay">
							<text class="group-name">{{ group.name }}</text>
							<button class="btn btn-primary btn-small" @tap.stop="joinGroup(group)">
								{{ group.joined ? '已加入' : '加入' }}
							</button>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 推荐任务 -->
			<view class="recommend-section">
				<view class="section-header">
					<text class="section-title">推荐任务</text>
					<text class="section-more" @tap="viewMoreTasks">更多 ></text>
				</view>
				
				<!-- 骨架屏 -->
				<view v-if="isLoading && recommendTasks.length === 0" class="skeleton-container">
					<view v-for="i in 3" :key="i" class="skeleton-item">
						<view class="skeleton skeleton-title"></view>
						<view class="skeleton skeleton-content"></view>
						<view class="skeleton skeleton-tags"></view>
					</view>
				</view>

				<!-- 任务列表 -->
				<view v-else-if="filteredTasks.length > 0" class="task-list">
					<view 
						v-for="task in filteredTasks" 
						:key="task.id"
						class="task-item"
						@tap="viewTaskDetail(task)"
					>
						<view class="task-header">
							<view class="task-time">{{ formatTime(task.time) }}</view>
							<view class="task-type" :class="getTypeClass(task.type)">
								<text class="task-type-icon" :class="getTypeIconClass(task.type)"></text>
								{{ task.type }}
							</view>
						</view>
						<view class="task-name">{{ task.name }}</view>
						<view class="task-description">{{ task.description }}</view>
						<view class="task-meta">
							<text class="meta-item">👥 {{ task.participantCount }}人参与</text>
							<text class="meta-item" v-if="task.location">📍 {{ task.location }}</text>
							<text class="meta-item" v-if="task.price">💰 {{ task.price }}</text>
						</view>
						<view class="task-actions">
							<button 
								class="btn"
								:class="task.joined ? 'btn-secondary' : 'btn-primary'"
								@tap.stop="toggleJoinTask(task)"
							>
								{{ task.joined ? '已参与' : '参与' }}
							</button>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-else class="empty-state">
					<view class="empty-icon">🔍</view>
					<view class="empty-text">暂无符合条件的内容</view>
					<view class="empty-desc">试试调整筛选条件</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="isLoadingMore" class="loading-more">
				<text>加载中...</text>
			</view>
		</scroll-view>

		<!-- 筛选弹窗 -->
		<view class="filter-modal" v-if="showFilterPanel">
			<view class="modal-mask" @tap="closeFilterModal"></view>
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">筛选条件</text>
					<button class="btn btn-text" @tap="clearAllFilters">清空</button>
				</view>
				
				<view class="filter-section">
					<text class="filter-label">类型</text>
					<view class="filter-options">
						<button 
							v-for="type in taskTypes" 
							:key="type"
							class="filter-option"
							:class="{ active: selectedFilters.types.includes(type) }"
							@tap="toggleTypeFilter(type)"
						>
							{{ type }}
						</button>
					</view>
				</view>

				<view class="filter-section">
					<text class="filter-label">时间</text>
					<view class="filter-options">
						<button 
							v-for="time in timeRanges" 
							:key="time.value"
							class="filter-option"
							:class="{ active: selectedFilters.timeRange === time.value }"
							@tap="selectTimeRange(time.value)"
						>
							{{ time.label }}
						</button>
					</view>
				</view>

				<view class="filter-section">
					<text class="filter-label">费用</text>
					<view class="filter-options">
						<button 
							v-for="price in priceRanges" 
							:key="price.value"
							class="filter-option"
							:class="{ active: selectedFilters.priceRange === price.value }"
							@tap="selectPriceRange(price.value)"
						>
							{{ price.label }}
						</button>
					</view>
				</view>

				<view class="modal-actions">
					<button class="btn btn-secondary" @tap="closeFilterModal">取消</button>
					<button class="btn btn-primary" @tap="applyFilters">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isSearchVisible: false,
			searchKeyword: '',
			isLoading: true,
			isLoadingMore: false,
			showFilterPanel: false,
			recommendGroups: [],
			recommendTasks: [],
			filteredTasks: [],
			page: 1,
			hasMore: true,
			activeFilters: [],
			selectedFilters: {
				types: [],
				timeRange: '',
				priceRange: ''
			},
			taskTypes: ['学习', '运动', '娱乐', '工作', '生活'],
			timeRanges: [
				{ label: '今天', value: 'today' },
				{ label: '本周', value: 'week' },
				{ label: '本月', value: 'month' }
			],
			priceRanges: [
				{ label: '免费', value: 'free' },
				{ label: '50元以下', value: 'low' },
				{ label: '50-200元', value: 'medium' },
				{ label: '200元以上', value: 'high' }
			]
		}
	},
	onLoad() {
		this.loadData()
	},
	methods: {
		// 显示搜索框
		showSearch() {
			this.isSearchVisible = true
		},
		
		// 隐藏搜索框
		hideSearch() {
			this.isSearchVisible = false
			this.searchKeyword = ''
			this.applySearch()
		},
		
		// 搜索
		onSearch() {
			this.applySearch()
		},
		
		// 应用搜索
		applySearch() {
			const self = this
			this.filteredTasks = this.recommendTasks.filter(function(task) {
				if (!self.searchKeyword.trim()) return true
				return task.name.includes(self.searchKeyword) || 
					   task.description.includes(self.searchKeyword)
			})
		},
		
		// 重置排序
		resetSort() {
			this.loadData(true)
		},
		
		// 显示筛选弹窗
		showFilterModal() {
			this.showFilterPanel = true
		},
		
		// 关闭筛选弹窗
		closeFilterModal() {
			this.showFilterPanel = false
		},
		
		// 切换类型筛选
		toggleTypeFilter(type) {
			const index = this.selectedFilters.types.indexOf(type)
			if (index > -1) {
				this.selectedFilters.types.splice(index, 1)
			} else {
				this.selectedFilters.types.push(type)
			}
		},
		
		// 选择时间范围
		selectTimeRange(range) {
			this.selectedFilters.timeRange = this.selectedFilters.timeRange === range ? '' : range
		},
		
		// 选择价格范围
		selectPriceRange(range) {
			this.selectedFilters.priceRange = this.selectedFilters.priceRange === range ? '' : range
		},
		
		// 清空筛选
		clearAllFilters() {
			this.selectedFilters = {
				types: [],
				timeRange: '',
				priceRange: ''
			}
		},
		
		// 应用筛选
		applyFilters() {
			this.updateActiveFilters()
			this.applyFilterLogic()
			this.closeFilterModal()
		},
		
		// 更新活跃筛选标签
		updateActiveFilters() {
			const self = this
			this.activeFilters = []
			
			// 类型筛选
			this.selectedFilters.types.forEach(function(type) {
				self.activeFilters.push({
					key: 'type-' + type,
					label: type,
					type: 'type',
					value: type
				})
			})
			
			// 时间筛选
			if (this.selectedFilters.timeRange) {
				const timeItem = this.timeRanges.find(function(t) { 
					return t.value === self.selectedFilters.timeRange 
				})
				const timeLabel = timeItem ? timeItem.label : ''
				self.activeFilters.push({
					key: 'time-' + self.selectedFilters.timeRange,
					label: timeLabel,
					type: 'time',
					value: self.selectedFilters.timeRange
				})
			}
			
			// 价格筛选
			if (this.selectedFilters.priceRange) {
				const priceItem = this.priceRanges.find(function(p) { 
					return p.value === self.selectedFilters.priceRange 
				})
				const priceLabel = priceItem ? priceItem.label : ''
				self.activeFilters.push({
					key: 'price-' + self.selectedFilters.priceRange,
					label: priceLabel,
					type: 'price',
					value: self.selectedFilters.priceRange
				})
			}
		},
		
		// 应用筛选逻辑
		applyFilterLogic() {
			const self = this
			this.filteredTasks = this.recommendTasks.filter(function(task) {
				// 类型筛选
				if (self.selectedFilters.types.length > 0 && 
					!self.selectedFilters.types.includes(task.type)) {
					return false
				}
				
				// 价格筛选
				if (self.selectedFilters.priceRange) {
					const priceStr = task.price ? task.price.replace('元', '') : '0'
					const taskPrice = parseFloat(priceStr)
					switch (self.selectedFilters.priceRange) {
						case 'free':
							if (taskPrice > 0) return false
							break
						case 'low':
							if (taskPrice === 0 || taskPrice >= 50) return false
							break
						case 'medium':
							if (taskPrice < 50 || taskPrice > 200) return false
							break
						case 'high':
							if (taskPrice <= 200) return false
							break
					}
				}
				
				return true
			})
		},
		
		// 移除筛选标签
		removeFilter(filter) {
			if (filter.type === 'type') {
				const index = this.selectedFilters.types.indexOf(filter.value)
				if (index > -1) {
					this.selectedFilters.types.splice(index, 1)
				}
			} else if (filter.type === 'time') {
				this.selectedFilters.timeRange = ''
			} else if (filter.type === 'price') {
				this.selectedFilters.priceRange = ''
			}
			
			this.updateActiveFilters()
			this.applyFilterLogic()
		},
		
		// 加载数据
		async loadData(reset = false) {
			if (reset) {
				this.page = 1
				this.isLoading = true
			}
			
			try {
				const [groups, tasks] = await Promise.all([
					this.loadRecommendGroups(),
					this.loadRecommendTasks()
				])
				
				this.recommendGroups = groups
				this.recommendTasks = tasks
				this.filteredTasks = [...tasks]
				this.hasMore = tasks.length === 10
			} catch (error) {
				console.error('加载数据失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				this.isLoading = false
				this.isLoadingMore = false
			}
		},
		
		// 加载更多
		loadMore() {
			if (!this.hasMore || this.isLoadingMore) return
			
			this.isLoadingMore = true
			this.page++
			this.loadData()
		},
		
		// 加载推荐社群
		async loadRecommendGroups() {
			// 模拟API调用
			return Array.from({ length: 5 }, function(_, i) {
				return {
					id: 'group-' + i,
					name: ['前端开发者', '健身达人', '读书会', '摄影师', '美食家'][i],
					cover: 'https://picsum.photos/300/200?random=' + (i + 100),
					joined: Math.random() > 0.7
				}
			})
		},
		
		// 加载推荐任务
		async loadRecommendTasks() {
			const types = ['学习', '运动', '娱乐', '工作', '生活']
			const names = [
				'Vue3 实战项目开发',
				'晨跑打卡挑战',
				'周末电影观影会',
				'UI设计作品评审',
				'家居整理收纳'
			]
			const prices = ['免费', '30元', '50元', '100元', '免费', '80元', '120元', '200元']
			
			return Array.from({ length: 8 }, function(_, i) {
				return {
					id: 'task-' + Date.now() + '-' + i,
					name: names[i % names.length],
					type: types[Math.floor(Math.random() * types.length)],
					description: '这是一个关于' + names[i % names.length] + '的详细描述，欢迎大家积极参与。',
					time: Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000,
					participantCount: Math.floor(Math.random() * 30) + 5,
					location: Math.random() > 0.5 ? '线上' : '北京朝阳区',
					price: Math.random() > 0.3 ? prices[Math.floor(Math.random() * prices.length)] : null,
					joined: Math.random() > 0.8
				}
			})
		},
		
		// 查看更多社群
		viewMoreGroups() {
			uni.switchTab({
				url: '/pages/groups/groups'
			})
		},
		
		// 查看更多任务
		viewMoreTasks() {
			uni.switchTab({
				url: '/pages/tasks/tasks'
			})
		},
		
		// 查看社群详情
		viewGroupDetail(group) {
			uni.navigateTo({
				url: '/pages/groupDetail/groupDetail?id=' + group.id
			})
		},
		
		// 查看任务详情
		viewTaskDetail(task) {
			uni.navigateTo({
				url: '/pages/taskDetail/taskDetail?id=' + task.id
			})
		},
		
		// 加入社群
		joinGroup(group) {
			group.joined = !group.joined
			uni.showToast({
				title: group.joined ? '加入成功' : '已退出',
				icon: 'success'
			})
		},
		
		// 参与任务
		toggleJoinTask(task) {
			task.joined = !task.joined
			if (task.joined) {
				task.participantCount++
			} else {
				task.participantCount--
			}
			
			uni.showToast({
				title: task.joined ? '参与成功' : '已退出',
				icon: 'success'
			})
		},
		
		// 格式化时间
		formatTime(time) {
			const date = new Date(time)
			const now = new Date()
			const diff = date.getTime() - now.getTime()
			
			if (diff > 0) {
				const days = Math.floor(diff / (24 * 60 * 60 * 1000))
				if (days > 0) {
					return days + '天后'
				} else {
					const hours = Math.floor(diff / (60 * 60 * 1000))
					return hours + '小时后'
				}
			} else {
				return '已结束'
			}
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
		
		// 获取任务类型图标
		getTypeIconClass(type) {
			const typeIcons = {
				'学习': 'icon-book',
				'运动': 'icon-sport',
				'娱乐': 'icon-game',
				'工作': 'icon-work',
				'生活': 'icon-life'
			}
			return typeIcons[type] || 'icon-default'
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.discover-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: $background-color;
}

.header-toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: $spacing-md $spacing-lg;
	background-color: $card-background;
	border-bottom: 1px solid $border-color;
	
	.btn {
		display: flex;
		align-items: center;
		gap: $spacing-xs;
		
		.iconfont {
			font-size: 16px;
		}
	}
}

.search-container {
	display: flex;
	align-items: center;
	padding: $spacing-md $spacing-lg;
	background-color: $card-background;
	border-bottom: 1px solid $border-color;
	
	.search-input {
		flex: 1;
		height: 36px;
		padding: 0 $spacing-md;
		border: 1px solid $border-color;
		border-radius: $border-radius-button;
		font-size: $font-size-content;
		margin-right: $spacing-md;
	}
}

.filter-container {
	display: flex;
	align-items: center;
	padding: $spacing-md $spacing-lg;
	background-color: $card-background;
	border-bottom: 1px solid $border-color;
	
	.filter-btn {
		display: flex;
		align-items: center;
		gap: $spacing-xs;
		padding: $spacing-xs $spacing-md;
		border: 1px solid $border-color;
		border-radius: $border-radius-button;
		background-color: transparent;
		font-size: $font-size-helper;
		color: $text-secondary;
		
		.iconfont {
			font-size: 14px;
		}
	}
	
	.active-filters {
		display: flex;
		flex-wrap: wrap;
		gap: $spacing-xs;
		margin-left: $spacing-md;
		
		.filter-tag {
			display: flex;
			align-items: center;
			padding: 4px $spacing-xs;
			background-color: rgba(0, 212, 170, 0.1);
			color: $primary-color;
			border-radius: 12px;
			font-size: $font-size-small;
			
			.remove-icon {
				margin-left: 4px;
				font-weight: bold;
				cursor: pointer;
			}
		}
	}
}

.content-scroll {
	flex: 1;
}

.recommend-section {
	margin-bottom: $spacing-lg;
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: $spacing-md $spacing-lg;
		
		.section-title {
			font-size: $font-size-title;
			font-weight: bold;
			color: $text-primary;
		}
		
		.section-more {
			font-size: $font-size-helper;
			color: $primary-color;
			cursor: pointer;
		}
	}
}

.recommend-groups {
	padding: 0 $spacing-lg;
	white-space: nowrap;
	
	.group-card {
		display: inline-block;
		width: 200px;
		height: 120px;
		margin-right: $spacing-md;
		border-radius: $border-radius-card;
		overflow: hidden;
		position: relative;
		
		.group-cover {
			width: 100%;
			height: 100%;
		}
		
		.group-overlay {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
			padding: $spacing-md;
			color: white;
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			
			.group-name {
				font-size: $font-size-content;
				font-weight: 500;
			}
			
			.btn-small {
				padding: 4px $spacing-xs;
				font-size: $font-size-small;
				min-width: auto;
			}
		}
	}
}

.skeleton-container {
	padding: 0 $spacing-lg;
	
	.skeleton-item {
		padding: $spacing-md;
		margin-bottom: $spacing-md;
		background-color: $card-background;
		border-radius: $border-radius-card;
		
		.skeleton-title {
			height: 20px;
			width: 60%;
			margin-bottom: $spacing-sm;
			border-radius: $border-radius-small;
		}
		
		.skeleton-content {
			height: 16px;
			width: 100%;
			margin-bottom: $spacing-xs;
			border-radius: $border-radius-small;
		}
		
		.skeleton-tags {
			height: 14px;
			width: 40%;
			border-radius: $border-radius-small;
		}
	}
}

.task-list {
	padding: 0 $spacing-lg;
}

.task-item {
	background-color: $card-background;
	border-radius: $border-radius-card;
	padding: $spacing-md;
	margin-bottom: $spacing-md;
	
	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: $spacing-xs;
		
		.task-time {
			font-size: $font-size-helper;
			color: $text-secondary;
		}
		
		.task-type {
			display: flex;
			align-items: center;
			padding: 2px $spacing-xs;
			border-radius: 8px;
			font-size: $font-size-small;
			
			.task-type-icon {
				margin-right: 4px;
				font-size: 12px;
			}
			
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
	
	.task-name {
		font-size: $font-size-content;
		font-weight: 500;
		color: $text-primary;
		margin-bottom: $spacing-xs;
	}
	
	.task-description {
		font-size: $font-size-helper;
		color: $text-secondary;
		line-height: 1.4;
		margin-bottom: $spacing-sm;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.task-meta {
		display: flex;
		gap: $spacing-md;
		margin-bottom: $spacing-md;
		
		.meta-item {
			font-size: $font-size-helper;
			color: $text-secondary;
		}
	}
	
	.task-actions {
		display: flex;
		justify-content: flex-end;
		
		.btn {
			min-width: 80px;
			padding: $spacing-xs $spacing-md;
			font-size: $font-size-helper;
		}
	}
}

.loading-more {
	text-align: center;
	padding: $spacing-md;
	color: $text-secondary;
	font-size: $font-size-helper;
}

// 筛选弹窗样式
.filter-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
	
	.modal-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
	}
	
	.modal-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: $card-background;
		border-radius: $border-radius-card $border-radius-card 0 0;
		padding: $spacing-lg;
		max-height: 70vh;
		
		.modal-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: $spacing-lg;
			
			.modal-title {
				font-size: $font-size-title;
				font-weight: bold;
				color: $text-primary;
			}
		}
		
		.filter-section {
			margin-bottom: $spacing-lg;
			
			.filter-label {
				display: block;
				font-size: $font-size-content;
				font-weight: 500;
				color: $text-primary;
				margin-bottom: $spacing-sm;
			}
			
			.filter-options {
				display: flex;
				flex-wrap: wrap;
				gap: $spacing-sm;
				
				.filter-option {
					padding: $spacing-xs $spacing-md;
					border: 1px solid $border-color;
					border-radius: $border-radius-button;
					background-color: transparent;
					font-size: $font-size-helper;
					color: $text-secondary;
					
					&.active {
						background-color: $primary-color;
						border-color: $primary-color;
						color: white;
					}
				}
			}
		}
		
		.modal-actions {
			display: flex;
			gap: $spacing-md;
			
			.btn {
				flex: 1;
				text-align: center;
			}
		}
	}
}

// 图标样式
.iconfont {
	font-family: 'iconfont';
}

.icon-refresh:before { content: '↻'; }
.icon-search:before { content: '🔍'; }
.icon-filter:before { content: '⚙️'; }
.icon-book:before { content: '📚'; }
.icon-sport:before { content: '🏃'; }
.icon-game:before { content: '🎮'; }
.icon-work:before { content: '💼'; }
.icon-life:before { content: '🏠'; }
.icon-default:before { content: '📋'; }
</style> 