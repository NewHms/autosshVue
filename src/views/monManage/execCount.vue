<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>

        <el-form-item>
          <el-input v-model="listQuery.host" placeholder="请输入服务器IP地址" style='width: 300px;' type="text" 
            clearable></el-input>
          <el-select v-model="listQuery.applicationServer" placeholder="请选择机房" label-width="80px" style='width: 15%' clearable> 
            <el-option
              v-for="item in allApplicaServer"
              :key="item.appId"
              :label="item.appType"
              :value="item.appType">
              <span style="float: left">{{ item.appType }}</span>
              <span style="float: right">{{ item.valuesDesc }}</span>
            </el-option>
          </el-select>  
          <el-select v-model="tempScriptConfig.shellDesc" placeholder="请选择命令描述" label-width="80px" multiple style='width: 30%;max-height:300px;'> 
            <el-option
              v-for="item in allShellDesc"
              :key="item.code"
              :label="item.shellDesc"
              :value="item.shellDesc"    
            >
            </el-option>
          </el-select> 
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530" :cell-class-name="checkDelInner">
      <el-table-column align="center" label="序号" prop="id" width="40" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>  
      <el-table-column align="center"   label="服务器信息" width="250">
        <template slot-scope="scope">
          <dt>IP地址: {{ scope.row.host }}</dt>
          <dt>逻辑名: {{ scope.row.logicalInfo }}</dt>
          <dt>类型:   {{ scope.row.systemType }}</dt>
          <dt>实例名: {{ scope.row.serviceName }}</dt> 
        </template>
      </el-table-column>
      <el-table-column align="center"   label="命令信息"  :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <dt>命令描述   : {{ scope.row.shellDesc }}</dt> 
          <dt>执行频率   : {{ scope.row.execTime }}</dt>
        </template>
      </el-table-column>
      <el-table-column   align="center" width="200"     label="当前时间"    prop="currentDate">
      </el-table-column>
      <el-table-column   align="center" width="120"     label="当前实际执行次数"    prop="execRealCount">
      </el-table-column>
      <el-table-column   align="center" width="120"     label="当前计划执行次数"    prop="execExpecCount">
      </el-table-column>
      <el-table-column   align="center" width="80"     label="全天计划执行次数"    prop="execCount">
      </el-table-column>
      <el-table-column align="center"     label="对比状态"       prop="execStatus" width="80">
        <template slot-scope="scope">
          <dt v-if="scope.row.execStatus == 'NG'"     class="fa fa-close" type = "text">
          </dt>
          <dt v-if="scope.row.execStatus == 'OK'"  class="fa fa-check" type = "text">
          </dt>
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

  export default {
    components: {

    },
    data() {
      
      return {    
        isIndeterminate: true,
        showCronBox: false,
        totalCount : 0, //分页组件--数据总条数
        listLoading: false,//数据加载等待动画
        //定义变量
        list: [],//表格的数据
        allShellDesc     : [],
        allApplicaServer : [],
        listQuery: {
          pageNum   : 1,//页码
          pageRow   : 50,//每页条数
        },
        dialogStatus: 'create',
        dialogFormVisible: false,
        tempScriptConfig: {
          host              : "",
          serviceName       : "",
          systemType        : "",
          execTime          : "",
          execCount         : "",
          execExpecCount    : "",
          execRealCount     : "",
          shellDesc         : "",
          logicalInfo       : "",
          currentDate       : "",
          execStatus        : ""
        },
        
      }
    },
    
    created() {
      this.getList();
      this.getAllAppServer();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllShellDesc();
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      checkDelInner({row, column, rowIndex, columnIndex}){
        if (this.list[rowIndex].execStatus=='NG'){
          return 'countNG'
        }
        if (this.list[rowIndex].execStatus=='OK'){
          return 'countOK'
        }
      },
      getAllShellDesc() {
        this.api({
          url: "/logConfig/getAllShellDesc",
          method: "get"
        }).then(data => {
          this.allShellDesc = data.list;
        })
      },
      onCopy (e) {
        this.$message.success("内容已复制到剪切板！")
      },
      // 复制失败时的回调函数
      onError (e) {
        this.$message.error("抱歉，复制失败！")
      },

      getAllAppServer() {
        this.api({
          url: "/commonsConfig/getAllAppServer",
          method: "get"
        }).then(data => {
          this.allApplicaServer = data.list;
        })
      },

      getList() {
        debugger
        //查询列表
        var allValue = '';
        for(var oldType in this.tempScriptConfig.shellDesc){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
        }
        this.listQuery.strShellDesc = allValue
        this.listLoading = true;
        this.api({ 
          url: "/alarmConfig/getExecCountStatus",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
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
     
    }
  }
</script>
<style>
  dt {text-align:left;  margin-left:5px;}
  .countNG{
    color: #FF0000;font-weight: 500;
  }
  .countOK{
    color: #008000;font-weight: 500;
  }
</style>