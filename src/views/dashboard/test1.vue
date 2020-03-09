<template >
  <div class="dv-full-screen-container">   
    <div id="top-header" >
        <dv-decoration-8 class="header-left-decoration" />
        <dv-decoration-5 class="header-center-decoration" />
        <dv-decoration-8 class="header-right-decoration" :reverse="true" />
        <div class="center-title">监控大屏</div> 
    </div>
    <div  class="chart-container">
      <dv-border-box-2>
        <el-button type="text" prefix-icon="el-icon-search" @click="goToDateRange()"  
        style="font-size: 15px;color: #F8F8FF;margin-left: 20px;margin-top: -5px;">返回</el-button>
      </dv-border-box-2>
    </div>  
    <div id="digital-flop" class="main-content">
      <el-container>
        <el-header height="15%">
          <div>
            <div
              class="digital-flop-item"
              v-for="item in digitalFlopData"
              :key="item.title">
              <div class="digital-flop-title">{{ item.title }}
              </div>
              <div style="height:10px;">
              <dv-active-ring-chart :config="item.config" style="width:100%;height:200px" />
              </div>
            </div>
            <dv-decoration-10  style="width:100%;height:10px;"/>
          </div> 
        </el-header>
        <el-container >
          <!-- <el-aside width="15%"><dv-scroll-ranking-board :config="config" style="width: 400px;margin-left: 10px;height:500px"/></el-aside> -->
          <!--  -->
          <!-- <el-main style="height:85%"> -->
          <el-main width="60%">   
            <div> 
              <div 
                class="echartsClass"
                v-for="item in list"
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
                        :time= "item.timeList"
                        :opData= "item.opDiskData"
                        :title= "item.diskTitleList">
                      </echartsLine>
                    </div>
                  </div>  
                </dv-border-box-6>
              </div>          
            </div>
          </el-main>
          <el-aside width="25%" style="margin-right: 10px;"><dv-scroll-board :config="alarmData" style="width: 400px;height:250px;margin-top: 10px;"/> 
          <dv-scroll-board :config="alarmData" style="width: 400px;height:250px;margin-top: 10px;"/>
          </el-aside>
        </el-container>
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
        list : [],
        timeData  : [],
        diskTitle : [],
        digitalFlopData: [],
        alarmData : [],
        listLoading: false,//数据加载等待动画    
      }
    
    },
    created() {
      this.getAllShellType();
      this.getAllOsRole();
      this.getAllAlarm();
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: { 
      goToDateRange() {
        debugger
        this.$router.push({name: '监控命令配置'});
      },
      getAllShellType() {
       debugger
        this.api({
          url: "/dashboardConfig/getDashboard",
          method: "get"
        }).then(data => {
          this.list = data.list;
          this.timeData = data.timeList;
          this.diskTitle = data.diskTitleList;
        })
      },
      getAllOsRole() {
       debugger
        this.api({
          url: "/dashboardConfig/getOsRole",
          method: "get"
        }).then(data => {
          this.digitalFlopData = data.list;

        })
      },
      getAllAlarm() {
       debugger
        this.api({
          url: "/dashboardConfig/getAlarmMess",
          method: "get"
        }).then(data => {
          this.alarmData = data.list;
        })
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
     width: 80px;
     height: 30px;
     margin-top: -40px;
  }
  .digital-flop-item {
    height: 100px;
    width: 33%; 
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