<template>
  <div class="agenda-container">
    <!-- 视图切换 tabs -->
    <div class="view-tabs">
      <div class="tab-item" :class="{ active: currentView === 'list' }" @click="switchView('list')">
        酒店事项
      </div>
      <div
        class="tab-item"
        :class="{ active: currentView === 'detail' }"
        @click="switchView('detail')"
      >
        酒店列表
      </div>
    </div>

    <!-- 议程列表视图 -->
    <div v-if="currentView === 'list'" class="content-card">
      <!-- 查询区域 -->
      <div class="search-section">
        <div class="search-row">
          <div class="search-item">
            <label>请输入会议名称</label>
            <el-input
              :style="{ width: '250px' }"
              v-model="searchForm.meetingName"
              placeholder="请输入会议名称"
              clearable
            />
          </div>

          <div class="search-item">
            <label>请选择创建日期</label>
            <el-date-picker
              v-model="searchForm.createDate"
              type="date"
              placeholder="请选择创建日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </div>
        </div>
      </div>

      <!-- 会议列表表格 -->
      <div class="table-section">
        <el-table :data="meetingList" style="width: 100%" border>
          <el-table-column prop="name" label="会议名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="hotelName" label="酒店名称" width="200" />
          <el-table-column prop="userDate" label="使用时间" width="200" />
          <el-table-column label="事项对接" width="200">
            <template #default="{ row }">
              <div class="editors-container">
                <el-button link type="primary" size="medium" @click="handleEdit(row)">
                  <div class="editors-list">
                    <span v-for="editor in row.editors" :key="editor" class="editor-item">
                      {{ editor }}
                    </span>
                  </div>
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="编辑" placement="top">
                <el-button link type="primary" circle size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button link type="danger" circle size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="查看" placement="top">
                <el-button link type="primary" circle size="small" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="打印" placement="top">
                <el-button link type="primary" circle size="small" @click="handlePrint(row)">
                  <el-icon><Printer /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底部操作栏：添加表单按钮 + 分页 -->
        <div class="table-footer">
          <div class="add-form-button">
            <el-button type="primary" size="small" @click="handleAdd">添加表单</el-button>
          </div>
          <div class="pagination-wrapper">
            <div class="pagination-info">共 {{ total }} 条 每页 {{ pageSize }} 条</div>
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 酒店详情视图 - 汤臣洲际大酒店 -->
    <div v-if="currentView === 'detail'" class="content-card">
      <!-- 酒店详情头部 -->
      <div class="detail-header">
        <div class="header-title-row">
          <h1>汤臣洲际大酒店</h1>
          <div class="header-actions">
            <el-tooltip content="编辑酒店" placement="top">
              <el-button type="primary" circle size="small" @click="handleEditHotel">
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除酒店" placement="top">
              <el-button type="danger" circle size="small" @click="handleDeleteHotel">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- 酒店事项分类标签 -->
      <div class="hotel-tabs">
        <div
          class="hotel-tab-item"
          :class="{ active: activeHotelTab === 'project' }"
          @click="activeHotelTab = 'project'"
        >
          项目清单
        </div>
        <div
          class="hotel-tab-item"
          :class="{ active: activeHotelTab === 'menu' }"
          @click="activeHotelTab = 'menu'"
        >
          餐饮菜单
        </div>
        <div
          class="hotel-tab-item"
          :class="{ active: activeHotelTab === 'comprehensive' }"
          @click="activeHotelTab = 'comprehensive'"
        >
          综合事项
        </div>
        <div
          class="hotel-tab-item"
          :class="{ active: activeHotelTab === 'guests' }"
          @click="activeHotelTab = 'guests'"
        >
          入住嘉宾
        </div>
        <div
          class="hotel-tab-item"
          :class="{ active: activeHotelTab === 'transport' }"
          @click="activeHotelTab = 'transport'"
        >
          嘉宾接送
        </div>
      </div>

      <!-- 项目清单表格 -->
      <div v-if="activeHotelTab === 'project'" class="hotel-items-table">
        <el-table :data="hotelItems" style="width: 100%" border>
          <el-table-column prop="projectName" label="项目名称" min-width="150" />
          <el-table-column prop="spec" label="规模/数量/尺寸" min-width="150" />
          <el-table-column prop="remarks" label="备注" min-width="200" />
          <el-table-column prop="standardPrice" label="标准价格" width="120" />
          <el-table-column prop="preferentialPrice" label="优惠价格" width="120" />
          <el-table-column prop="contact" label="事项对接" width="120" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="编辑" placement="top">
                <el-button link type="primary" circle size="small" @click="handleEditItem(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="查看">
                <el-button link type="primary" circle size="small" @click="handleViewItem(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button link type="danger" circle size="small" @click="handleDeleteItem(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 餐饮菜单页面 - 包含茶歇菜单和晚宴菜单 -->
      <!-- 餐饮菜单页面 - 包含茶歇菜单和晚宴菜单 -->
      <div v-if="activeHotelTab === 'menu'" class="menu-container">
        <!-- 茶歇菜单 -->
        <div class="menu-section">
          <div class="menu-header">
            <h2>茶歇菜单</h2>
            <div class="menu-actions">
              <el-tooltip content="编辑" placement="top">
                <el-button type="primary" circle size="small" @click="handleEditMenu('tea')">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <!-- 已确认/待确认状态切换按钮 -->
              <el-tooltip
                :content="teaMenu.status === 'confirmed' ? '已确认' : '待确认'"
                placement="top"
              >
                <el-button
                  :type="teaMenu.status === 'confirmed' ? 'success' : 'warning'"
                  circle
                  size="small"
                  @click="toggleMenuStatus('tea')"
                >
                  <el-icon v-if="teaMenu.status === 'confirmed'"><Select /></el-icon>
                  <el-icon v-else><Clock /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="menu-content">
            <!-- 顶部：菜单项列表 -->
            <div class="menu-items">
              <div class="menu-item" v-for="(item, index) in teaMenu.items" :key="index">
                {{ index + 1 }}.{{ item }}
              </div>
            </div>

            <!-- 底部：价格信息、对接人信息 -->
            <div class="menu-bottom">
              <div class="menu-footer">
                <div class="price-info">
                  <span class="label">单价</span>
                  <span class="value">{{ teaMenu.price }}</span>
                </div>
                <div class="price-info">
                  <span class="label">数量</span>
                  <span class="value">{{ teaMenu.quantity }}份</span>
                </div>
                <div class="price-info">
                  <span class="label">总计</span>
                  <span class="value total">￥{{ teaMenu.total }}</span>
                </div>
              </div>

              <div class="menu-contact">
                <span class="label">对接人：</span>
                <span class="value">{{ teaMenu.contact }}</span>
                <span class="label" style="margin-left: 20px">审核人：</span>
                <span class="value">{{ teaMenu.auditor }}</span>
                <!-- 状态标签 -->
                <span
                  class="status-tag"
                  :class="teaMenu.status === 'confirmed' ? 'status-confirmed' : 'status-pending'"
                >
                  {{ teaMenu.status === 'confirmed' ? '已确认' : '待确认' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 晚宴菜单 -->
        <div class="menu-section">
          <div class="menu-header">
            <h2>晚宴菜单</h2>
            <div class="menu-actions">
              <el-tooltip content="编辑" placement="top">
                <el-button type="primary" circle size="small" @click="handleEditMenu('dinner')">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <!-- 已确认/待确认状态切换按钮 -->
              <el-tooltip
                :content="dinnerMenu.status === 'confirmed' ? '已确认' : '待确认'"
                placement="top"
              >
                <el-button
                  :type="dinnerMenu.status === 'confirmed' ? 'success' : 'warning'"
                  circle
                  size="small"
                  @click="toggleMenuStatus('dinner')"
                >
                  <el-icon v-if="dinnerMenu.status === 'confirmed'"><Select /></el-icon>
                  <el-icon v-else><Clock /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="menu-content">
            <!-- 顶部：菜单项列表 -->
            <div class="menu-items">
              <div class="menu-item" v-for="(item, index) in dinnerMenu.items" :key="index">
                {{ index + 1 }}.{{ item }}
              </div>
            </div>

            <!-- 底部：价格信息、对接人信息 -->
            <div class="menu-bottom">
              <div class="menu-footer">
                <div class="price-info">
                  <span class="label">单价</span>
                  <span class="value">{{ dinnerMenu.price }}</span>
                </div>
                <div class="price-info">
                  <span class="label">数量</span>
                  <span class="value">{{ dinnerMenu.quantity }}份</span>
                </div>
                <div class="price-info">
                  <span class="label">总计</span>
                  <span class="value total">￥{{ dinnerMenu.total }}</span>
                </div>
              </div>

              <div class="menu-contact">
                <span class="label">对接人：</span>
                <span class="value">{{ dinnerMenu.contact }}</span>
                <span class="label" style="margin-left: 20px">审核人：</span>
                <span class="value">{{ dinnerMenu.auditor }}</span>
                <!-- 状态标签 -->
                <span
                  class="status-tag"
                  :class="dinnerMenu.status === 'confirmed' ? 'status-confirmed' : 'status-pending'"
                >
                  {{ dinnerMenu.status === 'confirmed' ? '已确认' : '待确认' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 综合事项 -->
      <!-- 综合事项 -->
      <div v-if="activeHotelTab === 'comprehensive'" class="comprehensive-container">
        <!-- 会议现场信息 -->
        <div class="conference-venue">
          <div>
            <div class="section-header">
              <h3>会议现场--紫玉厅A厅</h3>
              <div class="section-actions">
                <!-- <el-tooltip content="编辑" placement="top">
                  <el-button
                    type="primary"
                    circle
                    size="small"
                    @click="handleEditComprehensive('venue')"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip> -->
                <div class="info-row">
                  <span>对接人：</span>
                  <span class="info-value">Iris</span>
                </div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">人员规模：</span>
                <span class="info-value">200人</span>
              </div>
              <div class="info-row">
                <span class="info-label">大厅面积：</span>
                <span class="info-value">300平方米</span>
              </div>
              <div class="info-row">
                <span class="info-label">LED屏幕：</span>
                <span class="info-value">5.44M宽*2.88M高</span>
              </div>
              <div class="info-row">
                <span class="info-label">舞台高度：</span>
                <span class="info-value">40cm</span>
              </div>
              <div class="info-row">
                <span class="info-label">音响设备：</span>
                <span class="info-value">酒店提供</span>
              </div>
              <div class="info-row">
                <span class="info-label">前排沙发：</span>
                <span class="info-value">暂不提供</span>
              </div>
              <div class="info-row">
                <span class="info-label">话筒：</span>
                <span class="info-value">2支移动话筒+1个鹅颈话筒</span>
              </div>
              <div class="info-row">
                <span class="info-label">讲台：</span>
                <span class="info-value">61cm*65cm*61cm侧宽-120cm高</span>
              </div>
              <div class="info-row">
                <span class="info-label">翻页笔：</span>
                <span class="info-value">2支</span>
              </div>
            </div>
          </div>

          <!-- 指示牌显示屏图片尺寸 -->
          <div class="section-img">
            <h4 style="margin-top: 10px">指示牌显示屏图片尺寸</h4>
            <div class="section-actions"></div>
          </div>

          <div class="info-list">
            <div class="info-item">四楼电梯口-1920*1080（横）</div>
            <div class="info-item">一楼酒店大堂-1080*1920（竖）</div>
          </div>
        </div>

        <div class="comprehensive-section">
          <!-- 酒店联系信息 -->
          <div>
            <div class="section-header">
              <h3>酒店联系</h3>
            </div>

            <div class="contact-info">
              <!-- 小海狮头像和酒店名称 -->
              <div class="contact-person">
                <div class="person-avatar">
                  <img src="https://via.placeholder.com/40x40/409eff/ffffff?text=海" alt="小海狮" />
                </div>
                <div class="person-details">
                  <span class="person-name">小海狮</span>
                  <span class="person-hotel">汤臣洲际大酒店大堂</span>
                </div>
              </div>
            </div>

            <!-- 联系信息 -->
            <div>
              <div class="section-contant">
                <h3>联系信息</h3>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleEditComprehensive('contactEdit')"
                  >编辑</el-button
                >
              </div>
              <div class="contact-row">
                <el-icon class="contact-icon"><Message /></el-icon>
                <span class="contact-email">jinjinshejisucai@mail.com</span>
              </div>
              <div class="contact-row">
                <el-icon class="contact-icon"><Phone /></el-icon>

                <span class="contact-phone">15800000000</span>
              </div>
            </div>
            <!-- 收货地址 -->
            <div>
              <div class="section-contant">
                <h3>收货地址</h3>
                <div class="section-actions">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="handleEditComprehensive('contactEdit')"
                    >编辑</el-button
                  >
                </div>
              </div>

              <div class="address-info">
                <div class="address-text">北京市，北京市朝阳区翰林达到裕达大厦3层302</div>
              </div>
            </div>
          </div>

          <!-- 账单地址 -->
          <div>
            <div class="section-contant">
              <h3>账单地址</h3>
              <div class="section-actions">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handleEditComprehensive('contactEdit')"
                  >编辑</el-button
                >
              </div>
            </div>

            <div class="address-info">
              <div class="address-text">与收货地址相同</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 入住嘉宾 -->
      <div v-if="activeHotelTab === 'guests'" class="guests-container">
        <!-- 嘉宾信息标题 -->
        <div class="guests-header">
          <h2>嘉宾信息</h2>
        </div>

        <!-- 嘉宾卡片列表 -->
        <div class="guests-grid">
          <!-- 嘉宾卡片 1 - 演讲嘉宾 -->
          <div class="guest-card">
            <div class="card-header">
              <div class="guest-type">
                <span class="type-tag">演讲嘉宾</span>
              </div>
              <div class="card-actions">
                <el-tooltip content="编辑" placement="top">
                  <el-button type="primary" circle size="small" @click="handleEditGuest(1)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>

            <div class="guest-info">
              <div class="guest-avatar">
                <img src="https://via.placeholder.com/60x60/409eff/ffffff?text=海" alt="小海狮" />
              </div>
              <div class="guest-details">
                <div class="guest-name">小海狮</div>
                <div class="guest-room">
                  <span class="room-tag">标准客房--8801</span>
                  <span class="status-badge status-checked">已入住</span>
                </div>
              </div>
            </div>

            <div class="guest-basic-info">
              <div class="basic-header">
                <span class="basic-title">基本信息</span>
                <el-button link type="primary" size="small" @click="handleEditGuest(1)"
                  >编辑</el-button
                >
              </div>

              <div class="info-item">
                <span class="info-label">公司：</span>
                <span class="info-value">上海莫瑞思柯信息技术有限公司</span>
              </div>
              <div class="info-item">
                <span class="info-label">职务：</span>
                <span class="info-value"></span>
              </div>
              <div class="info-item">
                <span class="info-label">晚宴：</span>
                <span class="info-value"></span>
              </div>
              <div class="info-item">
                <span class="info-label">电话：</span>
                <span class="info-value">15800000000</span>
              </div>
              <div class="info-item">
                <span class="info-label">邮箱：</span>
                <span class="info-value">marinecircle@mail.com</span>
              </div>
              <div class="info-item">
                <span class="info-label">备注：</span>
                <span class="info-value"></span>
              </div>
            </div>
          </div>

          <!-- 嘉宾卡片 2 - 重要嘉宾 -->
          <div class="guest-card">
            <div class="card-header">
              <div class="guest-type">
                <span class="type-tag type-important">重要嘉宾</span>
              </div>
              <div class="card-actions">
                <el-tooltip content="编辑" placement="top">
                  <el-button type="primary" circle size="small" @click="handleEditGuest(2)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>

            <div class="guest-info">
              <div class="guest-avatar">
                <img src="https://via.placeholder.com/60x60/409eff/ffffff?text=海" alt="小海狮" />
              </div>
              <div class="guest-details">
                <div class="guest-name">小海狮</div>
                <div class="guest-room">
                  <span class="room-tag">标准客房--8801</span>
                  <span class="status-badge status-checked">已入住</span>
                </div>
              </div>
            </div>

            <div class="guest-basic-info">
              <div class="basic-header">
                <span class="basic-title">基本信息</span>
                <el-button link type="primary" size="small" @click="handleEditGuest(2)"
                  >编辑</el-button
                >
              </div>

              <div class="info-item">
                <span class="info-label">公司：</span>
                <span class="info-value">上海莫瑞思柯信息技术有限公司</span>
              </div>
              <div class="info-item">
                <span class="info-label">职务：</span>
                <span class="info-value"></span>
              </div>
              <div class="info-item">
                <span class="info-label">晚宴：</span>
                <span class="info-value"></span>
              </div>
              <div class="info-item">
                <span class="info-label">电话：</span>
                <span class="info-value">15800000000</span>
              </div>
              <div class="info-item">
                <span class="info-label">邮箱：</span>
                <span class="info-value">marinecircle@mail.com</span>
              </div>
              <div class="info-item">
                <span class="info-label">备注：</span>
                <span class="info-value"></span>
              </div>
            </div>
          </div>

          <!-- 嘉宾卡片 3 - 演讲嘉宾 -->
          <div class="guest-card">
            <div class="card-header">
              <div class="guest-type">
                <span class="type-tag">演讲嘉宾</span>
              </div>
              <div class="card-actions">
                <el-tooltip content="编辑" placement="top">
                  <el-button type="primary" circle size="small" @click="handleEditGuest(3)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>

            <div class="guest-info">
              <div class="guest-avatar">
                <img src="https://via.placeholder.com/60x60/409eff/ffffff?text=海" alt="小海狮" />
              </div>
              <div class="guest-details">
                <div class="guest-name">小海狮</div>
                <div class="guest-room">
                  <span class="room-tag">标准客房--8801</span>
                  <span class="status-badge status-checked">已入住</span>
                </div>
              </div>
            </div>

            <div class="guest-basic-info">
              <div class="basic-header">
                <span class="basic-title">基本信息</span>
                <el-button link type="primary" size="small" @click="handleEditGuest(3)"
                  >编辑</el-button
                >
              </div>

              <div class="info-item">
                <span class="info-label">公司：</span>
                <span class="info-value">上海莫瑞思树信息技术有限公司</span>
              </div>
              <div class="info-item">
                <span class="info-label">职务：</span>
                <span class="info-value"></span>
              </div>
              <div class="info-item">
                <span class="info-label">晚宴：</span>
                <span class="info-value"></span>
              </div>
              <div class="info-item">
                <span class="info-label">电话：</span>
                <span class="info-value">15800000000</span>
              </div>
              <div class="info-item">
                <span class="info-label">邮箱：</span>
                <span class="info-value">marinecircle@mail.com</span>
              </div>
              <div class="info-item">
                <span class="info-label">备注：</span>
                <span class="info-value"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 嘉宾接送 -->
      <div v-if="activeHotelTab === 'transport'" class="transport-container">
        <!-- 左侧：嘉宾信息列表 -->
        <div class="transport-left">
          <div class="transport-header">
            <h3>嘉宾信息</h3>
          </div>

          <!-- 嘉宾列表 - 三个嘉宾卡片 -->
          <div class="guest-list">
            <!-- 嘉宾卡片 1 - 小海狮 演讲嘉宾 已抵达 -->
            <div class="guest-card">
              <div class="guest-card-header">
                <div class="guest-title">
                  <span class="guest-name">小海狮</span>
                  <span class="guest-tag speaker-tag">演讲嘉宾</span>
                </div>
                <div class="guest-status status-arrived">已抵达</div>
              </div>
              <div class="guest-contact">对接人员：Evan</div>
            </div>
          </div>

          <!-- 底部行程安排标题 -->
          <div class="transport-subheader">
            <h3>行程安排</h3>
            <el-button link type="primary" size="small" @click="handleEditTransport('schedule')"
              >编辑</el-button
            >
          </div>

          <!-- 行程安排信息 -->
          <div class="schedule-info">
            <div class="info-item">
              <span class="info-label">对接人员：</span>
              <span class="info-value">Evan</span>
            </div>
            <div class="info-item">
              <span class="info-label">送达地点：</span>
              <span class="info-value">上海虹桥机场</span>
            </div>
            <div class="info-item">
              <span class="info-label">送达时间：</span>
              <span class="info-value">2026-01-01 16:30-17:30</span>
            </div>
            <div class="info-item">
              <span class="info-label">送达时间：</span>
              <span class="info-value">2026-01-01 17:00-17:30</span>
            </div>
            <div class="info-item">
              <span class="info-label">接送方式：</span>
              <span class="info-value">酒店商务车</span>
            </div>
            <div class="info-item">
              <span class="info-label">接送司机：</span>
              <span class="info-value">陈先生</span>
            </div>
            <div class="info-item">
              <span class="info-label">司机电话：</span>
              <span class="info-value">15800000000</span>
            </div>
            <div class="info-item">
              <span class="info-label">备注：</span>
              <span class="info-value"></span>
            </div>
          </div>
          <!-- 基本信息 -->
          <div class="basic-info-section">
            <div class="basic-header">
              <h4>基本信息</h4>
            </div>
            <div class="basic-content">
              <div class="basic-row">
                <span class="basic-label">公司：</span>
                <span class="basic-value">上海莫瑞思柯信息技术有限公司</span>
              </div>
              <div class="basic-row">
                <span class="basic-label">职务：</span>
                <span class="basic-value"></span>
              </div>
              <div class="basic-row">
                <span class="basic-label">晚宴：</span>
                <span class="basic-value"></span>
              </div>
              <div class="basic-row">
                <span class="basic-label">电话：</span>
                <span class="basic-value">15800000000</span>
              </div>
              <div class="basic-row">
                <span class="basic-label">邮箱：</span>
                <span class="basic-value">marinecircle@mail.com</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：嘉宾详细信息 -->
        <div class="transport-right">
          <div class="transport-header">
            <h3>嘉宾信息</h3>
          </div>

          <!-- 右侧嘉宾列表 - 四个嘉宾卡片（两行两列） -->
          <div class="right-guest-grid">
            <!-- 第一行第一个 - 小海狮 重要嘉宾 -->
            <div class="right-guest-card">
              <div class="right-guest-header">
                <span class="guest-name">小海狮</span>
                <span class="guest-tag important-tag">重要嘉宾</span>
              </div>
              <div class="guest-contact">对接人员：Evan</div>
              <div class="guest-status status-not-arrived">未抵达</div>
            </div>

            <!-- 第一行第二个 - 小海狮 重要嘉宾 -->
            <div class="right-guest-card">
              <div class="right-guest-header">
                <span class="guest-name">小海狮</span>
                <span class="guest-tag important-tag">重要嘉宾</span>
              </div>
              <div class="guest-contact">对接人员：Evan</div>
              <div class="guest-status status-not-arrived">未抵达</div>
            </div>

            <!-- 第二行第一个 - 小海狮 重要嘉宾 -->
            <div class="right-guest-card">
              <div class="right-guest-header">
                <span class="guest-name">小海狮</span>
                <span class="guest-tag important-tag">重要嘉宾</span>
              </div>
              <div class="guest-contact">对接人员：Evan</div>
              <div class="guest-status status-not-arrived">未抵达</div>
            </div>

            <!-- 第二行第二个 - 小海狮 重要嘉宾 -->
            <div class="right-guest-card">
              <div class="right-guest-header">
                <span class="guest-name">小海狮</span>
                <span class="guest-tag important-tag">重要嘉宾</span>
              </div>
              <div class="guest-contact">对接人员：Evan</div>
              <div class="guest-status status-not-arrived">未抵达</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, View, Printer, Select, Clock } from '@element-plus/icons-vue'

// 视图切换
const currentView = ref<'list' | 'detail'>('list')
// 酒店详情页面的活动标签
const activeHotelTab = ref<'project' | 'menu' | 'comprehensive' | 'guests' | 'transport'>('project')

// 搜索表单
const searchForm = reactive({
  meetingName: '',
  hotelName: '',
  userDate: [],
  createDate: '',
})

// 表格数据
const meetingList = ref([
  {
    id: 1,
    name: '2025第六届上海国际船舶管理论坛',
    hotelName: '上海',
    userDate: '2025-12-04',
    editors: ['Iris'],
  },
  {
    id: 2,
    name: '普陀区航运服务集聚区-暨港航物流和海事服务产业链合作交流会',
    hotelName: '舟山',
    userDate: '2025-12-04',
    editors: [],
  },
  {
    id: 3,
    name: '2025世界油商大会',
    hotelName: '舟山',
    userDate: '2025-11-21',
    editors: ['Evan'],
  },
  {
    id: 4,
    name: '2025散杂货船舶投资和经营论坛',
    hotelName: '上海',
    userDate: '2025-09-25',
    editors: ['Iris'],
  },
])

// 茶歇菜单数据 - 根据图片内容
const teaMenu = ref({
  items: [
    '迷你烟三文鱼开口三明治',
    '鸡肉蘑菇塔',
    '红茶奶冻',
    '橙味巧克力蛋糕',
    '曲奇',
    '水果：金桔、草莓、无花果、青提',
  ],
  price: '70￥/份',
  quantity: 100,
  total: 7000,
  contact: 'Iris',
  auditor: 'MacTong',
  status: 'pending', // 'confirmed' 或 'pending'
})

// 晚宴菜单数据 - 根据图片内容
const dinnerMenu = ref({
  items: [
    '吉祥如意八美碟（卤水牛肉，金陵盐水鸭，水晶肴肉，酸菜芯，拌海蜇花，糯米糖藕，爽脆芥兰丁，十八鲜，蕾萝卜）',
    '虫草花炖老鸭',
    '酒酿干烧大明虾',
  ],
  price: '3500￥/份',
  quantity: 10,
  total: 35000,
  contact: 'Iris',
  auditor: '',
  status: 'pending', // 'confirmed' 或 'pending'
})

// 切换菜单状态
const toggleMenuStatus = (type: 'tea' | 'dinner') => {
  const menu = type === 'tea' ? teaMenu.value : dinnerMenu.value
  const newStatus = menu.status === 'confirmed' ? 'pending' : 'confirmed'
  const statusText = newStatus === 'confirmed' ? '已确认' : '待确认'

  menu.status = newStatus
  ElMessage.success(`${type === 'tea' ? '茶歇' : '晚宴'}菜单状态已切换为${statusText}`)
}

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(800)

// 酒店详情页面的项目数据
const hotelItems = ref([
  {
    id: 1,
    projectName: '新亚厅场租赁',
    spec: '半天+晚宴',
    remarks: '',
    standardPrice: '30000元',
    preferentialPrice: '25000元',
    contact: 'Iris',
  },
  {
    id: 2,
    projectName: '茶歇',
    spec: '60人',
    remarks: '',
    standardPrice: '120元/人',
    preferentialPrice: '100元/人',
    contact: 'Iris',
  },
  {
    id: 3,
    projectName: '圆桌晚宴',
    spec: '10桌',
    remarks: '含本地啤酒、可乐、雪碧畅饮',
    standardPrice: '3500元/桌',
    preferentialPrice: '3500元/桌',
    contact: 'Iris',
  },
  {
    id: 4,
    projectName: '标准住宿',
    spec: '标准房型',
    remarks: '含早餐',
    standardPrice: '1370元',
    preferentialPrice: '900元',
    contact: 'Iris',
  },
  {
    id: 5,
    projectName: '开放式套房',
    spec: '豪华套房',
    remarks: '含早餐/免费升级',
    standardPrice: '1600元',
    preferentialPrice: '1600元',
    contact: 'Iris',
  },
  {
    id: 6,
    projectName: '舞台沙发',
    spec: '8套',
    remarks: '',
    standardPrice: '',
    preferentialPrice: '',
    contact: 'Iris',
  },
  {
    id: 7,
    projectName: 'LED屏',
    spec: '5.44M宽*2.88M高',
    remarks: '',
    standardPrice: '',
    preferentialPrice: '',
    contact: 'Iris',
  },
  {
    id: 8,
    projectName: '舞台',
    spec: '7.2M长*2.4M宽*0.4M高',
    remarks: '',
    standardPrice: '',
    preferentialPrice: '',
    contact: 'Iris',
  },
])

// 编辑综合事项
const handleEditComprehensive = (type: string) => {
  const typeMap: Record<string, string> = {
    venue: '会议现场',
    signage: '指示牌尺寸',
    contact: '酒店联系',
    contactEdit: '联系信息',
    shipping: '收货地址',
    billing: '账单地址',
  }
  ElMessage.info(`编辑${typeMap[type] || type}信息功能开发中`)
}

// 视图切换
const switchView = (view: 'list' | 'detail') => {
  currentView.value = view
}

// 搜索
const handleSearch = () => {
  ElMessage.success('搜索功能开发中')
  console.log('搜索条件:', searchForm)
}

// 重置搜索
const resetSearch = () => {
  searchForm.meetingName = ''
  searchForm.hotelName = ''
  searchForm.createDate = ''
  ElMessage.success('已重置')
}

// 新增会议
const handleAdd = () => {
  ElMessage.info('新增会议功能开发中')
}

// 编辑
const handleEdit = (row: any) => {
  ElMessage.info(`编辑会议: ${row.name}`)
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除会议"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 查看
const handleView = (row: any) => {
  ElMessage.info(`查看会议详情: ${row.name}`)
  switchView('detail')
}

// 打印
const handlePrint = (row: any) => {
  ElMessage.info(`打印议程: ${row.name}`)
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  ElMessage.info(`每页显示 ${val} 条`)
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  ElMessage.info(`跳转到第 ${val} 页`)
}

// 酒店详情页操作
const handleEditHotel = () => {
  ElMessage.info('编辑酒店信息功能开发中')
}

const handleDeleteHotel = () => {
  ElMessageBox.confirm('确认删除该酒店吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('删除成功')
      currentView.value = 'list'
    })
    .catch(() => {})
}

// 项目操作
const handleEditItem = (row: any) => {
  ElMessage.info(`编辑项目: ${row.projectName}`)
}

const handleViewItem = (row: any) => {
  ElMessage.info(`查看项目: ${row.projectName}`)
}

const handleDeleteItem = (row: any) => {
  ElMessageBox.confirm(`确认删除项目"${row.projectName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 菜单操作
const handleEditMenu = (type: 'tea' | 'dinner') => {
  ElMessage.info(`编辑${type === 'tea' ? '茶歇' : '晚宴'}菜单`)
}

const handlePrintMenu = (type: 'tea' | 'dinner') => {
  ElMessage.info(`打印${type === 'tea' ? '茶歇' : '晚宴'}菜单`)
}

// 编辑嘉宾信息
const handleEditGuest = (id: number) => {
  ElMessage.info(`编辑嘉宾信息功能开发中，嘉宾ID: ${id}`)
}

// 编辑接送信息
const handleEditTransport = (type: string, id?: number) => {
  const typeMap: Record<string, string> = {
    guest: '嘉宾信息',
    schedule: '行程安排',
    basic: '基本信息',
  }
  const idText = id ? ` ID: ${id}` : ''
  ElMessage.info(`编辑${typeMap[type] || type}信息功能开发中${idText}`)
}

// 添加晚宴
const handleAddDinner = () => {
  ElMessage.info('添加晚宴功能开发中')
}
</script>

<style scoped>
.agenda-container {
  padding: 10px;
  background-color: white;
  height: 100%;
}

.view-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.tab-item {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
}

.content-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
}

.search-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 表格区域 */
.table-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

.el-table {
  margin-bottom: 16px;
}

/* 表格底部样式 */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 8px 0;
}

.add-form-button {
  flex-shrink: 0;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

/* 酒店详情头部 */
.detail-header {
  margin-bottom: 20px;
}

.header-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title-row h1 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 酒店事项分类标签 */
.hotel-tabs {
  display: flex;
  gap: 4px;
  margin: 20px 0;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 0;
}

.hotel-tab-item {
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  border-radius: 4px 4px 0 0;
}

.hotel-tab-item:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.hotel-tab-item.active {
  color: #409eff;
  font-weight: 600;
}

.hotel-tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
  z-index: 1;
}

/* 酒店事项表格 */
.hotel-items-table {
  margin-top: 20px;
}

/* 餐饮菜单样式 */
/* 餐饮菜单样式 */
.menu-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 30px;
}

.menu-section {
  width: 433px;
  height: 600px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(241, 242, 244, 1);
  display: flex;
  flex-direction: column;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.menu-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.menu-actions {
  display: flex;
  gap: 8px;
}

/* 修改：将menu-content改为flex列布局，撑满整个section */
.menu-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 53px); /* 减去header的高度 */
  padding: 16px;
  box-sizing: border-box;
}

/* 顶部：菜单项区域，占据剩余空间 */
.menu-items {
  flex: 1;
  overflow-y: auto; /* 如果菜单项太多，可以滚动 */
  margin-bottom: 16px;
}

.menu-item {
  font-size: 17.06px;
  font-weight: 400;
  letter-spacing: 0.21px;
  line-height: 32px;
  color: rgba(113, 128, 150, 1);
  text-align: left;
  vertical-align: top;
  padding: 2px 0;
}

/* 底部：价格和对接人信息区域 */
.menu-bottom {
  flex-shrink: 0;
  border-top: 1px solid rgba(241, 242, 244, 1);
  padding-top: 12px;
}

.menu-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.price-info .label {
  font-size: 17.06px;
  font-weight: 400;
  letter-spacing: 0.32px;
  line-height: 25.59px;
  color: rgba(17, 24, 39, 1);
}

.price-info .value {
  font-size: 17.06px;
  font-weight: 400;
  letter-spacing: 0.32px;
  line-height: 25.59px;
  color: rgba(17, 24, 39, 1);
}

.price-info .value.total {
  color: #f56c6c;
  font-weight: 600;
}

.menu-contact {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 16px;
  font-weight: 400;
  line-height: 29.85px;
  color: rgba(17, 24, 39, 1);
}

.menu-contact .value {
  font-size: 16px;
  font-weight: 400;
  color: rgba(54, 134, 255, 1);
}

.status-tag {
  font-size: 16px;
  font-weight: 400;
  color: rgba(54, 134, 255, 1);
  margin-left: 8px;
}

/* 状态标签样式 */
.status-confirmed {
  color: #67c23a;
}

.status-pending {
  color: #e6a23c;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .menu-container {
    flex-direction: column;
    gap: 20px;
  }

  .menu-section {
    width: 100%;
    height: auto;
    min-height: 500px;
  }

  .menu-content {
    height: auto;
  }

  .menu-items {
    max-height: 300px;
  }
}

.menu-item {
  font-size: 17.06px;
  font-weight: 400;
  letter-spacing: 0.21px;
  line-height: 32px;
  color: rgba(113, 128, 150, 1);
  text-align: left;
  vertical-align: top;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-footer {
  display: flex;
  flex-direction: column;
  /* justify-content: flex-end; */
  gap: 40px;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
  width: 391px;
  /* left: 287px;
  top: 805px;
  width: 391px;
  height: 0px;
  opacity: 1; */
  transform: rotate(0.15deg);

  border: 1.07px solid rgba(241, 242, 244, 1);
}

.price-info {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 0px 10px;
}

.price-info .label {
  font-size: 17.06px;
  font-weight: 400;
  letter-spacing: 0.32px;
  line-height: 25.59px;
  color: rgba(17, 24, 39, 1);
  text-align: left;
  vertical-align: middle;
}

.price-info .value {
  font-size: 17.06px;
  font-weight: 400;
  letter-spacing: 0.32px;
  line-height: 25.59px;
  color: rgba(17, 24, 39, 1);
  text-align: left;
  vertical-align: middle;
}

.price-info .value.total {
  color: #f56c6c;
  font-weight: 600;
}

.menu-contact {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 29.85px;
  color: rgba(17, 24, 39, 1);
  text-align: right;
  vertical-align: middle;
}

/* .menu-contact .label {
  color: #909399;
} */

.menu-contact .value {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 29.85px;
  color: rgba(54, 134, 255, 1);
  text-align: center;
  vertical-align: top;
}
.status-tag {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 29.85px;
  color: rgba(54, 134, 255, 1);
  text-align: center;
  vertical-align: top;
}

/* 占位内容样式 */
.placeholder-content {
  margin-top: 30px;
  padding: 40px 0;
}

/* 编辑者名字样式 */
.editors-container {
  display: flex;
  align-items: center;
}

.editors-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.editor-item {
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(54, 134, 255, 1);
  font-size: 12px;
  color: rgba(54, 134, 255, 1);
  background-color: rgba(54, 134, 255, 0.1);
  white-space: nowrap;
}

/* 表格样式调整 */
:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 0;
}

:deep(.el-table td) {
  padding: 10px 0;
}

:deep(.el-table .cell) {
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hotel-tabs {
    flex-wrap: wrap;
    gap: 8px;
  }

  .hotel-tab-item {
    padding: 8px 16px;
    font-size: 14px;
  }

  .header-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .menu-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }

  .menu-contact {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 8px;
  }
}

/* 综合事项样式 */
.comprehensive-container {
  /* margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px; */
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 30px;
}
.conference-venue {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  left: 259px;
  top: 240px;
  width: 718px;
  height: 618px;
  opacity: 1;
  border-radius: 8px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(241, 242, 244, 1);
}
.comprehensive-section {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  left: 0px;
  top: 0px;
  width: 395px;
  height: 618px;
  opacity: 1;
  border-radius: 17.12px;
  background: rgba(255, 255, 255, 1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
.section-img {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 16px;
  padding-bottom: 12px;
}
.section-hotel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 16px;
  padding-bottom: 12px;
}
.section-contant {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.section-actions {
  display: flex;
  gap: 8px;
}

/* 信息网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px;
}

.info-row {
  display: flex;
  align-items: baseline;
  font-size: 15px;
  line-height: 1.6;
}

.info-label {
  width: 100px;
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  font-weight: 400;
  flex: 1;
}

/* 指示牌信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  font-size: 15px;
  color: #303133;
  padding: 4px 0;
}

/* 酒店联系信息 */
.contact-info {
  display: flex;
  /* justify-content: space-between; */
  /* align-items: flex-start; */
}

.contact-person {
  display: flex;
  gap: 12px;
  align-items: center;
}

.person-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.person-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-details {
  display: flex;
  flex-direction: column;
}

.person-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.person-hotel {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.contact-row {
  display: flex;
  /* align-items: baseline; */
  margin-bottom: 8px;
  left: 38.38px;
  top: 0px;
  width: 108px;
  height: 26px;
  opacity: 1;
}

.contact-label {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.contact-email,
.contact-phone {
  margin-left: 10px;
  font-size: 17.06px;
  font-weight: 500;
  color: rgba(113, 128, 150, 1);
  text-align: left;
  vertical-align: middle;
}

/* 地址信息 */
.address-info {
  padding: 4px 0;
}

.address-text {
  font-size: 15px;
  color: #303133;
  line-height: 1.6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .contact-info {
    flex-direction: column;
    gap: 16px;
  }

  .contact-row {
    justify-content: flex-start;
  }
}

/* 入住嘉宾样式 */
.guests-container {
  margin-top: 20px;
}

.guests-header {
  margin-bottom: 24px;
}

.guests-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.guests-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.guest-card {
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.guest-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.guest-type {
  display: flex;
  align-items: center;
}

.type-tag {
  display: inline-block;
  padding: 4px 12px;
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 20px;
}

.type-tag.type-important {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.guest-info {
  display: flex;
  gap: 16px;
  padding: 20px 16px;
  background-color: #f9fafc;
}

.guest-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guest-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.guest-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.guest-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.guest-room {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.room-tag {
  font-size: 14px;
  color: #606266;
  background-color: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}

.status-checked {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
  border: 1px solid #67c23a;
}

.guest-basic-info {
  padding: 16px;
}

.basic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
}

.basic-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.info-item .info-label {
  /* width: 50px; */
  color: #909399;
  flex-shrink: 0;
}

.info-item .info-value {
  flex: 1;
  color: #606266;
  word-break: break-word;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .guests-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .guests-grid {
    grid-template-columns: 1fr;
  }

  .guest-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .guest-room {
    justify-content: center;
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
  }

  .info-item .info-label {
    width: auto;
  }
}

/* 嘉宾接送样式 */
.transport-container {
  margin-top: 20px;
  display: flex;
  gap: 24px;
}

/* 左侧样式 */
.transport-left {
  width: 380px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
}

.transport-header {
  margin-bottom: 16px;
}

.transport-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.transport-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 16px 0;
}

.transport-subheader h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 左侧嘉宾列表 */
.guest-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.guest-card {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
  background-color: #ffffff;
}

.guest-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.guest-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guest-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.guest-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.speaker-tag {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.important-tag {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.guest-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-arrived {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status-not-arrived {
  background-color: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.guest-contact {
  font-size: 14px;
  color: #909399;
}

/* 左侧行程安排 */
.schedule-info {
  display: flex;
  flex-direction: column;
  /* gap: 8px; */
}

.info-item {
  display: flex;
  align-items: baseline;
  font-size: 14px;
  line-height: 1.6;
}
.info-label {
  /* width: 80px; */
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #303133;
}

/* 右侧样式 */
.transport-right {
  flex: 1;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
}

/* 右侧嘉宾网格 */
.right-guest-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 16px 0 20px 0;
}

.right-guest-card {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
  background-color: #f9fafc;
}

.right-guest-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.right-guest-card .guest-name {
  font-size: 15px;
}

.right-guest-card .guest-contact {
  font-size: 13px;
  margin-bottom: 6px;
}

.right-guest-card .guest-status {
  display: inline-block;
}

/* 基本信息区域 */
.basic-info-section {
  margin-top: 16px;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.basic-header {
  margin-bottom: 12px;
}

.basic-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.basic-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.basic-row {
  display: flex;
  align-items: baseline;
  font-size: 14px;
  line-height: 1.6;
}

.basic-label {
  width: 60px;
  color: #909399;
  flex-shrink: 0;
}

.basic-value {
  flex: 1;
  color: #303133;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .transport-container {
    flex-direction: column;
  }

  .transport-left {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .right-guest-grid {
    grid-template-columns: 1fr;
  }

  .guest-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    width: auto;
  }

  .basic-row {
    flex-direction: column;
    gap: 4px;
  }

  .basic-label {
    width: auto;
  }
}
</style>
