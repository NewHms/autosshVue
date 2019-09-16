<template>
  <div class="app-container">    <div class="filter-container">
      <el-form>
 
      <el-form-item>
          <el-input v-model="listQuery.IP" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input>
          <el-select v-model="listQuery.location" placeholder="机房" label-width="80px" style='width: 110px;' clearable> 
            <el-option
              v-for="item in allLocation"
              :key="item.locationId"
              :label="item.locationType"
              :value="item.locationType"
              visible-change>
            </el-option>
          </el-select>
          <el-date-picker
             v-model="listQuery.dataTime"
             type="date"
             placeholder="选择日期"
             value-format="yyyy-MM-dd" format="yyyy-MM-dd" style='width: 150px;'>
          </el-date-picker>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <el-button type="danger" prefix-icon="el-icon-search" @click="getList_critical">CRITICAL</el-button>
          <el-button type="warning" prefix-icon="el-icon-search" @click="getList_warning" >WARNING</el-button>
          
      </el-form-item>  
      </el-form>
  </div>
    
  <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :row-style="checkDel" height="530">
      <!-- <span v-if="scope.row.execStatus=2" style="color:red">{{ scope.row.execStatus }}</span>         -->
    <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
      <template slot-scope="scope">
        <span v-text="getIndex(scope.$index)"> </span>
      </template>
    </el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" class="demo-table-expand">
            <el-form-item label="用户名">
              <span>:  {{ props.row.userName }}</span>
            </el-form-item>
            <el-form-item label="SQL_ID">
              <span>:  {{ props.row.sqlId }}</span>
            </el-form-item>
            <el-form-item label="SQL_TEXT" style='width: 100%;'>
              <span>:  {{ props.row.sqlText }}</span>
            </el-form-item>
            <el-form-item label="CPU(次)">
              <span>:  {{ props.row.CPU }}</span>
            </el-form-item>
            <el-form-item label="WAIT(次)">
              <span>:  {{ props.row.wait }}</span>
            </el-form-item>
            <el-form-item label="I/O(次)">
              <span>:  {{ props.row.IO }}</span>
            </el-form-item>
            <el-form-item label="TOTAL(次)">
              <span>:  {{ props.row.Total }}</span>
            </el-form-item>
            <el-form-item label="执行时间(s)">
              <span>:  {{ props.row.avgTime }}</span>
            </el-form-item>
            <el-form-item label="PECEN(%)">
              <span>:  {{ props.row.per }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column align="center"     label="IP"         prop="IP" sortable></el-table-column>
      <el-table-column align="center"     label="实例名"      prop="serviceName" ></el-table-column>
      <el-table-column align="center"     label="SQL_ID"     prop="sqlId" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      <el-table-column align="center"     label="执行状态"    prop="resultStatus" :cell-class-name="checkDel"  sortable></el-table-column>
      <el-table-column align="center" label="执行时间">
        <el-table-column align="center" label="年-月-日" prop="execTimeDay"  sortable></el-table-column>
        <el-table-column align="center" label="时-分-秒" prop="execTimeHour" sortable></el-table-column>
      </el-table-column>
      <el-table-column align="center" label="累计捕获次数"    prop="execNum"></el-table-column>
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

<style>
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
<script>
  import {mapGetters} from 'vuex'
  import {formatDate} from '@/utils/commonUtil.js'
  export default {
    data() {
      return {
        totalCount: 0, //分页组件--数据总条数
        dataTime    : '',
        list        : [],//表格的数据
        alltype     : [],
        allLocation : '',
        listLoading: false,//数据加载等待动画     
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
          dataTime  : formatDate(new Date(),'yyyy-MM-dd')
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
        tempScriptConfig: {
          dailyRule     : '',
          code          : '',
          execTime      : '',
          serviceName   : '',
          location      : '',
          execResult    : '',
          execStatus    : '',
          execTimeDay   : '',
          execTimeHour  : '',
          execNum       : '',
          type          : '',
          logType       : ''
        },
        
      }
    
    },
    created() {
      this.getList();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllLocation();
      }
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
      },  
      getList() {
        debugger
        //查询列表
        this.listLoading = true;
        //this.listQuery.dataTime.setTime(dateTime.getTime() + 3600 * 1000 * 8)        
        this.api({ 
          url: "/logConfig/listSQL",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },
      getList_warning() {
        //查询告警列表
        debugger
        this.listLoading = true;
        this.listQuery_warning.dataTime =  this.listQuery.dataTime
        this.listQuery_warning.IP       =  this.listQuery.IP
        this.dialogStatus               = "warning"
        this.api({
          url: "/logConfig/listSQL",
          method: "get",
          params: this.listQuery_warning
          
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
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

      getList_critical() {
        //查询告警列表
        debugger
        this.listLoading = true;
        this.listQuery_critical.dataTime =  this.listQuery.dataTime
        this.listQuery_critical.IP       =  this.listQuery.IP
        this.dialogStatus                = "critical"
        this.api({
          url: "/logConfig/listSQL",
          method: "get",
          params: this.listQuery_critical
          
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
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
       if(this.dialogStatus == "critical"){
          this.listQuery_critical.pageNum = val
          this.getList_critical();
        }else if(this.dialogStatus == "warning"){
          this.listQuery_warning.pageNum = val
          this.getList_warning();
        }else{
          this.listQuery.pageNum = val
          this.getList(); 
        }
             
      },
      handleFilter() {
        //查询事件
        if(this.dialogStatus == "critical"){
          this.listQuery_critical.pageNum = val
          this.getList_critical();
        }else if(this.dialogStatus == "warning"){
          this.listQuery_warning.pageNum = val
          this.getList_warning();
        }else{
          this.listQuery.pageNum = val
          this.getList();
        }
        
      },
      getIndex($index) {
        //表格序号
        if(this.dialogStatus == "critical"){
          return (this.listQuery_critical.pageNum - 1) * this.listQuery_critical.pageRow + $index + 1
        }else if(this.dialogStatus == "warning"){
          return (this.listQuery_warning.pageNum - 1) * this.listQuery_warning.pageRow + $index + 1
        }else{
          return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
        }
      },
    }
  }
</script>

