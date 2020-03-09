<template>
  <div class="app-container">    
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-select v-model="listQuery.logType" placeholder="日志类型" label-width="80px" style='width: 110px;' clearable> 
            <el-option
              v-for="item in alltype"
              :key="item.alarmId"
              :label="item.alarmType"
              :value="item.alarmType"
              visible-change>
            </el-option>
          </el-select>
          <el-select v-model="listQuery.location" placeholder="机房" label-width="80px" style='width: 110px;' clearable> 
            <el-option
              v-for="item in allLocation"
              :key="item.locationId"
              :label="item.locationType"
              :value="item.locationType"
              visible-change>
            </el-option>
          </el-select>
          <el-input v-model="listQuery.IP" placeholder="请输入IP地址" style='width: 160px;' type="text" clearable></el-input>
          <el-select v-model="tempScriptConfig.shellDesc" placeholder="请选择命令描述" label-width="80px" multiple style='width: 235px;max-height:300px;' collapse-tags> 
            <el-option
              v-for="item in allShellDesc"
              :key="item.code"
              :label="item.shellDesc"
              :value="item.shellDesc"    
            >
            </el-option>
          </el-select>
          <el-date-picker
             v-model="listQuery.dataTime"
             type="date"
             placeholder="选择日期"
             value-format=" yyyy-MM-dd" format="yyyy-MM-dd" style='width: 140px;'>
          </el-date-picker>
          <el-select v-model="tempScriptConfig.resultStatus" placeholder="告警级别" label-width="80px"   multiple style='width: 300px;'  clearable> 
            <el-option
              v-for="item in allAlarmLevel"
              :key="item.alarmId"
              :label="item.alarmType"
              :value="item.alarmType">
            </el-option>
          </el-select>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <!-- <el-input v-model="listQuery.execStatus" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input> -->
          <!-- <el-button type="danger"  prefix-icon="el-icon-search" @click="getList_alter">ALTER</el-button>-->
          <!-- <el-button type="danger"  prefix-icon="el-icon-search" @click="getList_fail">失败</el-button>
          <el-button type="danger"  prefix-icon="el-icon-search" @click="getList_critical">告警C</el-button>
          <el-button type="warning" prefix-icon="el-icon-search" @click="getList_warning" >告警W</el-button>
          <el-button type="success" prefix-icon="el-icon-search" @click="getList_success">正常</el-button> -->
          <el-button style="width:60px;" type="text" icon="document" prefix-icon="el-icon-search" @click="doDaily">手动日检</el-button>
          <el-button style="width:60px;" type="text" icon="document" prefix-icon="el-icon-search" @click="dailyLogToExecl">导出EXECL</el-button>  
        </el-form-item>    
      </el-form>
  </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :cell-class-name="checkDel" height="530"  @expand-change="getInnerAlarm">
      <!-- <span v-if="scope.row.execStatus=2" style="color:red">{{ scope.row.execStatus }}</span>         -->
      <el-table-column align="center" width="70"     label="序号"       prop="id" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column type="expand" >
        <template  slot-scope="scope">
          <el-table :data="listAlarm" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :cell-class-name="checkDelInner">
            <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
                <template slot-scope="inner">
                  <span v-text="getInnerIndex(inner.$index)"> </span>
                </template>
            </el-table-column>  
            <el-table-column   align="center" width="80"     label="日志类型"    prop="logType"></el-table-column>
            <el-table-column   align="center" width="130"    label="IP"         prop="ip" sortable></el-table-column>
            <el-table-column   align="center" width="100"    label="实例名"      prop="serviceName"></el-table-column>
            <el-table-column   align="center" width="80"     label="用户名"      prop="USER" ></el-table-column>
            <!-- <el-table-column   align="center" width="150"    label="命令描述"    prop="shellDesc"    :show-overflow-tooltip="true"></el-table-column> -->
            <el-table-column   align="center"     label="执行结果"    prop="execResult"   :show-overflow-tooltip="true"></el-table-column>
            <el-table-column   align="center" width="90"     label="执行状态"    prop="resultStatus"></el-table-column>
            <el-table-column align="center" label="采集时间"  width="120">
              <template slot-scope="scope">
                <dt>{{ scope.row.execTimeDay  }}</dt>
                <dt>{{ scope.row.execTimeHour }}</dt> 
              </template>
            </el-table-column> 
            <el-table-column align="center" label="结束时间"  width="120">
              <template slot-scope="scope">
                <dt>{{ scope.row.execEndTimeDay  }}</dt>
                <dt>{{ scope.row.execEndTimeHour }}</dt> 
              </template>
            </el-table-column>
            <el-table-column   align="center" width="80"     label="间隔"    prop="diffTime"></el-table-column>
            <el-table-column   align="center" width="80"     label="执行次数"    prop="execNum"></el-table-column>
          </el-table>
          <el-pagination
            @size-change   ="handleInnerSizeChange"
            @current-change="handleInnerCurrentChange"
            :current-page  ="listData.pageNum"
            :page-size     ="listData.pageRow"
            :total         ="totalInnerCount"
            :page-sizes    ="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper">
          </el-pagination>
        </template>
      </el-table-column>
      <el-table-column label="服务器信息"  width="230">
        <template slot-scope="scope">
          <dt>IP地址: {{ scope.row.ip}}</dt>
          <dt>逻辑名: {{ scope.row.logicalInfo }}</dt> 
        </template>
      </el-table-column>  
      <el-table-column align="center"     label="实例名"         prop="serviceName"  width="100"></el-table-column>
      <el-table-column align="center"     label="机房位置"       prop="location"     width="90">    </el-table-column>
      <el-table-column align="center"     label="命令描述"       prop="shellDesc"  >    </el-table-column>
      <el-table-column label="执行次数"  width="150">
        <template slot-scope="scope">
          <dt>实际: {{ scope.row.execRealCount}}</dt>
          <dt>计划: {{ scope.row.execExpecCount }}</dt> 
        </template>
      </el-table-column>
      <!-- <el-table-column align="center"     label="code"          prop="code"         width="70">        </el-table-column> --> 
      <el-table-column align="center"     label="结果状态"       prop="resultStatus" width="100">
        <template slot-scope="scope">
            <dt v-if="scope.row.resultStatus == 'FAIL'"     class="fa fa-close" type = "text">
            </dt>
            <dt v-if="scope.row.resultStatus == 'CRITICAL'" class="fa fa-close" type = "text">
            </dt>
            <dt v-if="scope.row.resultStatus == 'WARNING'"  class="fa fa-exclamation" type = "text">
            </dt>
            <dt v-if="scope.row.resultStatus == 'RECOVER'"  class="fa fa-check" type = "text">
            </dt>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center"     label="恢复状态"       prop="status"       width="120">      </el-table-column> -->
      <el-table-column align="center"     label="告警起始时间"    prop="alarmStartTime" width="260">
        <template  slot-scope="timeScope">
          <el-date-picker
            v-model="timeScope.row.alarmStartTime"
            align="right"
            type="datetime"
            placeholder="选择日期"
            value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" style='width: 185px;'
            @change="updateAlarmTime(timeScope.$index)">
          </el-date-picker>
        </template>  
      </el-table-column>
      <el-table-column align="center" width="75" v-if="hasPerm('scriptConfig:update')" label="私有阀值调整" >
        <template slot-scope="scope">
         <el-button type="text" prefix-icon="el-icon-search" 
          icon="el-icon-edit" @click="goToPrivSetting(scope.$index)">
         </el-button>
        </template>
      </el-table-column>

      
    </el-table>
   
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageRow"
      :total="totalCount"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>

