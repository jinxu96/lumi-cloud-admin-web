<template>
  <div class="dashboard-container">

    <el-card class="admin-tip">
      {{ $t('dashboard.now_time', {
        nickname: nickname,
        nowTimeCall: nowTimeCall,
        nowTime: nowTime
      }) }}
    </el-card>

    <panel-group v-if="canViewStats" />

    <!-- 控制台趋势分析图表区域 -->
    <template v-if="canViewAnalytics">
      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="24">
          <div v-loading="analyticsLoading" class="chart-wrapper">
            <div class="chart-title">{{ $t('dashboard.userTrendTitle') }}</div>
            <user-trend-chart :chart-data="analytics.userTrend" height="320px" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="24">
          <div v-loading="analyticsLoading" class="chart-wrapper">
            <div class="chart-title">{{ $t('dashboard.projectTrendTitle') }}</div>
            <project-trend-chart :chart-data="analytics.projectTrend" height="320px" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="12">
          <div v-loading="analyticsLoading" class="chart-wrapper">
            <div class="chart-title">{{ $t('dashboard.topTemplatesTitle') }}</div>
            <top-templates-chart :chart-data="analytics.topTemplates" height="360px" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <div v-loading="analyticsLoading" class="chart-wrapper">
            <div class="chart-title">{{ $t('dashboard.materialUsageTitle') }}</div>
            <material-usage-chart :chart-data="analytics.materialUsage" height="320px" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="24">
          <div v-loading="analyticsLoading" class="chart-wrapper">
            <div class="chart-title">{{ $t('dashboard.machineUsageTitle') }}</div>
            <machine-usage-chart :chart-data="analytics.machineUsage" height="360px" />
          </div>
        </el-col>
      </el-row>
    </template>

    <component :is="currentSystem" />
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import PanelGroup from './components/PanelGroup'
import SystemTable from './components/SystemTable'
import UserTrendChart from './components/UserTrendChart'
import ProjectTrendChart from './components/ProjectTrendChart'
import TopTemplatesChart from './components/TopTemplatesChart'
import MaterialUsageChart from './components/MaterialUsageChart'
import MachineUsageChart from './components/MachineUsageChart'
import { getAnalytics as getDashboardAnalytics } from '@/api/dashboard'

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    SystemTable,
    UserTrendChart,
    ProjectTrendChart,
    TopTemplatesChart,
    MaterialUsageChart,
    MachineUsageChart
  },
  data() {
    return {
      nickname: '',

      nowTime: '',
      nowTimeCall: this.$t('dashboard.night'),

      timer: '',

      currentSystem: 'SystemTable',

      // 控制台统计与趋势分析权限
      canViewStats: false,
      canViewAnalytics: false,
      analyticsLoading: false,
      analyticsParams: {
        days: 30
      },
      // 统一缓存图表使用的数据结构
      analytics: {
        userTrend: [],
        projectTrend: [],
        topTemplates: [],
        materialUsage: [],
        machineUsage: []
      }
    }
  },
  created() {
    const thiz = this

    this.nickname = this.$store.getters.nickname
    if (!this.nickname) {
      setTimeout(function() {
        thiz.getNickname()
      }, 5000)
    }

    this.timer = setInterval(this.setNowTime, 1000)

    if (!checkPermission(['larke-admin.system.info'])) {
      this.currentSystem = ''
    }

    this.canViewStats = checkPermission(['app-admin.dashboard.stats'])
    this.canViewAnalytics = checkPermission(['app-admin.dashboard.analytics'])
    if (this.canViewAnalytics) {
      this.fetchAnalytics()
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    dateFilter(date) {
      if (date < 10) {
        return '0' + date
      }
      return date
    },
    getNowTime() {
      var dateObj = new Date()
      var year = dateObj.getFullYear()
      var month = dateObj.getMonth() + 1
      var date = dateObj.getDate()
      var day = dateObj.getDay()
      var weeks = [
        this.$t('dashboard.sunday'),
        this.$t('dashboard.monday'),
        this.$t('dashboard.tuesday'),
        this.$t('dashboard.wednesday'),
        this.$t('dashboard.thursdday'),
        this.$t('dashboard.friday'),
        this.$t('dashboard.saturday')
      ]
      var week = weeks[day]
      var hour = dateObj.getHours()
      var minute = dateObj.getMinutes()
      var second = dateObj.getSeconds()
      var timeValue = '' + (
        (hour >= 12)
          ? ((hour >= 18) ? this.$t('dashboard.night') : this.$t('dashboard.afternoon'))
          : ((hour >= 8) ? this.$t('dashboard.morning') : this.$t('dashboard.midnight'))
      )
      var nowTime = this.$t('dashboard.now_time_show', {
        year: this.dateFilter(year),
        month: this.dateFilter(month),
        day: this.dateFilter(date),
        hour: this.dateFilter(hour),
        minute: this.dateFilter(minute),
        second: this.dateFilter(second),
        week: week
      })
      return [nowTime, timeValue]
    },
    setNowTime() {
      const nowTime = this.getNowTime()
      this.nowTime = nowTime[0]
      this.nowTimeCall = nowTime[1]
    },
    getNickname() {
      this.nickname = this.$store.getters.nickname
    },
    async fetchAnalytics() {
      this.analyticsLoading = true
      try {
        // 控制台趋势分析
        const response = await getDashboardAnalytics(this.analyticsParams)
        const data = response.data || {}
        // 各图表按接口字段拆分数据来源
        this.analytics.userTrend = data.user_trend || []
        this.analytics.projectTrend = data.project_trend || []
        this.analytics.topTemplates = data.top_templates || []
        this.analytics.materialUsage = data.material_usage || []
        this.analytics.machineUsage = data.machine_usage || []
      } catch (error) {
        console.error('Failed to load dashboard analytics', error)
      } finally {
        this.analyticsLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    .chart-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
