<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
      <el-form-item>
          <el-input v-model="listQuery.IP" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :row-style="checkDel">
      <!-- <span v-if="scope.row.execStatus=2" style="color:red">{{ scope.row.execStatus }}</span>         -->
      <el-table-column align="center" label="序号"     prop="id" width="40">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="IP"         prop="ip" ></el-table-column>
      <el-table-column align="center" label="用户名"      prop="USER"></el-table-column>
      <el-table-column align="center" label="命令"        prop="shellName" style="width: 60px;" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      <el-table-column align="center" width="400" label="执行结果"    prop="execResult" style="width: 60px;" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      <el-table-column align="center" width="80"  label="执行状态"    prop="execStatus" :cell-class-name="checkDel"></el-table-column>
      <el-table-column align="center" label="执行时间"    prop="execTime" width="100"></el-table-column>
      <el-table-column align="center" width="80"  label="执行次数"    prop="execNum"></el-table-column>
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
        list: [],//表格的数据
        alltype : [],
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
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
          shellName  : '',
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
        if (this.list[rowIndex].execStatus==2){
          return 'color: #FF0000;font-weight: 500;'
        }
        if (this.list[rowIndex].execStatus==1){
          return 'color: #FFC125;font-weight: 500;'
        }
        if (this.list[rowIndex].execStatus==0){
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