</template>

<script>
  import {mapGetters} from 'vuex'
  import {formatDate} from '@/utils/commonUtil.js'
  export default {
    data() {
      return {
        totalCount: 0, //分页组件--数据总条数
        alltype         : [],     
        dataTime        : '',
        list            : [],//表格的数据
        listAlarm       : [],
        list_test       : '',
        allShellDesc    : [],
        allAlarmLevel   : [],
        totalInnerCount : '',
        allLocation  : '',
        listLoading: false,//数据加载等待动画     
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
          dataTime  : formatDate(new Date(),'yyyy-MM-dd')
          //execStatus : '',
        },

        listData: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
          dataTime  : formatDate(new Date(),'yyyy-MM-dd')
          //execStatus : '',
        },
        
        listQuery_monitor: {
          pageNum : 1,//页码
          pageRow : 50,//每页条数,
          logType : 'monitor',
        },
        listQuery_daily: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数,
        },
        listQuery_fail: {
           pageNum: 1,//页码
           pageRow: 50,//每页条数,
           resultStatus : '3_FAIL',
          //execStatus : '',
        },
        listQuery_warning: {
           pageNum: 1,//页码
           pageRow: 50,//每页条数,
           resultStatus : '1_WARNING',
          //execStatus : '',
        },
        listQuery_critical: {
           pageNum: 1,//页码
           pageRow: 50,//每页条数,
           resultStatus : '2_CRITICAL',
          //execStatus : '',
        },
        listQuery_success: {
           pageNum: 1,//页码
           pageRow: 50,//每页条数,
           resultStatus : '0_SUCCESS',
          //execStatus : '',
        },
        listQuery_execl: {
           pageNum: 1,//页码
           pageRow: 50,//每页条数,
          //execStatus : '',
        },

        tempScriptConfig: {
          shellDesc      : '',
          code           : '',
          execTime       : '',
          serviceName    : '',
          location       : '',
          execResult     : '',
          resultStatus   : '',
          status         : '',
          execTimeDay    : '',
          execTimeHour   : '',
          execEndTimeDay : '',
          execEndTimeHour: '',
          alarmStartTime : '',
          maxExecTime    : '',
          IP             : '',
          logicalInfo    : '',
          USER           : '',      
          execStatus     : '',
          execNum        : '',
          diffTime       : '',
          type           : '',
          logType        : '',
          execRealCount  : '',
          execExpecCount : '',
          execStatus     : '',
        },
        
      }
    
    },
    created() {
      this.getList();
      this.getAlarmLevel();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllLogType();
        this.getAllLocation();
        this.getAllShellDesc();
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: { 
      goToPrivSetting($index) {
      
        let _vue = this;
        let details = _vue.list[$index];
        this.$router.push({name: '私有阀值配置', params: {host: details.ip,
                                                        serviceName : details.serviceName,
                                                        code  : details.code}})
      },
      checkDelInner({row, column, rowIndex, columnIndex}){
        if (this.listAlarm[rowIndex].resultStatus=='FAIL' || this.listAlarm[rowIndex].resultStatus=='CRITICAL'){
          return 'NG'
        }
        if (this.listAlarm[rowIndex].resultStatus=='WARNING'){
          return 'NG'
        }
        if (this.listAlarm[rowIndex].resultStatus=='SUCCESS'){
          return 'OK'
        }
      },
      checkDel({row, column, rowIndex, columnIndex}){
        debugger
        if (this.list[rowIndex].execStatus =='NG' && columnIndex === 6){
          return 'NG'
        }
        if (this.list[rowIndex].status == "NG"){
          return 'NG'
        }
        if (this.list[rowIndex].status == "OK"){
          return 'OK'
        }
        
      },
      
      getAllLogType() {
        this.api({
          url: "/commonsConfig/getAllLogType",
          method: "get"
        }).then(data => {
          this.alltype = data.list;
        })
      },

      getAllShellDesc() {
        this.api({
          url: "/logConfig/getAllShellDesc",
          method: "get"
        }).then(data => {
          this.allShellDesc = data.list;
        })
      },
      
      getAllLocation() {
        this.api({
          url: "/commonsConfig/getAllLocation",
          method: "get"
        }).then(data => {
          this.allLocation = data.list;
        })
      },

      getList() {
        //查询列表
        this.listLoading = true;
        var allValue = '';
        for(var oldType in this.tempScriptConfig.shellDesc){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
        }

        var allResultStatus = '';
        for(var oldType in this.tempScriptConfig.resultStatus){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allResultStatus  =  allResultStatus+this.tempScriptConfig.resultStatus[oldType]+ ',';           
          }
        this.listQuery.resultStatus = allResultStatus
        this.listQuery.strShellDesc = allValue
        this.api({ 
          url: "/alarmConfig/getAllAlarm",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },

      getAlarmLevel() {
        //debugger
        //查询列表
        this.listLoading = true;
        //parseTime(this.listQuery.dataTime)
        this.api({ 
          url: "/commonsConfig/getAllAlarmLevel",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading   = false;
          this.allAlarmLevel = data.list;
        })
      },

      // getList_fail() {
      //   //查询失败列表
      //   this.listLoading = true;
      //   this.listQuery_fail.dataTime     =  this.listQuery.dataTime
      //   this.listQuery_fail.IP           =  this.listQuery.IP
      //   this.listQuery_fail.location     =  this.listQuery.location
      //   this.dialogStatus                = "fail"
      //   var allValue = '';
      //   for(var oldType in this.tempScriptConfig.shellDesc){
      //       // vue是数组类型是用push赋值
      //       //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
      //       allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
      //     }
      //   this.listQuery_fail.strShellDesc = allValue
      //   this.api({
      //     url: "/alarmConfig/getAllAlarm",
      //     method: "get",
      //     params: this.listQuery_fail
          
      //   }).then(data => {
      //     this.listLoading = false;
      //     this.list = data.list;
      //     this.totalCount = data.totalCount;
      //   })
      // },

      // getList_warning() {
      //   //查询告警列表
      //   debugger
      //   this.listLoading = true;
      //   this.listQuery_warning.dataTime     =  this.listQuery.dataTime
      //   this.listQuery_warning.IP           =  this.listQuery.IP
      //   this.listQuery_warning.location     =  this.listQuery.location
      //   this.dialogStatus                   = "warning"
      //   var allValue = '';
      //   for(var oldType in this.tempScriptConfig.shellDesc){
      //       // vue是数组类型是用push赋值
      //       //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
      //       allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
      //     }
      //   this.listQuery_warning.strShellDesc = allValue
      //   this.api({
      //     url: "/alarmConfig/getAllAlarm",
      //     method: "get",
      //     params: this.listQuery_warning
          
      //   }).then(data => {
      //     this.listLoading = false;
      //     this.list = data.list;
      //     this.totalCount = data.totalCount;
      //   })
      // },

      // getList_critical() {
      //   //查询告警列表
      //   this.listLoading = true;
      //   this.listQuery_critical.dataTime     =  this.listQuery.dataTime
      //   this.listQuery_critical.IP           =  this.listQuery.IP
      //   this.listQuery_critical.location     =  this.listQuery.location
      //   this.dialogStatus                    = "critical"
      //   var allValue = '';
      //   for(var oldType in this.tempScriptConfig.shellDesc){
      //       // vue是数组类型是用push赋值
      //       //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
      //       allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
      //     }
      //   this.listQuery_critical.strShellDesc = allValue
      //   this.api({
      //     url: "/alarmConfig/getAllAlarm",
      //     method: "get",
      //     params: this.listQuery_critical
          
      //   }).then(data => {
      //     this.listLoading = false;
      //     this.list = data.list;
      //     this.totalCount = data.totalCount;
      //   })
      // },

      // getList_success() {
      //   //查询成功列表
      //   this.listLoading = true;
      //   this.listQuery_success.dataTime     =  this.listQuery.dataTime
      //   this.listQuery_success.IP           =  this.listQuery.IP
      //   this.listQuery_success.location     =  this.listQuery.location
      //   this.dialogStatus                   = "success"
      //   var allValue = '';
      //   for(var oldType in this.tempScriptConfig.shellDesc){
      //       // vue是数组类型是用push赋值
      //       //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
      //       allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
      //     }
      //   this.listQuery_success.strShellDesc = allValue
      //   this.api({
      //     url: "/alarmConfig/getAllAlarm",
      //     method: "get",
      //     params: this.listQuery_success
          
      //   }).then(data => {
      //     this.listLoading = false;
      //     this.list = data.list;
      //     this.totalCount = data.totalCount;
      //   })
      // },
      dailyLogToExecl() {
      
        //刷新定时器
        let _vue = this;
        this.listLoading = true;
        this.listQuery_execl.dataTime =  this.listQuery.dataTime
        this.downloadLoading = true
        this.api({
          url: "/logConfig/dailyLogToExecl",
          method: "get",
          params: this.listQuery_execl
        }).then(() => {
          _vue.$message.success("导出成功")
          this.getList();
          this.dialogFormVisible = false
          this.downloadLoading   = false
        }).catch(() => {
            _vue.$message.error("导出失败")
            _vue.getList()
        })
      },
      doDaily() {
       
        //刷新定时器
        let _vue = this;
        this.listLoading = true;
        this.listQuery_daily.dataTime =  this.listQuery.dataTime
        this.downloadLoading   = true
        this.api({
          url: "/logConfig/doDaily",
          method: "get",
          params: this.listQuery_daily
        }).then(() => {
          _vue.$message.success("日检成功")
          this.getList();
          this.dialogFormVisible = false
          this.downloadLoading   = false
        }).catch(() => {
            _vue.$message.error("日检失败")
            _vue.getList()
        })
      },

      updateAlarmTime($index) {
        //修改告警开始时间
        debugger
        let _vue = this;
       
        this.api({
          url: "/alarmConfig/updateAlarmTimeConfig",
          method: "post",
          data:  this.list[$index]
        }).then(() => {
          let msg = "修改成功";
          this.dialogFormVisible = false
          if (this.userId === this.tempScriptConfig.userId) {
            msg = '修改成功,部分信息重新登录后生效'
          }
          this.$message({
            message: msg,
            type: 'success',
            duration: 1 * 1000,
            onClose: () => {
              _vue.getList();
            }
          })
        })
      },  
      getInnerAlarm(data,expandedRows) {

        //查询列表
        //alert(data)
        this.listLoading = true; 
        if(data != undefined){
            this.list_test = data
        } 
        this.list_test.dataTime = this.listQuery.dataTime
        this.list_test.logType  = this.listQuery.logType
        this.list_test.pageNum  = this.listData.pageNum
        this.list_test.pageRow  = this.listData.pageRow
        
        this.api({ 
          url: "/alarmConfig/getAllInnerAlarm",
          method: "get",
          params: this.list_test

        }).then(data => {
          this.listLoading = false;
          this.listAlarm   = data.list;
          this.totalInnerCount  = data.totalCount;
        })
        //如果展开行数大于1
        if(expandedRows.length>1){
        //shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
          expandedRows.shift();
        }  
      },
      handleSizeChange(val) {
        //改变每页数量

        this.listQuery.pageRow = val
        this.handleFilter();
      },
      handleCurrentChange(val) {
        //改变页码
        if (this.dialogStatus == "success"){
          this.listQuery_success.pageNum = val
          this.getList_success();
        }else if(this.dialogStatus == "critical"){
          this.listQuery_critical.pageNum = val
          this.getList_critical();
        }else if(this.dialogStatus == "warning"){
          this.listQuery_warning.pageNum = val
          this.getList_warning();
        }else if(this.dialogStatus == "fail"){
          this.listQuery_fail.pageNum = val
          this.getList_fail();}    
        else{
          this.listQuery.pageNum = val
          this.getList();
        }        
      },
      handleFilter() {
        //查询事件       
        if (this.dialogStatus == "success"){
          this.listQuery_success.pageNum = val
          this.getList_success();
        }else if(this.dialogStatus == "critical"){
          this.listQuery_critical.pageNum = val
          this.getList_critical();
        }else if(this.dialogStatus == "warning"){
          this.listQuery_warning.pageNum = val
          this.getList_warning();
        }else if(this.dialogStatus == "fail"){
          this.listQuery_fail.pageNum = val
          this.getList_fail();}
        else{
          this.listQuery.pageNum = val
          this.getList();}
      },
      handleInnerSizeChange(val) {
        //改变每页数量
  
        this.listData.pageRow = val
        this.handleInnerFilter();
      },
      handleInnerCurrentChange(val) {
     
        this.listData.pageNum = val
        this.getInnerAlarm();         
      },
      handleInnerFilter() {
       
        //查询事件       
        this.listData.pageNum = val
        this.getInnerAlarm();   
      },
      getIndex($index) {
        //debugger
        if (this.dialogStatus == "success"){
          return (this.listQuery_success.pageNum - 1) * this.listQuery_success.pageRow + $index + 1
        }else if(this.dialogStatus == "critical"){
          return (this.listQuery_critical.pageNum - 1) * this.listQuery_critical.pageRow + $index + 1
        }else if(this.dialogStatus == "warning"){
          return (this.listQuery_warning.pageNum - 1) * this.listQuery_warning.pageRow + $index + 1
        }else if(this.dialogStatus == "fail"){
          return (this.listQuery_fail.pageNum - 1) * this.listQuery_fail.pageRow + $index + 1}
        else{
          return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
        }  
      },
      getInnerIndex($index) {
        //表格序号
        //alert(($index+1))
        return (this.listData.pageNum - 1) * this.listData.pageRow + $index + 1
      },
    }
  }
</script>

<style  scoped lang="scss">
  .el-table .cell.el-tooltip {
      white-space: pre-wrap;
  }
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
<style>
   dt {text-align:left;  margin-left:5px;}
  .NG{
    color: #FF0000;font-weight: 500;
  }
  .OK{
    color: #008000;font-weight: 500;
  }
</style>