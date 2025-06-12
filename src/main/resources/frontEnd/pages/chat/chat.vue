<template>
	<view class="chat-page">
		<!-- 聊天消息列表 -->
		<scroll-view 
			class="message-list" 
			scroll-y="true" 
			:scroll-top="scrollTop"
			scroll-with-animation
		>
			<view v-for="message in messages" :key="message.id" class="message-item">
				<!-- 时间分隔线 -->
				<view v-if="message.showTime" class="time-divider">
					<text class="time-text">{{ formatTime(message.time) }}</text>
				</view>
				
				<!-- 消息内容 -->
				<view class="message-wrapper" :class="{ 'is-mine': message.isMine }">
					<!-- 头像 -->
					<image v-if="!message.isMine" :src="message.avatar" mode="aspectFill" class="user-avatar" />
					
					<!-- 消息气泡 -->
					<view class="message-bubble" :class="{ 'mine': message.isMine }">
						<!-- 文本消息 -->
						<text v-if="message.type === 'text'" class="message-text">{{ message.content }}</text>
						
						<!-- 图片消息 -->
						<view v-else-if="message.type === 'image'" class="message-image">
							<image :src="message.content" mode="aspectFill" @tap="previewImage(message.content)" />
						</view>
						
						<!-- 文件消息 -->
						<view v-else-if="message.type === 'file'" class="message-file" @tap="downloadFile(message)">
							<text class="file-icon">📎</text>
							<view class="file-info">
								<text class="file-name">{{ message.fileName }}</text>
								<text class="file-size">{{ message.fileSize }}</text>
							</view>
						</view>
						
						<!-- 系统消息 -->
						<text v-else-if="message.type === 'system'" class="system-text">{{ message.content }}</text>
					</view>
					
					<!-- 头像（自己的消息） -->
					<image v-if="message.isMine" :src="message.avatar" mode="aspectFill" class="user-avatar" />
				</view>
			</view>
		</scroll-view>

		<!-- 输入区域 -->
		<view class="input-area">
			<!-- 工具栏 -->
			<view class="toolbar">
				<button class="tool-btn" @tap="selectImage">
					<text class="tool-icon">📷</text>
				</button>
				<button class="tool-btn" @tap="selectFile">
					<text class="tool-icon">📎</text>
				</button>
				<button class="tool-btn" @tap="showEmojiPanel">
					<text class="tool-icon">😊</text>
				</button>
			</view>
			
			<!-- 输入框 -->
			<view class="input-container">
				<textarea 
					v-model="inputText"
					class="message-input"
					placeholder="输入消息..."
					:auto-height="true"
					:show-confirm-bar="false"
					@focus="onInputFocus"
					@blur="onInputBlur"
				/>
				<button 
					class="send-btn"
					:class="{ active: inputText.trim() }"
					@tap="sendMessage"
					:disabled="!inputText.trim()"
				>
					发送
				</button>
			</view>
			
			<!-- 表情面板 -->
			<view v-if="showEmoji" class="emoji-panel">
				<view class="emoji-grid">
					<text 
						v-for="emoji in emojiList" 
						:key="emoji"
						class="emoji-item"
						@tap="insertEmoji(emoji)"
					>
						{{ emoji }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			messages: [],
			inputText: '',
			scrollTop: 0,
			showEmoji: false,
			chatType: 'task', // task | group | support
			chatId: '',
			currentUser: {
				id: 'user123',
				name: '我',
				avatar: 'https://picsum.photos/100/100?random=999'
			},
			emojiList: [
				'😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
				'😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
				'😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
				'🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
				'👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
				'💪', '🙏', '✨', '🎉', '🎊', '💯', '❤️', '💛'
			]
		}
	},
	onLoad(options) {
		this.chatType = options.type || 'task'
		this.chatId = options.taskId || options.groupId || 'support'
		this.loadMessages()
	},
	methods: {
		// 加载消息历史
		async loadMessages() {
			try {
				// 模拟加载消息历史
				this.messages = [
					{
						id: 1,
						type: 'system',
						content: '欢迎加入聊天室',
						time: Date.now() - 3600000,
						showTime: true
					},
					{
						id: 2,
						type: 'text',
						content: '大家好，我是张三，很高兴和大家一起学习Vue3！',
						time: Date.now() - 3500000,
						isMine: false,
						userId: 'user1',
						userName: '张三',
						avatar: 'https://picsum.photos/100/100?random=1'
					},
					{
						id: 3,
						type: 'text',
						content: '欢迎欢迎！我们一起加油💪',
						time: Date.now() - 3400000,
						isMine: true,
						userId: this.currentUser.id,
						userName: this.currentUser.name,
						avatar: this.currentUser.avatar
					},
					{
						id: 4,
						type: 'text',
						content: '我准备了一些学习资料，等会分享给大家',
						time: Date.now() - 3300000,
						isMine: false,
						userId: 'user2',
						userName: '李四',
						avatar: 'https://picsum.photos/100/100?random=2'
					},
					{
						id: 5,
						type: 'image',
						content: 'https://picsum.photos/300/200?random=10',
						time: Date.now() - 3200000,
						isMine: false,
						userId: 'user2',
						userName: '李四',
						avatar: 'https://picsum.photos/100/100?random=2'
					}
				]
				
				// 滚动到底部
				this.$nextTick(() => {
					this.scrollToBottom()
				})
			} catch (error) {
				console.error('加载消息失败:', error)
			}
		},
		
		// 发送消息
		sendMessage() {
			if (!this.inputText.trim()) return
			
			const message = {
				id: Date.now(),
				type: 'text',
				content: this.inputText.trim(),
				time: Date.now(),
				isMine: true,
				userId: this.currentUser.id,
				userName: this.currentUser.name,
				avatar: this.currentUser.avatar
			}
			
			this.messages.push(message)
			this.inputText = ''
			
			// 隐藏表情面板
			this.showEmoji = false
			
			// 滚动到底部
			this.$nextTick(() => {
				this.scrollToBottom()
			})
			
			// 模拟收到回复
			setTimeout(() => {
				this.simulateReply()
			}, 1000)
		},
		
		// 模拟收到回复
		simulateReply() {
			const replies = [
				'收到！',
				'好的，明白了',
				'赞同👍',
				'这个想法不错',
				'我也是这么想的'
			]
			
			const reply = {
				id: Date.now(),
				type: 'text',
				content: replies[Math.floor(Math.random() * replies.length)],
				time: Date.now(),
				isMine: false,
				userId: 'user3',
				userName: '王五',
				avatar: 'https://picsum.photos/100/100?random=3'
			}
			
			this.messages.push(reply)
			
			this.$nextTick(() => {
				this.scrollToBottom()
			})
		},
		
		// 选择图片
		selectImage() {
			uni.chooseImage({
				count: 1,
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0]
					this.sendImageMessage(tempFilePath)
				}
			})
		},
		
		// 发送图片消息
		sendImageMessage(imagePath) {
			const message = {
				id: Date.now(),
				type: 'image',
				content: imagePath,
				time: Date.now(),
				isMine: true,
				userId: this.currentUser.id,
				userName: this.currentUser.name,
				avatar: this.currentUser.avatar
			}
			
			this.messages.push(message)
			
			this.$nextTick(() => {
				this.scrollToBottom()
			})
		},
		
		// 选择文件
		selectFile() {
			// uni-app 中需要使用插件或者原生能力来选择文件
			// 这里模拟一个文件选择
			const message = {
				id: Date.now(),
				type: 'file',
				content: '',
				fileName: '项目文档.pdf',
				fileSize: '2.5MB',
				time: Date.now(),
				isMine: true,
				userId: this.currentUser.id,
				userName: this.currentUser.name,
				avatar: this.currentUser.avatar
			}
			
			this.messages.push(message)
			
			this.$nextTick(() => {
				this.scrollToBottom()
			})
		},
		
		// 预览图片
		previewImage(imageUrl) {
			uni.previewImage({
				urls: [imageUrl]
			})
		},
		
		// 下载文件
		downloadFile(message) {
			uni.showToast({
				title: `下载${message.fileName}`,
				icon: 'none'
			})
		},
		
		// 显示/隐藏表情面板
		showEmojiPanel() {
			this.showEmoji = !this.showEmoji
		},
		
		// 插入表情
		insertEmoji(emoji) {
			this.inputText += emoji
		},
		
		// 输入框获得焦点
		onInputFocus() {
			this.showEmoji = false
		},
		
		// 输入框失去焦点
		onInputBlur() {
			// 延迟隐藏，避免点击表情时输入框失焦
		},
		
		// 滚动到底部
		scrollToBottom() {
			this.scrollTop = 999999
		},
		
		// 格式化时间
		formatTime(time) {
			const date = new Date(time)
			const now = new Date()
			const diff = now - date
			const day = 24 * 60 * 60 * 1000
			
			if (diff < 60000) { // 1分钟内
				return '刚刚'
			} else if (diff < day) { // 今天
				return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
			} else if (diff < 2 * day) { // 昨天
				return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
			} else {
				return date.toLocaleDateString('zh-CN')
			}
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.chat-page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: $background-color;
}

