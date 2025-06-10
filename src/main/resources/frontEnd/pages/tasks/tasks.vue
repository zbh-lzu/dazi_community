<template>
	<view class="tasks-page" :class="{ 'dragging': isDragging }">
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
			<text class="sort-tip">长按500ms拖拽任务排序</text>
		</view>

		<!-- 搜索框 -->
		<view class="search-container" v-if="isSearchVisible">
			<input 
				class="search-input" 
				type="text" 
				placeholder="搜索任务..." 
				v-model="searchKeyword"
				@input="onSearch"
				@confirm="onSearch"
			/>
			<button class="btn btn-text" @click="hideSearch">取消</button>
		</view>

		<!-- 任务列表 -->
		<scroll-view ref="taskList" class="task-list" :scroll-y="!isDragging" @scrolltolower="loadMore" @scroll="onScroll" :scroll-top="autoScrollTarget">
			<!-- 调试信息 -->
			<view class="debug-info" style="padding: 10px; background: #f0f0f0; margin: 10px;">
				<text>调试: 任务{{ tasks.length }}个, 显示{{ filteredTasks.length }}个, 加载中:{{ isLoading }}, hasMore:{{ hasMore }}</text>
			</view>
			
			<!-- 强制显示任务测试 -->
			<view v-if="tasks.length > 0" style="background: yellow; padding: 10px; margin: 10px;">
				<text>强制测试显示: {{ tasks[0].name }}</text>
			</view>
			
			<!-- 骨架屏 -->
			<view v-if="isLoading" class="skeleton-container">
				<view v-for="i in 5" :key="i" class="skeleton-item">
					<view class="skeleton skeleton-title"></view>
					<view class="skeleton skeleton-content"></view>
					<view class="skeleton skeleton-tags"></view>
				</view>
			</view>

			<!-- 任务列表项 -->
			<view v-if="!isLoading && filteredTasks.length > 0" class="task-items">
				<view 
					v-for="(task, index) in filteredTasks" 
					:key="task.id"
					:data-index="index"
					class="task-item"
					:class="{ 
						'expanded': task.expanded,
						'dragging': draggingIndex === index,
						'placeholder': dragOverIndex === index && draggingIndex !== index
					}"
					:style="getTaskStyle(index)"
					@touchstart="onTouchStart($event, index)"
					@touchmove="onTouchMove($event, index)"
					@touchend="onTouchEnd($event, index)"
				>
						<!-- 一级信息 -->
						<view class="task-primary">
							<view class="task-time">{{ formatTime(task.time) }}</view>
							<view class="task-info">
								<view class="task-name">{{ task.name }}</view>
								<view class="task-type">
									<text class="task-type-icon" :class="getTypeIconClass(task.type)"></text>
									{{ task.type }}
								</view>
							</view>
							<view class="expand-icon" :class="{ 'rotated': task.expanded }">
								<text class="iconfont icon-arrow-down"></text>
							</view>
						</view>

						<!-- 二级信息（展开时显示） -->
						<view class="task-secondary" v-if="task.expanded">
							<view class="task-description">{{ task.description }}</view>
							<view class="task-meta">
								<view class="meta-item">
									<text class="iconfont icon-user"></text>
									{{ task.participantCount }}人参与
								</view>
								<view class="meta-item" v-if="task.location">
									<text class="iconfont icon-location"></text>
									{{ task.location }}
								</view>
								<view class="meta-item" v-if="task.progress">
									<text class="iconfont icon-progress"></text>
									{{ task.progress }}%
								</view>
							</view>
							<view class="task-actions">
								<button class="btn btn-secondary" @click.stop="viewTaskDetail(task)">
									查看详情
								</button>
								<button class="btn btn-primary" @click.stop="joinTask(task)" v-if="!task.joined">
									参与任务
								</button>
							</view>
						</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="!isLoading && filteredTasks.length === 0" class="empty-state">
				<view class="empty-icon">📝</view>
				<view class="empty-text">暂无任务</view>
				<view class="empty-desc">快去发现页面找找有趣的任务吧</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="isLoadingMore" class="loading-more">
				<text>加载中...</text>
			</view>
		</scroll-view>
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
			tasks: [],
			filteredTasks: [],
			page: 1,
			hasMore: true,
			// 拖拽相关状态
			isDragging: false,
			draggingIndex: -1,
			dragOverIndex: -1,
			startY: 0,
			currentY: 0,
			startTime: 0,
			dragThreshold: 10, // 拖拽阈值
			longPressTimer: null,
			longPressDuration: 500, // 长按时长设为500ms
			itemHeight: 0,
			scrollTop: 0, // 记录滚动位置
			autoScrollTarget: 0, // 自动滚动目标位置
			autoScrollTimer: null, // 自动滚动定时器
			isLongPressing: false, // 是否在长按状态
			hasMoved: false // 是否有移动
		}
	},

	onLoad() {
		console.log('任务页面正在加载...')
		this.loadTasks(true)
	},
	onShow() {
		// 页面显示时也确保数据正确
		if (this.tasks.length === 0) {
			this.loadTasks(true)
		}
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
			this.filteredTasks = [...this.tasks]
		},
		
		// 搜索任务
		onSearch() {
			if (!this.searchKeyword.trim()) {
				this.filteredTasks = [...this.tasks]
				return
			}
			
			this.filteredTasks = this.tasks.filter(task => 
				task.name.includes(this.searchKeyword) || 
				task.description.includes(this.searchKeyword) ||
				task.type.includes(this.searchKeyword)
			)
		},
		
		// 重置排序
		resetSort() {
			this.loadTasks(true)
		},
		
		// 加载任务列表
		async loadTasks(reset = false) {
			console.log('loadTasks被调用, reset:', reset)
			
			if (reset) {
				this.page = 1
				this.tasks = []
				this.isLoading = true
			}
			
			try {
				// 模拟延时
				await new Promise(resolve => setTimeout(resolve, 100))
				
				// 模拟API调用
				const mockTasks = this.generateMockTasks()
				console.log('生成的任务数据:', mockTasks.length, '个任务')
				
				if (reset) {
					this.tasks = mockTasks
				} else {
					this.tasks = [...this.tasks, ...mockTasks]
				}
				
				this.filteredTasks = [...this.tasks]
				// 首次加载后就关闭hasMore，防止无限加载
				this.hasMore = false
				console.log('当前显示任务数量:', this.filteredTasks.length)
				console.log('isLoading设置为false')
			} catch (error) {
				console.error('加载任务失败:', error)
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
			console.log('=== loadMore触发调试 ===')
			console.log('loadMore被调用，hasMore:', this.hasMore)
			console.log('当前滚动位置:', this.scrollTop)
			console.log('是否正在拖拽:', this.isDragging)
			console.log('===================')
			
			if (!this.hasMore || this.isLoadingMore) return
			
			this.isLoadingMore = true
			this.page++
			this.loadTasks()
		},
		
		// 切换任务展开状态
		toggleTaskExpand(index) {
			this.filteredTasks[index].expanded = !this.filteredTasks[index].expanded
		},
		
		// 查看任务详情
		viewTaskDetail(task) {
			uni.navigateTo({
				url: `/pages/taskDetail/taskDetail?id=${task.id}`
			})
		},
		
		// 参与任务
		joinTask(task) {
			uni.showModal({
				title: '确认参与',
				content: `确定要参与"${task.name}"任务吗？`,
				success: (res) => {
					if (res.confirm) {
						task.joined = true
						task.participantCount++
						uni.showToast({
							title: '参与成功',
							icon: 'success'
						})
					}
				}
			})
		},
		
		// 触摸开始
		onTouchStart(e, index) {
			// 阻止事件冒泡，避免触发页面滚动
			e.stopPropagation()
			
			const touch = e.touches[0]
			this.startY = touch.clientY
			this.currentY = touch.clientY
			this.startTime = Date.now()
			// 不要立即设置dragOverIndex，等到真正开始拖拽时再设置
			this.isLongPressing = false
			this.hasMoved = false
			
			// 记录当前滚动位置
			this.recordScrollPosition()
			
			// 设置长按定时器
			this.longPressTimer = setTimeout(() => {
				if (!this.hasMoved) {
					this.isLongPressing = true
					this.startDragging(index)
				}
			}, this.longPressDuration)
			
			// 计算任务项高度
			if (!this.itemHeight) {
				const query = uni.createSelectorQuery().in(this)
				query.select('.task-item').boundingClientRect(data => {
					if (data) {
						this.itemHeight = data.height + 16 // 包含margin
					}
				}).exec()
			}
		},
		
		// 触摸移动
		onTouchMove(e, index) {
			const touch = e.touches[0]
			const deltaY = Math.abs(touch.clientY - this.startY)
			
			// 标记已移动
			if (deltaY > this.dragThreshold) {
				this.hasMoved = true
			}
			
			if (!this.isDragging) {
				// 如果移动距离超过阈值且没有长按，取消长按
				if (this.hasMoved && !this.isLongPressing) {
					clearTimeout(this.longPressTimer)
				}
				return
			}
			
			// 在拖拽状态下，阻止默认的滚动行为
			e.stopPropagation()
			e.preventDefault()
			
			console.log('拖拽移动中，当前滚动位置:', this.scrollTop)
			
			this.currentY = touch.clientY
			
			// 计算新的拖拽位置
			this.updateDragPosition(touch.clientY)
			
			// 处理自动滚动
			this.handleAutoScroll(touch.clientY)
		},
		
		// 触摸结束
		onTouchEnd(e, index) {
			// 清理定时器
			clearTimeout(this.longPressTimer)
			clearTimeout(this.autoScrollTimer)
			
			if (this.isDragging) {
				this.stopDragging()
			} else if (!this.hasMoved && !this.isLongPressing) {
				// 如果没有移动且没有长按，执行正常点击逻辑
				setTimeout(() => {
					this.toggleTaskExpand(index)
				}, 50) // 延迟50ms确保拖拽状态已清除
			}
			
			// 重置状态
			this.isLongPressing = false
			this.hasMoved = false
		},
		
		// 滚动事件处理
		onScroll(e) {
			const oldScrollTop = this.scrollTop
			this.scrollTop = e.detail.scrollTop
			
			// 只有在非拖拽状态下才同步autoScrollTarget
			if (!this.isDragging) {
				this.autoScrollTarget = this.scrollTop
			}
			
			// 添加调试信息，特别关注异常的滚动变化
			if (Math.abs(oldScrollTop - this.scrollTop) > 20 && oldScrollTop > 0) {
				console.log('=== 异常滚动检测 ===')
				console.log('旧滚动位置:', oldScrollTop)
				console.log('新滚动位置:', this.scrollTop)
				console.log('是否正在拖拽:', this.isDragging)
				console.log('滚动差值:', Math.abs(oldScrollTop - this.scrollTop))
			}
		},
		
		// 记录滚动位置
		recordScrollPosition() {
			// 当前滚动位置已经通过onScroll实时更新
			console.log('当前滚动位置:', this.scrollTop)
		},
		
		// 处理自动滚动（参考示例代码的做法）
		handleAutoScroll(clientY) {
			if (!this.isDragging) return
			
			const viewportHeight = uni.getSystemInfoSync().windowHeight
			const scrollThreshold = 200 // 参考示例，距离顶部/底部200px时开始滚动
			const scrollSpeed = 5 // 每次滚动5px
			
			// 当拖拽元素距离顶部小于200px时，向上滚动
			if (clientY < scrollThreshold) {
				console.log('触发向上自动滚动，距离顶部:', clientY)
				this.performAutoScrollUp(scrollSpeed)
			}
			// 当拖拽元素距离底部小于200px时，向下滚动
			else if ((viewportHeight - clientY) < scrollThreshold) {
				console.log('触发向下自动滚动，距离底部:', viewportHeight - clientY)
				this.performAutoScrollDown(scrollSpeed)
			}
		},
		
		// 执行向上自动滚动
		performAutoScrollUp(speed) {
			if (!this.isDragging) return
			
			// 获取当前滚动位置
			let currentScrollTop = this.autoScrollTarget
			if (currentScrollTop > 0) {
				// 向上滚动
				const newScrollTop = Math.max(0, currentScrollTop - speed)
				this.autoScrollTarget = newScrollTop
				console.log('执行向上滚动:', currentScrollTop, '->', newScrollTop)
			}
		},
		
		// 执行向下自动滚动
		performAutoScrollDown(speed) {
			if (!this.isDragging) return
			
			// 获取当前滚动位置
			let currentScrollTop = this.autoScrollTarget
			// 向下滚动（这里可以根据需要添加最大滚动限制）
			const newScrollTop = currentScrollTop + speed
			this.autoScrollTarget = newScrollTop
			console.log('执行向下滚动:', currentScrollTop, '->', newScrollTop)
		},
		

		
		// 开始拖拽
		startDragging(index) {
			console.log('=== 开始拖拽调试信息 ===')
			console.log('拖拽前滚动位置:', this.scrollTop)
			console.log('isDragging变化前:', this.isDragging)
			
			this.isDragging = true
			this.draggingIndex = index
			this.dragOverIndex = index // 在这里设置初始的dragOverIndex
			this.autoScrollTarget = this.scrollTop // 初始化自动滚动目标
			
			console.log('isDragging变化后:', this.isDragging)
			console.log('拖拽后滚动位置:', this.scrollTop)
			
			// 添加触觉反馈
			try {
				uni.vibrateShort({
					type: 'light'
				})
			} catch (e) {
				console.log('触觉反馈不支持')
			}
			
			// 显示拖拽提示
			uni.showToast({
				title: '长按拖拽排序中',
				icon: 'none',
				duration: 1500
			})
			
			console.log('开始拖拽任务:', index)
		},
		
		// 更新拖拽位置
		updateDragPosition(clientY) {
			const deltaY = clientY - this.startY
			const itemHeight = this.itemHeight || 120
			
			// 计算应该插入的位置
			const steps = Math.round(deltaY / itemHeight)
			const newIndex = Math.max(0, Math.min(
				this.filteredTasks.length - 1, 
				this.draggingIndex + steps
			))
			
			if (newIndex !== this.dragOverIndex) {
				this.dragOverIndex = newIndex
			}
		},
		
		// 停止拖拽
		stopDragging() {
			console.log('=== 停止拖拽调试信息 ===')
			console.log('停止前滚动位置:', this.scrollTop)
			console.log('停止前自动滚动目标:', this.autoScrollTarget)
			
			// 清理所有定时器
			clearTimeout(this.autoScrollTimer)
			
			if (this.draggingIndex !== this.dragOverIndex) {
				// 执行排序
				this.moveTaskToPosition(this.draggingIndex, this.dragOverIndex)
			}
			
			// 重置拖拽状态 - 这会重新启用scroll-view的滚动
			this.isDragging = false
			this.draggingIndex = -1
			this.dragOverIndex = -1
			this.startY = 0
			this.currentY = 0
			this.isLongPressing = false
			this.hasMoved = false
			
			console.log('停止后滚动位置:', this.scrollTop)
			console.log('停止后自动滚动目标:', this.autoScrollTarget)
			console.log('已重新启用scroll-view滚动')
		},
		
		// 获取任务样式
		getTaskStyle(index) {
			const style = {}
			
			if (this.isDragging && index === this.draggingIndex) {
				// 拖拽中的任务
				const deltaY = this.currentY - this.startY
				style.transform = `translateY(${deltaY}px) scale(1.05)`
				style.zIndex = 1000
				style.opacity = 0.9
			} else if (this.isDragging && index === this.dragOverIndex && index !== this.draggingIndex) {
				// 拖拽目标位置
				style.transform = 'scale(0.98)'
				style.backgroundColor = 'rgba(0, 212, 170, 0.1)'
			}
			
			return style
		},
		
		// 移动任务到指定位置
		moveTaskToPosition(fromIndex, toIndex) {
			if (fromIndex === toIndex) return
			
			// 移动任务
			const movedTask = this.filteredTasks.splice(fromIndex, 1)[0]
			this.filteredTasks.splice(toIndex, 0, movedTask)
			
			// 同步更新原始任务数组
			this.tasks = [...this.filteredTasks]
			
			uni.showToast({
				title: '任务位置已调整',
				icon: 'success',
				duration: 1500
			})
		},
		
		// 格式化时间
		formatTime(time) {
			const date = new Date(time)
			const now = new Date()
			const diff = now - date
			const day = 24 * 60 * 60 * 1000
			
			if (diff < day) {
				return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
			} else if (diff < 7 * day) {
				const days = Math.floor(diff / day)
				return `${days}天前`
			} else {
				return date.toLocaleDateString('zh-CN')
			}
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
		},
		
		// 生成模拟数据
		generateMockTasks() {
			const types = ['学习', '运动', '娱乐', '工作', '生活']
			const names = [
				'学习Vue3新特性',
				'晨跑锻炼',
				'看电影《星际穿越》',
				'完成项目原型设计',
				'整理房间',
				'学习英语口语',
				'健身房力量训练',
				'和朋友聚餐',
				'准备周会汇报',
				'购买生活用品',
				'阅读《设计心理学》',
				'参加线上技术分享',
				'制作PPT演示文稿',
				'学习摄影技巧',
				'练习瑜伽',
				'编写代码文档',
				'参与开源项目',
				'学习新的编程语言',
				'制定月度计划',
				'整理数字资料'
			]
			
			const descriptions = [
				'深入学习Composition API和新的响应式系统',
				'保持身体健康，提升精神状态',
				'放松身心，享受优质的视听体验',
				'运用设计思维，创造用户友好的界面',
				'营造整洁舒适的生活环境',
				'提高语言能力，拓展国际视野',
				'增强体质，塑造理想身材',
				'维护社交关系，分享生活乐趣',
				'展示工作成果，获得团队认可',
				'采购必需品，改善生活质量'
			]
			
			const locations = ['线上', '北京市朝阳区', '健身房', '图书馆', '咖啡厅', '公园', '家中', '办公室', '社区中心', '学校']
			
			return Array.from({ length: 15 }, (_, i) => {
				const nameIndex = i % names.length
				const name = names[nameIndex]
				const type = types[Math.floor(Math.random() * types.length)]
				const description = descriptions[nameIndex % descriptions.length]
				
				return {
					id: Date.now() + i + Math.random() * 1000,
					name: name,
					type: type,
					description: description,
					time: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
					participantCount: Math.floor(Math.random() * 50) + 1,
					location: locations[Math.floor(Math.random() * locations.length)],
					progress: Math.floor(Math.random() * 100),
					joined: Math.random() > 0.7,
					expanded: false,
					difficulty: ['简单', '中等', '困难'][Math.floor(Math.random() * 3)],
					reward: Math.floor(Math.random() * 50) + 10,
					deadline: Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000
				}
			})
		}
	},
	
	onLoad() {
		this.loadTasks()
	},
	
	beforeDestroy() {
		// 清理所有定时器
		if (this.longPressTimer) {
			clearTimeout(this.longPressTimer)
		}
		if (this.autoScrollTimer) {
			clearTimeout(this.autoScrollTimer)
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.tasks-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: $background-color;
	
	/* 拖拽时的样式，但不禁用滚动 */
	&.dragging {
		.task-list {
			/* 不再强制禁用overflow，让滚动保持正常 */
			/* overflow: hidden; */
		}
	}
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
	
	.sort-tip {
		font-size: $font-size-helper;
		color: $text-disabled;
		font-style: italic;
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

.task-list {
	flex: 1;
	padding: $spacing-md $spacing-lg;
}

.skeleton-container {
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

/* 移除movable-area样式，使用普通view */

.task-items {
	width: 100%;
}

.task-item {
	background-color: white;
	border-radius: $border-radius-card;
	margin-bottom: $spacing-md;
	overflow: hidden;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid $border-color;
	position: relative;
	user-select: none;
	
	&.expanded {
		box-shadow: 0 4px 12px rgba(0, 212, 170, 0.15);
	}
	
	/* 拖拽中的样式 */
	&.dragging {
		box-shadow: 0 12px 32px rgba(0, 212, 170, 0.3), 0 4px 16px rgba(0, 0, 0, 0.15);
		border: 2px solid $primary-color;
		background-color: #fff;
		transition: none;
		border-radius: 12px;
		
		.task-primary {
			background: linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(0, 212, 170, 0.15));
		}
		
		/* 添加拖拽指示器 */
		&:after {
			content: '拖拽中...';
			position: absolute;
			top: -30px;
			left: 50%;
			transform: translateX(-50%);
			background: $primary-color;
			color: white;
			padding: 4px 12px;
			border-radius: 12px;
			font-size: 12px;
			white-space: nowrap;
			z-index: 1001;
		}
	}
	
	/* 拖拽目标位置样式 */
	&.placeholder {
		border: 3px dashed $primary-color;
		background: linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(0, 212, 170, 0.05));
		animation: placeholder-pulse 1s ease-in-out infinite;
		
		&:before {
			content: '✓ 松开插入到此位置';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-size: $font-size-helper;
			color: $primary-color;
			font-weight: 600;
			pointer-events: none;
			z-index: 1;
			background: rgba(255, 255, 255, 0.9);
			padding: 8px 16px;
			border-radius: 20px;
			box-shadow: 0 2px 8px rgba(0, 212, 170, 0.2);
		}
		
		.task-primary {
			opacity: 0.2;
		}
	}
	
	/* 触摸反馈 */
	&:active:not(.dragging) {
		transform: scale(0.98);
		transition: transform 0.1s ease;
	}
}

.task-primary {
	display: flex;
	align-items: center;
	padding: $spacing-md $spacing-lg;
	cursor: pointer;
	
	.task-time {
		font-size: $font-size-helper;
		color: $text-secondary;
		min-width: 60px;
		margin-right: $spacing-md;
	}
	
	.task-info {
		flex: 1;
		
		.task-name {
			font-size: $font-size-content;
			font-weight: 500;
			color: $text-primary;
			margin-bottom: $spacing-xs;
		}
		
		.task-type {
			display: flex;
			align-items: center;
			font-size: $font-size-helper;
			color: $text-secondary;
			
			.task-type-icon {
				margin-right: $spacing-xs;
				font-size: 14px;
				color: $primary-color;
			}
		}
	}
	
	.expand-icon {
		color: $text-secondary;
		transition: transform 0.3s ease;
		
		&.rotated {
			transform: rotate(180deg);
		}
		
		.iconfont {
			font-size: 16px;
		}
	}
}

.task-secondary {
	padding: 0 $spacing-lg $spacing-md;
	border-top: 1px solid $border-color;
	background-color: #fafafa;
	animation: fadeIn 0.3s ease-out;
	
	.task-description {
		font-size: $font-size-content;
		color: $text-primary;
		line-height: 1.6;
		margin: $spacing-md 0;
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
			
			.iconfont {
				margin-right: $spacing-xs;
				font-size: 14px;
				color: $primary-color;
			}
		}
	}
	
	.task-actions {
		display: flex;
		gap: $spacing-md;
		
		.btn {
			flex: 1;
			text-align: center;
		}
	}
}

.loading-more {
	text-align: center;
	padding: $spacing-md;
	color: $text-secondary;
	font-size: $font-size-helper;
}

.empty-state {
	text-align: center;
	padding: 40px;
	
	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}
	
	.empty-text {
		font-size: $font-size-content;
		color: $text-primary;
		margin-bottom: 8px;
	}
	
	.empty-desc {
		font-size: $font-size-helper;
		color: $text-secondary;
	}
}

/* 图标字体样式 */
.iconfont {
	font-family: 'iconfont';
}

/* 拖拽动画 */
@keyframes placeholder-pulse {
	0%, 100% {
		border-color: $primary-color;
		background: linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(0, 212, 170, 0.05));
	}
	50% {
		border-color: rgba(0, 212, 170, 0.6);
		background: linear-gradient(135deg, rgba(0, 212, 170, 0.15), rgba(0, 212, 170, 0.08));
	}
}

.icon-refresh:before { content: '↻'; }
.icon-search:before { content: '🔍'; }
.icon-arrow-down:before { content: '▼'; }
.icon-user:before { content: '👤'; }
.icon-location:before { content: '📍'; }
.icon-progress:before { content: '📊'; }
.icon-book:before { content: '📚'; }
.icon-sport:before { content: '🏃'; }
.icon-game:before { content: '🎮'; }
.icon-work:before { content: '💼'; }
.icon-life:before { content: '🏠'; }
.icon-default:before { content: '📋'; }
</style> 