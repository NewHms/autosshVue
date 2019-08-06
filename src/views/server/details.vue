<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>

        <el-form-item>
          <el-input v-model="listQuery.host" placeholder="请输入服务器IP地址" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加 </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530">
      <el-table-column align="center" label="序号" prop="id" width="80" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
        <el-table-column align="center" label="服务器"        prop="host" sortable></el-table-column>
        <el-table-column align="center" label="端口"          prop="post"></el-table-column>
        <el-table-column align="center" label="备份路径"      prop="backupUrl"></el-table-column>
        <el-table-column align="center" label="备份个数"      prop="backupNum"></el-table-column>
        <el-table-column align="center" label="数据库类型"    prop="systemType" sortable></el-table-column>
        <el-table-column align="center" label="实例名"        prop="serviceName"></el-table-column>
        <el-table-column align="center" label="监控服务器"    prop="applicationServer"></el-table-column>
        <el-table-column align="center"  width="70" v-if="hasPerm('scriptConfig:update')">
          <template slot-scope="scope">
            <el-button type="text" prefix-icon="el-icon-search" @click="goToDetails(scope.$index)">详细信息
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
        isIndeterminate: true,
        totalCount: 0, //分页组件--数据总条数
        list: [],//表格的数据
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
          
        dialogFormVisible: false,
        tempScriptConfig: {
          host                   : '',
          serviceName            : '',
          post                   : '',
          applicationServer      : '',
          backupUrl              : '',
          backupNum              : '',
          userName               : '',
          dbUsername             : '',
          password               : '',
          dbPassword             : '',
          systemType             : ''   
        },  
      }
    },
    created() {
      this.getList();
      // if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
      //   this.getAllVersionType();
      //   this.getAllAppServer();
      //   this.getAllServer();
      // }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      getList() {
        debugger
        //查询列表
        this.listLoading = true;
        //this.listQuery.test = this.allAppServer;
        this.api({

          url: "/serverConfig/getDetails",
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
      goToDetails($index) {
        debugger
        let _vue = this;
        let details = _vue.list[$index];
        this.$router.push({name: '服务器配置', params: {host: details.host,
                                                       serviceName : details.serviceName,
                                                       systemType  : details.systemType}})
      },
    }
  }
</script>
