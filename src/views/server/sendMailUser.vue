<template>
  <div class="app-container">    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-input v-model="listQuery.alarmGroup" placeholder="请输入告警组" style='width: 300px;' type="text" clearable></el-input>      
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>        
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加联系人 </el-button> 
        </el-form-item>  
      </el-form>
  </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :row-style="checkDel" height="530"  @expand-change="getListUser">
      <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column type="expand" >
        <template  slot-scope="scope">
          <el-table :data="listUser" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row>
            <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
                <template slot-scope="inner">
                  <span v-text="getIndex(inner.$index)"> </span>
                </template>
            </el-table-column>  
            <el-table-column align="center" label="用户名"  prop="userName"></el-table-column> 
            <el-table-column align="center" label="邮箱"   prop="mail"> </el-table-column>
            <el-table-column align="center" width="70" v-if="hasPerm('scriptConfig:update')">
              <template slot-scope="scope_inner">
                <el-button type="text" icon="el-icon-edit" @click="showUpdate(scope_inner.$index)"></el-button>
                <el-button type="text" icon="el-icon-delete" 
                     @click="removeUser(scope_inner.$index)">
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            @size-change   ="handleInnerSizeChange"
            @current-change="handleInnerCurrentChange"
            :current-page  ="listQuery.pageNum"
            :page-size     ="listQuery.pageRow"
            :total         ="totalInnerCount"
            :page-sizes    ="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper">
          </el-pagination>
        </template>
      </el-table-column>
      <el-table-column align="center"     label="用户组"      prop="alarmGroup"  ></el-table-column>
      <el-table-column align="center"     label="告警级别"    prop="alarmLevel" ></el-table-column>
      <el-table-column align="center"     label="创建时间"    prop="createTime" ></el-table-column>
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
        <el-form-item label="用户名"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.userName"> 
          </el-input>
        </el-form-item>       
        <el-form-item label="邮箱"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.mail">
          </el-input>
        </el-form-item> 
        <el-form-item label="所属组" required label-width="150px">
          <el-select v-model="tempScriptConfig.alarmGroup" placeholder="请选择" style='width: 255px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allAlarmGroup"
              :key="item.id"
              :label="item.alarmGroup"
              :value="item.alarmGroup">
            </el-option>
          </el-select>
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
  export default {
    data() {
      return {
        totalCount: 0, //分页组件--数据总条数
        list          : [],//表格的数据
        listLoading   : false,//数据加载等待动画   
        allAlarmGroup : '',  
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          alarmGroup : ''
    
        },
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑用户',
          create: '新建用户'
        },
        tempScriptConfig: {
          userName       : '',
          mail           : '',
          alarmGroup     : ''
        },
        
      }
    
    },
    created() {
      this.getList();
      this.getMailGroup();
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

      getMailGroup() {
        debugger
        //查询列表
        this.listLoading = true;
        //parseTime(this.listQuery.dataTime)
        this.api({ 
          url: "/sendMailConfig/getMailGroup",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading   = false;
          this.allAlarmGroup = data.list;
        })
      },

      getListUser(data,expandedRows) {
        debugger
        //查询列表
        this.listLoading = true;
        //parseTime(this.listQuery.dataTime)
        this.listQuery_user = data
        this.listQuery_user.pageNum  = this.listQuery.pageNum
        this.listQuery_user.pageRow  = this.listQuery.pageRow
        this.api({ 
          url: "/sendMailConfig/listMailUser",
          method: "get",
          params: this.listQuery_user

        }).then(data => {
          this.listLoading     = false;
          this.listUser        = data.list;
          this.totalInnerCount = data.totalCount;
        })
        //如果展开行数大于1
        if(expandedRows.length>1){
        //shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
          expandedRows.shift();
        } 
      }, 

      showCreate() {
        //显示新增对话框
        this.tempScriptConfig.userName        =  "";  
        this.tempScriptConfig.mail            =  "";
        this.tempScriptConfig.alarmGroup      =  ""; 
        this.dialogStatus                     =  "create"
        this.dialogFormVisible                =  true
      },
      showUpdate($index) {
        debugger
        let shell                             =  this.listUser[$index];
        this.tempScriptConfig.userName        =  shell.userName;  
        this.tempScriptConfig.mail            =  shell.mail;
        this.tempScriptConfig.alarmGroup      =  shell.alarmGroup; 
        this.tempScriptConfig.id              =  shell.id;
        this.dialogStatus                     =  "update"
        this.dialogFormVisible                =  true
      },
      createScript() {
        let _vue = this;
        //添加新用户
        this.api({
          url: "/sendMailConfig/addMailUser",
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
          url: "/sendMailConfig/updateMailUser",
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
      handleInnerSizeChange(val) {
        //改变每页数量
        debugger
        this.listUser.pageRow = val
        this.handleInnerFilter();
      },
      handleInnerCurrentChange(val) {
        debugger
        this.listUser.pageNum = val
        this.getListUser();         
      },
      handleInnerFilter() {
        debugger
        //查询事件       
        this.listUser.pageNum = val
        this.getListUser();   
      },
      getIndex($index) {
        //表格序号
        debugger
        return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
      },
      // getInnerIndex($index) {
      //   //表格序号
      //   //alert(($index+1))
      //   return (this.listData.pageNum - 1) * this.listData.pageRow + $index
      // },
    }
  }
</script>

<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
  dt {text-align:left;  margin-left:5px;}
</style>