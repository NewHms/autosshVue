<template>
    <div :id="id" style="width:200%;height:100%"></div>
</template>
<script>
import echarts from 'echarts'
export default {
    name: 'echartsLine',
    //定义传入参数名，及参数类型
    props: {
        id: String,
        time: Array,
        opData: Array,
        unit: String,
        title: Array,
    },
    mounted(){
        this.echarts_init()
    },
    watch: {
        time: {
            handler(newName, oldName){
                this.echarts_init()
            }
        },
        opData: {
            handler(newName, oldName){
                this.echarts_init()
            }
        }
    },
    methods: {
        echarts_init(){
            let chartView = echarts.init(document.getElementById(this.id))
            //alert(document.getElementById(this.id))
            chartView.setOption({
                backgroundColor:'',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                },
                legend: {
                    data: this.title,
                    y: 'bottom',
                    orient: 'horizontal', // 'vertical' vertical:竖着显示  horizontal横着显示
                    x: '30%', // 'center' | 'left' | {number},
                    y: 'top', // 'center' | 'bottom' | {number} 
                    //borderWidth: 4, //线框宽度
                    padding: 1,
                    itemGap: 5,
                    icon: 'line',
                    textStyle: {
                      fill: '#fff'
                    }
                },
                grid: {
                    left: '10%', //距离左边距
                    right: '5%', //距离右边距
                    top: '15%',  //距上边距
                    bottom: '5%', //距离下边距
                    containLabel:true,
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        axisLine: {
                            style: {
                                stroke: '#999'
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                // 设置y轴颜色
                                color: '#F8F8FF'
                            }
                        },
                        axisLabel: {
                            //interval: 2, 设置间隔
                            style: {
                                fill: '#999'
                            }
                        },
                        axisTick: {
                            show: true
                        },
                        data: this.time
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name:  this.unit,
                        splitLine:{show: false},
                        axisTick:{       //y轴刻度线
                            "show":false
                        },
                        axisLine: {
                            lineStyle: {
                                // 设置y轴颜色
                                color: '#F8F8FF'
                            }
                        },
                    }
                ],
                series: this.opData
            })
            window.addEventListener('resize', function(){
                chartView.resize();
            })
        }
    },
    beforrDestroy(){
        if(this.chartView){
            this.chartView.clear()
        }
    }
}
</script>