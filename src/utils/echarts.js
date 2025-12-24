let echartsPromise = null

/**
 * Lazily load ECharts core and any side-effect modules.
 * @param {Array<Function>} loaders Functions returning dynamic import promises.
 * @returns {Promise<*>} resolved echarts instance.
 */
export function useEcharts(loaders = []) {
  if (!echartsPromise) {
    echartsPromise = import(/* webpackChunkName: "echarts-core" */ 'echarts/lib/echarts').then(module => module.default || module)
  }

  const tasks = [echartsPromise]
  loaders.forEach(loader => {
    if (typeof loader === 'function') {
      tasks.push(loader())
    }
  })

  return Promise.all(tasks).then(results => results[0])
}
