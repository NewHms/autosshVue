<template >
  <div class="dv-full-screen-container">   
    <div id="top-header" >
        <dv-decoration-8 class="header-left-decoration" />
        <dv-decoration-5 class="header-center-decoration" />
        <dv-decoration-8 class="header-right-decoration" :reverse="true" />
        <div class="center-title">监控大屏</div> 
    </div>
    <div  class="chart-container4">
      <dv-border-box-2>
        <el-button type="text" prefix-icon="el-icon-search" @click="goToDateRange()"  
        style="font-size: 15px;color: #F8F8FF;margin-left: 20px;margin-top: -5px;">返回</el-button>
      </dv-border-box-2>
    </div>  
    <div id="digital-flop" class="main-content">
      <div>
        <div
          class="digital-flop-item"
          v-for="item in digitalFlopData"
          :key="item.title">
          <div class="digital-flop-title">{{ item.title }}
          </div>
            <div class="digital-flop">
              <dv-digital-flop
                :config="item.number"
                style="width:85%;height:50px;display:inline-block;"/> 
              <div class="unit">{{ item.unit }}</div>
            </div>
        </div>
        <dv-decoration-10  style="width:100%;height:10px;"/>
      </div>  
      <el-container >
        <el-aside width="20%"><dv-scroll-ranking-board :config="config" style="width: 400px;margin-left: 10px;height:500px"/></el-aside>
        <!--  -->
        <!-- <el-main style="height:85%"> -->
        <el-main width="60%">   
          <div> 
            <div 
              class="echartsClass"
              v-for="item in test"
              :key="item.title">
              <dv-border-box-6 style="height:200%;">
                <div class="lineClass">
                  <div class="alarmClass">
                    {{item.title}}
                  </div>
                  <div class="alarmClass2">
                    <dv-decoration-3 style="width:100px;height:10px;float:right;" />
                  </div>
                  <div style="margin-top:20px;height:150px">
                    <echartsLine
                      :id="item.title"
                      :time="timeData"
                      :opData= "item.opDiskData"
                      :unit="diskUnit"
                      :title="diskTitle">
                    </echartsLine>
                  </div>
                </div>
                
              </dv-border-box-6>
              
            </div>          
          </div>
        </el-main>
        <el-aside width="20%" style="margin-right: 10px;"><dv-scroll-board :config="config2" style="width: 300px;margin-right: 50px;height:500px;margin-top: 10px;"/> </el-aside>
      </el-container>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import echartscom from '@/components/MyEcharts/index.vue'
