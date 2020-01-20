<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
        <el-form-item>
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
      <el-table-column align="center"   label="服务器"       prop="host"  width="150"  sortable></el-table-column>
      <el-table-column align="center"   label="实例名"       prop="serviceName" ></el-table-column>
      <el-table-column align="center"   label="机房"         prop="location" ></el-table-column>
      <el-table-column align="center"   label="用户名" width="260" :show-overflow-tooltip="true" @contextmenu="showMenu">
          <template slot-scope="scope">
            <dt>OS用户名: {{ scope.row.userName }}</dt>
            <dt>DB用户名: {{ scope.row.dbUsername }}</dt> 
          </template>
      </el-table-column>
      <el-table-column align="center"   label="服务器类型"     prop="systemType" ></el-table-column>
      <el-table-column align="center"   label="适用版本"       prop="systemVersion" width="360" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
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
        tempScriptConfig: {
          type            : '',  
          shellName       : '',
          shellDesc       : '',  
          code            : '',
          dailyRule       : '',  
          shellUseRe      : '',
          dailySuccess    : '',  
          dailyWarning    : '',
          dailyCritical   : '',  
          monitorWarning  : '', 
          monitorCritical : '',  
          execTime        : '',
          timeOut         : '',
          systemType      : '',
          withColumns     : []
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
          
          url: "/serverConfig/getSyncServer",
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
      createScript() {
        let _vue = this;
        //添加新用户
        this.api({
          url: "/scriptConfig/addScript",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          _vue.$message.success("新增成功")
          this.getList();
          this.dialogFormVisible = false
        })
      },

    }
  }
</script>
<style>
 dt {text-align:left;  margin-left:5px;}
</style>