<template>
  <div class="app-container">    <div class="filter-container">
      <el-form>
 
      <el-form-item>
          <el-input v-model="listQuery.IP" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <!-- <el-input v-model="listQuery.execStatus" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input> -->
          <el-button type="danger"  prefix-icon="el-icon-search" @click="getList_fail">失败</el-button>
          <el-button type="warning" prefix-icon="el-icon-search" @click="getList_warning">告警</el-button>
          <el-button type="success" prefix-icon="el-icon-search" @click="getList_success">正常</el-button>
          <el-button :loading="downloadLoading" style="margin:0 0 20px 20px;float:right" type="primary" icon="document" prefix-icon="el-icon-search" @click="dailyLogToExecl">导出EXECL</el-button>
          <el-date-picker
             v-model="listQuery.dataTime"
             style="float:right"
             type="date"
             placeholder="选择日期"
             value-format=" yyyy-MM-dd" format="yyyy-MM-dd">
          </el-date-picker>
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
      <el-table-column align="center" width="130"    label="IP"         prop="ip" sortable></el-table-column>
      <el-table-column align="center" width="100"    label="用户名"      prop="USER" ></el-table-column>
      <el-table-column align="center"                label="命令描述"    prop="shellDesc"  :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      <el-table-column align="center" width="450"    label="执行结果"    prop="execResult" style="width: 60px;" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      <el-table-column align="center" width="110"    label="执行状态"    prop="resultStatus" :cell-class-name="checkDel"  sortable></el-table-column>
      <el-table-column align="center" width="110"    label="执行时间"    prop="execTime" sortable></el-table-column>
      <el-table-column align="center" width="80"     label="执行次数"    prop="execNum"></el-table-column>
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
      return {
        totalCount: 0, //分页组件--数据总条数
        dataTime : '',
        list: [],//表格的数据
        alltype : [],
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
          //execStatus : '',
        },
        listQuery_fail: {
           pageNum: 1,//页码
           pageRow: 50,//每页条数,
           resultStatus : '0',
          //execStatus : '',
        },
        listQuery_warning: {
           pageNum: 1,//页码
           pageRow: 50,//每页条数,
           resultStatus : '1',
          //execStatus : '',
        },
        listQuery_success: {
           pageNum: 1,//页码
           pageRow: 50,//每页条数,
           resultStatus : '2',
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
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑',
          create: '新增配置'
        },
        tempScriptConfig: {
          IP         : '',
          USER       : '',
          shellDesc  : '',
          execResult : '',
          execStatus : '',
          execTime   : '',
          execNum    : '',
          type       : ''
        },
        
      }
    
    },
    created() {
      this.getList();
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
        if (this.list[rowIndex].resultStatus=='FAIL'){
          return 'color: #FF0000;font-weight: 500;'
        }
        if (this.list[rowIndex].resultStatus=='WARING' || this.list[rowIndex].resultStatus=='CRITICAL' ){
          return 'color: #CD6600;font-weight: 500;'
        }
        if (this.list[rowIndex].resultStatus=='SUCCESS'){
          return 'color: #008000;font-weight: 500;'
        }
      },
      getList() {
        //查询列表
        this.listLoading = true;        
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
        debugger
        //查询失败列表
        this.listLoading = true;
        this.listQuery_fail.dataTime =  this.listQuery.dataTime
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
        debugger
        this.listLoading = true;
        this.listQuery_warning.dataTime =  this.listQuery.dataTime
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
      getList_success() {
        //查询成功列表
        this.listLoading = true;
        this.listQuery_success.dataTime =  this.listQuery.dataTime
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
        this.listLoading = false;
        this.listQuery_execl.dataTime =  this.listQuery.dataTime
        this.api({
          url: "/logConfig/dailyLogToExecl",
          method: "get",
          params: this.listQuery_execl
        }).catch(() => {
            _vue.$message.success("导出成功")
            _vue.getList()
        })
      },
      handleSizeChange(val) {
        //改变每页数量
        this.listQuery.pageRow = val
        this.handleFilter();
      },
      handleCurrentChange(val) {
        //改变页码
        this.listQuery.pageNum = val
        this.getList();
      },
      handleFilter() {
        //查询事件
        this.listQuery.pageNum = 1
        this.getList()
      },
      getIndex($index) {
        //表格序号
        return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
      },
      removeUser($index) {
        let _vue = this;
        this.$confirm('确定删除此日志?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let script = _vue.list[$index];
          //user.deleteStatus = '2';
          this.tempScriptConfig.id = script.id;
          _vue.api({
            url: "/logConfig/deleteLog",
            method: "post",
            data: this.tempScriptConfig
          }).then(() => {
            _vue.$message.success("删除成功")
            _vue.getList()
          }).catch(() => {
            _vue.$message.error("删除失败")
          })
        })
      },
    }
  }
</script>
<style scoped>
.el-table /deep/ .cell.el-tooltip {
      white-space: pre-wrap;
  }
</style>
