<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
        <el-form-item>
          <el-input v-model="listQuery.ip" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530">
      <el-table-column align="center" label="序号"     prop="id" width="40" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column >
      <el-table-column align="center" label="IP"          prop="ip" width="200" sortable></el-table-column>
      <el-table-column align="center" label="TYPE"          prop="type" width="80"></el-table-column>
      <el-table-column align="center" label="监控项"         prop="dailyDesc"></el-table-column>
      <el-table-column align="center" label="通用阀值">
        <el-table-column align="center" label="WARNING"   prop="wanring"   width="100"></el-table-column>
        <el-table-column align="center" label="CRITICAL"  prop="critical" width="100"></el-table-column>
      </el-table-column>
      <el-table-column align="center" label="私有阀值">
        <el-table-column align="center" label="WARNING"   prop="warningPriv"   width="100"></el-table-column>
        <el-table-column align="center" label="CRITICAL"  prop="criticalPriv" width="100"></el-table-column>
      </el-table-column>
      <el-table-column align="center" label="判断规则"   prop="dailyRule" width="90"></el-table-column>
      <el-table-column align="center" label="编辑"           width="100" v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="primary" icon="edit" @click="showUpdate(scope.$index)">修改</el-button>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :model="tempScriptConfig" label-position="left" label-width="80px"
               style='width: 350px; margin-left:50px;'>
        <el-form-item label="ip"  required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.ip" disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="监控项"  required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.dailyDesc" disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="WARNING" required  label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.waring" disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="CRITICAL" required   label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.critical" disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="WARNING_PRIV" required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.waringPriv">
          </el-input>
        </el-form-item>
        <el-form-item label="CRITICAL_PRIV" required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.criticalPriv">
          </el-input>
        </el-form-item>
        <el-form-item label="判断规则" required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.dailyRule" disabled="true">
          </el-input>
        </el-form-item>
      </el-form>  
      <div slot="footer" class="dialog-footer" >
        <el-button @click="dialogFormVisible = false;alltypes=[]">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="success" @click="createScript">创 建</el-button>
        <el-button type="primary" v-else @click="updateScript">修 改</el-button>
      </div>
    </el-dialog>
  </div>
 

</template>
<script>
  import {mapGetters} from 'vuex'

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
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑',
          create: '新增配置'
        },
        tempScriptConfig: {
          dailyDesc    : '',
          ip           : '',
          warning      : '',
          critical     : '',
          warningPriv  : '',
          criticalPriv : '',
          dailyRule    : ''
        },
        
      }
    
    },
    created() {
      this.getList();
      this.getOneList();
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
        this.api({
          
          url: "/dailyConfig/listConfig",
          method: "get",
          params: this.listQuery
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },
      getOneList() {
        //查询列表
        this.listLoading = true;
        this.api({
          
          url: "/dailyConfig/listConfigOne",
          method: "get",
          params: this.listQuery
        }).then(data => {
          this.listLoading = false;
          this.listOne = data.list;
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
      showUpdate($index) {
        debugger
        let shell = this.list[$index];
        this.tempScriptConfig.warning      = shell.warning;
        this.tempScriptConfig.ip           = shell.ip;
        this.tempScriptConfig.critical     = shell.critical;
        this.tempScriptConfig.warningPriv  = shell.warningPriv;
        this.tempScriptConfig.criticalPriv = shell.criticalPriv;
        this.tempScriptConfig.dailyRule    = shell.dailyRule,
        this.tempScriptConfig.dailyDesc    = shell.dailyDesc;
        this.tempScriptConfig.id           = shell.id;
        this.dialogStatus                  = "update"
        this.dialogFormVisible             = true
      },
      
      createScript() {
        let _vue = this;
        //添加新配置
        this.api({
          url: "/dailyConfig/addConfig",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          _vue.$message.success("新增成功")
          this.getList();
          this.getOneList();
          this.dialogFormVisible = false
        })
      },
      updateScript() {
        //修改配置信息
        let _vue = this;
        debugger
        this.api({
          url: "/dailyConfig/updateIdConfig",
          method: "post",
          data: this.tempScriptConfig
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
              _vue.getOneList();
            }
          })
        })
      },
    }
  }
</script>
