<template>
	<view class="groups-page">
		<!-- 搜索框 -->
		<view class="search-header">
			<view class="search-box">
				<text class="search-icon">🔍</text>
				<input 
					class="search-input" 
					type="text" 
					placeholder="搜索社群" 
					v-model="searchKeyword"
					@input="onSearch"
					@confirm="onSearch"
				/>
			</view>
		</view>

		<!-- 社群列表 -->
		<scroll-view class="groups-list" scroll-y="true" @scrolltolower="loadMore">
			<!-- 骨架屏 -->
			<view v-if="isLoading && groups.length === 0" class="skeleton-container">
				<view v-for="i in 5" :key="i" class="skeleton-item">
					<view class="skeleton skeleton-avatar"></view>
					<view class="skeleton-content">
						<view class="skeleton skeleton-title"></view>
						<view class="skeleton skeleton-desc"></view>
						<view class="skeleton skeleton-tags"></view>
					</view>
				</view>
			</view>

			<!-- 社群列表项 -->
			<view v-else-if="filteredGroups.length > 0" class="group-items">
				<view 
					v-for="group in filteredGroups" 
					:key="group.id"
					class="group-item"
					@tap="viewGroupDetail(group)"
				>
					<view class="group-avatar">
						<image :src="group.avatar" mode="aspectFill" />
					</view>
					<view class="group-info">
						<view class="group-header">
							<text class="group-name">{{ group.name }}</text>
							<view class="group-status" :class="group.isPublic ? 'public' : 'private'">
								{{ group.isPublic ? '公开' : '私密' }}
							</view>
						</view>
						<view class="group-desc">{{ group.description }}</view>
						<view class="group-meta">
							<text class="member-count">👥 {{ group.memberCount }}人</text>
							<text class="activity-level">🔥 {{ group.activityLevel }}</text>
							<view class="group-tags">
								<text v-for="tag in group.tags" :key="tag" class="tag">{{ tag }}</text>
							</view>
						</view>
					</view>
					<view class="group-action">
						<button 
							class="btn"
							:class="group.joined ? 'btn-secondary' : 'btn-primary'"
							@tap.stop="toggleJoinGroup(group)"
						>
							{{ group.joined ? '已加入' : '加入' }}
						</button>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<view class="empty-icon">👥</view>
				<view class="empty-text">暂无社群</view>
				<view class="empty-desc">试试搜索感兴趣的社群</view>
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
			searchKeyword: '',
			isLoading: true,
			isLoadingMore: false,
			groups: [],
			filteredGroups: [],
			page: 1,
			hasMore: true
		}
	},
	onLoad() {
		this.loadGroups()
	},
	methods: {
		// 搜索社群
		onSearch() {
			if (!this.searchKeyword.trim()) {
				this.filteredGroups = [...this.groups]
				return
			}
			
			this.filteredGroups = this.groups.filter(group => 
				group.name.includes(this.searchKeyword) || 
				group.description.includes(this.searchKeyword) ||
				group.tags.some(tag => tag.includes(this.searchKeyword))
			)
		},
		
		// 加载社群列表
		async loadGroups(reset = false) {
			if (reset) {
				this.page = 1
				this.groups = []
				this.isLoading = true
			}
			
			try {
				// 模拟API调用
				const mockGroups = this.generateMockGroups()
				
				if (reset) {
					this.groups = mockGroups
				} else {
					this.groups = [...this.groups, ...mockGroups]
				}
				
				this.filteredGroups = [...this.groups]
				this.hasMore = mockGroups.length === 10
			} catch (error) {
				console.error('加载社群失败:', error)
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
			this.loadGroups()
		},
		
		// 查看社群详情
		viewGroupDetail(group) {
			uni.navigateTo({
				url: `/pages/groupDetail/groupDetail?id=${group.id}`
			})
		},
		
		// 加入/退出社群
		toggleJoinGroup(group) {
			if (group.joined) {
				// 退出社群
				uni.showModal({
					title: '确认退出',
					content: `确定要退出"${group.name}"社群吗？`,
					success: (res) => {
						if (res.confirm) {
							group.joined = false
							group.memberCount--
							uni.showToast({
								title: '已退出社群',
								icon: 'success'
							})
						}
					}
				})
			} else {
				// 加入社群
				if (!group.isPublic) {
					uni.showModal({
						title: '申请加入',
						content: `"${group.name}"是私密社群，需要申请加入`,
						confirmText: '申请',
						success: (res) => {
							if (res.confirm) {
								uni.showToast({
									title: '申请已发送',
									icon: 'success'
								})
							}
						}
					})
				} else {
					group.joined = true
					group.memberCount++
					uni.showToast({
						title: '加入成功',
						icon: 'success'
					})
				}
			}
		},
		
		// 生成模拟社群数据
		generateMockGroups() {
			const names = [
				'前端开发者联盟',
				'健身打卡群',
				'读书分享会',
				'摄影爱好者',
				'创业交流圈',
				'旅行达人',
				'美食探索队',
				'设计师之家',
				'投资理财群',
				'职场进阶'
			]
			
			const descriptions = [
				'分享前端技术，交流开发经验',
				'每日打卡，互相监督，一起变强',
				'好书推荐，读后感分享，思维碰撞',
				'摄影技巧分享，作品点评',
				'创业心得，资源对接，合作机会',
				'世界那么大，一起去看看',
				'发现城市美食，分享烹饪心得',
				'设计灵感分享，作品交流',
				'理性投资，财富增值',
				'职业规划，技能提升，经验分享'
			]
			
			const tags = [
				['技术', '前端', 'Vue'],
				['健身', '运动', '打卡'],
				['读书', '分享', '成长'],
				['摄影', '艺术', '创作'],
				['创业', '商业', '机会'],
				['旅行', '探索', '生活'],
				['美食', '烹饪', '分享'],
				['设计', 'UI', '创意'],
				['投资', '理财', '财富'],
				['职场', '成长', '技能']
			]
			
			const activityLevels = ['很活跃', '较活跃', '一般活跃', '不太活跃']
			
			return Array.from({ length: 10 }, (_, i) => ({
				id: Date.now() + i,
				name: names[i % names.length],
				description: descriptions[i % descriptions.length],
				avatar: `https://picsum.photos/200/200?random=${i}`,
				memberCount: Math.floor(Math.random() * 1000) + 50,
				isPublic: Math.random() > 0.3,
				joined: Math.random() > 0.8,
				activityLevel: activityLevels[Math.floor(Math.random() * activityLevels.length)],
				tags: tags[i % tags.length]
			}))
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.groups-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: $background-color;
}

.search-header {
	padding: $spacing-md $spacing-lg;
	background-color: $card-background;
	border-bottom: 1px solid $border-color;
	
	.search-box {
		display: flex;
		align-items: center;
		background-color: $background-color;
		border-radius: $border-radius-button;
		padding: 0 $spacing-md;
		
		.search-icon {
			font-size: 16px;
			color: $text-secondary;
			margin-right: $spacing-xs;
		}
		
		.search-input {
			flex: 1;
			height: 36px;
			font-size: $font-size-content;
			color: $text-primary;
			
			&::placeholder {
				color: $text-disabled;
			}
		}
	}
}

.groups-list {
	flex: 1;
	padding: $spacing-md $spacing-lg;
}

.skeleton-container {
	.skeleton-item {
		display: flex;
		padding: $spacing-md;
		margin-bottom: $spacing-md;
		background-color: $card-background;
		border-radius: $border-radius-card;
		
		.skeleton-avatar {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			margin-right: $spacing-md;
		}
		
		.skeleton-content {
			flex: 1;
			
			.skeleton-title {
				height: 20px;
				width: 70%;
				margin-bottom: $spacing-sm;
				border-radius: $border-radius-small;
			}
			
			.skeleton-desc {
				height: 16px;
				width: 100%;
				margin-bottom: $spacing-xs;
				border-radius: $border-radius-small;
			}
			
			.skeleton-tags {
				height: 14px;
				width: 50%;
				border-radius: $border-radius-small;
			}
		}
	}
}

.group-item {
	display: flex;
	align-items: flex-start;
	padding: $spacing-md;
	margin-bottom: $spacing-md;
	background-color: $card-background;
	border-radius: $border-radius-card;
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.98);
		background-color: #f8f8f8;
	}
	
	.group-avatar {
		width: 60px;
		height: 60px;
		margin-right: $spacing-md;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
		
		image {
			width: 100%;
			height: 100%;
		}
	}
	
	.group-info {
		flex: 1;
		min-width: 0;
		
		.group-header {
			display: flex;
			align-items: center;
			margin-bottom: $spacing-xs;
			
			.group-name {
				font-size: $font-size-content;
				font-weight: 500;
				color: $text-primary;
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			
			.group-status {
				font-size: $font-size-helper;
				padding: 2px 8px;
				border-radius: 12px;
				margin-left: $spacing-xs;
				
				&.public {
					background-color: rgba(0, 212, 170, 0.1);
					color: $primary-color;
				}
				
				&.private {
					background-color: rgba(255, 159, 67, 0.1);
					color: #ff9f43;
				}
			}
		}
		
		.group-desc {
			font-size: $font-size-helper;
			color: $text-secondary;
			line-height: 1.4;
			margin-bottom: $spacing-sm;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		
		.group-meta {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: $spacing-md;
			
			.member-count,
			.activity-level {
				font-size: $font-size-helper;
				color: $text-secondary;
			}
			
			.group-tags {
				display: flex;
				gap: $spacing-xs;
				
				.tag {
					font-size: $font-size-small;
					padding: 2px 6px;
					background-color: rgba(0, 212, 170, 0.1);
					color: $primary-color;
					border-radius: 8px;
				}
			}
		}
	}
	
	.group-action {
		margin-left: $spacing-md;
		
		.btn {
			min-width: 60px;
			padding: $spacing-xs $spacing-sm;
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
</style> 