import echarts from 'echarts'
import echartsLine from '@/components/MyEcharts/echarts-line.vue'
export default {
  
  data() {
    return { 
        diskUnit  : '',
        timeData  : ['5/12','6/12','7/12','8/12','9/12'],
        test: [
          
         {
          title : '表空间增长趋势4',
          opDiskData :  [
          {
            type: 'line',
            name: '192.100',
            data: [
              10,20,30
            ],
          } ,
          { 
            type: 'line',
            name: '192.112',
            data: [
              8,12,52
            ],
          },{ 
            type: 'line',
            name: '192.113',
            data: [
              8,13,503
            ],
          },{ 
            type: 'line',
            name: '192.114',
            data: [
              8,104,54
            ],
          },{ 
            type: 'line',
            name: '192.115',
            data: [
              8,15,55
            ],
          }
        ]},{
          title : '表空间增长趋势3',
          id : '2',
          opDiskData :  [
          {
            type: 'line',
            name: '192.100',
            data: [
              10,20,30
            ],
          } ,
          { 
            type: 'line',
            name: '192.112',
            data: [
              8,12,52
            ],
          },{ 
            type: 'line',
            name: '192.113',
            data: [
              8,13,503
            ],
          },{ 
            type: 'line',
            name: '192.114',
            data: [
              8,104,54
            ],
          },{ 
            type: 'line',
            name: '192.115',
            data: [
              8,15,55
            ],
          }
        ]},{
          title : '表空间增长趋势3',
          id : '2',
          opDiskData :  [
          {
            type: 'line',
            name: '192.100',
            data: [
              10,20,30
            ],
          } ,
          { 
            type: 'line',
            name: '192.112',
            data: [
              8,12,52
            ],
          },{ 
            type: 'line',
            name: '192.113',
            data: [
              8,13,503
            ],
          },{ 
            type: 'line',
            name: '192.114',
            data: [
              8,104,54
            ],
          },{ 
            type: 'line',
            name: '192.115',
            data: [
              8,15,55
            ],
          }
        ]},{
          title : '表空间增长趋势3',
          id : '2',
          opDiskData :  [
          {
            type: 'line',
            name: '192.100',
            data: [
              10,20,30
            ],
          } ,
          { 
            type: 'line',
            name: '192.112',
            data: [
              8,12,52
            ],
          },{ 
            type: 'line',
            name: '192.113',
            data: [
              8,13,503
            ],
          },{ 
            type: 'line',
            name: '192.114',
            data: [
              8,104,54
            ],
          },{ 
            type: 'line',
            name: '192.115',
            data: [
              8,15,55
            ],
          }
        ]}],
        diskTitle : ['192.112', '192.100','192.113', '192.114','192.115'],
        digitalFlopData: [],
        digitalFlopData : [
        {
          title: 'MySQL',
          number: {
            content: '100',
            textAlign: 'right',
            
          },
          unit: '台'
         },
         {
          title: 'Oracle',
          number: {
            content: '100',
            textAlign: 'right',
            
          },
          unit: '台'
         },
         {
          title: 'SQLServer',
          number: {
            content: '100',
            textAlign: 'right',
          },
          unit: '台'
         },
         {
          title: 'FAIL告警',
          number: {
            content: '100',
            textAlign: 'right',
          },
          unit: '条'
         },
         {
          title: 'CRITICAL告警',
          number: {
            content: '100',
            textAlign: 'right',
          },
          unit: '条'
         },
         {
          title: 'WARNING告警',
          number: {
            content: '100',
            textAlign: 'right',
          },
          unit: '条'
         },
        ],
        listLoading: false,//数据加载等待动画    
        config2:{
           header: ['列1', '列2', '列3'],
  data: [
    ['行1列1', '行1列2', '行1列3'],
    ['行2列1', '行2列2', '行2列3'],
    ['行3列1', '行3列2', '行3列3'],
    ['行4列1', '行4列2', '行4列3'],
    ['行5列1', '行5列2', '行5列3'],
    ['行6列1', '行6列2', '行6列3'],
    ['行7列1', '行7列2', '行7列3'],
    ['行8列1', '行8列2', '行8列3'],
    ['行9列1', '行9列2', '行9列3'],
    ['行10列1', '行10列2', '行10列3']
  ],
  index: true,
  columnWidth: [50],
  align: ['center'],
   rowNum: "10",
        } ,
        config:{
          rowNum: "10",
            data: [
    {
      name: '周口',
      value: 55
    },
    {
      name: '南阳',
      value: 120
    },
    {
      name: '西峡',
      value: 78
    },
    {
      name: '驻马店',
      value: 66
    },
    {
      name: '新乡',
      value: 80
    },
    {
      name: '信阳',
      value: 45
    },
    {
      name: '漯河',
      value: 29
    },
    {
      name: '漯河',
      value: 29
    },
    {
      name: '漯河',
      value: 29
    },
    {
      name: '漯河',
      value: 29
    },
    {
      name: '漯河',
      value: 29
    }
  ],
        },
      }
    
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: { 
      goToDateRange() {
        debugger
        this.$router.push({name: '检查脚本配置'});
      },
    },
    components: {
      echartscom,
      echartsLine
    }
  }
</script>

<style lang="scss">
#top-header {
  position: relative;
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
  }
  .dv-full-screen-container {
    background-image: url('./img/bg.png');
    background-size: 100% 100%;
    height: 100%;
    position: fixed;
    width: 100%;
    height:530;
    //box-shadow: 0 0 3px blue;
    //display: flex;
    //flex-direction: column;
  }
  #digital-flop {
  position: relative;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  //justify-content: space-between;
  align-items: left;
  background-color: rgba(6, 30, 93, 0.5);
  }
  .header-center-decoration {
    width: 40%;
    height: 60px;
    margin-top: 30px;
  }
  .header-left-decoration, .header-right-decoration {
    width: 25%;
    height: 60px;
  }
  .header-win-decoration {
    width: 15%;
    height: 20%;
    background-size: 100% 100%;
    background-color:rgba(6,30,93,.5);
    box-shadow: 0 0 3px blue;
  }
  .header-win2-decoration {
    width: 25%;
    height: 30%;
    background-size: 100% 100%;
    background-color:rgba(6,30,93,.5);
    box-shadow: 0 0 3px blue;
    margin-top: -165px;
    margin-left: 300px;
  }
  .header-win3-decoration {
    width: 200px;
    height: 500px;
    background-size: 100% 100%;
    background-color:rgba(6,30,93,.5);
    box-shadow: 0 0 3px blue;
  }
  .center-title {
    color:	#F8F8FF;  
    position: absolute;
    font-size: 30px;
    font-weight: bold;
    left: 50%;
    top: 15px;
    transform: translateX(-50%);
  }  
  .chart-container {
    flex: 1;
    display: flex;
    margin-top: -12px;
  }
  .chart-container2 {
    flex: 1;
    display: flex;
    margin-top: 15px;
    margin-left: 80px;
  }
  .chart-container3 {
    color: #F8F8FF;
    font-size: 20px;
    margin-left: 20px;
    line-height: 2.5;
  }
  .chart-container4 {
     width: 80px;
     height: 30px;
     margin-top: -40px;
  }
  .digital-flop-item {
    // width: 50%;
    // height: 50%;
    width: 16.5%; 
    display: inline-block;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-left: 3px solid rgb(6, 30, 93);
    border-right: 3px solid  rgb(6, 30, 93);
    color: #F8F8FF;
    margin-top: 10px;
  }
  .digital-flop-title {
    font-size: 15px;
    margin-bottom: 10px;
    text-align: center;
  }
  .unit {
    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
    padding-bottom: 13px;
    // width: 16px;
    height: 35px;
    /* height: 43px; */
    display: inline-block;
    vertical-align: bottom;
  }
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
     height: 100px;
  }
  .lineClass{
    height: 100%;
    width: 47%;
  }
  .alarmClass{
    width: 200%;
    font-size: 10px;
    color: #F8F8FF;
    text-align: right;
  }
  .alarmClass2{
    width: 200%;
    text-align: right;
  }
  .echartsClass{
    width: 45%;
    height: 35%;
    display:inline-block;
    margin-top: 20px;
    margin-left: 25px;
  }
</style>