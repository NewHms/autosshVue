<template>
  <div class="app-container">    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-input v-model="listQuery.userName" placeholder="请输入告警组" style='width: 300px;' type="text" clearable></el-input>      
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>  
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加联系人</el-button>        
        </el-form-item>  
      </el-form>
  </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row  height="530"  :cell-class-name="checkDel">
      <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center"     label="用户名"      prop="userName"  ></el-table-column>
      <el-table-column align="center"     label="负责服务器"    prop="dbContact" ></el-table-column>
      <el-table-column align="center"     label="邮箱"  prop="mail"  > </el-table-column>
      <el-table-column align="center"     label="手机号"  prop="mobile"  > </el-table-column>
      <el-table-column align="center"     label="创建时间"    prop="createTime" ></el-table-column>
      <el-table-column align="center"     label="管理" width="70" v-if="hasPerm('scriptConfig:update')">
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form class="small-space" :model="tempScriptConfig" label-position="left" label-width="80px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item label="用户名"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.userName"> 
          </el-input>
        </el-form-item> 
        <el-form-item label="负责服务器"  label-width="150px">
          <el-select v-model="tempScriptConfig.dbContact" placeholder="请选择" multiple style='width: 255px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in listServer"
              :key="item.id"
              :label="item.host"
              :value="item.host">
            </el-option>
          </el-select>
        </el-form-item>        
        <el-form-item label="邮箱"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.mail">
          </el-input>
          <el-switch
            v-model="tempScriptConfig.mailStats"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="0"
            inactive-value="1">
          </el-switch>
        </el-form-item> 
        <el-form-item label="手机号"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.mobile"> 
          </el-input>
          <el-switch
            v-model="tempScriptConfig.mobileStats"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="0"
            inactive-value="1">
          </el-switch> 
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
        listServer    : [],
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          alarmGroup : ''
    
        },
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑联系人',
          create: '新建联系人'
        },
        tempScriptConfig: {
          userName       : '',
          mail           : '',
          alarmGroup     : '',
          wechat         : '',
          mobile         : '',
          mailStats      : '',
          wechatStats    : '',
          mobileStats    : '',
          dbContact      : ''
        },
        
      }
    
    },
    created() {
      this.getList();
      this.getServer();
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: { 
      checkDel({row, column, rowIndex, columnIndex}){
        debugger
        if (this.list[rowIndex].mailStats =='1' && columnIndex === 3){
          return 'fail'
        }else if (this.list[rowIndex].mailStats =='0' && columnIndex === 3){
          return 'success'
        }

        if (this.list[rowIndex].mobileStats =='1' && columnIndex === 4){
          return 'fail'
        }else if (this.list[rowIndex].mobileStats =='0' && columnIndex === 4){
          return 'success'
        }
        
      }, 
      
      getList() {
        //debugger
        //查询列表
        this.listLoading = true;
       
        this.api({ 
          url: "/sendMailConfig/listUser",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading     = false;
          this.list        = data.list;
          this.totalInnerCount = data.totalCount;
        })
      }, 

      getServer() {
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
          this.listServer = data.list;
          this.totalCount = data.totalCount;
        })
      },

      showCreate($index) {
        //显示新增对话框
     
        this.tempScriptConfig.userName        =  "";  
        this.tempScriptConfig.mail            =  "";
        this.tempScriptConfig.mailStats       =  "";
        this.tempScriptConfig.mobile          =  "";
        this.tempScriptConfig.mobileStats     =  "";
        this.tempScriptConfig.dbContact       =  [];  
        this.dialogStatus                     =  "create"
        this.dialogFormVisible                =  true
      },
      showUpdate($index) {
        debugger
        let shell                             =  this.list[$index];
        let dbContact                         =  shell.dbContact;
        var arrDbContact                      =  new Array();
        if(dbContact != undefined){
          //以and分割 将类型存储数组中
          for(var oldType in dbContact.split(",")){
            // vue是数组类型是用push赋值
            arrDbContact.push(dbContact.split(",")[oldType]+'');
          }
        }
        this.tempScriptConfig.userName        =  shell.userName;  
        this.tempScriptConfig.mail            =  shell.mail;
        this.tempScriptConfig.mailStats       =  shell.mailStats;
        this.tempScriptConfig.wechat          =  shell.wechat;
        this.tempScriptConfig.wechatStats     =  shell.wechatStats;
        this.tempScriptConfig.mobile          =  shell.mobile;
        this.tempScriptConfig.mobileStats     =  shell.mobileStats;
        this.tempScriptConfig.alarmGroup      =  shell.alarmGroup; 
        this.tempScriptConfig.dbContact       =  [];
        this.tempScriptConfig.dbContact       =  arrDbContact;
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
      removeUser($index) {
        let _vue = this;
        this.$confirm('确定删除此用户?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let script = _vue.list[$index];
          //user.deleteStatus = '2';
          this.tempScriptConfig.id = script.id;
          _vue.api({
            url: "/sendMailConfig/deleteMailUser",
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
      handleSizeChange(val) {
        //改变每页数量
        //debugger
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
      // getInnerIndex($index) {
      //   //表格序号
      //   //alert(($index+1))
      //   return (this.listData.pageNum - 1) * this.listData.pageRow + $index
      // },
    }
  }
</script>

<style>
  .fail{
    color: #888888;font-weight: 500; text-decoration: line-through;
  }
  .success{
    color: #008000;font-weight: 500;
  }
</style>