<!-- echartscom.vue -->
<template>
  <div class="charttest">
    <div style="width:400px;height:400px;" :id="echarts" class="echarts" ref="echarts">
    </div>
  </div>
</template>
 
<script>
  import echarts from 'echarts'
  export default {
    name:'echartscom',
    props: {
      //父组件传过来的定义值
      chartData: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
      };
    },
    methods: {
      //定义方法
      drawCharts() {
        //获取ID
        var myChart = echarts.init(document.getElementById(this.echarts));
        //设置数据
        myChart.setOption({
          //定义浮标格式
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          activeTimeGap: 3000,
          ringAnimation () {
      let { activeIndex, getRingOption, chart, getRealRadius } = this

      const radius = getRealRadius()
      const active = getRealRadius(true)

      const option = getRingOption()

      const { data } = option.series[0]

      data.forEach((dataItem, i) => {
        if (i === activeIndex) {
          dataItem.radius = active
        } else {
          dataItem.radius = radius
        }
      })

      chart.setOption(option, true)

      const { activeTimeGap } = option.series[0]

      this.animationHandler = setTimeout(foo => {
        activeIndex += 1

        if (activeIndex >= data.length) activeIndex = 0

        this.activeIndex = activeIndex

        this.ringAnimation()
      }, activeTimeGap)
    }, getRealRadius (active = false) {
      const { mergedConfig, chart } = this

      const { radius, activeRadius, lineWidth } = mergedConfig

      const maxRadius = Math.min(...chart.render.area) / 2

      const halfLineWidth = lineWidth / 2

      let realRadius = active ? activeRadius : radius

      if (typeof realRadius !== 'number') realRadius = parseInt(realRadius) / 100 * maxRadius

      const insideRadius = realRadius - halfLineWidth
      const outSideRadius = realRadius + halfLineWidth

      return [insideRadius, outSideRadius]
    },
          // legend: {
          //   orient: 'vertical',
          //   x: 'left',
          //   // data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
          // },
          series: [
            {
              name: '访问来源',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                //文字显示到内部
                normal: {
                  show: false,
                  position: 'center'
                },
                //定义文字格式
                emphasis: {
                  show: true,
                  textStyle: {
                    fontSize: '30',
                    fontWeight: 'bold'
                  }
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data: this.chartData
              
            }
            
          ]
        });
      }
    },
    computed: {
      echarts() {
        return 'echarts' + Math.random() * 100000;
      }
    },
    mounted() {
      this.drawCharts();
    },
    components: {}
  };
</script>
 
<style></style>