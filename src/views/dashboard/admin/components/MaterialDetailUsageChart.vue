<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
import resize from '@/utils/mixins/resize'
import { useEcharts } from '@/utils/echarts'

export default {
  name: 'MaterialDetailUsageChart',
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
      default: '360px'
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
        // 材料使用榜单更新时刷新柱状图
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
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/chart/bar'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/tooltip'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/grid'),
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

      const rawData = Array.isArray(data) ? data : []
      const limitedData = rawData.slice(0, 10)
      const fallbackName = this.$t('dashboard.unknownMaterial')
      const fallbackCode = this.$t('dashboard.unknownMaterialCode')
      const categories = limitedData.map(item => item.material_name || fallbackName)
      const projectValues = limitedData.map(item => Number(item.project_count) || 0)

      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => {
            if (!params || !params.length) {
              return ''
            }
            const param = params[0]
            const source = limitedData[param.dataIndex] || {}
            const name = source.material_name || fallbackName
            const code = source.material_code || fallbackCode
            return `${name}<br/>${this.$t('dashboard.materialDetailUsageSeries')}: ${param.value}<br/>${this.$t('dashboard.materialCodeLabel')}: ${code}`
          }
        },
        legend: {
          show: false
        },
        grid: {
          top: 24,
          left: '3%',
          right: '4%',
          bottom: 24,
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          inverse: true,
          axisTick: { show: false },
          data: categories
        },
        series: [
          {
            name: this.$t('dashboard.materialDetailUsageSeries'),
            type: 'bar',
            barMaxWidth: 18,
            data: projectValues,
            label: {
              show: true,
              position: 'right'
            }
          }
        ]
      })
    }
  }
}
</script>
