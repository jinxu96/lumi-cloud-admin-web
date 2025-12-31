<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
import resize from '@/utils/mixins/resize'
import { useEcharts } from '@/utils/echarts'

export default {
  name: 'TopTemplatesChart',
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
        // 榜单数据变化时刷新柱状图
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

      const limitedData = data.slice(0, 10)
      // 横轴为下载与点赞数，纵轴保留模板标题
      const categories = limitedData.map(item => item.title)
      const downloadValues = limitedData.map(item => item.downloads_count)
      const likeValues = limitedData.map(item => item.likes_count)

      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          top: 0,
          data: [
            this.$t('dashboard.templateDownloads'),
            this.$t('dashboard.templateLikes')
          ]
        },
        grid: {
          top: 36,
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
            name: this.$t('dashboard.templateDownloads'),
            type: 'bar',
            barMaxWidth: 18,
            data: downloadValues
          },
          {
            name: this.$t('dashboard.templateLikes'),
            type: 'bar',
            barMaxWidth: 18,
            data: likeValues
          }
        ]
      })
    }
  }
}
</script>
