<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
import resize from '@/utils/mixins/resize'
import { useEcharts } from '@/utils/echarts'

export default {
  name: 'ProjectTrendChart',
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
        // 监听统计数据，确保折线同步更新
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
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/legend'),
        () => import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/component/axisPointer'),
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

      // 按日期拆分创建与发布数量
      const categories = data.map(item => item.date)
      const createdValues = data.map(item => item.created)
      const publishedValues = data.map(item => item.published)

      this.chart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: 32,
          left: '3%',
          right: '4%',
          bottom: 40,
          containLabel: true
        },
        legend: {
          top: 0,
          data: [
            this.$t('dashboard.projectTrendCreated'),
            this.$t('dashboard.projectTrendPublished')
          ]
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
            name: this.$t('dashboard.projectTrendCreated'),
            type: 'line',
            smooth: true,
            showSymbol: false,
            areaStyle: {
              opacity: 0.15
            },
            data: createdValues
          },
          {
            name: this.$t('dashboard.projectTrendPublished'),
            type: 'line',
            smooth: true,
            showSymbol: false,
            areaStyle: {
              opacity: 0.25
            },
            data: publishedValues
          }
        ]
      })
    }
  }
}
</script>
