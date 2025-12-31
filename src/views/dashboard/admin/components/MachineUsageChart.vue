<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
import resize from '@/utils/mixins/resize'
import { useEcharts } from '@/utils/echarts'

export default {
  name: 'MachineUsageChart',
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
        // 机器榜单变化时同步柱状图
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
      // 按机器名称输出引用次数
      const categories = limitedData.map(item => item.machine_name || this.$t('dashboard.unknownMachine'))
      const values = limitedData.map(item => item.project_count)

      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: 32,
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
            name: this.$t('dashboard.machineUsageTitle'),
            type: 'bar',
            barMaxWidth: 18,
            data: values
          }
        ]
      })
    }
  }
}
</script>
