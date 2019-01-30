<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row>
      <el-table-column align="center" label="序号" prop="id" width="80"></el-table-column>
      <el-table-column align="center" label="命令" prop="shellName" style="width: 60px;" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column align="center" label="命令描述" prop="shellDesc" width="130"></el-table-column>
      <el-table-column align="center" label="适用系统" prop="systemType" width="100"></el-table-column>
      <el-table-column align="center" label="系统版本" prop="systemVersion" width="100"></el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="160"></el-table-column>
      <el-table-column align="center" label="编辑" width="220" v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="primary" icon="edit" @click="showUpdate(scope.$index)">修改</el-button>
          <el-button type="danger" icon="delete" v-if="scope.row.userId!=userId "
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
               style='width: 300px; margin-left:50px;'>
        <el-form-item label="命令" required v-if="dialogStatus=='create'">
          <el-input type="text" v-model="tempScriptConfig.shellName">
          </el-input>
        </el-form-item>
        <el-form-item label="命令描述" v-if="dialogStatus=='create'" required>
          <el-input type="text" v-model="tempScriptConfig.shellDesc">
          </el-input>
        </el-form-item>
        <el-form-item label="适用系统" v-else>
          <el-input type="text" v-model="tempScriptConfig.systemType" placeholder="不填则表示不修改">
          </el-input>
        </el-form-item>
        <el-form-item label="系统版本" required v-if="dialogStatus=='create'">
          <el-input type="text" v-model="tempScriptConfig.systemVersion">
          </el-input>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="success" @click="createUser">创 建</el-button>
        <el-button type="primary" v-else @click="updateUser">修 改</el-button>
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
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        roles: [],//角色列表
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑',
          create: '新建用户'
        },
        tempScriptConfig: {
          shellName: '',
          shellDesc: '',
          systemType: '',
          systemVersion: ''
        }
      }
    },
    created() {
      this.getList();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllRoles();
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      getAllRoles() {
        this.api({
          url: "/user/getAllRoles",
          method: "get"
        }).then(data => {
          this.roles = data.list;
        })
      },
      getList() {
        //查询列表
        this.listLoading = true;
        this.api({
          
          url: "/scriptConfig/listScriptConfig",
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
        //显示新增对话框
        this.tempScriptConfig.shellName = "";
        this.tempScriptConfig.shellDesc = "";
        this.tempScriptConfig.systemType = "";
        this.tempScriptConfig.systemVersion = "";
      
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      },
      showUpdate($index) {
        let user = this.list[$index];
        this.tempScriptConfig.shellName = user.username;
        this.tempScriptConfig.nickname = user.nickname;
        this.tempScriptConfig.roleId = user.roleId;
        this.tempScriptConfig.userId = user.userId;
        this.tempScriptConfig.deleteStatus = '1';
        this.tempScriptConfig.password = '';
        this.dialogStatus = "update"
        this.dialogFormVisible = true
      },
      createUser() {
        //添加新用户
        this.api({
          url: "/user/addUser",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          this.getList();
          this.dialogFormVisible = false
        })
      },
      updateUser() {
        //修改用户信息
        let _vue = this;
        this.api({
          url: "/user/updateUser",
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
        this.$confirm('确定删除此用户?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let user = _vue.list[$index];
          user.deleteStatus = '2';
          _vue.api({
            url: "/user/updateUser",
            method: "post",
            data: user
          }).then(() => {
            _vue.getList()
          }).catch(() => {
            _vue.$message.error("删除失败")
          })
        })
      },
    }
  }
</script>
