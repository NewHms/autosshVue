<template>
  <div class="app-container">    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-input v-model="listQuery.alarmGroup" placeholder="请输入告警组" style='width: 300px;' type="text" clearable></el-input>      
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>        
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加告警组 </el-button> 
        </el-form-item>  
      </el-form>
  </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530" >
      <!-- <span v-if="scope.row.execStatus=2" style="color:red">{{ scope.row.execStatus }}</span>         -->
      <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center"     label="用户组"      prop="alarmGroup"  ></el-table-column>
      <el-table-column align="center"     label="告警级别"    prop="alarmLevel" ></el-table-column>
      <el-table-column align="center"     label="创建时间"    prop="createTime" ></el-table-column>
      <el-table-column align="center" width="70" v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-edit" @click="showUpdate(scope.$index)"></el-button>
          <el-button type="text" icon="el-icon-delete" 
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :model="tempScriptConfig" label-position="left" label-width="80px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item label="用户组"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.alarmGroup"> 
          </el-input>
        </el-form-item>       
        <el-form-item label="告警级别"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.alarmLevel">
          </el-input>
        </el-form-item>        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="success" @click="createScript">创 建</el-button>
        <el-button type="primary" v-else @click="updateScript">修 改</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
  import {mapGetters} from 'vuex'
  import {formatDate} from '@/utils/commonUtil.js'
  export default {
    data() {
      return {
        totalCount: 0, //分页组件--数据总条数
        dataTime    : '',
        list        : [],//表格的数据
        listLoading: false,//数据加载等待动画     
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑告警组',
          create: '新建告警组'
        },
        tempScriptConfig: {
          alarmLevel     : '',
          alarmGroup     : '',
          createTime     : ''
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
        //parseTime(this.listQuery.dataTime)
        this.api({ 
          url: "/sendMailConfig/listMailGroup",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      }, 
      showCreate() {
        //显示新增对话框
        this.tempScriptConfig.alarmLevel      =  "";  
        this.tempScriptConfig.alarmGroup      =  "";
        this.dialogStatus                     =  "create"
        this.dialogFormVisible                =  true
      },
      showUpdate($index) {
        let shell                             = this.list[$index];
        this.tempScriptConfig.alarmLevel      =  shell.alarmLevel;  
        this.tempScriptConfig.alarmGroup      =  shell.alarmGroup; 
        this.tempScriptConfig.id              =  shell.id;
        this.dialogStatus                     =  "update"
        this.dialogFormVisible                =  true
      },
      createScript() {
        let _vue = this;
        //添加新用户
        this.api({
          url: "/sendMailConfig/addMailGroup",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          _vue.$message.success("新增成功")
          this.getList();
          this.dialogFormVisible = false
        })
      },
      updateScript() {
        debugger
        //修改用户信息
        let _vue = this;
        this.api({
          url: "/sendMailConfig/updateMailGroup",
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
      handleSizeChange(val) {
        //改变每页数量
        debugger
        this.listQuery.pageRow = val
        this.handleFilter();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val
        this.getList();         
      },
      handleFilter() {
        //查询事件       
        this.listQuery.pageNum = val
        this.getList();   
      },
      getIndex($index) {
        //表格序号
        //debugger
        return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
      },
    }
  }
</script>
