<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          上次同步时间: <el-input v-model="dataTime" style='width: 200px;' size="small" type="text" readonly></el-input>
          <el-button type="info"     size="small" prefix-icon="el-icon-search" @click="flushList">搜索</el-button>
          <el-button type="primary"  size="small" prefix-icon="el-icon-search" @click="addSyncServer">同步</el-button>
        </el-form-item> 
      </el-form>
    </div>
    <dt2> 自上一次同步后新增的服务器 </dt2>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="220" @select='onTableSelect'>
      <el-table-column align="center" label="序号" width="60" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column> 
      <el-table-column type="selection" width="55">                                            </el-table-column>       
      <el-table-column align="center"   label="服务器"       prop="host"  width="150"  sortable></el-table-column>
      <el-table-column align="center"   label="实例名"       prop="serviceName" ></el-table-column>
      <el-table-column align="center"   label="机房"         prop="location" ></el-table-column>
      <el-table-column align="center"   label="OS用户名"     prop="userName" ></el-table-column>
      <el-table-column align="center"   label="DB用户名"     prop="dbUsername" ></el-table-column>
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

    <br>
    <dt3>自上一次同步后删除的服务器(monitor会删除)</dt3>
    <el-table :data="listDel" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="220"  @select='onTableDel'>
      <el-table-column align="center" label="序号" width="60" fixed="left">
        <template slot-scope="scope">
          <span v-text="getDelIndex(scope.$index)"> </span>
        </template>
      </el-table-column>   
      <el-table-column type="selection" width="55">                                            </el-table-column>            
      <el-table-column align="center"   label="服务器"       prop="host"  width="150"  sortable></el-table-column>
      <el-table-column align="center"   label="实例名"       prop="serviceName" ></el-table-column>
      <el-table-column align="center"   label="机房"         prop="location" ></el-table-column>
      <el-table-column align="center"   label="OS用户名"     prop="userName" ></el-table-column>
      <el-table-column align="center"   label="DB用户名"     prop="dbUsername" ></el-table-column>
      <el-table-column align="center"   label="服务器类型"    prop="systemType" ></el-table-column>
      <el-table-column align="center"   label="适用版本"      prop="systemVersion" width="360" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
    </el-table>
   
    <el-pagination
      @size-change="handleDelSizeChange"
      @current-change="handleDelCurrentChange"
      :current-page="listDelQuery.pageNum"
      :page-size="listDelQuery.pageRow"
      :total="totalDelCount"
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
        showCronBox: false,
        totalCount: 0, //分页组件--数据总条数
        list     : [],//表格的数据
        listDel  : [],//表格的数据
        selectHost: [],//选中值
        delHost: [],//选中值
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        listDelQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
               
      }
    
    },
    created() {
      this.getList();
      this.getDelList();
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      getList(rows, row) {
        //查询列表
        debugger
        this.listLoading = true
        this.api({
          
          url: "/serverConfig/getSyncServer",
          method: "get",
          params: this.listQuery
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
          this.dataTime = data.list[0].creationDate;
        })
      },

      getDelList() {
        //debugger
        //查询列表
        this.listLoading = true;
        this.api({
          
          url: "/serverConfig/getDelServer",
          method: "get",
          params: this.listDelQuery
        }).then(data => {
          this.listLoading = false;
          this.listDel = data.list;
          this.totalDelCount = data.totalCount;
        })
      },

      onTableSelect(rows, row) {
       // debugger  
        let selected = rows.length && rows.indexOf(row) !== -1
        if(selected == true){
          this.selectHost.push(rows[rows.indexOf(row)].host)
        }
	      //alert(this.selecHost)  // true就是选中，0或者false是取消选中
      },
      
      onTableDel(rows, row) {
       // debugger  
        let selected = rows.length && rows.indexOf(row) !== -1
        if(selected == true){
          this.delHost.push(rows[rows.indexOf(row)].host)
        }
	    },
      addSyncServer() {
        debugger
        let _vue = this;
        this.dialogFormVisible = true

        if(this.selectHost.length != 0){
          var allValue = '';
          for(var oldType in this.selectHost){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue +  this.selectHost[oldType] + ',';           
          }
          this.listQuery.strSelectHost = allValue
        }else{
          this.listQuery.strSelectHost = ''
        }

        if(this.delHost.length != 0){
          var allValue = '';
          for(var oldType in this.delHost){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue +  this.delHost[oldType] + ',';           
          }
          this.listQuery.strDelHost = allValue
        }else{
          this.listQuery.strDelHost = ''
        }

        //添加新配置
        this.api({
          url: "/serverConfig/addSyncServer",
          method: "get",
          params: this.listQuery
        }).then(() => {
          _vue.$message.success("同步成功")
          this.getList();
          this.getDelList();
          this.selectHost = [];
          this.dialogFormVisible = false
        })
      },

      flushList($index){
        this.listQuery.pageNum = 1;
        this.listDelQuery.pageNum = 1;
        
        this.getList();
        this.getDelList();
      },
      handleSizeChange(val) {
        //改变每页数量
        this.listQuery.pageRow = val
        this.handleFilter();
      },
      handleDelSizeChange(val) {
        //改变每页数量
        this.listDelQuery.pageRow = val
        this.handleDelFilter();
      },
      handleCurrentChange(val) {
        //改变页码
        this.listQuery.pageNum = val
        this.getList();
      },
      handleDelCurrentChange(val) {
        //改变页码
        this.listDelQuery.pageNum = val
        this.getDelList();
      },
      handleFilter() {
        //查询事件
        this.listQuery.pageNum = 1
        this.getList()
      },
      handleDelFilter() {
        //查询事件
        this.listDelQuery.pageNum = 1
        this.getDelList()
      },
      getIndex($index) {
        //表格序号
        return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
      },

      getDelIndex($index) {
        //表格序号
        return (this.listDelQuery.pageNum - 1) * this.listDelQuery.pageRow + $index + 1
      },
      
    }
  }
</script>
<style>
 dt3 {text-align:left;  margin-left:5px; color: #FF0000;}
 dt2 {text-align:left;  margin-left:5px; color: #008000;}
</style>