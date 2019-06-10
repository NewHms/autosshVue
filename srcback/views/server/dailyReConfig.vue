<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
        <el-form-item>
          <el-input v-model="listQuery.dailyReDesc" placeholder="请输入正则描述" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加 </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530">
      <el-table-column align="center" label="序号"     prop="id" width="40" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="code"             prop="dailyReCode" width="95" sortable></el-table-column>
      <el-table-column align="center" label="正则表达式"        prop="dailyRe" width="320"></el-table-column>
      <el-table-column align="center" label="正则描述"          prop="dailyReDesc" width="400"></el-table-column>
      <el-table-column align="center" label="循环处理"      prop="isLoop" width="80"></el-table-column>
      <el-table-column align="center" label="计算处理"      prop="isCalc" width="80"></el-table-column>
      <el-table-column align="center" label="编辑"           width="200" v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="primary" icon="edit" @click="showUpdate(scope.$index)">修改</el-button>
          <el-button type="danger" icon="delete" 
                     @click="removeUser(scope.$index)">删除
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :model="tempScriptConfig" label-position="left" label-width="80px"
               style='width: 350px; margin-left:50px;'>
        <el-form-item label="code"  required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.dailyReCode">
          </el-input>
        </el-form-item>
        <el-form-item label="正则表达式"  required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.dailyRe" >
          </el-input>
        </el-form-item>
        <el-form-item label="正则描述" required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.dailyReDesc">
          </el-input>
        </el-form-item>
        <el-form-item label="是否循环处理" required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.isLoop">
          </el-input>
        </el-form-item>
        <el-form-item label="是否计算处理" required label-width="145px">
          <el-input type="text" v-model="tempScriptConfig.isCalc">
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
          dailyRe      : '',
          dailyReCode  : '',
          dailyReDesc  : '',
          isLoop       : '',
          isCalc       : ''
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
        debugger
        //查询列表
        this.listLoading = true;
        this.api({
          
          url: "/dailyReConfig/listDailyRe",
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
      showCreate() {
        debugger
        //显示新增对话框
        this.tempScriptConfig.dailyRe      = "";
        this.tempScriptConfig.dailyReDesc  = "";
        this.tempScriptConfig.dailyReCode  = "";
        this.tempScriptConfig.isLoop       = "";
        this.tempScriptConfig.isCalc       = "";
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      },
      showUpdate($index) {
        debugger
        let shell = this.list[$index];
        this.tempScriptConfig.dailyRe      = shell.dailyRe;
        this.tempScriptConfig.dailyReDesc  = shell.dailyReDesc;
        this.tempScriptConfig.dailyReCode  = shell.dailyReCode;
        this.tempScriptConfig.isLoop       = shell.isLoop;
        this.tempScriptConfig.isCalc       = shell.isCalc;
        this.tempScriptConfig.id           = shell.id;
        this.dialogStatus                  = "update"
        this.dialogFormVisible             = true
      },
      
      createScript() {
        let _vue = this;
        //添加新配置
        this.api({
          url: "/dailyReConfig/addDailyRe",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          _vue.$message.success("新增成功")
          this.getList();
          this.dialogFormVisible = false
        })
      },
      updateScript() {
        //修改配置信息
        let _vue = this;
        debugger
        this.api({
          url: "/dailyReConfig/updateDailyRe",
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
            }
          })
        })
      },
      removeUser($index) {
        let _vue = this;
        this.$confirm('确定删除此命令?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let script = _vue.list[$index];
          //user.deleteStatus = '2';
          this.tempScriptConfig.id = script.id;
          _vue.api({
            url: "/dailyReConfig/deleteDailyRe",
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
