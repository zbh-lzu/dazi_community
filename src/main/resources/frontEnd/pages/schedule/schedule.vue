<template>
	<view class="container">
		<view class="header">
			<text class="title">日程表</text>
			<button class="add-btn" @tap="addSchedule">+</button>
		</view>
		
		<view class="calendar-wrapper">
			<view class="month-header">
				<button class="nav-btn" @tap="prevMonth">‹</button>
				<text class="month-title">{{ currentMonth }}</text>
				<button class="nav-btn" @tap="nextMonth">›</button>
			</view>
			
			<view class="calendar-grid">
				<view class="day-header" v-for="day in weekDays" :key="day">{{ day }}</view>
				<view class="calendar-day" 
					  v-for="day in calendarDays" 
					  :key="day.date"
					  :class="{ 
						  active: day.isToday, 
						  selected: day.isSelected,
						  'has-event': day.hasEvent 
					  }"
					  @tap="selectDay(day)">
					<text class="day-number">{{ day.day }}</text>
					<view class="event-dot" v-if="day.hasEvent"></view>
				</view>
			</view>
		</view>
		
		<view class="schedule-list">
			<text class="section-title">{{ selectedDateText }}的日程</text>
			<view class="schedule-item" v-for="item in selectedDaySchedules" :key="item.id">
				<view class="time-slot">{{ item.time }}</view>
				<view class="schedule-content">
					<text class="schedule-title">{{ item.title }}</text>
					<text class="schedule-desc">{{ item.description }}</text>
				</view>
			</view>
			
			<view class="empty-state" v-if="selectedDaySchedules.length === 0">
				<text class="empty-text">当天没有日程安排</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentDate: new Date(),
			selectedDate: new Date(),
			weekDays: ['日', '一', '二', '三', '四', '五', '六'],
			schedules: {},
			calendarDays: []
		}
	},
	computed: {
		currentMonth() {
			return `${this.currentDate.getFullYear()}年${this.currentDate.getMonth() + 1}月`
		},
		selectedDateText() {
			const date = this.selectedDate
			return `${date.getMonth() + 1}月${date.getDate()}日`
		},
		selectedDaySchedules() {
			const key = this.formatDateKey(this.selectedDate)
			return this.schedules[key] || []
		}
	},
	onLoad() {
		this.initCalendar()
		this.loadSchedules()
	},
	methods: {
		initCalendar() {
			this.generateCalendarDays()
		},
		generateCalendarDays() {
			const year = this.currentDate.getFullYear()
			const month = this.currentDate.getMonth()
			const firstDay = new Date(year, month, 1)
			const lastDay = new Date(year, month + 1, 0)
			const startDate = new Date(firstDay)
			startDate.setDate(startDate.getDate() - firstDay.getDay())
			
			const days = []
			const today = new Date()
			
			for (let i = 0; i < 42; i++) {
				const date = new Date(startDate)
				date.setDate(startDate.getDate() + i)
				
				const dateKey = this.formatDateKey(date)
				const hasEvent = this.schedules[dateKey] && this.schedules[dateKey].length > 0
				
				days.push({
					date: date.getTime(),
					day: date.getDate(),
					isToday: this.isSameDay(date, today),
					isSelected: this.isSameDay(date, this.selectedDate),
					hasEvent: hasEvent,
					isCurrentMonth: date.getMonth() === month
				})
			}
			
			this.calendarDays = days
		},
		selectDay(day) {
			this.selectedDate = new Date(day.date)
			this.generateCalendarDays()
		},
		prevMonth() {
			this.currentDate.setMonth(this.currentDate.getMonth() - 1)
			this.generateCalendarDays()
		},
		nextMonth() {
			this.currentDate.setMonth(this.currentDate.getMonth() + 1)
			this.generateCalendarDays()
		},
		loadSchedules() {
			// 模拟日程数据
			const today = new Date()
			const tomorrow = new Date(today)
			tomorrow.setDate(today.getDate() + 1)
			
			this.schedules = {
				[this.formatDateKey(today)]: [
					{
						id: 1,
						time: '09:00',
						title: '团队会议',
						description: '讨论项目进度'
					},
					{
						id: 2,
						time: '14:00',
						title: '学习Vue3',
						description: '深入学习Composition API'
					}
				],
				[this.formatDateKey(tomorrow)]: [
					{
						id: 3,
						time: '10:00',
						title: '健身运动',
						description: '在健身房进行力量训练'
					}
				]
			}
			
			this.generateCalendarDays()
		},
		addSchedule() {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		},
		formatDateKey(date) {
			return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
		},
		isSameDay(date1, date2) {
			return date1.getFullYear() === date2.getFullYear() &&
				   date1.getMonth() === date2.getMonth() &&
				   date1.getDate() === date2.getDate()
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
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: white;
	padding: $spacing-lg;
	border-bottom: 1px solid $border-color;
	
	.title {
		font-size: $font-size-title;
		font-weight: bold;
		color: $text-primary;
	}
	
	.add-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: $primary-color;
		color: white;
		border: none;
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.calendar-wrapper {
	background: white;
	margin: $spacing-md;
	border-radius: $border-radius-card;
	padding: $spacing-lg;
}

.month-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: $spacing-lg;
	
	.nav-btn {
		width: 32px;
		height: 32px;
		border: 1px solid $border-color;
		background: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		color: $text-secondary;
	}
	
	.month-title {
		font-size: $font-size-title;
		font-weight: bold;
		color: $text-primary;
	}
}

.calendar-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 1px;
	
	.day-header {
		text-align: center;
		padding: $spacing-sm;
		font-size: $font-size-helper;
		color: $text-secondary;
		font-weight: 500;
	}
	
	.calendar-day {
		position: relative;
		text-align: center;
		padding: $spacing-sm;
		min-height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: all 0.2s ease;
		
		&.active {
			background: $primary-color;
			color: white;
		}
		
		&.selected {
			background: rgba(0, 212, 170, 0.1);
			color: $primary-color;
		}
		
		&.has-event {
			font-weight: bold;
		}
		
		.day-number {
			font-size: $font-size-helper;
		}
		
		.event-dot {
			position: absolute;
			bottom: 4px;
			left: 50%;
			transform: translateX(-50%);
			width: 4px;
			height: 4px;
			border-radius: 50%;
			background: $primary-color;
		}
	}
}

.schedule-list {
	padding: $spacing-md;
	
	.section-title {
		font-size: $font-size-content;
		font-weight: bold;
		color: $text-primary;
		margin-bottom: $spacing-md;
		display: block;
	}
	
	.schedule-item {
		display: flex;
		background: white;
		padding: $spacing-md;
		margin-bottom: $spacing-md;
		border-radius: $border-radius-card;
		
		.time-slot {
			width: 60px;
			font-size: $font-size-helper;
			color: $primary-color;
			font-weight: 500;
		}
		
		.schedule-content {
			flex: 1;
			
			.schedule-title {
				font-size: $font-size-content;
				color: $text-primary;
				font-weight: 500;
				display: block;
				margin-bottom: $spacing-xs;
			}
			
			.schedule-desc {
				font-size: $font-size-helper;
				color: $text-secondary;
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
	}
}
</style> 