.message-list {
	flex: 1;
	padding: $spacing-md;
}

.message-item {
	margin-bottom: $spacing-md;
}

.time-divider {
	text-align: center;
	margin: $spacing-lg 0;
	
	.time-text {
		font-size: $font-size-small;
		color: $text-disabled;
		background-color: $background-color;
		padding: 4px $spacing-sm;
		border-radius: 12px;
	}
}

.message-wrapper {
	display: flex;
	align-items: flex-end;
	
	&.is-mine {
		justify-content: flex-end;
	}
	
	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin: 0 $spacing-sm;
		flex-shrink: 0;
	}
}

.message-bubble {
	max-width: 70%;
	padding: $spacing-sm $spacing-md;
	border-radius: $border-radius-card;
	background-color: $card-background;
	
	&.mine {
		background-color: $primary-color;
		color: white;
	}
	
	.message-text {
		font-size: $font-size-content;
		line-height: 1.4;
		word-wrap: break-word;
	}
	
	.system-text {
		font-size: $font-size-helper;
		color: $text-disabled;
		text-align: center;
	}
}

.message-image {
	image {
		max-width: 200px;
		max-height: 200px;
		border-radius: $border-radius-button;
	}
}

.message-file {
	display: flex;
	align-items: center;
	padding: $spacing-sm;
	background-color: rgba(0, 0, 0, 0.1);
	border-radius: $border-radius-button;
	
	.file-icon {
		font-size: 20px;
		margin-right: $spacing-sm;
	}
	
	.file-info {
		flex: 1;
		
		.file-name {
			font-size: $font-size-content;
			color: inherit;
			display: block;
		}
		
		.file-size {
			font-size: $font-size-small;
			opacity: 0.7;
			display: block;
		}
	}
}

