<template>
  <!-- 通用导航组件 -->
  <ConferenceNavigation
    :currentPage="'议程安排'"
    :meetings="meetings"
    @meeting-change="handleMeetingChange"
  />
  <div class="agenda-page">
    <!-- 酒店基础信息配置区 -->
    <div class="hotel-config-card">
      <div class="config-header">
        <div class="hotel-selector">
          <span class="label">预选酒店：</span>
          <el-select v-model="selectedHotel" placeholder="选择酒店" class="hotel-select">
            <el-option label="上海汤臣洲际大酒店" value="1" />
            <el-option label="上海浦东丽思卡尔顿" value="2" />
            <el-option label="上海金茂君悦大酒店" value="3" />
          </el-select>
          <el-button link class="import-btn" @click="handleImportHotel">
            <el-icon><Upload /></el-icon> 导入酒店
          </el-button>
          <el-button link class="remove-btn" @click="handleRemoveHotel">
            <el-icon><Delete /></el-icon> 移除
          </el-button>
        </div>
        <div class="hotel-status">
          <el-tag type="success" effect="plain" size="large">已确认使用</el-tag>
          <el-button link class="cancel-confirm-btn">取消确认</el-button>
        </div>
      </div>

      <div class="config-body">
        <div class="config-row">
          <div class="config-item">
            <span class="label">使用时间段</span>
            <el-date-picker
              v-model="usageTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="time-range-picker"
            />
          </div>
          <div class="config-item">
            <span class="label">对接负责人</span>
            <div class="contact-list">
              <el-tag
                v-for="(contact, idx) in contacts"
                :key="idx"
                closable
                @close="removeContact(idx)"
                class="contact-tag"
              >
                {{ contact }}
              </el-tag>
              <el-button link class="add-contact-btn" @click="addContact">
                <el-icon><Plus /></el-icon> 添加
              </el-button>
              <el-button link class="export-list-btn" @click="handleExportList">
                <el-icon><Download /></el-icon> 导出总清单
              </el-button>
            </div>
          </div>
        </div>

        <div class="hotel-detail-row">
          <div class="hotel-address">
            <el-icon><Location /></el-icon>
            <span>{{ hotelDetail.address }}</span>
          </div>
          <div class="hotel-contact">
            <el-icon><Phone /></el-icon>
            <span>{{ hotelDetail.contact }}</span>
          </div>
          <div class="hotel-rooms">
            <span>房间数：{{ hotelDetail.rooms }}</span>
            <span class="price-info">参考价：￥{{ hotelDetail.referencePrice }}/间</span>
            <span class="price-info contract-price"
              >协议价：￥{{ hotelDetail.contractPrice }}/间</span
            >
          </div>
          <div class="total-cost">
            <span class="label">费用总计：</span>
            <span class="cost-value">￥{{ formatNumber(totalAmount + hotelTotalCost) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能标签栏 -->
    <div class="tabs-nav">
      <el-tabs v-model="activeTab" class="custom-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="报价清单" name="quote" />
        <el-tab-pane label="会议厅信息" name="hall" />
        <el-tab-pane label="菜单信息" name="menu" />
        <el-tab-pane label="服务方-设计" name="design" />
        <el-tab-pane label="服务方-搭建" name="build" />
        <el-tab-pane label="服务方-摄影" name="photo" />
        <el-tab-pane label="嘉宾入住" name="guestStay" />
        <el-tab-pane label="接送安排" name="transport" />
      </el-tabs>
    </div>

    <!-- 动态内容区 -->
    <div class="tabs-content">
      <!-- 报价清单内容 -->
      <div v-if="activeTab === 'quote'">
        <div class="cost-overview">
          <div class="action-buttons">
            <div>
              <h2>酒店事项报价清单</h2>
            </div>
            <div>
              <el-button class="btn-import-excel" @click="handleImportExcel">
                <el-icon><Upload /></el-icon> 导入Excel
              </el-button>
              <el-button type="primary" class="btn-add-item" @click="handleAddItem">
                <el-icon><Plus /></el-icon> 添加项目
              </el-button>
              <el-button class="btn-delete-import" @click="handleDeleteImport">
                <el-icon><Delete /></el-icon> 删除导入
              </el-button>
            </div>
          </div>
          <div class="cost-cards">
            <div class="cost-card" v-for="item in costCategories" :key="item.name">
              <div class="card-info">
                <div class="card-name">{{ item.name }}</div>
                <div class="card-amount">￥{{ formatNumber(item.amount) }}</div>
              </div>
            </div>
            <div class="cost-card total-card">
              <div class="card-info">
                <div class="card-name">总价</div>
                <div class="card-amount total-amount">￥{{ formatNumber(totalAmount) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="quote-table-wrapper">
          <el-table :data="quoteList" stripe border class="quote-table">
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column prop="category" label="类别" width="100">
              <template #default="{ row }">
                <el-tag :type="getCategoryTagType(row.category)" size="small">{{
                  row.category
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="project" label="项目" min-width="150" />
            <el-table-column prop="spec" label="规格/说明" min-width="200" show-overflow-tooltip />
            <el-table-column prop="unit" label="单位" width="80" align="center" />
            <el-table-column prop="price" label="单价(元)" width="110" align="right">
              <template #default="{ row }">￥{{ formatNumber(row.price) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="total" label="合计(元)" width="120" align="right">
              <template #default="{ row }">￥{{ formatNumber(row.total) }}</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" min-width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link class="btn-edit-table" @click="handleEditItem(row)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button link class="btn-delete-table" @click="handleDeleteItem(row)">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 会议厅信息内容 - 左右并排显示 -->
      <div v-if="activeTab === 'hall'" class="hall-info-content">
        <!-- 循环展示会议厅卡片 -->
        <div v-for="hall in hallList" :key="hall.id" class="hall-card-detail">
          <div class="hall-card-header">
            <div class="hall-title">
              <h3 class="hall-name">{{ hall.name }}</h3>
              <span class="hall-floor">{{ hall.floor }}</span>
            </div>
            <div class="hall-actions">
              <el-button link class="hall-edit-btn" @click="handleEditHall(hall)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button link class="hall-delete-btn" @click="handleDeleteHall(hall)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </div>
          <div class="hall-detail-grid">
            <div class="detail-item">
              <span class="detail-label">面积</span>
              <span class="detail-value">{{ hall.area }}m²</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">容纳</span>
              <span class="detail-value">{{ hall.capacity }}人</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">布局</span>
              <span class="detail-value">{{ hall.layout }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">楼层</span>
              <span class="detail-value">{{ hall.floor }}</span>
            </div>
            <div class="detail-item detail-item-full">
              <span class="detail-label">设备</span>
              <span class="detail-value">{{
                hall.devices?.join(' ') || hall.facilities?.join(' ') || '-'
              }}</span>
            </div>
            <div class="detail-item detail-item-full">
              <span class="detail-label">备注</span>
              <span class="detail-value">{{ hall.remark }}</span>
            </div>
          </div>

          <!-- 多张图片画廊展示区 -->
          <div class="hall-gallery">
            <div class="gallery-header">
              <span class="gallery-title">宴会厅照片</span>
              <el-button link class="add-photo-btn" @click="handleOpenImageManager(hall)">
                <el-icon><Plus /></el-icon> 管理照片
              </el-button>
            </div>
            <div class="gallery-images" v-if="hall.images && hall.images.length > 0">
              <div
                v-for="(img, imgIdx) in hall.images"
                :key="imgIdx"
                class="gallery-item"
                @click="handlePreviewImage(hall, imgIdx)"
              >
                <img :src="img.url" :alt="img.name || '宴会厅照片'" />
                <div class="image-overlay">
                  <el-icon><ZoomIn /></el-icon>
                </div>
              </div>
              <div class="gallery-add-more" @click="handleOpenImageManager(hall)">
                <el-icon><Plus /></el-icon>
                <span>添加更多</span>
              </div>
            </div>
            <div v-else class="gallery-empty" @click="handleOpenImageManager(hall)">
              <el-icon><Camera /></el-icon>
              <span>点击上传宴会厅照片</span>
            </div>
          </div>

          <!-- 费用信息行 -->
          <div class="hall-price-row">
            <div class="price-item">
              <span class="price-label">半天场租</span>
              <span class="price-value">￥{{ formatNumber(hall.halfDayPrice) }}</span>
            </div>
            <div class="price-item">
              <span class="price-label">全天场租</span>
              <span class="price-value">￥{{ formatNumber(hall.fullDayPrice) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 菜单信息内容 - 卡片样式表格 -->
      <div v-if="activeTab === 'menu'" class="menu-info-content">
        <!-- 茶歇菜单卡片 -->
        <div class="menu-card">
          <div class="menu-card-header">
            <div class="menu-card-title">
              <span class="title-icon">🍵</span>
              <h3>茶歇菜单</h3>
              <span class="menu-count">({{ teaBreakMenu.length }}项)</span>
            </div>
            <el-button type="primary" size="small" @click="openAddTeaBreakDialog">
              <el-icon><Plus /></el-icon> 添加茶歇项
            </el-button>
          </div>
          <div class="menu-card-body">
            <el-table :data="teaBreakMenu" stripe class="menu-table" style="width: 100%">
              <el-table-column type="index" label="#" width="55" align="center" />
              <el-table-column prop="name" label="名称" min-width="120" />
              <el-table-column prop="category" label="分类" width="90" />
              <el-table-column prop="quantity" label="数量/份量" width="110" />
              <el-table-column prop="price" label="单价(元)" width="100" align="right">
                <template #default="{ row }">￥{{ formatNumber(row.price) }}</template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
              <el-table-column label="操作" width="100" align="center" fixed="right">
                <template #default="{ row, $index }">
                  <el-button link class="edit-btn" @click="openEditTeaBreakDialog(row, $index)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button link class="delete-btn" @click="teaBreakMenu.splice($index, 1)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 晚宴菜单卡片 -->
        <div class="menu-card">
          <div class="menu-card-header">
            <div class="menu-card-title">
              <span class="title-icon">🍽️</span>
              <h3>晚宴菜单</h3>
              <span class="menu-count">({{ dinnerMenu.length }}项)</span>
            </div>
            <el-button type="primary" size="small" @click="openAddDinnerDialog">
              <el-icon><Plus /></el-icon> 添加晚宴项
            </el-button>
          </div>
          <div class="menu-card-body">
            <el-table :data="dinnerMenu" stripe class="menu-table" style="width: 100%">
              <el-table-column type="index" label="#" width="55" align="center" />
              <el-table-column prop="name" label="名称" min-width="140" />
              <el-table-column prop="category" label="分类" width="90" />
              <el-table-column prop="quantity" label="数量/份量" width="110" />
              <el-table-column prop="price" label="单价(元)" width="100" align="right">
                <template #default="{ row }">￥{{ formatNumber(row.price) }}</template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
              <el-table-column label="操作" width="100" align="center" fixed="right">
                <template #default="{ row, $index }">
                  <el-button link class="edit-btn" @click="openEditDinnerDialog(row, $index)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button link class="delete-btn" @click="dinnerMenu.splice($index, 1)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 服务方-设计内容 - 根据图片重新设计 -->
      <div v-if="activeTab === 'design'" class="design-content">
        <div class="design-header">
          <div class="header-left">
            <h3>设计事项</h3>
            <div class="total-cost-badge">
              费用合计：<span class="total-amount">￥{{ formatNumber(designTotalCost) }}</span>
            </div>
          </div>
          <div class="header-right">
            <el-button class="import-excel-btn" @click="handleImportDesignExcel">
              <el-icon><Upload /></el-icon> 导入Excel
            </el-button>
            <el-button type="primary" @click="openAddDesignDialog">
              <el-icon><Plus /></el-icon> 添加事项
            </el-button>
            <el-button class="delete-import-btn" @click="handleDeleteDesignImport">
              <el-icon><Delete /></el-icon> 删除导入
            </el-button>
          </div>
        </div>

        <div class="design-table-wrapper">
          <el-table :data="designList" stripe border class="design-table" style="width: 100%">
            <el-table-column type="index" label="#" width="55" align="center" />
            <el-table-column prop="itemName" label="事项名称" min-width="150" />
            <el-table-column
              prop="description"
              label="事项描述"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column label="设计方" min-width="180">
              <template #default="{ row }">
                <div class="contact-info">
                  <div>{{ row.designer.name }}</div>
                  <div class="contact-phone">{{ row.designer.phone }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="搭建方" width="180">
              <template #default="{ row }">
                <div class="contact-info">
                  <div>{{ row.builder.name }}</div>
                  <div class="contact-phone">{{ row.builder.phone }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getDesignStatusType(row.status)" size="small">{{
                  row.status
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="designPrice" label="设计制作(元)" width="120" align="right">
              <template #default="{ row }">￥{{ formatNumber(row.designPrice) }}</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column label="操作" min-width="120" align="center" fixed="right">
              <template #default="{ row, $index }">
                <el-button link class="edit-btn" @click="openEditDesignDialog(row, $index)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button link class="delete-btn" @click="deleteDesignItem($index)">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 服务方-搭建内容 -->
      <div v-if="activeTab === 'build'" class="service-content">
        <div class="service-header">
          <h3>服务方-搭建</h3>
          <el-button type="primary" @click="handleAddBuildItem">
            <el-icon><Plus /></el-icon> 添加搭建项目
          </el-button>
        </div>
        <el-table :data="buildList" stripe border>
          <el-table-column prop="project" label="项目名称" width="200" />
          <el-table-column prop="spec" label="规格/说明" />
          <el-table-column prop="price" label="单价(元)" width="120">
            <template #default="{ row }">￥{{ formatNumber(row.price) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '已完成' ? 'success' : 'warning'">{{
                row.status
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="buildList.splice($index, 1)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 服务方-摄影内容 -->
      <div v-if="activeTab === 'photo'" class="service-content">
        <div class="service-header">
          <h3>服务方-摄影</h3>
          <el-button type="primary" @click="handleAddPhotoItem">
            <el-icon><Plus /></el-icon> 添加摄影服务
          </el-button>
        </div>
        <el-table :data="photoList" stripe border>
          <el-table-column prop="project" label="服务项目" width="200" />
          <el-table-column prop="spec" label="规格/说明" />
          <el-table-column prop="price" label="单价(元)" width="120">
            <template #default="{ row }">￥{{ formatNumber(row.price) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '已确认' ? 'success' : 'info'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="photoList.splice($index, 1)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 嘉宾入住内容 -->
      <div v-if="activeTab === 'guestStay'" class="guest-stay-content">
        <div class="service-header">
          <h3>嘉宾入住信息</h3>
          <el-button type="primary" @click="handleAddGuest">
            <el-icon><Plus /></el-icon> 添加嘉宾
          </el-button>
        </div>
        <el-table :data="guestList" stripe border>
          <el-table-column prop="name" label="嘉宾姓名" width="120" />
          <el-table-column prop="roomType" label="房型" width="120" />
          <el-table-column prop="roomNumber" label="房间号" width="100" />
          <el-table-column prop="checkIn" label="入住日期" width="120" />
          <el-table-column prop="checkOut" label="离店日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '已入住' ? 'success' : 'info'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="guestList.splice($index, 1)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 接送安排内容 -->
      <div v-if="activeTab === 'transport'" class="transport-content">
        <div class="service-header">
          <h3>接送安排</h3>
          <el-button type="primary" @click="handleAddTransport">
            <el-icon><Plus /></el-icon> 添加接送安排
          </el-button>
        </div>
        <el-table :data="transportList" stripe border>
          <el-table-column prop="guest" label="嘉宾" width="120" />
          <el-table-column prop="type" label="接送类型" width="100" />
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="time" label="时间" width="100" />
          <el-table-column prop="route" label="路线" />
          <el-table-column prop="vehicle" label="车辆" width="120" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="transportList.splice($index, 1)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增/编辑项目弹窗（报价清单） -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="类别" prop="category">
          <el-select v-model="formData.category" placeholder="请选择类别" style="width: 100%">
            <el-option label="住宿" value="住宿" />
            <el-option label="会场" value="会场" />
            <el-option label="餐饮" value="餐饮" />
            <el-option label="设备" value="设备" />
            <el-option label="服务" value="服务" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目" prop="project">
          <el-input v-model="formData.project" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="规格/说明" prop="spec">
          <el-input
            v-model="formData.spec"
            type="textarea"
            :rows="2"
            placeholder="请输入规格说明"
          />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" placeholder="如：间/晚、天、餐" />
        </el-form-item>
        <el-form-item label="单价(元)" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="formData.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" placeholder="备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑会议厅弹窗 -->
    <el-dialog
      v-model="hallDialogVisible"
      :title="hallDialogTitle"
      width="800px"
      @close="resetHallForm"
    >
      <el-form :model="hallForm" :rules="hallRules" ref="hallFormRef" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12"
            ><el-form-item label="会议厅名称" prop="name"
              ><el-input v-model="hallForm.name" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="所在楼层" prop="floor"
              ><el-input v-model="hallForm.floor" /></el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"
            ><el-form-item label="面积(㎡)" prop="area"
              ><el-input-number
                v-model="hallForm.area"
                :min="0"
                style="width: 100%" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="容纳人数" prop="capacity"
              ><el-input-number
                v-model="hallForm.capacity"
                :min="1"
                style="width: 100%" /></el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"
            ><el-form-item label="半天场租(元)" prop="halfDayPrice"
              ><el-input-number
                v-model="hallForm.halfDayPrice"
                :min="0"
                :precision="2"
                style="width: 100%" /></el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item label="全天场租(元)" prop="fullDayPrice"
              ><el-input-number
                v-model="hallForm.fullDayPrice"
                :min="0"
                :precision="2"
                style="width: 100%" /></el-form-item
          ></el-col>
        </el-row>
        <el-form-item label="布局样式" prop="layout">
          <el-select v-model="hallForm.layout" placeholder="请选择布局样式" style="width: 100%">
            <el-option label="剧院式" value="剧院式" />
            <el-option label="课桌式" value="课桌式" />
            <el-option label="U型" value="U型" />
            <el-option label="宴会式" value="宴会式" />
          </el-select>
        </el-form-item>
        <el-form-item label="配套设施" prop="facilities">
          <el-select
            v-model="hallForm.facilities"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入"
            style="width: 100%"
          >
            <el-option label="投影仪" value="投影仪" />
            <el-option label="LED屏" value="LED屏" />
            <el-option label="音响系统" value="音响系统" />
            <el-option label="无线麦克风" value="无线麦克风" />
            <el-option label="灯光控制系统" value="灯光控制系统" />
            <el-option label="舞台" value="舞台" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="hallForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="hallDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHall">确定</el-button>
      </template>
    </el-dialog>

    <!-- 茶歇菜单编辑弹窗 -->
    <el-dialog
      v-model="teaBreakDialogVisible"
      :title="teaBreakDialogTitle"
      width="550px"
      @close="resetTeaBreakForm"
    >
      <el-form
        :model="teaBreakForm"
        :rules="menuFormRules"
        ref="teaBreakFormRef"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="teaBreakForm.name" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="teaBreakForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="饮品" value="饮品" />
            <el-option label="点心" value="点心" />
            <el-option label="水果" value="水果" />
            <el-option label="零食" value="零食" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量/份量" prop="quantity">
          <el-input v-model="teaBreakForm.quantity" placeholder="如：200杯、每桌1份" />
        </el-form-item>
        <el-form-item label="单价(元)" prop="price">
          <el-input-number
            v-model="teaBreakForm.price"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="teaBreakForm.remark" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="teaBreakDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTeaBreakItem">确定</el-button>
      </template>
    </el-dialog>

    <!-- 晚宴菜单编辑弹窗 -->
    <el-dialog
      v-model="dinnerDialogVisible"
      :title="dinnerDialogTitle"
      width="550px"
      @close="resetDinnerForm"
    >
      <el-form :model="dinnerForm" :rules="menuFormRules" ref="dinnerFormRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dinnerForm.name" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="dinnerForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="冷菜" value="冷菜" />
            <el-option label="汤品" value="汤品" />
            <el-option label="热菜" value="热菜" />
            <el-option label="主食" value="主食" />
            <el-option label="甜品" value="甜品" />
            <el-option label="水果" value="水果" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量/份量" prop="quantity">
          <el-input v-model="dinnerForm.quantity" placeholder="如：每桌1份、每人1位" />
        </el-form-item>
        <el-form-item label="单价(元)" prop="price">
          <el-input-number v-model="dinnerForm.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dinnerForm.remark" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dinnerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDinnerItem">确定</el-button>
      </template>
    </el-dialog>

    <!-- 设计事项编辑弹窗 -->
    <el-dialog
      v-model="designDialogVisible"
      :title="designDialogTitle"
      width="700px"
      @close="resetDesignForm"
    >
      <el-form :model="designForm" :rules="designFormRules" ref="designFormRef" label-width="115px">
        <el-form-item label="事项名称" prop="itemName" label-width="115px">
          <el-input v-model="designForm.itemName" placeholder="请输入事项名称" />
        </el-form-item>
        <el-form-item label="事项描述" prop="description" label-width="115px">
          <el-input
            v-model="designForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入规格说明"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity" label-width="115px">
              <el-input-number v-model="designForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设计制作费(元)" prop="designPrice" label-width="115px">
              <el-input-number
                v-model="designForm.designPrice"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设计方名称" prop="designerName" label-width="115px">
              <el-input v-model="designForm.designerName" placeholder="如：karl" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设计方电话" prop="designerPhone" label-width="115px">
              <el-input v-model="designForm.designerPhone" placeholder="联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="搭建方名称" prop="builderName" label-width="115px">
              <el-input v-model="designForm.builderName" placeholder="如：博文搭建有限公司" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="搭建方电话" prop="builderPhone" label-width="115px">
              <el-input v-model="designForm.builderPhone" placeholder="联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status" label-width="115px">
          <el-select v-model="designForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="进行中" />
            <el-option label="定稿" value="定稿" />
            <el-option label="初稿" value="初稿" />
            <el-option label="制作中" value="制作中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark" label-width="115px">
          <el-input v-model="designForm.remark" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="designDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDesignItem">确定</el-button>
      </template>
    </el-dialog>

    <!-- 照片管理弹窗（支持多张上传） -->
    <el-dialog
      v-model="imageManagerVisible"
      :title="`${currentHall?.name || '宴会厅'} - 照片管理`"
      width="800px"
      @close="resetImageManager"
    >
      <div class="image-manager">
        <!-- 上传区域 -->
        <div class="upload-section">
          <div class="upload-title">添加新照片</div>
          <el-upload
            ref="multiUploadRef"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleMultiImageChange"
            accept="image/*"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG 格式，单张不超过 5MB</div>
        </div>

        <!-- 已上传照片列表 -->
        <div
          class="uploaded-section"
          v-if="tempImageList.length > 0 || (currentHall?.images && currentHall.images.length > 0)"
        >
          <div class="upload-title">
            已选照片 ({{ tempImageList.length + (currentHall?.images?.length || 0) }})
          </div>
          <div class="image-grid">
            <!-- 原有照片 -->
            <div
              v-for="(img, idx) in currentHall?.images"
              :key="'existing-' + idx"
              class="image-item"
            >
              <img :src="img.url" :alt="img.name || '宴会厅照片'" />
              <div class="image-item-actions">
                <el-button link class="preview-btn" @click="previewExistingImage(img.url)">
                  <el-icon><ZoomIn /></el-icon>
                </el-button>
                <el-button link class="delete-btn" @click="removeExistingImage(idx)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <!-- 新上传的临时照片 -->
            <div v-for="(img, idx) in tempImageList" :key="'temp-' + idx" class="image-item">
              <img :src="img.url" alt="新上传照片" />
              <div class="image-item-actions">
                <el-button link class="preview-btn" @click="previewTempImage(img.url)">
                  <el-icon><ZoomIn /></el-icon>
                </el-button>
                <el-button link class="delete-btn" @click="removeTempImage(idx)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-icon><Picture /></el-icon>
          <span>暂无照片，请点击上方区域上传</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="imageManagerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveImages">确认保存</el-button>
      </template>
    </el-dialog>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px" append-to-body>
      <div class="preview-container">
        <img :src="previewUrl" alt="预览图片" />
      </div>
    </el-dialog>

    <!-- 会议管理弹窗 -->
    <el-dialog v-model="showMeetingDialog" title="会议管理" width="800px">
      <el-table :data="meetings" stripe>
        <el-table-column prop="name" label="会议名称" />
        <el-table-column prop="time" label="会议时间" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"
            ><el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag></template
          >
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link @click="editMeeting(row)">编辑</el-button>
            <el-button link class="text-danger" @click="deleteMeeting(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showMeetingDialog = false">关闭</el-button>
        <el-button type="primary" @click="addNewMeeting">新建会议</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Delete,
  Plus,
  Upload,
  Download,
  Location,
  Phone,
  Camera,
  ZoomIn,
  Picture,
} from '@element-plus/icons-vue'
import ConferenceNavigation from '@/components/ConferenceNavigation.vue'

// 类型定义
interface MeetingItem {
  id: number
  index: number
  name: string
  location: string
  time: string
  status: '报名中' | '进行中' | '已结束'
}
interface QuoteItem {
  id: number
  category: string
  project: string
  spec: string
  unit: string
  price: number
  quantity: number
  total: number
  remark: string
}
interface HallImage {
  url: string
  name?: string
  uploadTime?: string
}
interface HallItem {
  id: number
  name: string
  floor: string
  area: number
  capacity: number
  halfDayPrice: number
  fullDayPrice: number
  layout: string
  facilities: string[]
  devices: string[]
  remark: string
  images?: HallImage[]
}
interface MenuItem {
  name: string
  category: string
  quantity: string
  price: number
  remark: string
}
interface ServiceItem {
  project: string
  spec: string
  price: number
  status: string
}
interface GuestItem {
  name: string
  roomType: string
  roomNumber: string
  checkIn: string
  checkOut: string
  status: string
}
interface TransportItem {
  guest: string
  type: string
  date: string
  time: string
  route: string
  vehicle: string
}
interface TempImage {
  url: string
  file: File
}

// 设计事项类型定义
interface DesignItem {
  id: number
  itemName: string
  description: string
  quantity: number
  designer: {
    name: string
    phone: string
  }
  builder: {
    name: string
    phone: string
  }
  status: string
  designPrice: number
  remark: string
}

// 响应式数据
const activeTab = ref('quote')
const selectedHotel = ref('1')
const usageTimeRange = ref(['2025-12-04 07:00:00', '2025-12-04 21:00:00'])
const contacts = ref(['Evan', 'Iris'])
const showMeetingDialog = ref(false)

// 酒店详情数据（根据图片）
const hotelDetail = ref({
  address: '上海市浦东新区张杨路777号',
  contact: '张经理 021-58356666',
  rooms: 30,
  referencePrice: 680,
  contractPrice: 580,
})
const hotelTotalCost = ref(185100)

// 会议列表
const meetings = ref<MeetingItem[]>([
  {
    id: 1,
    index: 1,
    name: '2025第六届上海国际船舶管理论坛',
    location: '中国·上海',
    time: '2025年12月04日 7:00-21:00',
    status: '报名中',
  },
  {
    id: 2,
    index: 2,
    name: '普陀区航运服务集聚区 - 暨港航物流和海事服务产业链合作交流会',
    location: '中国·舟山',
    time: '2025年12月04日 7:00-21:00',
    status: '进行中',
  },
  {
    id: 3,
    index: 3,
    name: '2025世界油商大会',
    location: '中国·舟山',
    time: '2025年12月04日 7:00-21:00',
    status: '已结束',
  },
  {
    id: 4,
    index: 4,
    name: '2025散杂货船舶投资和经营论坛',
    location: '中国·青岛',
    time: '2025年12月04日 7:00-21:00',
    status: '已结束',
  },
])

// 报价清单数据
const quoteList = ref<QuoteItem[]>([
  {
    id: 1,
    category: '住宿',
    project: '标准大床房',
    spec: '含早餐/WiFi',
    unit: '间/晚',
    price: 680,
    quantity: 20,
    total: 13600,
    remark: '4月17-18日',
  },
  {
    id: 2,
    category: '住宿',
    project: '豪华套房',
    spec: '含早餐/行政酒廊',
    unit: '间/晚',
    price: 1500,
    quantity: 5,
    total: 7500,
    remark: '4月17-18日',
  },
  {
    id: 3,
    category: '会场',
    project: '主会议厅',
    spec: '可容纳300人/投影/音响',
    unit: '天',
    price: 25000,
    quantity: 1,
    total: 25000,
    remark: '4月17-18日',
  },
  {
    id: 4,
    category: '会场',
    project: '分会场A',
    spec: '可容纳80人',
    unit: '半天',
    price: 8000,
    quantity: 2,
    total: 16000,
    remark: '4月17-18日',
  },
  {
    id: 5,
    category: '餐饮',
    project: '午餐自助',
    spec: '中西式自助/200人份',
    unit: '餐',
    price: 15000,
    quantity: 1,
    total: 15000,
    remark: '4月17-18日',
  },
  {
    id: 6,
    category: '餐饮',
    project: '茶歇',
    spec: '咖啡/茶/点心',
    unit: '次',
    price: 5000,
    quantity: 2,
    total: 10000,
    remark: '4月17-18日',
  },
  {
    id: 7,
    category: '设备',
    project: 'LED屏租赁',
    spec: 'P3高清/4m×3m',
    unit: '套',
    price: 8000,
    quantity: 1,
    total: 8000,
    remark: '4月17-18日',
  },
  {
    id: 8,
    category: '服务',
    project: '酒店礼仪',
    spec: '6人',
    unit: '人次',
    price: 300,
    quantity: 6,
    total: 1800,
    remark: '4月17-18日',
  },
])

// 会议厅数据（根据图片）
const hallList = ref<HallItem[]>([
  {
    id: 1,
    name: '洲际宴会厅',
    floor: '3F',
    area: 600,
    capacity: 400,
    halfDayPrice: 15000,
    fullDayPrice: 25000,
    layout: '剧院式',
    facilities: ['无线麦克风', 'LED屏幕', '音响系统', '灯光控制系统', '舞台'],
    devices: ['无线麦克风', 'LED屏幕', '音响系统', '灯光控制系统', '舞台'],
    remark: '酒店最大宴会厅，层高8米，可分隔为2个独立厅',
    images: [
      { url: 'https://picsum.photos/400/300?random=1', name: '宴会厅全景' },
      { url: 'https://picsum.photos/400/300?random=2', name: '舞台视角' },
    ],
  },
  {
    id: 2,
    name: '海景厅A',
    floor: '5F',
    area: 200,
    capacity: 120,
    halfDayPrice: 8000,
    fullDayPrice: 14000,
    layout: 'U型',
    facilities: ['无线麦克风', '投影屏', '音响系统', '灯光控制系统'],
    devices: ['无线麦克风', '投影屏', '音响系统', '灯光控制系统'],
    remark: '高端商务洽谈/签约仪式',
    images: [{ url: 'https://picsum.photos/400/300?random=3', name: '海景厅内景' }],
  },
])

// 菜单数据（根据图片）
const teaBreakMenu = ref<MenuItem[]>([
  { name: '现磨咖啡', category: '饮品', quantity: '200杯', price: 25, remark: '美式/拿铁可选' },
  {
    name: '精选茶饮',
    category: '饮品',
    quantity: '200杯',
    price: 18,
    remark: '龙井/铁观音/英式红茶',
  },
  { name: '鲜榨果汁', category: '饮品', quantity: '200杯', price: 22, remark: '橙汁/西瓜汁' },
  { name: '法式可颂', category: '点心', quantity: '200份', price: 15, remark: '原味/巧克力' },
  { name: '水果塔', category: '点心', quantity: '200份', price: 20, remark: '蓝莓/草莓' },
  { name: '三明治', category: '点心', quantity: '200份', price: 18, remark: '火腿芝士/鸡肉牛油果' },
  { name: '时令水果拼盘', category: '水果', quantity: '200盘', price: 80, remark: '' },
  { name: '坚果拼盘', category: '零食', quantity: '200盘', price: 50, remark: '腰果/杏仁/开心果' },
])

const dinnerMenu = ref<MenuItem[]>([
  { name: '洲际迎宾冷盘', category: '冷菜', quantity: '每桌1份', price: 180, remark: '四拼冷盘' },
  { name: '花胶鸡汤', category: '汤品', quantity: '每桌1盅', price: 280, remark: '' },
  { name: '清蒸东星斑', category: '热菜', quantity: '每桌1条', price: 480, remark: '时令价格' },
  { name: '黑松露焗龙虾', category: '热菜', quantity: '每桌1只', price: 520, remark: '' },
  { name: '蜜汁叉烧', category: '热菜', quantity: '每桌6只', price: 160, remark: '' },
  { name: '蒜蓉粉丝蒸扇贝', category: '热菜', quantity: '每桌1份', price: 120, remark: '' },
  { name: '上汤时蔬', category: '热菜', quantity: '每桌1份', price: 68, remark: '' },
  { name: '扬州炒饭', category: '主食', quantity: '每桌1份', price: 58, remark: '' },
  { name: '精品点心双拼', category: '主食', quantity: '每桌1份', price: 68, remark: '虾饺/烧卖' },
  { name: '芒果布丁', category: '甜品', quantity: '每桌1份', price: 48, remark: '' },
  { name: '时令水果拼盘', category: '水果', quantity: '每桌1份', price: 88, remark: '' },
])

// 设计事项数据（根据图片）
const designList = ref<DesignItem[]>([
  {
    id: 1,
    itemName: '主背景墙',
    description: '6m宽*3m高（加20cm包边）',
    quantity: 1,
    designer: { name: 'karl', phone: '17712341520' },
    builder: { name: '博文搭建有限公司', phone: '16612343510' },
    status: '进行中',
    designPrice: 1500,
    remark: '加厚白卡纸·竖式·椰亚膜 穿012银白色三股编',
  },
  {
    id: 2,
    itemName: '签到墙',
    description: '4m宽*3m高（加20cm包边）',
    quantity: 1,
    designer: { name: 'karl', phone: '17712341520' },
    builder: { name: '博文搭建有限公司', phone: '16612343510' },
    status: '定稿',
    designPrice: 1500,
    remark: '',
  },
  {
    id: 3,
    itemName: '讲台包围板',
    description: '两侧0.54m宽*1.22m高/正向0.83m宽*1.22m高',
    quantity: 1,
    designer: { name: 'karl', phone: '17712341520' },
    builder: { name: '博文搭建有限公司', phone: '16612343510' },
    status: '初稿',
    designPrice: 1500,
    remark: '',
  },
  {
    id: 4,
    itemName: '参会牌',
    description: '9cm宽*13cm高',
    quantity: 300,
    designer: { name: 'karl', phone: '17712341520' },
    builder: { name: '淘宝定制', phone: '16612343510' },
    status: '制作中',
    designPrice: 1500,
    remark: '',
  },
  {
    id: 5,
    itemName: '资料袋',
    description: '36cm高*26长*8cm宽',
    quantity: 5,
    designer: { name: '第三方设计', phone: '12345678910' },
    builder: { name: '博文搭建有限公司', phone: '16612343510' },
    status: '制作中',
    designPrice: 1500,
    remark: '',
  },
  {
    id: 6,
    itemName: '设计项打包',
    description: '所有的设计项打包保存',
    quantity: 1,
    designer: { name: '', phone: '' },
    builder: { name: '', phone: '' },
    status: '进行中',
    designPrice: 0,
    remark: '百度网盘链接：www.xxxxxxx.com',
  },
])

// 服务方数据
const buildList = ref<ServiceItem[]>([
  { project: '舞台搭建', spec: '主舞台+LED背景', price: 15000, status: '待搭建' },
])
const photoList = ref<ServiceItem[]>([
  { project: '全程摄影', spec: '3机位+快剪', price: 12000, status: '已确认' },
])
const guestList = ref<GuestItem[]>([
  {
    name: '张三',
    roomType: '标准大床房',
    roomNumber: '1808',
    checkIn: '12-04',
    checkOut: '12-06',
    status: '未入住',
  },
])
const transportList = ref<TransportItem[]>([
  {
    guest: '张三',
    type: '接机',
    date: '12-04',
    time: '10:00',
    route: '浦东机场→酒店',
    vehicle: '别克GL8',
  },
])

// 计算属性
const totalAmount = computed(() => quoteList.value.reduce((sum, item) => sum + item.total, 0))
const designTotalCost = computed(() =>
  designList.value.reduce((sum, item) => sum + (item.designPrice || 0), 0),
)
const costCategories = computed(() => {
  const categories = ['住宿', '会场', '餐饮', '设备', '服务', '其他']
  return categories.map((name) => ({
    name,
    amount: quoteList.value.filter((i) => i.category === name).reduce((s, i) => s + i.total, 0),
  }))
})

// 报价清单弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增项目')
const editingId = ref<number | null>(null)
const formRef = ref()
const formData = ref({
  category: '',
  project: '',
  spec: '',
  unit: '',
  price: 0,
  quantity: 1,
  remark: '',
})
const formRules = {
  category: [{ required: true }],
  project: [{ required: true }],
  price: [{ required: true }],
  quantity: [{ required: true }],
}

// 会议厅弹窗
const hallDialogVisible = ref(false)
const hallDialogTitle = ref('新增会议厅')
const editingHallId = ref<number | null>(null)
const hallFormRef = ref()
const hallForm = ref({
  name: '',
  floor: '',
  area: 0,
  capacity: 0,
  halfDayPrice: 0,
  fullDayPrice: 0,
  layout: '',
  facilities: [] as string[],
  remark: '',
})
const hallRules = {
  name: [{ required: true, message: '请输入会议厅名称' }],
  floor: [{ required: true, message: '请输入楼层' }],
  area: [{ required: true, message: '请输入面积' }],
  capacity: [{ required: true, message: '请输入容纳人数' }],
  halfDayPrice: [{ required: true, message: '请输入半天场租' }],
  fullDayPrice: [{ required: true, message: '请输入全天场租' }],
}

// 茶歇菜单弹窗
const teaBreakDialogVisible = ref(false)
const teaBreakDialogTitle = ref('新增茶歇项')
const teaBreakFormRef = ref()
const teaBreakForm = ref({
  name: '',
  category: '',
  quantity: '',
  price: 0,
  remark: '',
})
const editingTeaBreakIndex = ref<number | null>(null)

// 晚宴菜单弹窗
const dinnerDialogVisible = ref(false)
const dinnerDialogTitle = ref('新增晚宴项')
const dinnerFormRef = ref()
const dinnerForm = ref({
  name: '',
  category: '',
  quantity: '',
  price: 0,
  remark: '',
})
const editingDinnerIndex = ref<number | null>(null)

// 菜单表单校验规则
const menuFormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量/份量', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
}

// 设计事项弹窗
const designDialogVisible = ref(false)
const designDialogTitle = ref('新增设计事项')
const designFormRef = ref()
const editingDesignIndex = ref<number | null>(null)
const designForm = ref({
  itemName: '',
  description: '',
  quantity: 1,
  designerName: '',
  designerPhone: '',
  builderName: '',
  builderPhone: '',
  status: '',
  designPrice: 0,
  remark: '',
})
const designFormRules = {
  itemName: [{ required: true, message: '请输入事项名称', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  designPrice: [{ required: true, message: '请输入设计制作费', trigger: 'blur' }],
}

// 照片管理相关
const imageManagerVisible = ref(false)
const currentHall = ref<HallItem | null>(null)
const tempImageList = ref<TempImage[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

// 辅助函数
const formatNumber = (num: number) => num.toLocaleString()
const getStatusType = (status: string) =>
  ({ 报名中: 'success', 进行中: 'warning', 已结束: 'info' })[status] || ''
const getCategoryTagType = (category: string) =>
  ({ 住宿: 'primary', 会场: 'success', 餐饮: 'warning', 设备: 'danger', 服务: 'info' })[category] ||
  ''
const getDesignStatusType = (status: string) => {
  const map: Record<string, string> = {
    进行中: 'warning',
    定稿: 'success',
    初稿: 'info',
    制作中: 'primary',
    已完成: 'success',
  }
  return map[status] || 'info'
}

// 标签切换
const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

// 会议操作
const handleMeetingChange = (meetingId: number) => {
  console.log('会议切换', meetingId)
}
const editMeeting = (row: MeetingItem) => ElMessage.info(`编辑会议: ${row.name}`)
const deleteMeeting = (row: MeetingItem) =>
  ElMessageBox.confirm(`确定删除"${row.name}"？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = meetings.value.findIndex((m) => m.id === row.id)
      if (idx !== -1) meetings.value.splice(idx, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
const addNewMeeting = () => ElMessage.info('新建会议功能开发中')

// 酒店配置操作
const handleImportHotel = () => ElMessage.info('导入酒店功能开发中')
const handleRemoveHotel = () =>
  ElMessageBox.confirm('确定移除当前酒店？', '提示', { type: 'warning' })
    .then(() => ElMessage.success('已移除'))
    .catch(() => {})
const addContact = () =>
  ElMessageBox.prompt('请输入负责人姓名', '添加对接人')
    .then(({ value }) => {
      if (value) contacts.value.push(value)
    })
    .catch(() => {})
const removeContact = (idx: number) => contacts.value.splice(idx, 1)
const handleExportList = () => ElMessage.success('导出成功')

// 报价清单操作
const handleImportExcel = () => ElMessage.info('导入Excel功能开发中')
const handleAddItem = () => {
  dialogTitle.value = '新增项目'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}
const handleEditItem = (row: QuoteItem) => {
  dialogTitle.value = '编辑项目'
  editingId.value = row.id
  formData.value = { ...row }
  dialogVisible.value = true
}
const handleDeleteItem = (row: QuoteItem) =>
  ElMessageBox.confirm(`确定删除"${row.project}"？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = quoteList.value.findIndex((i) => i.id === row.id)
      if (idx !== -1) quoteList.value.splice(idx, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
const handleDeleteImport = () =>
  ElMessageBox.confirm('确定删除所有导入的项目？', '提示', { type: 'warning' })
    .then(() => {
      quoteList.value = quoteList.value.filter((i) => i.id <= 8)
      ElMessage.success('已删除导入项目')
    })
    .catch(() => {})
const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      const newItem: QuoteItem = {
        ...formData.value,
        id: editingId.value || Math.max(...quoteList.value.map((i) => i.id), 0) + 1,
        total: formData.value.price * formData.value.quantity,
      }
      if (editingId.value) {
        const idx = quoteList.value.findIndex((i) => i.id === editingId.value)
        if (idx !== -1) quoteList.value[idx] = newItem
        ElMessage.success('编辑成功')
      } else {
        quoteList.value.push(newItem)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}
const resetForm = () => {
  formData.value = {
    category: '',
    project: '',
    spec: '',
    unit: '',
    price: 0,
    quantity: 1,
    remark: '',
  }
  formRef.value?.clearValidate()
}

// 会议厅操作
const handleAddHall = () => {
  hallDialogTitle.value = '新增会议厅'
  editingHallId.value = null
  resetHallForm()
  hallDialogVisible.value = true
}
const handleEditHall = (hall: HallItem) => {
  hallDialogTitle.value = '编辑会议厅'
  editingHallId.value = hall.id
  hallForm.value = {
    name: hall.name,
    floor: hall.floor,
    area: hall.area,
    capacity: hall.capacity,
    halfDayPrice: hall.halfDayPrice,
    fullDayPrice: hall.fullDayPrice,
    layout: hall.layout,
    facilities: [...(hall.facilities || hall.devices || [])],
    remark: hall.remark,
  }
  hallDialogVisible.value = true
}
const handleDeleteHall = (hall: HallItem) => {
  ElMessageBox.confirm(`确定删除"${hall.name}"？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = hallList.value.findIndex((h) => h.id === hall.id)
      if (idx !== -1) hallList.value.splice(idx, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
const saveHall = async () => {
  if (!hallFormRef.value) return
  await hallFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const existingHall = editingHallId.value
        ? hallList.value.find((h) => h.id === editingHallId.value)
        : null
      const newHall: HallItem = {
        id: editingHallId.value || Math.max(...hallList.value.map((h) => h.id), 0) + 1,
        ...hallForm.value,
        devices: [...hallForm.value.facilities],
        images: existingHall?.images || [],
      }
      if (editingHallId.value) {
        const idx = hallList.value.findIndex((h) => h.id === editingHallId.value)
        if (idx !== -1) hallList.value[idx] = newHall
        ElMessage.success('编辑成功')
      } else {
        hallList.value.push(newHall)
        ElMessage.success('新增成功')
      }
      hallDialogVisible.value = false
    }
  })
}
const resetHallForm = () => {
  hallForm.value = {
    name: '',
    floor: '',
    area: 0,
    capacity: 0,
    halfDayPrice: 0,
    fullDayPrice: 0,
    layout: '',
    facilities: [],
    remark: '',
  }
  hallFormRef.value?.clearValidate()
}

// 茶歇菜单操作
const openAddTeaBreakDialog = () => {
  teaBreakDialogTitle.value = '新增茶歇项'
  editingTeaBreakIndex.value = null
  resetTeaBreakForm()
  teaBreakDialogVisible.value = true
}
const openEditTeaBreakDialog = (row: MenuItem, index: number) => {
  teaBreakDialogTitle.value = '编辑茶歇项'
  editingTeaBreakIndex.value = index
  teaBreakForm.value = { ...row }
  teaBreakDialogVisible.value = true
}
const saveTeaBreakItem = async () => {
  if (!teaBreakFormRef.value) return
  await teaBreakFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const newItem: MenuItem = { ...teaBreakForm.value }
      if (editingTeaBreakIndex.value !== null) {
        teaBreakMenu.value[editingTeaBreakIndex.value] = newItem
        ElMessage.success('编辑成功')
      } else {
        teaBreakMenu.value.push(newItem)
        ElMessage.success('新增成功')
      }
      teaBreakDialogVisible.value = false
    }
  })
}
const resetTeaBreakForm = () => {
  teaBreakForm.value = {
    name: '',
    category: '',
    quantity: '',
    price: 0,
    remark: '',
  }
  teaBreakFormRef.value?.clearValidate()
}

// 晚宴菜单操作
const openAddDinnerDialog = () => {
  dinnerDialogTitle.value = '新增晚宴项'
  editingDinnerIndex.value = null
  resetDinnerForm()
  dinnerDialogVisible.value = true
}
const openEditDinnerDialog = (row: MenuItem, index: number) => {
  dinnerDialogTitle.value = '编辑晚宴项'
  editingDinnerIndex.value = index
  dinnerForm.value = { ...row }
  dinnerDialogVisible.value = true
}
const saveDinnerItem = async () => {
  if (!dinnerFormRef.value) return
  await dinnerFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const newItem: MenuItem = { ...dinnerForm.value }
      if (editingDinnerIndex.value !== null) {
        dinnerMenu.value[editingDinnerIndex.value] = newItem
        ElMessage.success('编辑成功')
      } else {
        dinnerMenu.value.push(newItem)
        ElMessage.success('新增成功')
      }
      dinnerDialogVisible.value = false
    }
  })
}
const resetDinnerForm = () => {
  dinnerForm.value = {
    name: '',
    category: '',
    quantity: '',
    price: 0,
    remark: '',
  }
  dinnerFormRef.value?.clearValidate()
}

// 设计事项操作
const handleImportDesignExcel = () => ElMessage.info('导入Excel功能开发中')
const handleDeleteDesignImport = () =>
  ElMessageBox.confirm('确定删除所有导入的设计事项？', '提示', { type: 'warning' })
    .then(() => {
      designList.value = designList.value.filter((item) => item.id <= 6)
      ElMessage.success('已删除导入事项')
    })
    .catch(() => {})
const openAddDesignDialog = () => {
  designDialogTitle.value = '新增设计事项'
  editingDesignIndex.value = null
  resetDesignForm()
  designDialogVisible.value = true
}
const openEditDesignDialog = (row: DesignItem, index: number) => {
  designDialogTitle.value = '编辑设计事项'
  editingDesignIndex.value = index
  designForm.value = {
    itemName: row.itemName,
    description: row.description,
    quantity: row.quantity,
    designerName: row.designer.name,
    designerPhone: row.designer.phone,
    builderName: row.builder.name,
    builderPhone: row.builder.phone,
    status: row.status,
    designPrice: row.designPrice,
    remark: row.remark,
  }
  designDialogVisible.value = true
}
const deleteDesignItem = (index: number) => {
  ElMessageBox.confirm(`确定删除"${designList.value[index].itemName}"？`, '提示', {
    type: 'warning',
  })
    .then(() => {
      designList.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
const saveDesignItem = async () => {
  if (!designFormRef.value) return
  await designFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const newItem: DesignItem = {
        id:
          editingDesignIndex.value !== null
            ? designList.value[editingDesignIndex.value].id
            : Math.max(...designList.value.map((i) => i.id), 0) + 1,
        itemName: designForm.value.itemName,
        description: designForm.value.description,
        quantity: designForm.value.quantity,
        designer: {
          name: designForm.value.designerName,
          phone: designForm.value.designerPhone,
        },
        builder: {
          name: designForm.value.builderName,
          phone: designForm.value.builderPhone,
        },
        status: designForm.value.status,
        designPrice: designForm.value.designPrice,
        remark: designForm.value.remark,
      }
      if (editingDesignIndex.value !== null) {
        designList.value[editingDesignIndex.value] = newItem
        ElMessage.success('编辑成功')
      } else {
        designList.value.push(newItem)
        ElMessage.success('新增成功')
      }
      designDialogVisible.value = false
    }
  })
}
const resetDesignForm = () => {
  designForm.value = {
    itemName: '',
    description: '',
    quantity: 1,
    designerName: '',
    designerPhone: '',
    builderName: '',
    builderPhone: '',
    status: '',
    designPrice: 0,
    remark: '',
  }
  designFormRef.value?.clearValidate()
}

// 照片管理操作
const handleOpenImageManager = (hall: HallItem) => {
  currentHall.value = hall
  tempImageList.value = []
  imageManagerVisible.value = true
}

const handleMultiImageChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    tempImageList.value.push({
      url: e.target?.result as string,
      file: file.raw,
    })
  }
  reader.readAsDataURL(file.raw)
}

const removeExistingImage = (idx: number) => {
  if (currentHall.value && currentHall.value.images) {
    currentHall.value.images.splice(idx, 1)
  }
}

const removeTempImage = (idx: number) => {
  tempImageList.value.splice(idx, 1)
}

const previewExistingImage = (url: string) => {
  previewUrl.value = url
  previewVisible.value = true
}

const previewTempImage = (url: string) => {
  previewUrl.value = url
  previewVisible.value = true
}

const handlePreviewImage = (hall: HallItem, imgIdx: number) => {
  if (hall.images && hall.images[imgIdx]) {
    previewUrl.value = hall.images[imgIdx].url
    previewVisible.value = true
  }
}

const resetImageManager = () => {
  tempImageList.value = []
  currentHall.value = null
}

const confirmSaveImages = () => {
  if (currentHall.value) {
    // 添加新上传的图片
    const newImages = tempImageList.value.map((temp, idx) => ({
      url: temp.url,
      name: `宴会厅照片_${Date.now()}_${idx}`,
      uploadTime: new Date().toISOString(),
    }))

    if (!currentHall.value.images) {
      currentHall.value.images = []
    }
    currentHall.value.images.push(...newImages)

    ElMessage.success(`成功保存 ${newImages.length} 张照片`)
    imageManagerVisible.value = false
    tempImageList.value = []
  }
}

// 服务方操作
const handleAddBuildItem = () =>
  buildList.value.push({ project: '新项目', spec: '', price: 0, status: '待搭建' })
const handleAddPhotoItem = () =>
  photoList.value.push({ project: '新服务', spec: '', price: 0, status: '待确认' })
const handleAddGuest = () =>
  guestList.value.push({
    name: '新嘉宾',
    roomType: '标准间',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    status: '未入住',
  })
const handleAddTransport = () =>
  transportList.value.push({ guest: '', type: '接机', date: '', time: '', route: '', vehicle: '' })
</script>

<style scoped>
.agenda-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 10px;
}
.hotel-config-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.hotel-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hotel-selector .label {
  font-size: 14px;
  color: #666;
}
.hotel-select {
  width: 240px;
}
.import-btn {
  color: #1890ff;
}
.remove-btn {
  color: #ff4d4f;
}
.hotel-status {
  display: flex;
  align-items: center;
  gap: 12px;
}
.config-body {
  padding: 10px;
}
.config-row {
  display: flex;
  gap: 40px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.config-item .label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}
.time-range-picker {
  width: 380px;
}
.contact-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.contact-tag {
  background: #f5f5f5;
  border: none;
}
.add-contact-btn {
  color: #1890ff;
}
.export-list-btn {
  color: #52c41a;
}
.hotel-detail-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
}
.hotel-address,
.hotel-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}
.hotel-rooms {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 14px;
}
.price-info {
  color: #fa8c16;
}
.contract-price {
  color: #52c41a;
  font-weight: 500;
}
.total-cost {
  margin-left: auto;
}
.total-cost .label {
  font-size: 14px;
  color: #666;
}
.total-cost .cost-value {
  font-size: 20px;
  font-weight: 600;
  color: #fa8c16;
}
.tabs-nav {
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  padding: 0 20px;
}
.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
}
.custom-tabs :deep(.el-tabs__active-bar) {
  background-color: #1890ff;
}
.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #1890ff;
}
.tabs-content {
  background: white;
  border-radius: 16px;
  padding: 20px;
  min-height: 500px;
}
.cost-overview {
  margin-bottom: 20px;
}
.cost-cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
}
.cost-card {
  flex: 1;
  min-width: 120px;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}
.cost-card:hover {
  border-color: #1890ff;
}
.card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-name {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}
.card-amount {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
.total-card .card-amount {
  color: #fa8c16;
  font-size: 20px;
}
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-add-item {
  background: #1890ff;
  border-color: #1890ff;
}
.quote-table-wrapper {
  overflow-x: auto;
}
.btn-edit-table {
  color: #1890ff;
}
.btn-delete-table {
  color: red;
}

/* 会议厅信息 */
.hall-info-content {
  display: flex;
  gap: 24px;
}

.hall-card-detail {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.hall-card-detail:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.hall-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.hall-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hall-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.hall-floor {
  font-size: 13px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 10px;
  border-radius: 12px;
}

.hall-actions {
  display: flex;
  gap: 4px;
}

.hall-edit-btn {
  color: #1890ff;
  padding: 4px;
}

.hall-delete-btn {
  color: #ff4d4f;
  padding: 4px;
}

/* 信息网格 - 两列布局 */
.hall-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.detail-item-full {
  grid-column: span 2;
}

.detail-label {
  width: 44px;
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #333;
  flex: 1;
  line-height: 1.5;
}

/* 画廊样式 */
.hall-gallery {
  margin: 16px 0;
  border-radius: 8px;
  background: #fafafa;
  padding: 12px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.gallery-title {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.add-photo-btn {
  color: #1890ff;
  font-size: 12px;
}

.gallery-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.gallery-item {
  position: relative;
  width: 100px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e8e8e8;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item .image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.image-overlay .el-icon {
  color: white;
  font-size: 24px;
}

.gallery-add-more {
  width: 100px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.gallery-add-more:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.gallery-add-more .el-icon {
  font-size: 20px;
  color: #999;
}

.gallery-add-more span {
  font-size: 10px;
  color: #999;
}

.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.gallery-empty:hover {
  background: #e8e8e8;
}

.gallery-empty .el-icon {
  font-size: 32px;
  color: #999;
}

.gallery-empty span {
  font-size: 12px;
  color: #999;
}

/* 费用信息行 */
.hall-price-row {
  display: flex;
  gap: 32px;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  margin: 0 -20px -20px -20px;
  padding: 16px 20px;
  border-radius: 0 0 12px 12px;
}

.price-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.price-label {
  font-size: 13px;
  color: #666;
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: #fa8c16;
}

/* 菜单卡片样式 */
.menu-info-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.menu-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8edf2;
  overflow: hidden;
  transition: all 0.2s;
}

.menu-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.menu-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e8edf2;
}

.menu-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-card-title .title-icon {
  font-size: 22px;
}

.menu-card-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.menu-card-title .menu-count {
  font-size: 13px;
  color: #8c8f9e;
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 20px;
}

.menu-card-body {
  padding: 0;
}

.menu-table {
  width: 100%;
}

.menu-table :deep(.el-table__header th) {
  background-color: #f8f9fa;
  color: #5a5e6e;
  font-weight: 500;
  font-size: 13px;
}

.menu-table :deep(.el-table__body td) {
  font-size: 13px;
  color: #2c3e50;
}

.edit-btn {
  color: #1890ff;
  padding: 4px 6px;
}

.delete-btn {
  color: #ff4d4f;
  padding: 4px 6px;
}

/* 设计事项样式 */
.design-content {
  width: 100%;
}

.design-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.total-cost-badge {
  font-size: 14px;
  color: #666;
  background: #f5f7fa;
  padding: 6px 14px;
  border-radius: 20px;
}

.total-cost-badge .total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #fa8c16;
  margin-left: 4px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.import-excel-btn {
  border-color: #1890ff;
  color: #1890ff;
}

.delete-import-btn {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.design-table-wrapper {
  overflow-x: auto;
}

.design-table {
  width: 100%;
}

.design-table :deep(.el-table__header th) {
  background-color: #f8f9fa;
  color: #5a5e6e;
  font-weight: 500;
  font-size: 13px;
}

.design-table :deep(.el-table__body td) {
  font-size: 13px;
  color: #2c3e50;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-phone {
  font-size: 12px;
  color: #8c8f9e;
}

/* 照片管理弹窗样式 */
.image-manager {
  padding: 8px;
}

.upload-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.upload-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

.uploaded-section {
  margin-top: 8px;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-item {
  position: relative;
  width: 140px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-item-actions {
  opacity: 1;
}

.preview-btn {
  color: white;
  padding: 2px;
}

.delete-btn {
  color: #ff4d4f;
  padding: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  background: #fafafa;
  border-radius: 8px;
  color: #999;
}

.empty-state .el-icon {
  font-size: 48px;
}

/* 预览弹窗样式 */
.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-container img {
  max-width: 100%;
  max-height: 600px;
  border-radius: 8px;
}

.service-content,
.guest-stay-content,
.transport-content {
  width: 100%;
}
.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.text-danger {
  color: #ff4d4f;
}
.el-form-item--label-right .el-form-item__label {
  display: flex;
  justify-content: flex-start;
  text-align: left;
}
.el-form-item__label {
  padding: 0 2px 0 0px !important;
}
</style>
