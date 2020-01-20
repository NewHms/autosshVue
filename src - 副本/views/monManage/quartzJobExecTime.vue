<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
      <el-form-item>
          <el-input v-model="listQuery.shellDesc" placeholder="请输入命令描述" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530">
      <el-table-column align="center" label="序号" width="40" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>        
      <el-table-column align="center" label="线程ID"     prop="fireInstanceId" width = '130'></el-table-column>
      <el-table-column align="center" label="IP"        prop="jobHost"></el-table-column>
      <el-table-column align="center" label="监控服务器" prop="monitorHost"></el-table-column>
      <el-table-column align="center" label="执行命令"   prop="jobShellName" width = '200' :show-overflow-tooltip="true"></el-table-column>
      <el-table-column align="center" label="命令描述"   prop="jobShellDesc" width = '150' :show-overflow-tooltip="true"></el-table-column>
      <el-table-column align="center" label="开始时间"   prop="jobFireTime"></el-table-column>
      <el-table-column align="center" label="当前时间"   prop="systemTime"></el-table-column>
      <el-table-column align="center" label="持续时间(s)" prop="jobRunningTime"></el-table-column>
      <el-table-column align="center" width="40" label="管理" v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="text" class="fa fa-close" 
                     @click="removeUser(scope.$index)">
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
  export default {
    data() {
      return {
        showCronBox: false,
        totalCount: 0, //分页组件--数据总条数
        list: [],//表格的数据
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        dialogStatus: 'create',
        dialogFormVisible: false,
        tempScriptConfig: {
          fireInstanceId  : '',  
          jobRunningTime  : '',
          jobFireTime     : '',  
          jobHost         : '',
          jobShellName    : '',  
          jobShellDesc    : '',
          systemTime      : '',
          monitorHost     : ''
        },
        
      }
    
    },
    created() {
      this.getList();
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      getList() {
        //查询列表
        this.listLoading = true;
        this.api({
          url: "/serverConfig/getAllRunJob",
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
      removeUser($index) {
        let _vue = this;
        this.$confirm('确定强制停止JOB?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let script = _vue.list[$index];
          //user.deleteStatus = '2';
          this.tempScriptConfig.fireInstanceId = script.fireInstanceId;
          _vue.api({
            url: "/serverConfig/killRunJob",
            method: "post",
            data: this.tempScriptConfig
          }).then(() => {
            _vue.$message.success("停止成功")
            _vue.getList()
          }).catch(() => {
            _vue.$message.success("停止成功")
            _vue.getList()
          })
        })
      },
    }
  }
</script>