.input-area {
	background-color: $card-background;
	border-top: 1px solid $border-color;
	padding: $spacing-sm $spacing-md;
}

.toolbar {
	display: flex;
	gap: $spacing-sm;
	margin-bottom: $spacing-sm;
	
	.tool-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: $background-color;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.tool-icon {
			font-size: 20px;
		}
	}
}

.input-container {
	display: flex;
	align-items: flex-end;
	gap: $spacing-sm;
	
	.message-input {
		flex: 1;
		min-height: 40px;
		max-height: 120px;
		padding: $spacing-sm $spacing-md;
		border: 1px solid $border-color;
		border-radius: $border-radius-button;
		font-size: $font-size-content;
		background-color: $background-color;
	}
	
	.send-btn {
		height: 40px;
		padding: 0 $spacing-lg;
		background-color: $text-disabled;
		color: white;
		border: none;
		border-radius: $border-radius-button;
		font-size: $font-size-content;
		
		&.active {
			background-color: $primary-color;
		}
		
		&:disabled {
			opacity: 0.6;
		}
	}
}

.emoji-panel {
	margin-top: $spacing-sm;
	padding: $spacing-md;
	background-color: $background-color;
	border-radius: $border-radius-button;
	max-height: 200px;
	overflow-y: auto;
	
	.emoji-grid {
		display: flex;
		flex-wrap: wrap;
		gap: $spacing-sm;
		
		.emoji-item {
			font-size: 24px;
			padding: $spacing-xs;
			text-align: center;
			cursor: pointer;
			
			&:active {
				transform: scale(1.2);
			}
		}
	}
}
</style> 