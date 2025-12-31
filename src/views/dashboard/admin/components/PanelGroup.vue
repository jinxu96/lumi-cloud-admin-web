<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.admins') }}
          </div>
          <count-to
            :start-val="0"
            :end-val="admins"
            :duration="2600"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-paperclip">
          <i class="el-icon-paperclip card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.attachments') }}
          </div>
          <count-to
            :start-val="0"
            :end-val="attachments"
            :duration="3000"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-user">
          <i class="el-icon-user card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.users') }}
          </div>
          <count-to
            :start-val="0"
            :end-val="users"
            :duration="3200"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-operation">
          <i class="el-icon-s-operation card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ $t('dashboard.groups') }}
          </div>
          <count-to
            :start-val="0"
            :end-val="groups"
            :duration="3600"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import checkPermission from '@/utils/permission'
import { getStats as getDashboardStats } from '@/api/dashboard'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      admins: 0,
      attachments: 0,
      users: 0,
      groups: 0
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      if (!checkPermission(['app-admin.dashboard.stats'])) {
        return
      }

      // 控制台统计数据聚合请求
      const response = await getDashboardStats()
      const stats = response.data || {}
      this.admins = stats.admin_total || 0
      this.attachments = stats.attachment_total || 0
      this.users = stats.user_total || 0
      this.groups = stats.auth_group_total || 0
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-paperclip {
        background: #36a3f7;
      }

      .icon-operation {
        background: #f4516c;
      }

      .icon-user {
        background: #7d68ff;
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-paperclip {
      color: #36a3f7;
    }

    .icon-operation {
      color: #f4516c;
    }

    .icon-user {
      color: #7d68ff;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
