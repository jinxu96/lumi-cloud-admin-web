<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
import resize from '@/utils/mixins/resize'
import { useEcharts } from '@/utils/echarts'

export default {
  name: 'UserTrendChart',
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
      default: '300px'
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
        // 数据变更时重新绘制趋势线
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
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/chart/line'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/tooltip'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/grid'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/dataZoom'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/axisPointer'),
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

      // 拆解日期与新增用户数量
      const categories = data.map(item => item.date)
      const values = data.map(item => item.new_users)

      this.chart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: 24,
          left: '3%',
          right: '4%',
          bottom: 40,
          containLabel: true
        },
        legend: {
          top: 0,
          right: 0,
          data: [this.$t('dashboard.userTrendLegend')]
        },
        dataZoom: [
          {
            type: 'slider',
            height: 18,
            bottom: 8,
            start: 0,
            end: data.length > 0 ? 100 : 0
          },
          {
            type: 'inside'
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: [
          {
            name: this.$t('dashboard.userTrendLegend'),
            type: 'line',
            smooth: true,
            areaStyle: {
              opacity: 0.2
            },
            showSymbol: false,
            data: values
          }
        ]
      })
    }
  }
}
</script>
