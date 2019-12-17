<!-- index.vue -->
<template>
  <div style="height: 250px">
    <echartsLine
      id="echartsLine"
      :time="timeData"
      :opData="opDiskData"
      :unit="diskUnit"
      :title="diskTitle">
    </echartsLine>
  </div>
</template>
 
<script>
import echarts from 'echarts'
import echartsLine from '@/components/MyEcharts/echarts-line.vue'
  export default {
    data() {
      return {
        diskUnit  : '',
        timeData  : [1,2,3,4,5,6],
        opDiskData :  [
          { 
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(55, 162, 218, 0.6)'
                }, {
                    offset: 1,
                    color: 'rgba(55, 162, 218, 0)'
                }])
            },
            symbolSize:5,
            // 设置拐点为实心圆
            symbol:'circle',
            color: 'rgba(55, 162, 218, 0.6)',
            itemStyle:{
              normal:{
                // // 拐点上显示数值
                // label : {
                // show: true
                // },
                lineStyle:{                 
                  width:1,  // 设置线宽
                  type:'solid',  //'dotted'虚线 'solid'实线
                  color: 'rgba(55, 162, 218, 0.6)'
                }
              }
            },
            type: 'line',
            name: '设备完好率',
            data: [
              1,2,3,4,5,6
            ],
          }  
        ],
        diskTitle : [1,2,3,4,5,6]
      }
        
    },
    methods: {
    },
    mounted() {},
    components: {
      echartsLine
    }
  };
</script>
 
<style>
  .test{
    float: left;
  }
</style>