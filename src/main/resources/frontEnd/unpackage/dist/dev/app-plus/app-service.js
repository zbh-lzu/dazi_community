if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$f = {
    data() {
      return {
        isSearchVisible: false,
        searchKeyword: "",
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
        dragThreshold: 10,
        // 拖拽阈值
        longPressTimer: null,
        longPressDuration: 500,
        // 长按时长设为500ms
        itemHeight: 0,
        scrollTop: 0,
        // 记录滚动位置
        autoScrollTarget: 0,
        // 自动滚动目标位置
        autoScrollTimer: null,
        // 自动滚动定时器
        isLongPressing: false,
        // 是否在长按状态
        hasMoved: false
        // 是否有移动
      };
    },
    onLoad() {
      formatAppLog("log", "at pages/tasks/tasks.vue:158", "任务页面正在加载...");
      this.loadTasks(true);
    },
    onShow() {
      if (this.tasks.length === 0) {
        this.loadTasks(true);
      }
    },
    methods: {
      // 显示搜索框
      showSearch() {
        this.isSearchVisible = true;
      },
      // 隐藏搜索框
      hideSearch() {
        this.isSearchVisible = false;
        this.searchKeyword = "";
        this.filteredTasks = [...this.tasks];
      },
      // 搜索任务
      onSearch() {
        if (!this.searchKeyword.trim()) {
          this.filteredTasks = [...this.tasks];
          return;
        }
        this.filteredTasks = this.tasks.filter(
          (task) => task.name.includes(this.searchKeyword) || task.description.includes(this.searchKeyword) || task.type.includes(this.searchKeyword)
        );
      },
      // 重置排序
      resetSort() {
        this.loadTasks(true);
      },
      // 加载任务列表
      async loadTasks(reset = false) {
        formatAppLog("log", "at pages/tasks/tasks.vue:201", "loadTasks被调用, reset:", reset);
        if (reset) {
          this.page = 1;
          this.tasks = [];
          this.isLoading = true;
        }
        try {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const mockTasks = this.generateMockTasks();
          formatAppLog("log", "at pages/tasks/tasks.vue:215", "生成的任务数据:", mockTasks.length, "个任务");
          if (reset) {
            this.tasks = mockTasks;
          } else {
            this.tasks = [...this.tasks, ...mockTasks];
          }
          this.filteredTasks = [...this.tasks];
          this.hasMore = false;
          formatAppLog("log", "at pages/tasks/tasks.vue:226", "当前显示任务数量:", this.filteredTasks.length);
          formatAppLog("log", "at pages/tasks/tasks.vue:227", "isLoading设置为false");
        } catch (error) {
          formatAppLog("error", "at pages/tasks/tasks.vue:229", "加载任务失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
          this.isLoadingMore = false;
        }
      },
      // 加载更多
      loadMore() {
        formatAppLog("log", "at pages/tasks/tasks.vue:242", "=== loadMore触发调试 ===");
        formatAppLog("log", "at pages/tasks/tasks.vue:243", "loadMore被调用，hasMore:", this.hasMore);
        formatAppLog("log", "at pages/tasks/tasks.vue:244", "当前滚动位置:", this.scrollTop);
        formatAppLog("log", "at pages/tasks/tasks.vue:245", "是否正在拖拽:", this.isDragging);
        formatAppLog("log", "at pages/tasks/tasks.vue:246", "===================");
        if (!this.hasMore || this.isLoadingMore)
          return;
        this.isLoadingMore = true;
        this.page++;
        this.loadTasks();
      },
      // 切换任务展开状态
      toggleTaskExpand(index) {
        this.filteredTasks[index].expanded = !this.filteredTasks[index].expanded;
      },
      // 查看任务详情
      viewTaskDetail(task) {
        uni.navigateTo({
          url: `/pages/taskDetail/taskDetail?id=${task.id}`
        });
      },
      // 参与任务
      joinTask(task) {
        uni.showModal({
          title: "确认参与",
          content: `确定要参与"${task.name}"任务吗？`,
          success: (res) => {
            if (res.confirm) {
              task.joined = true;
              task.participantCount++;
              uni.showToast({
                title: "参与成功",
                icon: "success"
              });
            }
          }
        });
      },
      // 触摸开始
      onTouchStart(e, index) {
        e.stopPropagation();
        const touch = e.touches[0];
        this.startY = touch.clientY;
        this.currentY = touch.clientY;
        this.startTime = Date.now();
        this.isLongPressing = false;
        this.hasMoved = false;
        this.recordScrollPosition();
        this.longPressTimer = setTimeout(() => {
          if (!this.hasMoved) {
            this.isLongPressing = true;
            this.startDragging(index);
          }
        }, this.longPressDuration);
        if (!this.itemHeight) {
          const query = uni.createSelectorQuery().in(this);
          query.select(".task-item").boundingClientRect((data) => {
            if (data) {
              this.itemHeight = data.height + 16;
            }
          }).exec();
        }
      },
      // 触摸移动
      onTouchMove(e, index) {
        const touch = e.touches[0];
        const deltaY = Math.abs(touch.clientY - this.startY);
        if (deltaY > this.dragThreshold) {
          this.hasMoved = true;
        }
        if (!this.isDragging) {
          if (this.hasMoved && !this.isLongPressing) {
            clearTimeout(this.longPressTimer);
          }
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        formatAppLog("log", "at pages/tasks/tasks.vue:342", "拖拽移动中，当前滚动位置:", this.scrollTop);
        this.currentY = touch.clientY;
        this.updateDragPosition(touch.clientY);
        this.handleAutoScroll(touch.clientY);
      },
      // 触摸结束
      onTouchEnd(e, index) {
        clearTimeout(this.longPressTimer);
        clearTimeout(this.autoScrollTimer);
        if (this.isDragging) {
          this.stopDragging();
        } else if (!this.hasMoved && !this.isLongPressing) {
          setTimeout(() => {
            this.toggleTaskExpand(index);
          }, 50);
        }
        this.isLongPressing = false;
        this.hasMoved = false;
      },
      // 滚动事件处理
      onScroll(e) {
        const oldScrollTop = this.scrollTop;
        this.scrollTop = e.detail.scrollTop;
        if (!this.isDragging) {
          this.autoScrollTarget = this.scrollTop;
        }
        if (Math.abs(oldScrollTop - this.scrollTop) > 20 && oldScrollTop > 0) {
          formatAppLog("log", "at pages/tasks/tasks.vue:385", "=== 异常滚动检测 ===");
          formatAppLog("log", "at pages/tasks/tasks.vue:386", "旧滚动位置:", oldScrollTop);
          formatAppLog("log", "at pages/tasks/tasks.vue:387", "新滚动位置:", this.scrollTop);
          formatAppLog("log", "at pages/tasks/tasks.vue:388", "是否正在拖拽:", this.isDragging);
          formatAppLog("log", "at pages/tasks/tasks.vue:389", "滚动差值:", Math.abs(oldScrollTop - this.scrollTop));
        }
      },
      // 记录滚动位置
      recordScrollPosition() {
        formatAppLog("log", "at pages/tasks/tasks.vue:396", "当前滚动位置:", this.scrollTop);
      },
      // 处理自动滚动（参考示例代码的做法）
      handleAutoScroll(clientY) {
        if (!this.isDragging)
          return;
        const viewportHeight = uni.getSystemInfoSync().windowHeight;
        const scrollThreshold = 200;
        const scrollSpeed = 5;
        if (clientY < scrollThreshold) {
          formatAppLog("log", "at pages/tasks/tasks.vue:409", "触发向上自动滚动，距离顶部:", clientY);
          this.performAutoScrollUp(scrollSpeed);
        } else if (viewportHeight - clientY < scrollThreshold) {
          formatAppLog("log", "at pages/tasks/tasks.vue:414", "触发向下自动滚动，距离底部:", viewportHeight - clientY);
          this.performAutoScrollDown(scrollSpeed);
        }
      },
      // 执行向上自动滚动
      performAutoScrollUp(speed) {
        if (!this.isDragging)
          return;
        let currentScrollTop = this.autoScrollTarget;
        if (currentScrollTop > 0) {
          const newScrollTop = Math.max(0, currentScrollTop - speed);
          this.autoScrollTarget = newScrollTop;
          formatAppLog("log", "at pages/tasks/tasks.vue:429", "执行向上滚动:", currentScrollTop, "->", newScrollTop);
        }
      },
      // 执行向下自动滚动
      performAutoScrollDown(speed) {
        if (!this.isDragging)
          return;
        let currentScrollTop = this.autoScrollTarget;
        const newScrollTop = currentScrollTop + speed;
        this.autoScrollTarget = newScrollTop;
        formatAppLog("log", "at pages/tasks/tasks.vue:442", "执行向下滚动:", currentScrollTop, "->", newScrollTop);
      },
      // 开始拖拽
      startDragging(index) {
        formatAppLog("log", "at pages/tasks/tasks.vue:449", "=== 开始拖拽调试信息 ===");
        formatAppLog("log", "at pages/tasks/tasks.vue:450", "拖拽前滚动位置:", this.scrollTop);
        formatAppLog("log", "at pages/tasks/tasks.vue:451", "isDragging变化前:", this.isDragging);
        this.isDragging = true;
        this.draggingIndex = index;
        this.dragOverIndex = index;
        this.autoScrollTarget = this.scrollTop;
        formatAppLog("log", "at pages/tasks/tasks.vue:458", "isDragging变化后:", this.isDragging);
        formatAppLog("log", "at pages/tasks/tasks.vue:459", "拖拽后滚动位置:", this.scrollTop);
        try {
          uni.vibrateShort({
            type: "light"
          });
        } catch (e) {
          formatAppLog("log", "at pages/tasks/tasks.vue:467", "触觉反馈不支持");
        }
        uni.showToast({
          title: "长按拖拽排序中",
          icon: "none",
          duration: 1500
        });
        formatAppLog("log", "at pages/tasks/tasks.vue:477", "开始拖拽任务:", index);
      },
      // 更新拖拽位置
      updateDragPosition(clientY) {
        const deltaY = clientY - this.startY;
        const itemHeight = this.itemHeight || 120;
        const steps = Math.round(deltaY / itemHeight);
        const newIndex = Math.max(0, Math.min(
          this.filteredTasks.length - 1,
          this.draggingIndex + steps
        ));
        if (newIndex !== this.dragOverIndex) {
          this.dragOverIndex = newIndex;
        }
      },
      // 停止拖拽
      stopDragging() {
        formatAppLog("log", "at pages/tasks/tasks.vue:499", "=== 停止拖拽调试信息 ===");
        formatAppLog("log", "at pages/tasks/tasks.vue:500", "停止前滚动位置:", this.scrollTop);
        formatAppLog("log", "at pages/tasks/tasks.vue:501", "停止前自动滚动目标:", this.autoScrollTarget);
        clearTimeout(this.autoScrollTimer);
        if (this.draggingIndex !== this.dragOverIndex) {
          this.moveTaskToPosition(this.draggingIndex, this.dragOverIndex);
        }
        this.isDragging = false;
        this.draggingIndex = -1;
        this.dragOverIndex = -1;
        this.startY = 0;
        this.currentY = 0;
        this.isLongPressing = false;
        this.hasMoved = false;
        formatAppLog("log", "at pages/tasks/tasks.vue:520", "停止后滚动位置:", this.scrollTop);
        formatAppLog("log", "at pages/tasks/tasks.vue:521", "停止后自动滚动目标:", this.autoScrollTarget);
        formatAppLog("log", "at pages/tasks/tasks.vue:522", "已重新启用scroll-view滚动");
      },
      // 获取任务样式
      getTaskStyle(index) {
        const style = {};
        if (this.isDragging && index === this.draggingIndex) {
          const deltaY = this.currentY - this.startY;
          style.transform = `translateY(${deltaY}px) scale(1.05)`;
          style.zIndex = 1e3;
          style.opacity = 0.9;
        } else if (this.isDragging && index === this.dragOverIndex && index !== this.draggingIndex) {
          style.transform = "scale(0.98)";
          style.backgroundColor = "rgba(0, 212, 170, 0.1)";
        }
        return style;
      },
      // 移动任务到指定位置
      moveTaskToPosition(fromIndex, toIndex) {
        if (fromIndex === toIndex)
          return;
        const movedTask = this.filteredTasks.splice(fromIndex, 1)[0];
        this.filteredTasks.splice(toIndex, 0, movedTask);
        this.tasks = [...this.filteredTasks];
        uni.showToast({
          title: "任务位置已调整",
          icon: "success",
          duration: 1500
        });
      },
      // 格式化时间
      formatTime(time) {
        const date = new Date(time);
        const now = /* @__PURE__ */ new Date();
        const diff = now - date;
        const day = 24 * 60 * 60 * 1e3;
        if (diff < day) {
          return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
        } else if (diff < 7 * day) {
          const days = Math.floor(diff / day);
          return `${days}天前`;
        } else {
          return date.toLocaleDateString("zh-CN");
        }
      },
      // 获取任务类型图标
      getTypeIconClass(type) {
        const typeIcons = {
          "学习": "icon-book",
          "运动": "icon-sport",
          "娱乐": "icon-game",
          "工作": "icon-work",
          "生活": "icon-life"
        };
        return typeIcons[type] || "icon-default";
      },
      // 生成模拟数据
      generateMockTasks() {
        const types = ["学习", "运动", "娱乐", "工作", "生活"];
        const names = [
          "学习Vue3新特性",
          "晨跑锻炼",
          "看电影《星际穿越》",
          "完成项目原型设计",
          "整理房间",
          "学习英语口语",
          "健身房力量训练",
          "和朋友聚餐",
          "准备周会汇报",
          "购买生活用品",
          "阅读《设计心理学》",
          "参加线上技术分享",
          "制作PPT演示文稿",
          "学习摄影技巧",
          "练习瑜伽",
          "编写代码文档",
          "参与开源项目",
          "学习新的编程语言",
          "制定月度计划",
          "整理数字资料"
        ];
        const descriptions = [
          "深入学习Composition API和新的响应式系统",
          "保持身体健康，提升精神状态",
          "放松身心，享受优质的视听体验",
          "运用设计思维，创造用户友好的界面",
          "营造整洁舒适的生活环境",
          "提高语言能力，拓展国际视野",
          "增强体质，塑造理想身材",
          "维护社交关系，分享生活乐趣",
          "展示工作成果，获得团队认可",
          "采购必需品，改善生活质量"
        ];
        const locations = ["线上", "北京市朝阳区", "健身房", "图书馆", "咖啡厅", "公园", "家中", "办公室", "社区中心", "学校"];
        return Array.from({ length: 15 }, (_, i) => {
          const nameIndex = i % names.length;
          const name = names[nameIndex];
          const type = types[Math.floor(Math.random() * types.length)];
          const description = descriptions[nameIndex % descriptions.length];
          return {
            id: Date.now() + i + Math.random() * 1e3,
            name,
            type,
            description,
            time: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1e3,
            participantCount: Math.floor(Math.random() * 50) + 1,
            location: locations[Math.floor(Math.random() * locations.length)],
            progress: Math.floor(Math.random() * 100),
            joined: Math.random() > 0.7,
            expanded: false,
            difficulty: ["简单", "中等", "困难"][Math.floor(Math.random() * 3)],
            reward: Math.floor(Math.random() * 50) + 10,
            deadline: Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1e3
          };
        });
      }
    },
    onLoad() {
      this.loadTasks();
    },
    beforeDestroy() {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
      }
      if (this.autoScrollTimer) {
        clearTimeout(this.autoScrollTimer);
      }
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["tasks-page", { "dragging": $data.isDragging }])
      },
      [
        vue.createCommentVNode(" 顶部工具栏 "),
        vue.createElementVNode("view", { class: "header-toolbar" }, [
          vue.createElementVNode("button", {
            class: "btn btn-text",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.resetSort && $options.resetSort(...args))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-refresh" }),
            vue.createTextVNode(" 恢复初始排序 ")
          ]),
          vue.createElementVNode("button", {
            class: "btn btn-text",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.showSearch && $options.showSearch(...args))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-search" }),
            vue.createTextVNode(" 搜索 ")
          ]),
          vue.createElementVNode("text", { class: "sort-tip" }, "长按500ms拖拽任务排序")
        ]),
        vue.createCommentVNode(" 搜索框 "),
        $data.isSearchVisible ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "search-container"
        }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              type: "text",
              placeholder: "搜索任务...",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.searchKeyword = $event),
              onInput: _cache[3] || (_cache[3] = (...args) => $options.onSearch && $options.onSearch(...args)),
              onConfirm: _cache[4] || (_cache[4] = (...args) => $options.onSearch && $options.onSearch(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
          ]),
          vue.createElementVNode("button", {
            class: "btn btn-text",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.hideSearch && $options.hideSearch(...args))
          }, "取消")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 任务列表 "),
        vue.createElementVNode("scroll-view", {
          ref: "taskList",
          class: "task-list",
          "scroll-y": !$data.isDragging,
          onScrolltolower: _cache[6] || (_cache[6] = (...args) => $options.loadMore && $options.loadMore(...args)),
          onScroll: _cache[7] || (_cache[7] = (...args) => $options.onScroll && $options.onScroll(...args)),
          "scroll-top": $data.autoScrollTarget
        }, [
          vue.createCommentVNode(" 调试信息 "),
          vue.createElementVNode("view", {
            class: "debug-info",
            style: { "padding": "10px", "background": "#f0f0f0", "margin": "10px" }
          }, [
            vue.createElementVNode(
              "text",
              null,
              "调试: 任务" + vue.toDisplayString($data.tasks.length) + "个, 显示" + vue.toDisplayString($data.filteredTasks.length) + "个, 加载中:" + vue.toDisplayString($data.isLoading) + ", hasMore:" + vue.toDisplayString($data.hasMore),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 强制显示任务测试 "),
          $data.tasks.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            style: { "background": "yellow", "padding": "10px", "margin": "10px" }
          }, [
            vue.createElementVNode(
              "text",
              null,
              "强制测试显示: " + vue.toDisplayString($data.tasks[0].name),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 骨架屏 "),
          $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "skeleton-container"
          }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(5, (i) => {
                return vue.createElementVNode("view", {
                  key: i,
                  class: "skeleton-item"
                }, [
                  vue.createElementVNode("view", { class: "skeleton skeleton-title" }),
                  vue.createElementVNode("view", { class: "skeleton skeleton-content" }),
                  vue.createElementVNode("view", { class: "skeleton skeleton-tags" })
                ]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 任务列表项 "),
          !$data.isLoading && $data.filteredTasks.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "task-items"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.filteredTasks, (task, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: task.id,
                  "data-index": index,
                  class: vue.normalizeClass(["task-item", {
                    "expanded": task.expanded,
                    "dragging": $data.draggingIndex === index,
                    "placeholder": $data.dragOverIndex === index && $data.draggingIndex !== index
                  }]),
                  style: vue.normalizeStyle($options.getTaskStyle(index)),
                  onTouchstart: ($event) => $options.onTouchStart($event, index),
                  onTouchmove: ($event) => $options.onTouchMove($event, index),
                  onTouchend: ($event) => $options.onTouchEnd($event, index)
                }, [
                  vue.createCommentVNode(" 一级信息 "),
                  vue.createElementVNode("view", { class: "task-primary" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "task-time" },
                      vue.toDisplayString($options.formatTime(task.time)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "task-info" }, [
                      vue.createElementVNode(
                        "view",
                        { class: "task-name" },
                        vue.toDisplayString(task.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "task-type" }, [
                        vue.createElementVNode(
                          "text",
                          {
                            class: vue.normalizeClass(["task-type-icon", $options.getTypeIconClass(task.type)])
                          },
                          null,
                          2
                          /* CLASS */
                        ),
                        vue.createTextVNode(
                          " " + vue.toDisplayString(task.type),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["expand-icon", { "rotated": task.expanded }])
                      },
                      [
                        vue.createElementVNode("text", { class: "iconfont icon-arrow-down" })
                      ],
                      2
                      /* CLASS */
                    )
                  ]),
                  vue.createCommentVNode(" 二级信息（展开时显示） "),
                  task.expanded ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "task-secondary"
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "task-description" },
                      vue.toDisplayString(task.description),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "task-meta" }, [
                      vue.createElementVNode("view", { class: "meta-item" }, [
                        vue.createElementVNode("text", { class: "iconfont icon-user" }),
                        vue.createTextVNode(
                          " " + vue.toDisplayString(task.participantCount) + "人参与 ",
                          1
                          /* TEXT */
                        )
                      ]),
                      task.location ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "meta-item"
                      }, [
                        vue.createElementVNode("text", { class: "iconfont icon-location" }),
                        vue.createTextVNode(
                          " " + vue.toDisplayString(task.location),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true),
                      task.progress ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "meta-item"
                      }, [
                        vue.createElementVNode("text", { class: "iconfont icon-progress" }),
                        vue.createTextVNode(
                          " " + vue.toDisplayString(task.progress) + "% ",
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true)
                    ]),
                    vue.createElementVNode("view", { class: "task-actions" }, [
                      vue.createElementVNode("button", {
                        class: "btn btn-secondary",
                        onClick: vue.withModifiers(($event) => $options.viewTaskDetail(task), ["stop"])
                      }, " 查看详情 ", 8, ["onClick"]),
                      !task.joined ? (vue.openBlock(), vue.createElementBlock("button", {
                        key: 0,
                        class: "btn btn-primary",
                        onClick: vue.withModifiers(($event) => $options.joinTask(task), ["stop"])
                      }, " 参与任务 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                    ])
                  ])) : vue.createCommentVNode("v-if", true)
                ], 46, ["data-index", "onTouchstart", "onTouchmove", "onTouchend"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 空状态 "),
          !$data.isLoading && $data.filteredTasks.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "empty-state"
          }, [
            vue.createElementVNode("view", { class: "empty-icon" }, "📝"),
            vue.createElementVNode("view", { class: "empty-text" }, "暂无任务"),
            vue.createElementVNode("view", { class: "empty-desc" }, "快去发现页面找找有趣的任务吧")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 加载更多 "),
          $data.isLoadingMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 4,
            class: "loading-more"
          }, [
            vue.createElementVNode("text", null, "加载中...")
          ])) : vue.createCommentVNode("v-if", true)
        ], 40, ["scroll-y", "scroll-top"])
      ],
      2
      /* CLASS */
    );
  }
  const PagesTasksTasks = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-027feebf"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/tasks/tasks.vue"]]);
  const _imports_0 = "/static/logo.png";
  const _sfc_main$e = {
    data() {
      return {
        title: "Hello"
      };
    },
    onLoad() {
    },
    methods: {}
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("image", {
        class: "logo",
        src: _imports_0
      }),
      vue.createElementVNode("view", { class: "text-area" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($data.title),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/index/index.vue"]]);
  const _sfc_main$d = {
    data() {
      return {
        searchKeyword: "",
        isLoading: true,
        isLoadingMore: false,
        groups: [],
        filteredGroups: [],
        page: 1,
        hasMore: true
      };
    },
    onLoad() {
      this.loadGroups();
    },
    methods: {
      // 搜索社群
      onSearch() {
        if (!this.searchKeyword.trim()) {
          this.filteredGroups = [...this.groups];
          return;
        }
        this.filteredGroups = this.groups.filter(
          (group) => group.name.includes(this.searchKeyword) || group.description.includes(this.searchKeyword) || group.tags.some((tag) => tag.includes(this.searchKeyword))
        );
      },
      // 加载社群列表
      async loadGroups(reset = false) {
        if (reset) {
          this.page = 1;
          this.groups = [];
          this.isLoading = true;
        }
        try {
          const mockGroups = this.generateMockGroups();
          if (reset) {
            this.groups = mockGroups;
          } else {
            this.groups = [...this.groups, ...mockGroups];
          }
          this.filteredGroups = [...this.groups];
          this.hasMore = mockGroups.length === 10;
        } catch (error) {
          formatAppLog("error", "at pages/groups/groups.vue:138", "加载社群失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
          this.isLoadingMore = false;
        }
      },
      // 加载更多
      loadMore() {
        if (!this.hasMore || this.isLoadingMore)
          return;
        this.isLoadingMore = true;
        this.page++;
        this.loadGroups();
      },
      // 查看社群详情
      viewGroupDetail(group) {
        uni.navigateTo({
          url: `/pages/groupDetail/groupDetail?id=${group.id}`
        });
      },
      // 加入/退出社群
      toggleJoinGroup(group) {
        if (group.joined) {
          uni.showModal({
            title: "确认退出",
            content: `确定要退出"${group.name}"社群吗？`,
            success: (res) => {
              if (res.confirm) {
                group.joined = false;
                group.memberCount--;
                uni.showToast({
                  title: "已退出社群",
                  icon: "success"
                });
              }
            }
          });
        } else {
          if (!group.isPublic) {
            uni.showModal({
              title: "申请加入",
              content: `"${group.name}"是私密社群，需要申请加入`,
              confirmText: "申请",
              success: (res) => {
                if (res.confirm) {
                  uni.showToast({
                    title: "申请已发送",
                    icon: "success"
                  });
                }
              }
            });
          } else {
            group.joined = true;
            group.memberCount++;
            uni.showToast({
              title: "加入成功",
              icon: "success"
            });
          }
        }
      },
      // 生成模拟社群数据
      generateMockGroups() {
        const names = [
          "前端开发者联盟",
          "健身打卡群",
          "读书分享会",
          "摄影爱好者",
          "创业交流圈",
          "旅行达人",
          "美食探索队",
          "设计师之家",
          "投资理财群",
          "职场进阶"
        ];
        const descriptions = [
          "分享前端技术，交流开发经验",
          "每日打卡，互相监督，一起变强",
          "好书推荐，读后感分享，思维碰撞",
          "摄影技巧分享，作品点评",
          "创业心得，资源对接，合作机会",
          "世界那么大，一起去看看",
          "发现城市美食，分享烹饪心得",
          "设计灵感分享，作品交流",
          "理性投资，财富增值",
          "职业规划，技能提升，经验分享"
        ];
        const tags = [
          ["技术", "前端", "Vue"],
          ["健身", "运动", "打卡"],
          ["读书", "分享", "成长"],
          ["摄影", "艺术", "创作"],
          ["创业", "商业", "机会"],
          ["旅行", "探索", "生活"],
          ["美食", "烹饪", "分享"],
          ["设计", "UI", "创意"],
          ["投资", "理财", "财富"],
          ["职场", "成长", "技能"]
        ];
        const activityLevels = ["很活跃", "较活跃", "一般活跃", "不太活跃"];
        return Array.from({ length: 10 }, (_, i) => ({
          id: Date.now() + i,
          name: names[i % names.length],
          description: descriptions[i % descriptions.length],
          avatar: `https://picsum.photos/200/200?random=${i}`,
          memberCount: Math.floor(Math.random() * 1e3) + 50,
          isPublic: Math.random() > 0.3,
          joined: Math.random() > 0.8,
          activityLevel: activityLevels[Math.floor(Math.random() * activityLevels.length)],
          tags: tags[i % tags.length]
        }));
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "groups-page" }, [
      vue.createCommentVNode(" 搜索框 "),
      vue.createElementVNode("view", { class: "search-header" }, [
        vue.createElementVNode("view", { class: "search-box" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              type: "text",
              placeholder: "搜索社群",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.searchKeyword = $event),
              onInput: _cache[1] || (_cache[1] = (...args) => $options.onSearch && $options.onSearch(...args)),
              onConfirm: _cache[2] || (_cache[2] = (...args) => $options.onSearch && $options.onSearch(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
          ])
        ])
      ]),
      vue.createCommentVNode(" 社群列表 "),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "groups-list",
          "scroll-y": "true",
          onScrolltolower: _cache[3] || (_cache[3] = (...args) => $options.loadMore && $options.loadMore(...args))
        },
        [
          vue.createCommentVNode(" 骨架屏 "),
          $data.isLoading && $data.groups.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "skeleton-container"
          }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(5, (i) => {
                return vue.createElementVNode("view", {
                  key: i,
                  class: "skeleton-item"
                }, [
                  vue.createElementVNode("view", { class: "skeleton skeleton-avatar" }),
                  vue.createElementVNode("view", { class: "skeleton-content" }, [
                    vue.createElementVNode("view", { class: "skeleton skeleton-title" }),
                    vue.createElementVNode("view", { class: "skeleton skeleton-desc" }),
                    vue.createElementVNode("view", { class: "skeleton skeleton-tags" })
                  ])
                ]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])) : $data.filteredGroups.length > 0 ? (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            { key: 1 },
            [
              vue.createCommentVNode(" 社群列表项 "),
              vue.createElementVNode("view", { class: "group-items" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.filteredGroups, (group) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: group.id,
                      class: "group-item",
                      onClick: ($event) => $options.viewGroupDetail(group)
                    }, [
                      vue.createElementVNode("view", { class: "group-avatar" }, [
                        vue.createElementVNode("image", {
                          src: group.avatar,
                          mode: "aspectFill"
                        }, null, 8, ["src"])
                      ]),
                      vue.createElementVNode("view", { class: "group-info" }, [
                        vue.createElementVNode("view", { class: "group-header" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "group-name" },
                            vue.toDisplayString(group.name),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "view",
                            {
                              class: vue.normalizeClass(["group-status", group.isPublic ? "public" : "private"])
                            },
                            vue.toDisplayString(group.isPublic ? "公开" : "私密"),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        vue.createElementVNode(
                          "view",
                          { class: "group-desc" },
                          vue.toDisplayString(group.description),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "group-meta" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "member-count" },
                            "👥 " + vue.toDisplayString(group.memberCount) + "人",
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "activity-level" },
                            "🔥 " + vue.toDisplayString(group.activityLevel),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", { class: "group-tags" }, [
                            (vue.openBlock(true), vue.createElementBlock(
                              vue.Fragment,
                              null,
                              vue.renderList(group.tags, (tag) => {
                                return vue.openBlock(), vue.createElementBlock(
                                  "text",
                                  {
                                    key: tag,
                                    class: "tag"
                                  },
                                  vue.toDisplayString(tag),
                                  1
                                  /* TEXT */
                                );
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ])
                        ])
                      ]),
                      vue.createElementVNode("view", { class: "group-action" }, [
                        vue.createElementVNode("button", {
                          class: vue.normalizeClass(["btn", group.joined ? "btn-secondary" : "btn-primary"]),
                          onClick: vue.withModifiers(($event) => $options.toggleJoinGroup(group), ["stop"])
                        }, vue.toDisplayString(group.joined ? "已加入" : "加入"), 11, ["onClick"])
                      ])
                    ], 8, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            { key: 2 },
            [
              vue.createCommentVNode(" 空状态 "),
              vue.createElementVNode("view", { class: "empty-state" }, [
                vue.createElementVNode("view", { class: "empty-icon" }, "👥"),
                vue.createElementVNode("view", { class: "empty-text" }, "暂无社群"),
                vue.createElementVNode("view", { class: "empty-desc" }, "试试搜索感兴趣的社群")
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )),
          vue.createCommentVNode(" 加载更多 "),
          $data.isLoadingMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "loading-more"
          }, [
            vue.createElementVNode("text", null, "加载中...")
          ])) : vue.createCommentVNode("v-if", true)
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PagesGroupsGroups = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-5f8c2705"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/groups/groups.vue"]]);
  const _sfc_main$c = {
    data() {
      return {
        isSearchVisible: false,
        searchKeyword: "",
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
          timeRange: "",
          priceRange: ""
        },
        taskTypes: ["学习", "运动", "娱乐", "工作", "生活"],
        timeRanges: [
          { label: "今天", value: "today" },
          { label: "本周", value: "week" },
          { label: "本月", value: "month" }
        ],
        priceRanges: [
          { label: "免费", value: "free" },
          { label: "50元以下", value: "low" },
          { label: "50-200元", value: "medium" },
          { label: "200元以上", value: "high" }
        ]
      };
    },
    onLoad() {
      this.loadData();
    },
    methods: {
      // 显示搜索框
      showSearch() {
        this.isSearchVisible = true;
      },
      // 隐藏搜索框
      hideSearch() {
        this.isSearchVisible = false;
        this.searchKeyword = "";
        this.applySearch();
      },
      // 搜索
      onSearch() {
        this.applySearch();
      },
      // 应用搜索
      applySearch() {
        const self = this;
        this.filteredTasks = this.recommendTasks.filter(function(task) {
          if (!self.searchKeyword.trim())
            return true;
          return task.name.includes(self.searchKeyword) || task.description.includes(self.searchKeyword);
        });
      },
      // 重置排序
      resetSort() {
        this.loadData(true);
      },
      // 显示筛选弹窗
      showFilterModal() {
        this.showFilterPanel = true;
      },
      // 关闭筛选弹窗
      closeFilterModal() {
        this.showFilterPanel = false;
      },
      // 切换类型筛选
      toggleTypeFilter(type) {
        const index = this.selectedFilters.types.indexOf(type);
        if (index > -1) {
          this.selectedFilters.types.splice(index, 1);
        } else {
          this.selectedFilters.types.push(type);
        }
      },
      // 选择时间范围
      selectTimeRange(range) {
        this.selectedFilters.timeRange = this.selectedFilters.timeRange === range ? "" : range;
      },
      // 选择价格范围
      selectPriceRange(range) {
        this.selectedFilters.priceRange = this.selectedFilters.priceRange === range ? "" : range;
      },
      // 清空筛选
      clearAllFilters() {
        this.selectedFilters = {
          types: [],
          timeRange: "",
          priceRange: ""
        };
      },
      // 应用筛选
      applyFilters() {
        this.updateActiveFilters();
        this.applyFilterLogic();
        this.closeFilterModal();
      },
      // 更新活跃筛选标签
      updateActiveFilters() {
        const self = this;
        this.activeFilters = [];
        this.selectedFilters.types.forEach(function(type) {
          self.activeFilters.push({
            key: "type-" + type,
            label: type,
            type: "type",
            value: type
          });
        });
        if (this.selectedFilters.timeRange) {
          const timeItem = this.timeRanges.find(function(t) {
            return t.value === self.selectedFilters.timeRange;
          });
          const timeLabel = timeItem ? timeItem.label : "";
          self.activeFilters.push({
            key: "time-" + self.selectedFilters.timeRange,
            label: timeLabel,
            type: "time",
            value: self.selectedFilters.timeRange
          });
        }
        if (this.selectedFilters.priceRange) {
          const priceItem = this.priceRanges.find(function(p) {
            return p.value === self.selectedFilters.priceRange;
          });
          const priceLabel = priceItem ? priceItem.label : "";
          self.activeFilters.push({
            key: "price-" + self.selectedFilters.priceRange,
            label: priceLabel,
            type: "price",
            value: self.selectedFilters.priceRange
          });
        }
      },
      // 应用筛选逻辑
      applyFilterLogic() {
        const self = this;
        this.filteredTasks = this.recommendTasks.filter(function(task) {
          if (self.selectedFilters.types.length > 0 && !self.selectedFilters.types.includes(task.type)) {
            return false;
          }
          if (self.selectedFilters.priceRange) {
            const priceStr = task.price ? task.price.replace("元", "") : "0";
            const taskPrice = parseFloat(priceStr);
            switch (self.selectedFilters.priceRange) {
              case "free":
                if (taskPrice > 0)
                  return false;
                break;
              case "low":
                if (taskPrice === 0 || taskPrice >= 50)
                  return false;
                break;
              case "medium":
                if (taskPrice < 50 || taskPrice > 200)
                  return false;
                break;
              case "high":
                if (taskPrice <= 200)
                  return false;
                break;
            }
          }
          return true;
        });
      },
      // 移除筛选标签
      removeFilter(filter) {
        if (filter.type === "type") {
          const index = this.selectedFilters.types.indexOf(filter.value);
          if (index > -1) {
            this.selectedFilters.types.splice(index, 1);
          }
        } else if (filter.type === "time") {
          this.selectedFilters.timeRange = "";
        } else if (filter.type === "price") {
          this.selectedFilters.priceRange = "";
        }
        this.updateActiveFilters();
        this.applyFilterLogic();
      },
      // 加载数据
      async loadData(reset = false) {
        if (reset) {
          this.page = 1;
          this.isLoading = true;
        }
        try {
          const [groups, tasks] = await Promise.all([
            this.loadRecommendGroups(),
            this.loadRecommendTasks()
          ]);
          this.recommendGroups = groups;
          this.recommendTasks = tasks;
          this.filteredTasks = [...tasks];
          this.hasMore = tasks.length === 10;
        } catch (error) {
          formatAppLog("error", "at pages/discover/discover.vue:423", "加载数据失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
          this.isLoadingMore = false;
        }
      },
      // 加载更多
      loadMore() {
        if (!this.hasMore || this.isLoadingMore)
          return;
        this.isLoadingMore = true;
        this.page++;
        this.loadData();
      },
      // 加载推荐社群
      async loadRecommendGroups() {
        return Array.from({ length: 5 }, function(_, i) {
          return {
            id: "group-" + i,
            name: ["前端开发者", "健身达人", "读书会", "摄影师", "美食家"][i],
            cover: "https://picsum.photos/300/200?random=" + (i + 100),
            joined: Math.random() > 0.7
          };
        });
      },
      // 加载推荐任务
      async loadRecommendTasks() {
        const types = ["学习", "运动", "娱乐", "工作", "生活"];
        const names = [
          "Vue3 实战项目开发",
          "晨跑打卡挑战",
          "周末电影观影会",
          "UI设计作品评审",
          "家居整理收纳"
        ];
        const prices = ["免费", "30元", "50元", "100元", "免费", "80元", "120元", "200元"];
        return Array.from({ length: 8 }, function(_, i) {
          return {
            id: "task-" + Date.now() + "-" + i,
            name: names[i % names.length],
            type: types[Math.floor(Math.random() * types.length)],
            description: "这是一个关于" + names[i % names.length] + "的详细描述，欢迎大家积极参与。",
            time: Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1e3,
            participantCount: Math.floor(Math.random() * 30) + 5,
            location: Math.random() > 0.5 ? "线上" : "北京朝阳区",
            price: Math.random() > 0.3 ? prices[Math.floor(Math.random() * prices.length)] : null,
            joined: Math.random() > 0.8
          };
        });
      },
      // 查看更多社群
      viewMoreGroups() {
        uni.switchTab({
          url: "/pages/groups/groups"
        });
      },
      // 查看更多任务
      viewMoreTasks() {
        uni.switchTab({
          url: "/pages/tasks/tasks"
        });
      },
      // 查看社群详情
      viewGroupDetail(group) {
        uni.navigateTo({
          url: "/pages/groupDetail/groupDetail?id=" + group.id
        });
      },
      // 查看任务详情
      viewTaskDetail(task) {
        uni.navigateTo({
          url: "/pages/taskDetail/taskDetail?id=" + task.id
        });
      },
      // 加入社群
      joinGroup(group) {
        group.joined = !group.joined;
        uni.showToast({
          title: group.joined ? "加入成功" : "已退出",
          icon: "success"
        });
      },
      // 参与任务
      toggleJoinTask(task) {
        task.joined = !task.joined;
        if (task.joined) {
          task.participantCount++;
        } else {
          task.participantCount--;
        }
        uni.showToast({
          title: task.joined ? "参与成功" : "已退出",
          icon: "success"
        });
      },
      // 格式化时间
      formatTime(time) {
        const date = new Date(time);
        const now = /* @__PURE__ */ new Date();
        const diff = date.getTime() - now.getTime();
        if (diff > 0) {
          const days = Math.floor(diff / (24 * 60 * 60 * 1e3));
          if (days > 0) {
            return days + "天后";
          } else {
            const hours = Math.floor(diff / (60 * 60 * 1e3));
            return hours + "小时后";
          }
        } else {
          return "已结束";
        }
      },
      // 获取任务类型样式类
      getTypeClass(type) {
        const typeClasses = {
          "学习": "type-study",
          "运动": "type-sport",
          "娱乐": "type-entertainment",
          "工作": "type-work",
          "生活": "type-life"
        };
        return typeClasses[type] || "type-default";
      },
      // 获取任务类型图标
      getTypeIconClass(type) {
        const typeIcons = {
          "学习": "icon-book",
          "运动": "icon-sport",
          "娱乐": "icon-game",
          "工作": "icon-work",
          "生活": "icon-life"
        };
        return typeIcons[type] || "icon-default";
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "discover-page" }, [
      vue.createCommentVNode(" 顶部工具栏 "),
      vue.createElementVNode("view", { class: "header-toolbar" }, [
        vue.createElementVNode("button", {
          class: "btn btn-text",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.resetSort && $options.resetSort(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-refresh" }),
          vue.createTextVNode(" 恢复初始排序 ")
        ]),
        vue.createElementVNode("button", {
          class: "btn btn-text",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.showSearch && $options.showSearch(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-search" }),
          vue.createTextVNode(" 搜索 ")
        ])
      ]),
      vue.createCommentVNode(" 搜索框 "),
      $data.isSearchVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "search-container"
      }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "search-input",
            type: "text",
            placeholder: "搜索任务或社群...",
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.searchKeyword = $event),
            onInput: _cache[3] || (_cache[3] = (...args) => $options.onSearch && $options.onSearch(...args)),
            onConfirm: _cache[4] || (_cache[4] = (...args) => $options.onSearch && $options.onSearch(...args))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [
          [vue.vModelText, $data.searchKeyword]
        ]),
        vue.createElementVNode("button", {
          class: "btn btn-text",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.hideSearch && $options.hideSearch(...args))
        }, "取消")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 筛选器 "),
      vue.createElementVNode("view", { class: "filter-container" }, [
        vue.createElementVNode("button", {
          class: "filter-btn",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.showFilterModal && $options.showFilterModal(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-filter" }),
          vue.createTextVNode(" 筛选 ")
        ]),
        $data.activeFilters.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "active-filters"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.activeFilters, (filter) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: filter.key,
                class: "filter-tag",
                onClick: ($event) => $options.removeFilter(filter)
              }, [
                vue.createTextVNode(
                  vue.toDisplayString(filter.label) + " ",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "remove-icon" }, "×")
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "content-scroll",
          "scroll-y": "true",
          onScrolltolower: _cache[9] || (_cache[9] = (...args) => $options.loadMore && $options.loadMore(...args))
        },
        [
          vue.createCommentVNode(" 推荐社群 "),
          vue.createElementVNode("view", { class: "recommend-section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "推荐社群"),
              vue.createElementVNode("text", {
                class: "section-more",
                onClick: _cache[7] || (_cache[7] = (...args) => $options.viewMoreGroups && $options.viewMoreGroups(...args))
              }, "更多 >")
            ]),
            vue.createElementVNode("scroll-view", {
              class: "recommend-groups",
              "scroll-x": "true",
              "show-scrollbar": "false"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.recommendGroups, (group) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "group-card",
                    key: group.id,
                    onClick: ($event) => $options.viewGroupDetail(group)
                  }, [
                    vue.createElementVNode("image", {
                      src: group.cover,
                      mode: "aspectFill",
                      class: "group-cover"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "group-overlay" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "group-name" },
                        vue.toDisplayString(group.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("button", {
                        class: "btn btn-primary btn-small",
                        onClick: vue.withModifiers(($event) => $options.joinGroup(group), ["stop"])
                      }, vue.toDisplayString(group.joined ? "已加入" : "加入"), 9, ["onClick"])
                    ])
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createCommentVNode(" 推荐任务 "),
          vue.createElementVNode("view", { class: "recommend-section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "推荐任务"),
              vue.createElementVNode("text", {
                class: "section-more",
                onClick: _cache[8] || (_cache[8] = (...args) => $options.viewMoreTasks && $options.viewMoreTasks(...args))
              }, "更多 >")
            ]),
            vue.createCommentVNode(" 骨架屏 "),
            $data.isLoading && $data.recommendTasks.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "skeleton-container"
            }, [
              (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(3, (i) => {
                  return vue.createElementVNode("view", {
                    key: i,
                    class: "skeleton-item"
                  }, [
                    vue.createElementVNode("view", { class: "skeleton skeleton-title" }),
                    vue.createElementVNode("view", { class: "skeleton skeleton-content" }),
                    vue.createElementVNode("view", { class: "skeleton skeleton-tags" })
                  ]);
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ])) : $data.filteredTasks.length > 0 ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 1 },
              [
                vue.createCommentVNode(" 任务列表 "),
                vue.createElementVNode("view", { class: "task-list" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.filteredTasks, (task) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: task.id,
                        class: "task-item",
                        onClick: ($event) => $options.viewTaskDetail(task)
                      }, [
                        vue.createElementVNode("view", { class: "task-header" }, [
                          vue.createElementVNode(
                            "view",
                            { class: "task-time" },
                            vue.toDisplayString($options.formatTime(task.time)),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "view",
                            {
                              class: vue.normalizeClass(["task-type", $options.getTypeClass(task.type)])
                            },
                            [
                              vue.createElementVNode(
                                "text",
                                {
                                  class: vue.normalizeClass(["task-type-icon", $options.getTypeIconClass(task.type)])
                                },
                                null,
                                2
                                /* CLASS */
                              ),
                              vue.createTextVNode(
                                " " + vue.toDisplayString(task.type),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          )
                        ]),
                        vue.createElementVNode(
                          "view",
                          { class: "task-name" },
                          vue.toDisplayString(task.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "view",
                          { class: "task-description" },
                          vue.toDisplayString(task.description),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "task-meta" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "meta-item" },
                            "👥 " + vue.toDisplayString(task.participantCount) + "人参与",
                            1
                            /* TEXT */
                          ),
                          task.location ? (vue.openBlock(), vue.createElementBlock(
                            "text",
                            {
                              key: 0,
                              class: "meta-item"
                            },
                            "📍 " + vue.toDisplayString(task.location),
                            1
                            /* TEXT */
                          )) : vue.createCommentVNode("v-if", true),
                          task.price ? (vue.openBlock(), vue.createElementBlock(
                            "text",
                            {
                              key: 1,
                              class: "meta-item"
                            },
                            "💰 " + vue.toDisplayString(task.price),
                            1
                            /* TEXT */
                          )) : vue.createCommentVNode("v-if", true)
                        ]),
                        vue.createElementVNode("view", { class: "task-actions" }, [
                          vue.createElementVNode("button", {
                            class: vue.normalizeClass(["btn", task.joined ? "btn-secondary" : "btn-primary"]),
                            onClick: vue.withModifiers(($event) => $options.toggleJoinTask(task), ["stop"])
                          }, vue.toDisplayString(task.joined ? "已参与" : "参与"), 11, ["onClick"])
                        ])
                      ], 8, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 2 },
              [
                vue.createCommentVNode(" 空状态 "),
                vue.createElementVNode("view", { class: "empty-state" }, [
                  vue.createElementVNode("view", { class: "empty-icon" }, "🔍"),
                  vue.createElementVNode("view", { class: "empty-text" }, "暂无符合条件的内容"),
                  vue.createElementVNode("view", { class: "empty-desc" }, "试试调整筛选条件")
                ])
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            ))
          ]),
          vue.createCommentVNode(" 加载更多 "),
          $data.isLoadingMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "loading-more"
          }, [
            vue.createElementVNode("text", null, "加载中...")
          ])) : vue.createCommentVNode("v-if", true)
        ],
        32
        /* NEED_HYDRATION */
      ),
      vue.createCommentVNode(" 筛选弹窗 "),
      $data.showFilterPanel ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "filter-modal"
      }, [
        vue.createElementVNode("view", {
          class: "modal-mask",
          onClick: _cache[10] || (_cache[10] = (...args) => $options.closeFilterModal && $options.closeFilterModal(...args))
        }),
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "筛选条件"),
            vue.createElementVNode("button", {
              class: "btn btn-text",
              onClick: _cache[11] || (_cache[11] = (...args) => $options.clearAllFilters && $options.clearAllFilters(...args))
            }, "清空")
          ]),
          vue.createElementVNode("view", { class: "filter-section" }, [
            vue.createElementVNode("text", { class: "filter-label" }, "类型"),
            vue.createElementVNode("view", { class: "filter-options" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.taskTypes, (type) => {
                  return vue.openBlock(), vue.createElementBlock("button", {
                    key: type,
                    class: vue.normalizeClass(["filter-option", { active: $data.selectedFilters.types.includes(type) }]),
                    onClick: ($event) => $options.toggleTypeFilter(type)
                  }, vue.toDisplayString(type), 11, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "filter-section" }, [
            vue.createElementVNode("text", { class: "filter-label" }, "时间"),
            vue.createElementVNode("view", { class: "filter-options" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.timeRanges, (time) => {
                  return vue.openBlock(), vue.createElementBlock("button", {
                    key: time.value,
                    class: vue.normalizeClass(["filter-option", { active: $data.selectedFilters.timeRange === time.value }]),
                    onClick: ($event) => $options.selectTimeRange(time.value)
                  }, vue.toDisplayString(time.label), 11, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "filter-section" }, [
            vue.createElementVNode("text", { class: "filter-label" }, "费用"),
            vue.createElementVNode("view", { class: "filter-options" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.priceRanges, (price) => {
                  return vue.openBlock(), vue.createElementBlock("button", {
                    key: price.value,
                    class: vue.normalizeClass(["filter-option", { active: $data.selectedFilters.priceRange === price.value }]),
                    onClick: ($event) => $options.selectPriceRange(price.value)
                  }, vue.toDisplayString(price.label), 11, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-actions" }, [
            vue.createElementVNode("button", {
              class: "btn btn-secondary",
              onClick: _cache[12] || (_cache[12] = (...args) => $options.closeFilterModal && $options.closeFilterModal(...args))
            }, "取消"),
            vue.createElementVNode("button", {
              class: "btn btn-primary",
              onClick: _cache[13] || (_cache[13] = (...args) => $options.applyFilters && $options.applyFilters(...args))
            }, "确定")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesDiscoverDiscover = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-7f6951af"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/discover/discover.vue"]]);
  const _sfc_main$b = {
    data() {
      return {
        userInfo: {
          name: "用户昵称",
          id: "123456789",
          avatar: "https://picsum.photos/200/200?random=999",
          level: "Lv.5",
          creditLevel: "A",
          memberType: "黄金会员",
          friendsCount: 128
        },
        statsData: {
          myGroups: 8,
          myTasks: 15,
          achievements: 12,
          following: 45
        }
      };
    },
    onLoad() {
      this.loadUserData();
    },
    onShow() {
      this.loadUserData();
    },
    methods: {
      // 加载用户数据
      async loadUserData() {
      },
      // 导航到指定页面
      navigateTo(url) {
        uni.navigateTo({
          url,
          fail: (err) => {
            formatAppLog("warn", "at pages/me/me.vue:250", "页面跳转失败:", url, err);
            uni.showToast({
              title: "功能开发中",
              icon: "none"
            });
          }
        });
      },
      // 联系客服
      contactSupport() {
        uni.showActionSheet({
          itemList: ["在线客服", "电话客服", "邮件反馈"],
          success: (res) => {
            switch (res.tapIndex) {
              case 0:
                this.navigateTo("/pages/chat/chat?type=support");
                break;
              case 1:
                uni.makePhoneCall({
                  phoneNumber: "400-123-4567"
                });
                break;
              case 2:
                this.navigateTo("/pages/feedback/feedback?type=email");
                break;
            }
          }
        });
      },
      // 切换账号
      switchAccount() {
        uni.showModal({
          title: "切换账号",
          content: "确定要切换到其他账号吗？",
          success: (res) => {
            if (res.confirm) {
              uni.removeStorageSync("userToken");
              uni.reLaunch({
                url: "/pages/login/login"
              });
            }
          }
        });
      },
      // 退出登录
      logout() {
        uni.showModal({
          title: "退出登录",
          content: "确定要退出当前账号吗？",
          confirmColor: "#ff4757",
          success: (res) => {
            if (res.confirm) {
              uni.clearStorageSync();
              uni.showToast({
                title: "已退出登录",
                icon: "success"
              });
              setTimeout(() => {
                uni.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1500);
            }
          }
        });
      },
      // 获取等级样式类
      getLevelClass(level) {
        const levelNum = parseInt(level.replace("Lv.", ""));
        if (levelNum >= 10)
          return "level-high";
        if (levelNum >= 5)
          return "level-medium";
        return "level-low";
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "me-page" }, [
      vue.createCommentVNode(" 用户信息区 "),
      vue.createElementVNode("view", { class: "user-info-section" }, [
        vue.createElementVNode("view", { class: "user-profile" }, [
          vue.createElementVNode("view", { class: "avatar-wrapper" }, [
            vue.createElementVNode("image", {
              src: $data.userInfo.avatar,
              mode: "aspectFill",
              class: "user-avatar"
            }, null, 8, ["src"]),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["level-badge", $options.getLevelClass($data.userInfo.level)])
              },
              vue.toDisplayString($data.userInfo.level),
              3
              /* TEXT, CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "user-details" }, [
            vue.createElementVNode(
              "text",
              { class: "user-name" },
              vue.toDisplayString($data.userInfo.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "user-id" },
              "ID: " + vue.toDisplayString($data.userInfo.id),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "user-badges" }, [
              $data.userInfo.creditLevel ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "badge credit-badge"
              }, [
                vue.createElementVNode("text", { class: "badge-icon" }, "⭐"),
                vue.createElementVNode(
                  "text",
                  { class: "badge-text" },
                  "信用等级" + vue.toDisplayString($data.userInfo.creditLevel),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              $data.userInfo.memberType ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "badge member-badge"
              }, [
                vue.createElementVNode("text", { class: "badge-icon" }, "👑"),
                vue.createElementVNode(
                  "text",
                  { class: "badge-text" },
                  vue.toDisplayString($data.userInfo.memberType),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ]),
        vue.createCommentVNode(" 快捷入口 "),
        vue.createElementVNode("view", { class: "quick-entries" }, [
          vue.createElementVNode("view", {
            class: "entry-item",
            onClick: _cache[0] || (_cache[0] = ($event) => $options.navigateTo("/pages/friends/friends"))
          }, [
            vue.createElementVNode("text", { class: "entry-icon" }, "👥"),
            vue.createElementVNode("text", { class: "entry-text" }, "我的好友"),
            $data.userInfo.friendsCount ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "entry-count"
              },
              vue.toDisplayString($data.userInfo.friendsCount),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", {
            class: "entry-item",
            onClick: _cache[1] || (_cache[1] = ($event) => $options.navigateTo("/pages/settings/settings"))
          }, [
            vue.createElementVNode("text", { class: "entry-icon" }, "⚙️"),
            vue.createElementVNode("text", { class: "entry-text" }, "设置")
          ]),
          vue.createElementVNode("view", {
            class: "entry-item",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.contactSupport && $options.contactSupport(...args))
          }, [
            vue.createElementVNode("text", { class: "entry-icon" }, "💬"),
            vue.createElementVNode("text", { class: "entry-text" }, "联系客服")
          ])
        ])
      ]),
      vue.createCommentVNode(" 功能列表 "),
      vue.createElementVNode("scroll-view", {
        class: "function-list",
        "scroll-y": "true"
      }, [
        vue.createCommentVNode(" 我的内容 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "我的内容"),
          vue.createElementVNode("view", { class: "function-items" }, [
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[3] || (_cache[3] = ($event) => $options.navigateTo("/pages/myGroups/myGroups"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "🏠"),
                vue.createElementVNode("text", { class: "item-text" }, "我的社群")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                $data.statsData.myGroups ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "item-count"
                  },
                  vue.toDisplayString($data.statsData.myGroups),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[4] || (_cache[4] = ($event) => $options.navigateTo("/pages/myTasks/myTasks"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "📝"),
                vue.createElementVNode("text", { class: "item-text" }, "我的任务")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                $data.statsData.myTasks ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "item-count"
                  },
                  vue.toDisplayString($data.statsData.myTasks),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[5] || (_cache[5] = ($event) => $options.navigateTo("/pages/schedule/schedule"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "📅"),
                vue.createElementVNode("text", { class: "item-text" }, "日程表")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ])
          ])
        ]),
        vue.createCommentVNode(" 社交功能 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "社交功能"),
          vue.createElementVNode("view", { class: "function-items" }, [
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[6] || (_cache[6] = ($event) => $options.navigateTo("/pages/invite/invite"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "🎁"),
                vue.createElementVNode("text", { class: "item-text" }, "邀请好友")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                vue.createElementVNode("text", { class: "item-badge" }, "有奖励"),
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[7] || (_cache[7] = ($event) => $options.navigateTo("/pages/achievements/achievements"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "🏆"),
                vue.createElementVNode("text", { class: "item-text" }, "成就徽章")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                $data.statsData.achievements ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "item-count"
                  },
                  vue.toDisplayString($data.statsData.achievements),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[8] || (_cache[8] = ($event) => $options.navigateTo("/pages/following/following"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "❤️"),
                vue.createElementVNode("text", { class: "item-text" }, "我的关注")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                $data.statsData.following ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "item-count"
                  },
                  vue.toDisplayString($data.statsData.following),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ])
          ])
        ]),
        vue.createCommentVNode(" 工具与帮助 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "工具与帮助"),
          vue.createElementVNode("view", { class: "function-items" }, [
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[9] || (_cache[9] = ($event) => $options.navigateTo("/pages/feedback/feedback"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "💡"),
                vue.createElementVNode("text", { class: "item-text" }, "反馈建议")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[10] || (_cache[10] = ($event) => $options.navigateTo("/pages/help/help"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "❓"),
                vue.createElementVNode("text", { class: "item-text" }, "帮助中心")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[11] || (_cache[11] = ($event) => $options.navigateTo("/pages/about/about"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "ℹ️"),
                vue.createElementVNode("text", { class: "item-text" }, "关于我们")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ])
          ])
        ]),
        vue.createCommentVNode(" 账号管理 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "账号管理"),
          vue.createElementVNode("view", { class: "function-items" }, [
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[12] || (_cache[12] = ($event) => $options.navigateTo("/pages/privacy/privacy"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "🔒"),
                vue.createElementVNode("text", { class: "item-text" }, "隐私设置")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[13] || (_cache[13] = ($event) => $options.navigateTo("/pages/security/security"))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "🛡️"),
                vue.createElementVNode("text", { class: "item-text" }, "账号安全")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "function-item",
              onClick: _cache[14] || (_cache[14] = (...args) => $options.switchAccount && $options.switchAccount(...args))
            }, [
              vue.createElementVNode("view", { class: "item-left" }, [
                vue.createElementVNode("text", { class: "item-icon" }, "🔄"),
                vue.createElementVNode("text", { class: "item-text" }, "切换账号")
              ]),
              vue.createElementVNode("view", { class: "item-right" }, [
                vue.createElementVNode("text", { class: "item-arrow" }, ">")
              ])
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 登出按钮 "),
      vue.createElementVNode("view", { class: "logout-section" }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: _cache[15] || (_cache[15] = (...args) => $options.logout && $options.logout(...args))
        }, "退出登录")
      ])
    ]);
  }
  const PagesMeMe = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-19c123a7"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/me/me.vue"]]);
  const _sfc_main$a = {
    data() {
      return {
        isLoading: true,
        taskId: "",
        taskDetail: null
      };
    },
    onLoad(options) {
      this.taskId = options.id;
      this.loadTaskDetail();
    },
    methods: {
      // 加载任务详情
      async loadTaskDetail() {
        this.isLoading = true;
        try {
          this.taskDetail = {
            id: this.taskId,
            name: "Vue3 实战项目开发",
            type: "学习",
            description: "通过实际项目开发学习Vue3的新特性，包括Composition API、Teleport、Fragments等。我们将一起构建一个完整的Web应用，从项目搭建到部署上线。适合有一定Vue基础的开发者参与。",
            time: Date.now() + 2 * 24 * 60 * 60 * 1e3,
            participantCount: 28,
            location: "线上",
            joined: false,
            attachments: [
              {
                id: 1,
                name: "Vue3开发指南.pdf",
                size: "2.5MB"
              },
              {
                id: 2,
                name: "项目需求文档.docx",
                size: "1.2MB"
              }
            ],
            checkpoints: [
              {
                id: 1,
                title: "环境搭建",
                description: "安装Node.js、Vue CLI等开发环境",
                completed: true
              },
              {
                id: 2,
                title: "项目初始化",
                description: "创建Vue3项目，配置路由和状态管理",
                completed: true
              },
              {
                id: 3,
                title: "组件开发",
                description: "使用Composition API开发核心组件",
                completed: false
              },
              {
                id: 4,
                title: "功能测试",
                description: "编写单元测试和集成测试",
                completed: false
              }
            ],
            participants: [
              {
                id: 1,
                name: "张三",
                avatar: "https://picsum.photos/100/100?random=1"
              },
              {
                id: 2,
                name: "李四",
                avatar: "https://picsum.photos/100/100?random=2"
              },
              {
                id: 3,
                name: "王五",
                avatar: "https://picsum.photos/100/100?random=3"
              }
            ]
          };
        } catch (error) {
          formatAppLog("error", "at pages/taskDetail/taskDetail.vue:198", "加载任务详情失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
        }
      },
      // 格式化时间
      formatTime(time) {
        const date = new Date(time);
        return date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      },
      // 获取任务类型样式类
      getTypeClass(type) {
        const typeClasses = {
          "学习": "type-study",
          "运动": "type-sport",
          "娱乐": "type-entertainment",
          "工作": "type-work",
          "生活": "type-life"
        };
        return typeClasses[type] || "type-default";
      },
      // 预览附件
      previewAttachment(attachment) {
        uni.showToast({
          title: `预览${attachment.name}`,
          icon: "none"
        });
      },
      // 打开聊天室
      openChat() {
        uni.navigateTo({
          url: `/pages/chat/chat?taskId=${this.taskId}&type=task`
        });
      },
      // 切换参与状态
      toggleJoin() {
        if (this.taskDetail.joined) {
          uni.showModal({
            title: "确认退出",
            content: "确定要退出这个任务吗？",
            success: (res) => {
              if (res.confirm) {
                this.taskDetail.joined = false;
                this.taskDetail.participantCount--;
                uni.showToast({
                  title: "已退出任务",
                  icon: "success"
                });
              }
            }
          });
        } else {
          this.taskDetail.joined = true;
          this.taskDetail.participantCount++;
          uni.showToast({
            title: "参与成功",
            icon: "success"
          });
        }
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "task-detail-page" }, [
      vue.createCommentVNode(" 加载状态 "),
      $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : $data.taskDetail ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 任务详情 "),
          vue.createElementVNode("view", { class: "task-content" }, [
            vue.createCommentVNode(" 任务头部信息 "),
            vue.createElementVNode("view", { class: "task-header" }, [
              vue.createElementVNode(
                "view",
                { class: "task-title" },
                vue.toDisplayString($data.taskDetail.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "task-meta" }, [
                vue.createElementVNode("view", { class: "meta-item" }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "⏰"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($options.formatTime($data.taskDetail.time)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "meta-item" }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "👥"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($data.taskDetail.participantCount) + "人参与",
                    1
                    /* TEXT */
                  )
                ]),
                $data.taskDetail.location ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "meta-item"
                }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "📍"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($data.taskDetail.location),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["task-type-badge", $options.getTypeClass($data.taskDetail.type)])
                },
                vue.toDisplayString($data.taskDetail.type),
                3
                /* TEXT, CLASS */
              )
            ]),
            vue.createCommentVNode(" 任务描述 "),
            vue.createElementVNode("view", { class: "task-description" }, [
              vue.createElementVNode("text", { class: "section-title" }, "任务描述"),
              vue.createElementVNode(
                "text",
                { class: "description-text" },
                vue.toDisplayString($data.taskDetail.description),
                1
                /* TEXT */
              )
            ]),
            vue.createCommentVNode(" 附件列表 "),
            $data.taskDetail.attachments && $data.taskDetail.attachments.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "attachments-section"
            }, [
              vue.createElementVNode("text", { class: "section-title" }, "相关附件"),
              vue.createElementVNode("view", { class: "attachment-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.taskDetail.attachments, (attachment) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: attachment.id,
                      class: "attachment-item",
                      onClick: ($event) => $options.previewAttachment(attachment)
                    }, [
                      vue.createElementVNode("text", { class: "attachment-icon" }, "📎"),
                      vue.createElementVNode(
                        "text",
                        { class: "attachment-name" },
                        vue.toDisplayString(attachment.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "attachment-size" },
                        vue.toDisplayString(attachment.size),
                        1
                        /* TEXT */
                      )
                    ], 8, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 节点打卡 "),
            $data.taskDetail.checkpoints && $data.taskDetail.checkpoints.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "checkpoints-section"
            }, [
              vue.createElementVNode("text", { class: "section-title" }, "任务节点"),
              vue.createElementVNode("view", { class: "checkpoint-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.taskDetail.checkpoints, (checkpoint, index) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: checkpoint.id,
                        class: vue.normalizeClass(["checkpoint-item", { completed: checkpoint.completed }])
                      },
                      [
                        vue.createElementVNode(
                          "view",
                          { class: "checkpoint-index" },
                          vue.toDisplayString(index + 1),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "checkpoint-content" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "checkpoint-title" },
                            vue.toDisplayString(checkpoint.title),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "checkpoint-desc" },
                            vue.toDisplayString(checkpoint.description),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "checkpoint-status" }, [
                          checkpoint.completed ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "✅")) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "⭕"))
                        ])
                      ],
                      2
                      /* CLASS */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 参与者列表 "),
            $data.taskDetail.participants && $data.taskDetail.participants.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "participants-section"
            }, [
              vue.createElementVNode(
                "text",
                { class: "section-title" },
                "参与者（" + vue.toDisplayString($data.taskDetail.participants.length) + "人）",
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "participants-grid" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.taskDetail.participants, (participant) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: participant.id,
                      class: "participant-item"
                    }, [
                      vue.createElementVNode("image", {
                        src: participant.avatar,
                        mode: "aspectFill",
                        class: "participant-avatar"
                      }, null, 8, ["src"]),
                      vue.createElementVNode(
                        "text",
                        { class: "participant-name" },
                        vue.toDisplayString(participant.name),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 底部操作栏 "),
      vue.createElementVNode("view", { class: "bottom-actions" }, [
        vue.createElementVNode("button", {
          class: "action-btn chat-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.openChat && $options.openChat(...args))
        }, " 💬 进入聊天室 "),
        vue.createElementVNode(
          "button",
          {
            class: vue.normalizeClass(["action-btn join-btn", { joined: $data.taskDetail && $data.taskDetail.joined }]),
            onClick: _cache[1] || (_cache[1] = (...args) => $options.toggleJoin && $options.toggleJoin(...args))
          },
          vue.toDisplayString($data.taskDetail && $data.taskDetail.joined ? "已参与" : "参与任务"),
          3
          /* TEXT, CLASS */
        )
      ])
    ]);
  }
  const PagesTaskDetailTaskDetail = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-23bb7c06"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/taskDetail/taskDetail.vue"]]);
  const _sfc_main$9 = {
    data() {
      return {
        groupInfo: {
          id: 1,
          name: "产品设计交流群",
          description: "分享设计心得，探讨产品趋势",
          fullDescription: "这是一个专注于产品设计的交流社群，我们在这里分享最新的设计理念、讨论产品趋势、交流设计心得。欢迎所有对产品设计感兴趣的朋友加入我们！",
          avatar: "https://via.placeholder.com/80x80/00D4AA/FFFFFF?text=群",
          memberCount: 156,
          isPublic: true
        },
        isJoined: false,
        members: []
      };
    },
    onLoad(options) {
      if (options.id) {
        this.loadGroupDetail(options.id);
      }
      this.generateMembers();
    },
    methods: {
      loadGroupDetail(id) {
        formatAppLog("log", "at pages/groupDetail/groupDetail.vue:65", "加载社群详情:", id);
      },
      toggleJoin() {
        this.isJoined = !this.isJoined;
        if (this.isJoined) {
          this.groupInfo.memberCount++;
        } else {
          this.groupInfo.memberCount--;
        }
      },
      generateMembers() {
        const names = ["张三", "李四", "王五", "赵六", "孙七", "周八"];
        this.members = names.map((name, index) => ({
          id: index + 1,
          name,
          avatar: "https://via.placeholder.com/32x32/4A90E2/FFFFFF?text=" + name.charAt(0)
        }));
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "group-info" }, [
          vue.createElementVNode("image", {
            class: "group-avatar",
            src: $data.groupInfo.avatar,
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "info" }, [
            vue.createElementVNode(
              "text",
              { class: "name" },
              vue.toDisplayString($data.groupInfo.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "desc" },
              vue.toDisplayString($data.groupInfo.description),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "stats" }, [
              vue.createElementVNode(
                "text",
                { class: "stat" },
                vue.toDisplayString($data.groupInfo.memberCount) + "人",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "stat" },
                vue.toDisplayString($data.groupInfo.isPublic ? "公开" : "私密"),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createElementVNode(
          "button",
          {
            class: vue.normalizeClass(["join-btn", { joined: $data.isJoined }]),
            onClick: _cache[0] || (_cache[0] = (...args) => $options.toggleJoin && $options.toggleJoin(...args))
          },
          vue.toDisplayString($data.isJoined ? "已加入" : "加入社群"),
          3
          /* TEXT, CLASS */
        )
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "社群简介"),
          vue.createElementVNode(
            "text",
            { class: "section-content" },
            vue.toDisplayString($data.groupInfo.fullDescription),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode(
            "text",
            { class: "section-title" },
            "成员 (" + vue.toDisplayString($data.groupInfo.memberCount) + ")",
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "members" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.members, (member) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "member",
                  key: member.id
                }, [
                  vue.createElementVNode("image", {
                    class: "member-avatar",
                    src: member.avatar,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode(
                    "text",
                    { class: "member-name" },
                    vue.toDisplayString(member.name),
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])
    ]);
  }
  const PagesGroupDetailGroupDetail = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-fb6725ac"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/groupDetail/groupDetail.vue"]]);
  const _sfc_main$8 = {
    data() {
      return {
        messages: [],
        inputText: "",
        scrollTop: 0,
        showEmoji: false,
        chatType: "task",
        // task | group | support
        chatId: "",
        currentUser: {
          id: "user123",
          name: "我",
          avatar: "https://picsum.photos/100/100?random=999"
        },
        emojiList: [
          "😀",
          "😃",
          "😄",
          "😁",
          "😆",
          "😅",
          "😂",
          "🤣",
          "😊",
          "😇",
          "🙂",
          "🙃",
          "😉",
          "😌",
          "😍",
          "🥰",
          "😘",
          "😗",
          "😙",
          "😚",
          "😋",
          "😛",
          "😝",
          "😜",
          "🤪",
          "🤨",
          "🧐",
          "🤓",
          "😎",
          "🤩",
          "🥳",
          "😏",
          "👍",
          "👎",
          "👌",
          "✌️",
          "🤞",
          "🤟",
          "🤘",
          "🤙",
          "💪",
          "🙏",
          "✨",
          "🎉",
          "🎊",
          "💯",
          "❤️",
          "💛"
        ]
      };
    },
    onLoad(options) {
      this.chatType = options.type || "task";
      this.chatId = options.taskId || options.groupId || "support";
      this.loadMessages();
    },
    methods: {
      // 加载消息历史
      async loadMessages() {
        try {
          this.messages = [
            {
              id: 1,
              type: "system",
              content: "欢迎加入聊天室",
              time: Date.now() - 36e5,
              showTime: true
            },
            {
              id: 2,
              type: "text",
              content: "大家好，我是张三，很高兴和大家一起学习Vue3！",
              time: Date.now() - 35e5,
              isMine: false,
              userId: "user1",
              userName: "张三",
              avatar: "https://picsum.photos/100/100?random=1"
            },
            {
              id: 3,
              type: "text",
              content: "欢迎欢迎！我们一起加油💪",
              time: Date.now() - 34e5,
              isMine: true,
              userId: this.currentUser.id,
              userName: this.currentUser.name,
              avatar: this.currentUser.avatar
            },
            {
              id: 4,
              type: "text",
              content: "我准备了一些学习资料，等会分享给大家",
              time: Date.now() - 33e5,
              isMine: false,
              userId: "user2",
              userName: "李四",
              avatar: "https://picsum.photos/100/100?random=2"
            },
            {
              id: 5,
              type: "image",
              content: "https://picsum.photos/300/200?random=10",
              time: Date.now() - 32e5,
              isMine: false,
              userId: "user2",
              userName: "李四",
              avatar: "https://picsum.photos/100/100?random=2"
            }
          ];
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } catch (error) {
          formatAppLog("error", "at pages/chat/chat.vue:193", "加载消息失败:", error);
        }
      },
      // 发送消息
      sendMessage() {
        if (!this.inputText.trim())
          return;
        const message = {
          id: Date.now(),
          type: "text",
          content: this.inputText.trim(),
          time: Date.now(),
          isMine: true,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          avatar: this.currentUser.avatar
        };
        this.messages.push(message);
        this.inputText = "";
        this.showEmoji = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        setTimeout(() => {
          this.simulateReply();
        }, 1e3);
      },
      // 模拟收到回复
      simulateReply() {
        const replies = [
          "收到！",
          "好的，明白了",
          "赞同👍",
          "这个想法不错",
          "我也是这么想的"
        ];
        const reply = {
          id: Date.now(),
          type: "text",
          content: replies[Math.floor(Math.random() * replies.length)],
          time: Date.now(),
          isMine: false,
          userId: "user3",
          userName: "王五",
          avatar: "https://picsum.photos/100/100?random=3"
        };
        this.messages.push(reply);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      // 选择图片
      selectImage() {
        uni.chooseImage({
          count: 1,
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            this.sendImageMessage(tempFilePath);
          }
        });
      },
      // 发送图片消息
      sendImageMessage(imagePath) {
        const message = {
          id: Date.now(),
          type: "image",
          content: imagePath,
          time: Date.now(),
          isMine: true,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          avatar: this.currentUser.avatar
        };
        this.messages.push(message);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      // 选择文件
      selectFile() {
        const message = {
          id: Date.now(),
          type: "file",
          content: "",
          fileName: "项目文档.pdf",
          fileSize: "2.5MB",
          time: Date.now(),
          isMine: true,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          avatar: this.currentUser.avatar
        };
        this.messages.push(message);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      // 预览图片
      previewImage(imageUrl) {
        uni.previewImage({
          urls: [imageUrl]
        });
      },
      // 下载文件
      downloadFile(message) {
        uni.showToast({
          title: `下载${message.fileName}`,
          icon: "none"
        });
      },
      // 显示/隐藏表情面板
      showEmojiPanel() {
        this.showEmoji = !this.showEmoji;
      },
      // 插入表情
      insertEmoji(emoji) {
        this.inputText += emoji;
      },
      // 输入框获得焦点
      onInputFocus() {
        this.showEmoji = false;
      },
      // 输入框失去焦点
      onInputBlur() {
      },
      // 滚动到底部
      scrollToBottom() {
        this.scrollTop = 999999;
      },
      // 格式化时间
      formatTime(time) {
        const date = new Date(time);
        const now = /* @__PURE__ */ new Date();
        const diff = now - date;
        const day = 24 * 60 * 60 * 1e3;
        if (diff < 6e4) {
          return "刚刚";
        } else if (diff < day) {
          return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
        } else if (diff < 2 * day) {
          return "昨天 " + date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
        } else {
          return date.toLocaleDateString("zh-CN");
        }
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "chat-page" }, [
      vue.createCommentVNode(" 聊天消息列表 "),
      vue.createElementVNode("scroll-view", {
        class: "message-list",
        "scroll-y": "true",
        "scroll-top": $data.scrollTop,
        "scroll-with-animation": ""
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.messages, (message) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: message.id,
              class: "message-item"
            }, [
              vue.createCommentVNode(" 时间分隔线 "),
              message.showTime ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "time-divider"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "time-text" },
                  vue.toDisplayString($options.formatTime(message.time)),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              vue.createCommentVNode(" 消息内容 "),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["message-wrapper", { "is-mine": message.isMine }])
                },
                [
                  vue.createCommentVNode(" 头像 "),
                  !message.isMine ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: message.avatar,
                    mode: "aspectFill",
                    class: "user-avatar"
                  }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode(" 消息气泡 "),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["message-bubble", { "mine": message.isMine }])
                    },
                    [
                      vue.createCommentVNode(" 文本消息 "),
                      message.type === "text" ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "message-text"
                        },
                        vue.toDisplayString(message.content),
                        1
                        /* TEXT */
                      )) : message.type === "image" ? (vue.openBlock(), vue.createElementBlock(
                        vue.Fragment,
                        { key: 1 },
                        [
                          vue.createCommentVNode(" 图片消息 "),
                          vue.createElementVNode("view", { class: "message-image" }, [
                            vue.createElementVNode("image", {
                              src: message.content,
                              mode: "aspectFill",
                              onClick: ($event) => $options.previewImage(message.content)
                            }, null, 8, ["src", "onClick"])
                          ])
                        ],
                        2112
                        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                      )) : message.type === "file" ? (vue.openBlock(), vue.createElementBlock(
                        vue.Fragment,
                        { key: 2 },
                        [
                          vue.createCommentVNode(" 文件消息 "),
                          vue.createElementVNode("view", {
                            class: "message-file",
                            onClick: ($event) => $options.downloadFile(message)
                          }, [
                            vue.createElementVNode("text", { class: "file-icon" }, "📎"),
                            vue.createElementVNode("view", { class: "file-info" }, [
                              vue.createElementVNode(
                                "text",
                                { class: "file-name" },
                                vue.toDisplayString(message.fileName),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "file-size" },
                                vue.toDisplayString(message.fileSize),
                                1
                                /* TEXT */
                              )
                            ])
                          ], 8, ["onClick"])
                        ],
                        2112
                        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                      )) : message.type === "system" ? (vue.openBlock(), vue.createElementBlock(
                        vue.Fragment,
                        { key: 3 },
                        [
                          vue.createCommentVNode(" 系统消息 "),
                          vue.createElementVNode(
                            "text",
                            { class: "system-text" },
                            vue.toDisplayString(message.content),
                            1
                            /* TEXT */
                          )
                        ],
                        2112
                        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                      )) : vue.createCommentVNode("v-if", true)
                    ],
                    2
                    /* CLASS */
                  ),
                  vue.createCommentVNode(" 头像（自己的消息） "),
                  message.isMine ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 1,
                    src: message.avatar,
                    mode: "aspectFill",
                    class: "user-avatar"
                  }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              )
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ], 8, ["scroll-top"]),
      vue.createCommentVNode(" 输入区域 "),
      vue.createElementVNode("view", { class: "input-area" }, [
        vue.createCommentVNode(" 工具栏 "),
        vue.createElementVNode("view", { class: "toolbar" }, [
          vue.createElementVNode("button", {
            class: "tool-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.selectImage && $options.selectImage(...args))
          }, [
            vue.createElementVNode("text", { class: "tool-icon" }, "📷")
          ]),
          vue.createElementVNode("button", {
            class: "tool-btn",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.selectFile && $options.selectFile(...args))
          }, [
            vue.createElementVNode("text", { class: "tool-icon" }, "📎")
          ]),
          vue.createElementVNode("button", {
            class: "tool-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.showEmojiPanel && $options.showEmojiPanel(...args))
          }, [
            vue.createElementVNode("text", { class: "tool-icon" }, "😊")
          ])
        ]),
        vue.createCommentVNode(" 输入框 "),
        vue.createElementVNode("view", { class: "input-container" }, [
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.inputText = $event),
              class: "message-input",
              placeholder: "输入消息...",
              "auto-height": true,
              "show-confirm-bar": false,
              onFocus: _cache[4] || (_cache[4] = (...args) => $options.onInputFocus && $options.onInputFocus(...args)),
              onBlur: _cache[5] || (_cache[5] = (...args) => $options.onInputBlur && $options.onInputBlur(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.inputText]
          ]),
          vue.createElementVNode("button", {
            class: vue.normalizeClass(["send-btn", { active: $data.inputText.trim() }]),
            onClick: _cache[6] || (_cache[6] = (...args) => $options.sendMessage && $options.sendMessage(...args)),
            disabled: !$data.inputText.trim()
          }, " 发送 ", 10, ["disabled"])
        ]),
        vue.createCommentVNode(" 表情面板 "),
        $data.showEmoji ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "emoji-panel"
        }, [
          vue.createElementVNode("view", { class: "emoji-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.emojiList, (emoji) => {
                return vue.openBlock(), vue.createElementBlock("text", {
                  key: emoji,
                  class: "emoji-item",
                  onClick: ($event) => $options.insertEmoji(emoji)
                }, vue.toDisplayString(emoji), 9, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesChatChat = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-0a633310"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/chat/chat.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {
        myGroups: []
      };
    },
    onLoad() {
      this.loadMyGroups();
    },
    methods: {
      loadMyGroups() {
        this.myGroups = [
          {
            id: 1,
            name: "产品设计交流群",
            description: "分享设计心得，探讨产品趋势",
            avatar: "https://via.placeholder.com/60x60/00D4AA/FFFFFF?text=设",
            memberCount: 156,
            lastMessage: "有新的设计分享"
          },
          {
            id: 2,
            name: "前端开发学习",
            description: "一起学习前端技术",
            avatar: "https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=前",
            memberCount: 89,
            lastMessage: "新的技术文章推荐"
          }
        ];
      },
      viewGroupDetail(group) {
        uni.navigateTo({
          url: `/pages/groupDetail/groupDetail?id=${group.id}`
        });
      },
      exploreGroups() {
        uni.switchTab({
          url: "/pages/groups/groups"
        });
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "我的社群")
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "groups-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.myGroups, (group) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "group-item",
                key: group.id,
                onClick: ($event) => $options.viewGroupDetail(group)
              }, [
                vue.createElementVNode("image", {
                  class: "group-avatar",
                  src: group.avatar,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "group-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "group-name" },
                    vue.toDisplayString(group.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "group-desc" },
                    vue.toDisplayString(group.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "group-meta" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "member-count" },
                      vue.toDisplayString(group.memberCount) + "人",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "last-message" },
                      vue.toDisplayString(group.lastMessage),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        $data.myGroups.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "还没有加入任何社群"),
          vue.createElementVNode("button", {
            class: "explore-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.exploreGroups && $options.exploreGroups(...args))
          }, "去发现社群")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesMyGroupsMyGroups = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-a99fec89"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/myGroups/myGroups.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        currentTab: "ongoing",
        ongoingTasks: [],
        completedTasks: []
      };
    },
    onLoad() {
      this.loadMyTasks();
    },
    methods: {
      loadMyTasks() {
        this.ongoingTasks = [
          {
            id: 1,
            name: "学习Vue3新特性",
            description: "深入学习Vue3的Composition API",
            progress: 75,
            deadline: Date.now() + 7 * 24 * 60 * 60 * 1e3,
            location: "线上"
          },
          {
            id: 2,
            name: "晨跑锻炼",
            description: "每天早上7点晨跑30分钟",
            progress: 60,
            deadline: Date.now() + 3 * 24 * 60 * 60 * 1e3,
            location: "公园"
          }
        ];
        this.completedTasks = [
          {
            id: 3,
            name: "阅读《设计心理学》",
            description: "完整阅读并做读书笔记",
            completedTime: Date.now() - 2 * 24 * 60 * 60 * 1e3
          }
        ];
      },
      switchTab(tab) {
        this.currentTab = tab;
      },
      getCurrentTasks() {
        return this.currentTab === "ongoing" ? this.ongoingTasks : this.completedTasks;
      },
      viewTaskDetail(task) {
        uni.navigateTo({
          url: `/pages/taskDetail/taskDetail?id=${task.id}`
        });
      },
      exploreTasks() {
        uni.switchTab({
          url: "/pages/tasks/tasks"
        });
      },
      formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString("zh-CN");
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "我的任务")
      ]),
      vue.createElementVNode("view", { class: "tabs" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "ongoing" }]),
            onClick: _cache[0] || (_cache[0] = ($event) => $options.switchTab("ongoing"))
          },
          [
            vue.createElementVNode("text", null, "进行中"),
            $data.ongoingTasks.length ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "count"
              },
              "(" + vue.toDisplayString($data.ongoingTasks.length) + ")",
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "completed" }]),
            onClick: _cache[1] || (_cache[1] = ($event) => $options.switchTab("completed"))
          },
          [
            vue.createElementVNode("text", null, "已完成"),
            $data.completedTasks.length ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "count"
              },
              "(" + vue.toDisplayString($data.completedTasks.length) + ")",
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        $data.currentTab === "ongoing" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "tasks-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.ongoingTasks, (task) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "task-item",
                key: task.id,
                onClick: ($event) => $options.viewTaskDetail(task)
              }, [
                vue.createElementVNode("view", { class: "task-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "task-name" },
                    vue.toDisplayString(task.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "task-progress" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "progress-text" },
                      vue.toDisplayString(task.progress) + "%",
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "task-desc" },
                  vue.toDisplayString(task.description),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "task-meta" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "deadline" },
                    "截止：" + vue.toDisplayString($options.formatDate(task.deadline)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "location" },
                    vue.toDisplayString(task.location),
                    1
                    /* TEXT */
                  )
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        $data.currentTab === "completed" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "tasks-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.completedTasks, (task) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "task-item completed",
                key: task.id,
                onClick: ($event) => $options.viewTaskDetail(task)
              }, [
                vue.createElementVNode("view", { class: "task-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "task-name" },
                    vue.toDisplayString(task.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "completed-tag" }, "已完成")
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "task-desc" },
                  vue.toDisplayString(task.description),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "task-meta" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "completed-time" },
                    "完成时间：" + vue.toDisplayString($options.formatDate(task.completedTime)),
                    1
                    /* TEXT */
                  )
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        $options.getCurrentTasks().length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-state"
        }, [
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($data.currentTab === "ongoing" ? "暂无进行中的任务" : "暂无已完成的任务"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            class: "explore-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.exploreTasks && $options.exploreTasks(...args))
          }, "去发现任务")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesMyTasksMyTasks = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-e6fb4b8f"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/myTasks/myTasks.vue"]]);
  const _sfc_main$5 = {
    data() {
      return {
        currentDate: /* @__PURE__ */ new Date(),
        selectedDate: /* @__PURE__ */ new Date(),
        weekDays: ["日", "一", "二", "三", "四", "五", "六"],
        schedules: {},
        calendarDays: []
      };
    },
    computed: {
      currentMonth() {
        return `${this.currentDate.getFullYear()}年${this.currentDate.getMonth() + 1}月`;
      },
      selectedDateText() {
        const date = this.selectedDate;
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      },
      selectedDaySchedules() {
        const key = this.formatDateKey(this.selectedDate);
        return this.schedules[key] || [];
      }
    },
    onLoad() {
      this.initCalendar();
      this.loadSchedules();
    },
    methods: {
      initCalendar() {
        this.generateCalendarDays();
      },
      generateCalendarDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        const days = [];
        const today = /* @__PURE__ */ new Date();
        for (let i = 0; i < 42; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateKey = this.formatDateKey(date);
          const hasEvent = this.schedules[dateKey] && this.schedules[dateKey].length > 0;
          days.push({
            date: date.getTime(),
            day: date.getDate(),
            isToday: this.isSameDay(date, today),
            isSelected: this.isSameDay(date, this.selectedDate),
            hasEvent,
            isCurrentMonth: date.getMonth() === month
          });
        }
        this.calendarDays = days;
      },
      selectDay(day) {
        this.selectedDate = new Date(day.date);
        this.generateCalendarDays();
      },
      prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.generateCalendarDays();
      },
      nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.generateCalendarDays();
      },
      loadSchedules() {
        const today = /* @__PURE__ */ new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        this.schedules = {
          [this.formatDateKey(today)]: [
            {
              id: 1,
              time: "09:00",
              title: "团队会议",
              description: "讨论项目进度"
            },
            {
              id: 2,
              time: "14:00",
              title: "学习Vue3",
              description: "深入学习Composition API"
            }
          ],
          [this.formatDateKey(tomorrow)]: [
            {
              id: 3,
              time: "10:00",
              title: "健身运动",
              description: "在健身房进行力量训练"
            }
          ]
        };
        this.generateCalendarDays();
      },
      addSchedule() {
        uni.showToast({
          title: "功能开发中",
          icon: "none"
        });
      },
      formatDateKey(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      },
      isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "日程表"),
        vue.createElementVNode("button", {
          class: "add-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.addSchedule && $options.addSchedule(...args))
        }, "+")
      ]),
      vue.createElementVNode("view", { class: "calendar-wrapper" }, [
        vue.createElementVNode("view", { class: "month-header" }, [
          vue.createElementVNode("button", {
            class: "nav-btn",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.prevMonth && $options.prevMonth(...args))
          }, "‹"),
          vue.createElementVNode(
            "text",
            { class: "month-title" },
            vue.toDisplayString($options.currentMonth),
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            class: "nav-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.nextMonth && $options.nextMonth(...args))
          }, "›")
        ]),
        vue.createElementVNode("view", { class: "calendar-grid" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.weekDays, (day) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: "day-header",
                  key: day
                },
                vue.toDisplayString(day),
                1
                /* TEXT */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.calendarDays, (day) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["calendar-day", {
                  active: day.isToday,
                  selected: day.isSelected,
                  "has-event": day.hasEvent
                }]),
                key: day.date,
                onClick: ($event) => $options.selectDay(day)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "day-number" },
                  vue.toDisplayString(day.day),
                  1
                  /* TEXT */
                ),
                day.hasEvent ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "event-dot"
                })) : vue.createCommentVNode("v-if", true)
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "schedule-list" }, [
        vue.createElementVNode(
          "text",
          { class: "section-title" },
          vue.toDisplayString($options.selectedDateText) + "的日程",
          1
          /* TEXT */
        ),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.selectedDaySchedules, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "schedule-item",
              key: item.id
            }, [
              vue.createElementVNode(
                "view",
                { class: "time-slot" },
                vue.toDisplayString(item.time),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "schedule-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "schedule-title" },
                  vue.toDisplayString(item.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "schedule-desc" },
                  vue.toDisplayString(item.description),
                  1
                  /* TEXT */
                )
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $options.selectedDaySchedules.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "当天没有日程安排")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesScheduleSchedule = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-e6e5e79f"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/schedule/schedule.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        followingUsers: []
      };
    },
    onLoad() {
      this.loadFollowingUsers();
    },
    methods: {
      loadFollowingUsers() {
        this.followingUsers = [
          {
            id: 1,
            name: "设计师小王",
            description: "专注UI/UX设计",
            avatar: "https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=王",
            isFollowing: true
          },
          {
            id: 2,
            name: "前端开发者",
            description: "Vue.js技术分享者",
            avatar: "https://via.placeholder.com/60x60/50E3C2/FFFFFF?text=前",
            isFollowing: true
          }
        ];
      },
      toggleFollow(user) {
        user.isFollowing = !user.isFollowing;
        if (!user.isFollowing) {
          uni.showModal({
            title: "确认取消关注",
            content: `确定要取消关注 ${user.name} 吗？`,
            success: (res) => {
              if (!res.confirm) {
                user.isFollowing = true;
              }
            }
          });
        }
      },
      exploreUsers() {
        uni.switchTab({
          url: "/pages/discover/discover"
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "我的关注")
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "following-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.followingUsers, (user) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "user-item",
                key: user.id
              }, [
                vue.createElementVNode("image", {
                  class: "user-avatar",
                  src: user.avatar,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "user-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "user-name" },
                    vue.toDisplayString(user.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "user-desc" },
                    vue.toDisplayString(user.description),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("button", {
                  class: "follow-btn",
                  onClick: ($event) => $options.toggleFollow(user)
                }, vue.toDisplayString(user.isFollowing ? "已关注" : "关注"), 9, ["onClick"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        $data.followingUsers.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "还没有关注任何人"),
          vue.createElementVNode("button", {
            class: "explore-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.exploreUsers && $options.exploreUsers(...args))
          }, "去发现更多用户")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesFollowingFollowing = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-173991ba"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/following/following.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        achievements: []
      };
    },
    onLoad() {
      this.loadAchievements();
    },
    methods: {
      loadAchievements() {
        this.achievements = [
          {
            id: 1,
            name: "初来乍到",
            description: "完成第一个任务",
            icon: "🎯",
            unlocked: true,
            unlockDate: Date.now() - 7 * 24 * 60 * 60 * 1e3
          },
          {
            id: 2,
            name: "社交达人",
            description: "加入5个社群",
            icon: "👥",
            unlocked: true,
            unlockDate: Date.now() - 3 * 24 * 60 * 60 * 1e3
          },
          {
            id: 3,
            name: "坚持不懈",
            description: "连续7天完成任务",
            icon: "🔥",
            unlocked: false,
            progress: 3,
            target: 7
          },
          {
            id: 4,
            name: "学习达人",
            description: "完成10个学习类任务",
            icon: "📚",
            unlocked: false,
            progress: 6,
            target: 10
          },
          {
            id: 5,
            name: "运动健将",
            description: "完成20个运动类任务",
            icon: "🏃",
            unlocked: false,
            progress: 8,
            target: 20
          },
          {
            id: 6,
            name: "人气王",
            description: "获得100个赞",
            icon: "⭐",
            unlocked: false,
            progress: 45,
            target: 100
          }
        ];
      },
      formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString("zh-CN");
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "成就徽章")
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "achievement-grid" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.achievements, (achievement) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: vue.normalizeClass(["achievement-item", { unlocked: achievement.unlocked }]),
                  key: achievement.id
                },
                [
                  vue.createElementVNode(
                    "view",
                    { class: "achievement-icon" },
                    vue.toDisplayString(achievement.icon),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "achievement-name" },
                    vue.toDisplayString(achievement.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "achievement-desc" },
                    vue.toDisplayString(achievement.description),
                    1
                    /* TEXT */
                  ),
                  !achievement.unlocked ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "achievement-progress"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "progress-text" },
                      vue.toDisplayString(achievement.progress) + "/" + vue.toDisplayString(achievement.target),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true),
                  achievement.unlocked ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "unlock-date"
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($options.formatDate(achievement.unlockDate)),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const PagesAchievementsAchievements = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-062a4f72"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/achievements/achievements.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        inviteCode: "ALPHA2024",
        shareLink: "https://alpha.example.com/invite/ALPHA2024",
        inviteStats: {
          total: 5,
          registered: 3,
          rewards: 150
        }
      };
    },
    methods: {
      copyInviteCode() {
        uni.setClipboardData({
          data: this.inviteCode,
          success: () => {
            uni.showToast({
              title: "邀请码已复制",
              icon: "success"
            });
          }
        });
      },
      copyShareLink() {
        uni.setClipboardData({
          data: this.shareLink,
          success: () => {
            uni.showToast({
              title: "链接已复制",
              icon: "success"
            });
          }
        });
      },
      shareToWechat() {
        uni.share({
          provider: "weixin",
          scene: "WXSceneSession",
          type: 0,
          href: this.shareLink,
          title: "Alpha - 任务驱动的轻社交应用",
          summary: "和我一起在Alpha完成有趣的任务，提升自己！",
          imageUrl: "https://via.placeholder.com/200x200/00D4AA/FFFFFF?text=Alpha",
          success: () => {
            uni.showToast({
              title: "分享成功",
              icon: "success"
            });
          },
          fail: () => {
            uni.showToast({
              title: "分享失败",
              icon: "none"
            });
          }
        });
      },
      shareToMoments() {
        uni.share({
          provider: "weixin",
          scene: "WXSceneTimeline",
          type: 0,
          href: this.shareLink,
          title: "Alpha - 任务驱动的轻社交应用",
          imageUrl: "https://via.placeholder.com/200x200/00D4AA/FFFFFF?text=Alpha",
          success: () => {
            uni.showToast({
              title: "分享成功",
              icon: "success"
            });
          },
          fail: () => {
            uni.showToast({
              title: "分享失败",
              icon: "none"
            });
          }
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "邀请好友")
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "invite-card" }, [
          vue.createElementVNode("view", { class: "reward-section" }, [
            vue.createElementVNode("text", { class: "reward-title" }, "邀请奖励"),
            vue.createElementVNode("view", { class: "reward-list" }, [
              vue.createElementVNode("view", { class: "reward-item" }, [
                vue.createElementVNode("text", { class: "reward-icon" }, "🎁"),
                vue.createElementVNode("text", { class: "reward-text" }, "每邀请1人注册获得10积分")
              ]),
              vue.createElementVNode("view", { class: "reward-item" }, [
                vue.createElementVNode("text", { class: "reward-icon" }, "💰"),
                vue.createElementVNode("text", { class: "reward-text" }, "好友完成首个任务您获得5元奖励")
              ]),
              vue.createElementVNode("view", { class: "reward-item" }, [
                vue.createElementVNode("text", { class: "reward-icon" }, "👑"),
                vue.createElementVNode("text", { class: "reward-text" }, "累计邀请10人升级VIP会员")
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "invite-code-section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "我的邀请码"),
            vue.createElementVNode("view", { class: "invite-code" }, [
              vue.createElementVNode(
                "text",
                { class: "code-text" },
                vue.toDisplayString($data.inviteCode),
                1
                /* TEXT */
              ),
              vue.createElementVNode("button", {
                class: "copy-btn",
                onClick: _cache[0] || (_cache[0] = (...args) => $options.copyInviteCode && $options.copyInviteCode(...args))
              }, "复制")
            ])
          ]),
          vue.createElementVNode("view", { class: "share-section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "分享给好友"),
            vue.createElementVNode("view", { class: "share-buttons" }, [
              vue.createElementVNode("button", {
                class: "share-btn wechat",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.shareToWechat && $options.shareToWechat(...args))
              }, [
                vue.createElementVNode("text", { class: "share-icon" }, "💬"),
                vue.createElementVNode("text", { class: "share-text" }, "微信")
              ]),
              vue.createElementVNode("button", {
                class: "share-btn moments",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.shareToMoments && $options.shareToMoments(...args))
              }, [
                vue.createElementVNode("text", { class: "share-icon" }, "📱"),
                vue.createElementVNode("text", { class: "share-text" }, "朋友圈")
              ]),
              vue.createElementVNode("button", {
                class: "share-btn copy",
                onClick: _cache[3] || (_cache[3] = (...args) => $options.copyShareLink && $options.copyShareLink(...args))
              }, [
                vue.createElementVNode("text", { class: "share-icon" }, "🔗"),
                vue.createElementVNode("text", { class: "share-text" }, "复制链接")
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "stats-section" }, [
            vue.createElementVNode("text", { class: "section-title" }, "邀请统计"),
            vue.createElementVNode("view", { class: "stats-grid" }, [
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-number" },
                  vue.toDisplayString($data.inviteStats.total),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "累计邀请")
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-number" },
                  vue.toDisplayString($data.inviteStats.registered),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "成功注册")
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-number" },
                  vue.toDisplayString($data.inviteStats.rewards),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "stat-label" }, "获得积分")
              ])
            ])
          ])
        ])
      ])
    ]);
  }
  const PagesInviteInvite = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-34e3eabd"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/invite/invite.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        currentTab: "friends",
        friendsList: [],
        friendRequests: []
      };
    },
    onLoad() {
      this.loadFriends();
      this.loadFriendRequests();
    },
    methods: {
      loadFriends() {
        this.friendsList = [
          {
            id: 1,
            name: "张小明",
            avatar: "https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=张",
            isOnline: true,
            description: "热爱运动的程序员",
            mutualFriends: 5
          },
          {
            id: 2,
            name: "李小红",
            avatar: "https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=李",
            isOnline: false,
            lastSeen: "2小时前",
            description: "设计师，喜欢美食和旅行",
            mutualFriends: 8
          },
          {
            id: 3,
            name: "王大力",
            avatar: "https://via.placeholder.com/60x60/50E3C2/FFFFFF?text=王",
            isOnline: true,
            description: "健身达人，马拉松爱好者",
            mutualFriends: 3
          },
          {
            id: 4,
            name: "赵小美",
            avatar: "https://via.placeholder.com/60x60/FFE66D/FFFFFF?text=赵",
            isOnline: false,
            lastSeen: "1天前",
            description: "摄影师，记录生活美好",
            mutualFriends: 12
          }
        ];
      },
      loadFriendRequests() {
        this.friendRequests = [
          {
            id: 101,
            name: "陈小华",
            avatar: "https://via.placeholder.com/60x60/9B59B6/FFFFFF?text=陈",
            message: "你好，我们在同一个学习群里，想和你交个朋友",
            time: Date.now() - 2 * 60 * 60 * 1e3
          },
          {
            id: 102,
            name: "刘小强",
            avatar: "https://via.placeholder.com/60x60/E67E22/FFFFFF?text=刘",
            message: "看到你的跑步记录很棒，一起运动吧！",
            time: Date.now() - 5 * 60 * 60 * 1e3
          }
        ];
      },
      switchTab(tab) {
        this.currentTab = tab;
      },
      getCurrentList() {
        return this.currentTab === "friends" ? this.friendsList : this.friendRequests;
      },
      viewFriendProfile(friend) {
        uni.showToast({ title: "功能开发中", icon: "none" });
      },
      chatWithFriend(friend) {
        uni.navigateTo({
          url: `/pages/chat/chat?friendId=${friend.id}&friendName=${friend.name}`
        });
      },
      showFriendMenu(friend) {
        uni.showActionSheet({
          itemList: ["查看资料", "删除好友", "设置备注"],
          success: (res) => {
            if (res.tapIndex === 1) {
              this.deleteFriend(friend);
            } else {
              uni.showToast({ title: "功能开发中", icon: "none" });
            }
          }
        });
      },
      deleteFriend(friend) {
        uni.showModal({
          title: "删除好友",
          content: `确定要删除好友 ${friend.name} 吗？`,
          success: (res) => {
            if (res.confirm) {
              const index = this.friendsList.findIndex((f) => f.id === friend.id);
              if (index > -1) {
                this.friendsList.splice(index, 1);
                uni.showToast({
                  title: "已删除好友",
                  icon: "success"
                });
              }
            }
          }
        });
      },
      acceptRequest(request) {
        const newFriend = {
          id: request.id,
          name: request.name,
          avatar: request.avatar,
          isOnline: Math.random() > 0.5,
          lastSeen: "刚刚",
          description: "新朋友",
          mutualFriends: 0
        };
        this.friendsList.unshift(newFriend);
        const index = this.friendRequests.findIndex((r) => r.id === request.id);
        if (index > -1) {
          this.friendRequests.splice(index, 1);
        }
        uni.showToast({
          title: "已添加好友",
          icon: "success"
        });
      },
      rejectRequest(request) {
        const index = this.friendRequests.findIndex((r) => r.id === request.id);
        if (index > -1) {
          this.friendRequests.splice(index, 1);
          uni.showToast({
            title: "已拒绝申请",
            icon: "success"
          });
        }
      },
      addFriend() {
        uni.showActionSheet({
          itemList: ["扫一扫", "通过手机号添加", "从通讯录添加"],
          success: (res) => {
            uni.showToast({ title: "功能开发中", icon: "none" });
          }
        });
      },
      exploreUsers() {
        uni.switchTab({
          url: "/pages/discover/discover"
        });
      },
      formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1e3 * 60));
        const hours = Math.floor(diff / (1e3 * 60 * 60));
        const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
        if (minutes < 60) {
          return `${minutes}分钟前`;
        } else if (hours < 24) {
          return `${hours}小时前`;
        } else {
          return `${days}天前`;
        }
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "我的好友"),
        vue.createElementVNode("button", {
          class: "add-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.addFriend && $options.addFriend(...args))
        }, "+")
      ]),
      vue.createElementVNode("view", { class: "tabs" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "friends" }]),
            onClick: _cache[1] || (_cache[1] = ($event) => $options.switchTab("friends"))
          },
          [
            vue.createElementVNode("text", null, "好友"),
            $data.friendsList.length ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "count"
              },
              "(" + vue.toDisplayString($data.friendsList.length) + ")",
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "requests" }]),
            onClick: _cache[2] || (_cache[2] = ($event) => $options.switchTab("requests"))
          },
          [
            vue.createElementVNode("text", null, "申请"),
            $data.friendRequests.length ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "count"
              },
              "(" + vue.toDisplayString($data.friendRequests.length) + ")",
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createCommentVNode(" 好友列表 "),
        $data.currentTab === "friends" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "friends-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.friendsList, (friend) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "friend-item",
                key: friend.id,
                onClick: ($event) => $options.viewFriendProfile(friend)
              }, [
                vue.createElementVNode("image", {
                  class: "friend-avatar",
                  src: friend.avatar,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "friend-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "friend-name" },
                    vue.toDisplayString(friend.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "friend-status" },
                    vue.toDisplayString(friend.isOnline ? "在线" : friend.lastSeen),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "friend-desc" },
                    vue.toDisplayString(friend.description),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "friend-actions" }, [
                  vue.createElementVNode("button", {
                    class: "action-btn chat",
                    onClick: vue.withModifiers(($event) => $options.chatWithFriend(friend), ["stop"])
                  }, "💬", 8, ["onClick"]),
                  vue.createElementVNode("button", {
                    class: "action-btn more",
                    onClick: vue.withModifiers(($event) => $options.showFriendMenu(friend), ["stop"])
                  }, "⋯", 8, ["onClick"])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 好友申请列表 "),
        $data.currentTab === "requests" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "requests-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.friendRequests, (request) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "request-item",
                key: request.id
              }, [
                vue.createElementVNode("image", {
                  class: "request-avatar",
                  src: request.avatar,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "request-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "request-name" },
                    vue.toDisplayString(request.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "request-message" },
                    vue.toDisplayString(request.message),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "request-time" },
                    vue.toDisplayString($options.formatTime(request.time)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "request-actions" }, [
                  vue.createElementVNode("button", {
                    class: "accept-btn",
                    onClick: ($event) => $options.acceptRequest(request)
                  }, "接受", 8, ["onClick"]),
                  vue.createElementVNode("button", {
                    class: "reject-btn",
                    onClick: ($event) => $options.rejectRequest(request)
                  }, "拒绝", 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 空状态 "),
        $options.getCurrentList().length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-state"
        }, [
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($data.currentTab === "friends" ? "还没有好友，快去添加吧" : "暂无好友申请"),
            1
            /* TEXT */
          ),
          $data.currentTab === "friends" ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            class: "explore-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.exploreUsers && $options.exploreUsers(...args))
          }, "发现新朋友")) : vue.createCommentVNode("v-if", true)
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesFriendsFriends = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-db42cae2"], ["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/pages/friends/friends.vue"]]);
  __definePage("pages/tasks/tasks", PagesTasksTasks);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/groups/groups", PagesGroupsGroups);
  __definePage("pages/discover/discover", PagesDiscoverDiscover);
  __definePage("pages/me/me", PagesMeMe);
  __definePage("pages/taskDetail/taskDetail", PagesTaskDetailTaskDetail);
  __definePage("pages/groupDetail/groupDetail", PagesGroupDetailGroupDetail);
  __definePage("pages/chat/chat", PagesChatChat);
  __definePage("pages/myGroups/myGroups", PagesMyGroupsMyGroups);
  __definePage("pages/myTasks/myTasks", PagesMyTasksMyTasks);
  __definePage("pages/schedule/schedule", PagesScheduleSchedule);
  __definePage("pages/following/following", PagesFollowingFollowing);
  __definePage("pages/achievements/achievements", PagesAchievementsAchievements);
  __definePage("pages/invite/invite", PagesInviteInvite);
  __definePage("pages/friends/friends", PagesFriendsFriends);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/mac/Documents/HBuilderProjects/demo-2/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
