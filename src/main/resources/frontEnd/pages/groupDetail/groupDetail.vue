<template>
	<view class="container">
		<view class="header">
			<view class="group-info">
				<image class="group-avatar" :src="groupInfo.avatar" mode="aspectFill"></image>
				<view class="info">
					<text class="name">{{ groupInfo.name }}</text>
					<text class="desc">{{ groupInfo.description }}</text>
					<view class="stats">
						<text class="stat">{{ groupInfo.memberCount }}人</text>
						<text class="stat">{{ groupInfo.isPublic ? '公开' : '私密' }}</text>
					</view>
				</view>
			</view>
			<button class="join-btn" :class="{ joined: isJoined }" @click="toggleJoin">
				{{ isJoined ? '已加入' : '加入社群' }}
			</button>
		</view>
		
		<view class="content">
			<view class="section">
				<text class="section-title">社群简介</text>
				<text class="section-content">{{ groupInfo.fullDescription }}</text>
			</view>
			
			<view class="section">
				<text class="section-title">成员 ({{ groupInfo.memberCount }})</text>
				<view class="members">
					<view class="member" v-for="member in members" :key="member.id">
						<image class="member-avatar" :src="member.avatar" mode="aspectFill"></image>
						<text class="member-name">{{ member.name }}</text>
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
			groupInfo: {
				id: 1,
				name: '产品设计交流群',
				description: '分享设计心得，探讨产品趋势',
				fullDescription: '这是一个专注于产品设计的交流社群，我们在这里分享最新的设计理念、讨论产品趋势、交流设计心得。欢迎所有对产品设计感兴趣的朋友加入我们！',
				avatar: 'https://via.placeholder.com/80x80/00D4AA/FFFFFF?text=群',
				memberCount: 156,
				isPublic: true
			},
			isJoined: false,
			members: []
		}
	},
	onLoad(options) {
		if (options.id) {
			this.loadGroupDetail(options.id)
		}
		this.generateMembers()
	},
	methods: {
		loadGroupDetail(id) {
			// 模拟加载社群详情
			console.log('加载社群详情:', id)
		},
		toggleJoin() {
			this.isJoined = !this.isJoined
			if (this.isJoined) {
				this.groupInfo.memberCount++
			} else {
				this.groupInfo.memberCount--
			}
		},
		generateMembers() {
			const names = ['张三', '李四', '王五', '赵六', '孙七', '周八']
			this.members = names.map((name, index) => ({
				id: index + 1,
				name,
				avatar: 'https://via.placeholder.com/32x32/4A90E2/FFFFFF?text=' + name.charAt(0)
			}))
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
	margin-bottom: $spacing-md;
}

.group-info {
	display: flex;
	margin-bottom: $spacing-md;
	
	.group-avatar {
		width: 80px;
		height: 80px;
		border-radius: $border-radius-card;
		margin-right: $spacing-md;
	}
	
	.info {
		flex: 1;
		
		.name {
			font-size: $font-size-title;
			font-weight: bold;
			color: $text-primary;
			display: block;
			margin-bottom: $spacing-xs;
		}
		
		.desc {
			font-size: $font-size-helper;
			color: $text-secondary;
			display: block;
			margin-bottom: $spacing-sm;
		}
		
		.stats {
			display: flex;
			gap: $spacing-sm;
			
			.stat {
				font-size: $font-size-small;
				color: $text-disabled;
				background: $background-color;
				padding: 4px 8px;
				border-radius: $border-radius-small;
			}
		}
	}
}

.join-btn {
	background: $primary-color;
	color: white;
	border: none;
	padding: $spacing-sm $spacing-lg;
	border-radius: $border-radius-button;
	font-size: $font-size-content;
	
	&.joined {
		background: $text-disabled;
	}
}

.content {
	padding: 0 $spacing-lg;
}

.section {
	background: white;
	padding: $spacing-lg;
	margin-bottom: $spacing-md;
	border-radius: $border-radius-card;
	
	.section-title {
		font-size: $font-size-content;
		font-weight: bold;
		color: $text-primary;
		display: block;
		margin-bottom: $spacing-sm;
	}
	
	.section-content {
		font-size: $font-size-helper;
		color: $text-secondary;
		line-height: 1.6;
	}
}

.members {
	display: flex;
	flex-wrap: wrap;
	gap: $spacing-md;
	
	.member {
		display: flex;
		align-items: center;
		width: 48%;
		
		.member-avatar {
			width: 32px;
			height: 32px;
			border-radius: 50%;
			margin-right: $spacing-xs;
		}
		
		.member-name {
			font-size: $font-size-helper;
			color: $text-primary;
		}
	}
}
</style> 