<template>
  <div class="app-container">    <div class="filter-container">
      <el-form>
 
      <el-form-item>
          <el-select v-model="listQuery.logType" placeholder="日志类型" label-width="80px" style='width: 110px;' clearable> 
            <el-option
              v-for="item in alltype"
              :key="item.logId"
              :label="item.logType"
              :value="item.logType"
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
          
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <!-- <el-input v-model="listQuery.execStatus" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input> -->
          <!-- <el-button type="danger"  prefix-icon="el-icon-search" @click="getList_alter">ALTER</el-button>-->
          <el-button type="danger"  prefix-icon="el-icon-search" @click="getList_fail">失败</el-button>
          <el-button type="danger"  prefix-icon="el-icon-search" @click="getList_critical">告警C</el-button>
          <el-button type="warning" prefix-icon="el-icon-search" @click="getList_warning" >告警W</el-button>
          <el-button type="success" prefix-icon="el-icon-search" @click="getList_success">正常</el-button>
          <el-button :loading="downloadLoading" style="width:60px;" type="text" icon="document" prefix-icon="el-icon-search" @click="doDaily">手动日检</el-button>
          <el-button :loading="downloadLoading" style="width:60px;" type="text" icon="document" prefix-icon="el-icon-search" @click="dailyLogToExecl">导出EXECL</el-button>
          
      </el-form-item>  
      </el-form>
  </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :row-style="checkDel" height="530">
      <!-- <span v-if="scope.row.execStatus=2" style="color:red">{{ scope.row.execStatus }}</span>         -->
      <el-table-column align="center" width="40"     label="序号"       prop="id" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column   align="center" width="80"     label="日志类型"    prop="logType"></el-table-column>
      <el-table-column   align="center" width="130"    label="IP"         prop="ip" sortable></el-table-column>
      <el-table-column   align="center" width="100"    label="实例名"      prop="serviceName"></el-table-column>
      <el-table-column   align="center" width="80"     label="用户名"      prop="USER" ></el-table-column>
      <el-table-column   align="center" width="150"    label="命令描述"    prop="shellDesc"    :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      <el-table-column   align="center" width="400"    label="执行结果"    prop="execResult"   :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      <el-table-column   align="center" width="90"     label="执行状态"    prop="resultStatus" :cell-class-name="checkDel"  sortable></el-table-column>
      <el-table-column   align="center"                label="执行时间">
        <el-table-column align="center" width="100"    label="年-月-日"    prop="execTimeDay"  sortable></el-table-column>
        <el-table-column align="center" width="100"    label="时-分-秒"    prop="execTimeHour" sortable></el-table-column>
      </el-table-column>
      <el-table-column   align="center" width="80"     label="执行次数"    prop="execNum"></el-table-column>
      <!-- <el-table-column align="center" width="70"  v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-delete" 
                     @click="removeUser(scope.$index)">
          </el-button>
        </template>
      </el-table-column> -->
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
  import cron from './cron'
  export default {
    data() {
      //datetime+8小时
      //var dateTime = new Date()
      //dateTime.setTime(dateTime.getTime() + 3600 * 1000 * 8)
      return {
        totalCount: 0, //分页组件--数据总条数
        dataTime    : '',
        list        : [],//表格的数据
        alltype     : [],
        allLocation : '',
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum   : 1,//页码
          pageRow   : 50,//每页条数
          dataTime  : new Date(),
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
        // sysVersion1: [{
        //   value:'0',
        //   lable:'MySQL'
        // },{
        //   value:'1',
        //   lable:'Oracle'
        // },{
        //   value:'2',
        //   lable:'SQLServer'
        // },{
        //   value:'3',
        //   lable:'Redis'
        // },{
        //   value:'4',
        //   lable:'Red Hat'
        // }],//角色列表

        tempScriptConfig: {
          IP            : '',
          USER          : '',
          shellDesc     : '',
          serviceName   : '',
          execResult    : '',
          execStatus    : '',
          execTimeDay   : '',
          execTimeHour  : '',
          execNum       : '',
          type          : '',
          logType       : '',
        },
        
      }
    
    },
    created() {
      this.getList();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllLogType();
        this.getAllLocation();
        this.getAllShellDesc();
      }
      //this.dateTime = new Date()
      // if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
      //   this.getAllRoles();
      // }
      // if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
      //   this.getAllServerType();
      // }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      checkDel({row, column, rowIndex, columnIndex}){
        if (this.list[rowIndex].resultStatus=='FAIL' || this.list[rowIndex].resultStatus=='CRITICAL'){
          return 'color: #FF0000;font-weight: 500;'
        }
        if (this.list[rowIndex].resultStatus=='WARNING'){
          return 'color: #CD6600;font-weight: 500;'
        }
        if (this.list[rowIndex].resultStatus=='SUCCESS'){
          return 'color: #008000;font-weight: 500;'
        }
      },
      getAllLogType() {
        this.api({
          url: "/logConfig/getAllLogType",
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
          url: "/scriptConfig/getAllLocation",
          method: "get"
        }).then(data => {
          this.allLocation = data.list;
        })
      },

      getList() {
        debugger
        //查询列表
        this.listLoading = true;
        var allValue = '';
        for(var oldType in this.tempScriptConfig.shellDesc){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
          }
        this.listQuery.strShellDesc = allValue
        this.api({ 
          url: "/logConfig/listLog",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },

      getList_fail() {
        //查询失败列表
        this.listLoading = true;
        this.listQuery_fail.dataTime     =  this.listQuery.dataTime
        this.listQuery_fail.IP           =  this.listQuery.IP
        this.dialogStatus                = "fail"
        var allValue = '';
        for(var oldType in this.tempScriptConfig.shellDesc){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
          }
        this.listQuery_fail.strShellDesc = allValue
        this.api({
          url: "/logConfig/listLog",
          method: "get",
          params: this.listQuery_fail
          
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },

      getList_warning() {
        //查询告警列表
        this.listLoading = true;
        this.listQuery_warning.dataTime     =  this.listQuery.dataTime
        this.listQuery_warning.IP           =  this.listQuery.IP
        this.dialogStatus                   = "warning"
        var allValue = '';
        for(var oldType in this.tempScriptConfig.shellDesc){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
          }
        this.listQuery_warning.strShellDesc = allValue
        this.api({
          url: "/logConfig/listLog",
          method: "get",
          params: this.listQuery_warning
          
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },

      getList_critical() {
        //查询告警列表
        this.listLoading = true;
        this.listQuery_critical.dataTime     =  this.listQuery.dataTime
        this.listQuery_critical.IP           =  this.listQuery.IP
        this.dialogStatus                    = "critical"
        var allValue = '';
        for(var oldType in this.tempScriptConfig.shellDesc){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
          }
        this.listQuery_critical.strShellDesc = allValue
        this.api({
          url: "/logConfig/listLog",
          method: "get",
          params: this.listQuery_critical
          
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },

      // getList_daily() {
      //   //查询告警列表
      //   debugger
      //   this.listLoading = true;
      //   this.listQuery_daily.dataTime =  this.listQuery.dataTime
      //   this.listQuery_daily.IP       =  this.listQuery.IP
      //   this.dialogStatus             = "daily"
      //   this.api({
      //     url: "/logConfig/listLog",
      //     method: "get",
      //     params: this.listQuery_daily
          
      //   }).then(data => {
      //     this.listLoading = false;
      //     this.list = data.list;
      //     this.totalCount = data.totalCount;
      //   })
      // },

      // getList_monitor() {
      //   //查询告警列表
      //   debugger
      //   this.listLoading = true;
      //   this.listQuery_monitor.dataTime =  this.listQuery.dataTime
      //   this.listQuery_monitor.IP       =  this.listQuery.IP
      //   this.dialogStatus               = "monitor"
      //   this.api({
      //     url: "/logConfig/listLog",
      //     method: "get",
      //     params: this.listQuery_monitor
          
      //   }).then(data => {
      //     this.listLoading = false;
      //     this.list = data.list;
      //     this.totalCount = data.totalCount;
      //   })
      // },

      getList_success() {
        //查询成功列表
        this.listLoading = true;
        this.listQuery_success.dataTime     =  this.listQuery.dataTime
        this.listQuery_success.IP           =  this.listQuery.IP
        this.dialogStatus                   = "success"
        var allValue = '';
        for(var oldType in this.tempScriptConfig.shellDesc){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
          }
        this.listQuery_success.strShellDesc = allValue
        this.api({
          url: "/logConfig/listLog",
          method: "get",
          params: this.listQuery_success
          
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },
      dailyLogToExecl() {
        debugger
        //刷新定时器
        let _vue = this;
        this.listLoading = true;
        this.listQuery_execl.dataTime =  this.listQuery.dataTime
        this.api({
          url: "/logConfig/dailyLogToExecl",
          method: "get",
          params: this.listQuery_execl
        }).then(() => {
          _vue.$message.success("导出成功")
          this.getList();
          this.dialogFormVisible = false
        }).catch(() => {
            _vue.$message.error("导出失败")
            _vue.getList()
        })
      },
      doDaily() {
        debugger
        //刷新定时器
        let _vue = this;
        this.listLoading = true;
        this.listQuery_daily.dataTime =  this.listQuery.dataTime
        this.api({
          url: "/logConfig/doDaily",
          method: "get",
          params: this.listQuery_daily
        }).then(() => {
          _vue.$message.success("日检成功")
          this.getList();
          this.dialogFormVisible = false
        }).catch(() => {
            _vue.$message.error("日检失败")
            _vue.getList()
        })
      },
      handleSizeChange(val) {
        //改变每页数量
        debugger
        this.listQuery.pageRow = val
        this.handleFilter();
      },
      handleCurrentChange(val) {
        debugger
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
        // }else if(this.dialogStatus == "monitor"){
        //   this.listQuery_monitor.pageNum = val
        //   this.getList_monitor();
        // }else if(this.dialogStatus == "daily"){
        //   this.listQuery_daily.pageNum = val
        //   this.getList_daily();
        // }
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
        // }else if(this.dialogStatus == "monitor"){
        //   this.listQuery_monitor.pageNum = val
        //   this.getList_monitor();
        // }else if(this.dialogStatus == "daily"){
        //   this.listQuery_daily.pageNum = val
        //   this.getList_daily();
        // }
        else{
          this.listQuery.pageNum = val
          this.getList();
        }  
      },
      getIndex($index) {
        //表格序号
        if (this.dialogStatus == "success"){
          return (this.listQuery_success.pageNum - 1) * this.listQuery_success.pageRow + $index + 1
        }else if(this.dialogStatus == "critical"){
          return (this.listQuery_critical.pageNum - 1) * this.listQuery_critical.pageRow + $index + 1
        }else if(this.dialogStatus == "warning"){
          return (this.listQuery_warning.pageNum - 1) * this.listQuery_warning.pageRow + $index + 1
        }else if(this.dialogStatus == "fail"){
          return (this.listQuery_fail.pageNum - 1) * this.listQuery_fail.pageRow + $index + 1}
        // }else if(this.dialogStatus == "monitor"){
        //   return (this.listQuery_monitor.pageNum - 1) * this.listQuery_monitor.pageRow + $index + 1
        // }else if(this.dialogStatus == "daily"){
        //   return (this.listQuery_daily.pageNum - 1) * this.listQuery_daily.pageRow + $index + 1
        // }
        else{
          return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
        }  
        
      },
    }
  }
</script>
<style scoped>
.el-table /deep/ .cell.el-tooltip {
      white-space: pre-wrap;
  }
</style>
