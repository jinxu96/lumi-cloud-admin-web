<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
import resize from '@/utils/mixins/resize'
import { useEcharts } from '@/utils/echarts'

export default {
  name: 'MaterialUsageChart',
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '320px'
    },
    chartData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null,
      echarts: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        // 使用榜单更新时刷新饼图
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    async initChart() {
      const echarts = await useEcharts([
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/chart/pie'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/tooltip'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/legend'),
        () => import(/* webpackChunkName: "echarts-theme" */ 'echarts/theme/macarons')
      ])

      this.echarts = echarts
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions(data = []) {
      if (!this.chart) {
        return
      }

      const limitedData = data.slice(0, 10).map(item => ({
        name: item.name,
        value: item.project_count
      }))

      // 饼图展示 Top10 分类的占比与数量
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 0,
          top: 'middle'
        },
        series: [
          {
            name: this.$t('dashboard.materialUsageTitle'),
            type: 'pie',
            radius: ['35%', '70%'],
            center: ['40%', '50%'],
            roseType: false,
            itemStyle: {
              borderRadius: 4
            },
            label: {
              formatter: '{b}\n{c}'
            },
            data: limitedData
          }
        ]
      })
    }
  }
}
</script>
