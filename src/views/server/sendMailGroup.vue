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
              highlight-current-row height="530" :cell-class-name="checkDelOut"  @expand-change="getListUser" >
      <!-- <span v-if="scope.row.execStatus=2" style="color:red">{{ scope.row.execStatus }}</span>         -->
      <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column type="expand" >
        <template  slot-scope="scope">
          <el-table :data="listUser" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :cell-class-name="checkDel">
            <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
                <template slot-scope="inner">
                  <span v-text="getIndex(inner.$index)"> </span>
                </template>
            </el-table-column>  
            <el-table-column align="center" label="用户名"     prop="userName"></el-table-column> 
            <el-table-column align="center" label="负责服务器"  prop="dbContact"></el-table-column>
            <el-table-column align="center" label="邮箱"       prop="mail"    > </el-table-column>
            <el-table-column align="center" label="手机号"     prop="mobile"   > </el-table-column>
            <el-table-column align="center" label="创建时间"   prop="createTime"   > </el-table-column>
            <el-table-column align="center" width="70" label="管理" v-if="hasPerm('scriptConfig:update')">
              <template slot-scope="scope_inner">
                <!-- <el-button type="text" icon="el-icon-edit" @click="showUpdateUser(scope_inner.$index)"></el-button> -->
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
      <el-table-column align="center"     label="用户组"         prop="alarmGroup"  ></el-table-column>
      <el-table-column align="center"     label="告警级别"       prop="alarmLevel" width="200"></el-table-column>
      <el-table-column align="center"   label="告警优先级">
        <el-table-column align="center" label="一级" prop="firstAlarm"   width="180" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
        <el-table-column align="center" label="二级" prop="secondAlarm"  width="180" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
        <el-table-column align="center" label="三级" prop="thirdAlarm"   width="180" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      </el-table-column>
      <el-table-column align="center"     label="告警筛选"      prop="alarmSelect" ></el-table-column>
      <el-table-column align="center" width="100" v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-plus" @click="showCreateUser(scope.$index)"></el-button>
          <el-button type="text" icon="el-icon-edit" @click="showUpdate(scope.$index)"></el-button>
          <el-button type="text" icon="el-icon-delete" 
                     @click="removeGroup(scope.$index)">
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
    <el-dialog :title="textMapUser[dialogStatus]" :visible.sync="dialogFormUser">
      <el-form class="small-space" :model="tempScriptConfig" label-position="left" label-width="80px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item label="用户名"  label-width="150px">
          <el-select v-model="tempScriptConfig.userName" v-if="dialogStatus=='update'"   disabled="true" placeholder="请选择" style='width: 255px;' @change="selectFn($event)"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in listAllUser"
              :key="item.id"
              :label="item.userName"
              :value="item.userName">
            </el-option>
          </el-select>
          <el-select v-model="tempScriptConfig.userName" v-else placeholder="请选择" style='width: 255px;' @change="selectFn($event)"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in listAllUser"
              :key="item.id"
              :label="item.userName"
              :value="item.userName">
            </el-option>
          </el-select>
        </el-form-item> 
        <el-form-item label="负责服务器" label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.dbContact" disabled="true"> 
          </el-input>
        </el-form-item>        
        <el-form-item label="邮箱"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.mail" disabled="true">
          </el-input>
          <el-switch
            v-model="tempScriptConfig.mailStats"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="0"
            inactive-value="1"
            disabled="true"
          >
          </el-switch>
        </el-form-item> 
        <el-form-item label="手机号"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.mobile"  disabled="true">
          </el-input>
          <el-switch
            v-model="tempScriptConfig.mobileStats"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="0"
            inactive-value="1"
            disabled="true"
          >
          </el-switch>
        </el-form-item> 
        <el-form-item label="所属组" required label-width="150px" >
          <el-select v-model="tempScriptConfig.alarmGroup" placeholder="请选择" style='width: 255px;' disabled="true"> <!-- 对应列名 clearable 清空当前checkbox-->
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
        <el-button v-if="dialogStatus=='create'" type="success" @click="createScriptUser">创 建</el-button>
        <el-button type="primary" v-else @click="updateScriptUser">修 改</el-button>
      </div>
    </el-dialog>    
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :model="tempScriptConfig" label-position="left" label-width="80px"
               style='width: 400px; margin-left:50px;'>
        <el-form-item label="用户组"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.alarmGroup"> 
          </el-input>
        </el-form-item>       
        <el-form-item label="告警级别"  label-width="150px">
          <el-select v-model="tempScriptConfig.alarmLevel" placeholder="请选择" label-width="80px" multiple style='width: 250px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allAlarmLevel"
              :key="item.alarmId"
              :label="item.alarmType"
              :value="item.alarmType">
            </el-option>
          </el-select>
        </el-form-item>  
        <el-form-item label="企业微信组"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.weChat">
          </el-input>
        </el-form-item> 
        <el-form-item label="发送微信"  label-width="150px">
          <el-switch
            v-model="tempScriptConfig.wechatStats"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="0"
            inactive-value="1">
          </el-switch>
        </el-form-item> 
        <el-form-item label="一级告警"  label-width="150px">
          <el-select v-model="tempScriptConfig.firstAlarm" placeholder="请选择" label-width="80px" style='width: 230px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allAlarmPriority"
              :key="item.alarmId"
              :label="item.alarmType"
              :value="item.alarmType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="二级告警"  label-width="150px">
          <el-select v-model="tempScriptConfig.secondAlarm" placeholder="请选择" label-width="80px" style='width: 230px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allAlarmPriority"
              :key="item.alarmId"
              :label="item.alarmType"
              :value="item.alarmType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="三级告警"  label-width="150px">
          <el-select v-model="tempScriptConfig.thirdAlarm" placeholder="请选择" label-width="80px" style='width: 230px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allAlarmPriority"
              :key="item.alarmId"
              :label="item.alarmType"
              :value="item.alarmType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接受告警"  label-width="150px">   
          <el-select v-model="tempScriptConfig.alarmSelect" placeholder="请选择命令描述" label-width="80px" multiple style='width: 235px;max-height:300px;' collapse-tags> 
            <el-option
              v-for="item in allShellDesc"
              :key="item.code"
              :label="item.shellDesc"
              :value="item.shellDesc"    
            >
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
  import {formatDate} from '@/utils/commonUtil.js'
  export default {
    data() {
      return {
        totalCount: 0, //分页组件--数据总条数
        allAlarmGroup    : '',
        allAlarmPriority : '',
        allShellDesc     : '',
        allAlarmLevel    : '',
        list             : [],//表格的数据
        listLoading      : false,//数据加载等待动画     
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        listQuery_select: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        dialogStatus: 'create',
        dialogFormVisible: false,
        dialogFormUser   : false,
        textMap: {
          update: '编辑告警组',
          create: '新建告警组'
        },

        textMapUser: {
          update: '编辑告警联系人',
          create: '新建告警联系人'
        },
        tempScriptConfig: {
          alarmLevel     : '',
          alarmGroup     : '',
          createTime     : '',
          wechatStats    : '',
          weChat         : '',
          alarmSelect    : [],
          firstAlarm     : '',
          secondAlarm    : '',
          thirdAlarm     : '',
          allAlarmPriority : '',
          allShellDesc   : '',
          allAlarmGroup  : '',
          allAlarmLevel  : '',
          userName       : '',
          mail           : '',
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
      this.getAllShellDesc();
      this.getMailGroup();
      this.getAlarmLevel();
      this.getListAllUser();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAlarmPriority();
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: { 

      checkDel({row, column, rowIndex, columnIndex}){
       
        if (this.listUser[rowIndex].mailStats =='1' && columnIndex === 3){
          return 'fail'
        }else if (this.listUser[rowIndex].mailStats =='0' && columnIndex === 3){
          return 'success'
        }

        if (this.listUser[rowIndex].mobileStats =='1' && columnIndex === 4){
          return 'fail'
        }else if (this.listUser[rowIndex].mobileStats =='0' && columnIndex === 4){
          return 'success'
        }
      }, 

      checkDelOut({row, column, rowIndex, columnIndex}){
        debugger
        // if (this.list[rowIndex].wechatStats =='1' && columnIndex === 4){
        //   return 'fail'
        // }else if (this.list[rowIndex].wechatStats =='0' && columnIndex === 4){
        //   return 'success'
        // }
        if (columnIndex === 4){
          if (this.list[rowIndex].firstAlarm.indexOf('微信') != -1){
            if (this.list[rowIndex].wechatStats =='1' ){
              return 'fail'
            }else{
              return 'first'
            }
          }else{
            return 'first'
          }
          
        }else if (columnIndex === 5){
          if (this.list[rowIndex].secondAlarm.indexOf('微信') != -1){
            if (this.list[rowIndex].wechatStats =='1' ){
              return 'fail'
            }else{
              return 'second'
            }
          }else{
            return 'second'
          }
        }else if (columnIndex === 6){
          if (this.list[rowIndex].thirdAlarm.indexOf('微信') != -1){
            if (this.list[rowIndex].wechatStats =='1' ){
              return 'fail'
            }else{
              return 'third'
            }
          }else{
            return 'third'
          }
        }
      },

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
      getListUser(data,expandedRows) {
        //debugger
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
      getListAllUser() {
        //debugger
        this.api({ 
          url: "/sendMailConfig/listUser",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading     = false;
          this.listAllUser        = data.list;
          this.totalInnerCount = data.totalCount;
        })
      },
      getAlarmPriority() {
        this.api({
          url: "/commonsConfig/getAlarmPriority",
          method: "get"
        }).then(data => {
          this.allAlarmPriority = data.list;
        })
      },

      getAllShellDesc() {
        this.api({
          url: "/logConfig/getAllShellDesc",
          method: "get"
        }).then(data => {
          this.allShellDesc = data.list;
        })
      },

      getMailGroup() {
        //debugger
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

      getAlarmLevel() {
        //debugger
        //查询列表
        this.listLoading = true;
        //parseTime(this.listQuery.dataTime)
        this.api({ 
          url: "/commonsConfig/getAllAlarmLevel",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading   = false;
          this.allAlarmLevel = data.list;
        })
      },

      showCreate() {
        //显示新增对话框
        this.tempScriptConfig.alarmLevel      =  "";  
        this.tempScriptConfig.alarmGroup      =  "";
        this.tempScriptConfig.alarmSelect     = [];
        this.tempScriptConfig.wechat          =  "";
        this.tempScriptConfig.firstAlarm      =  "";
        this.tempScriptConfig.secondAlarm     =  "";
        this.tempScriptConfig.thirdAlarm      =  "";
        this.dialogStatus                     =  "create"
        this.dialogFormVisible                =  true
      },
      showUpdate($index) {
        debugger
        let shell                             = this.list[$index];
        let alarmSelect                       = shell.alarmSelect;
        let alarmLevel                        = shell.alarmLevel;
        var arrStringTypes                    = new Array();
        if(alarmSelect != undefined && alarmSelect != 'ALL'){
          //以and分割 将类型存储数组中
          for(var oldType in alarmSelect.split(",")){
            // vue是数组类型是用push赋值
            arrStringTypes.push(alarmSelect.split(",")[oldType]+'');
          }
        }else if(alarmSelect === 'ALL'){
         this.tempScriptConfig.alarmSelect = ''
        }

        var arrStringLevel                    = new Array();
        if(alarmLevel != undefined){
          //以and分割 将类型存储数组中
          for(var oldType in alarmLevel.split(",")){
            // vue是数组类型是用push赋值
            arrStringLevel.push(alarmLevel.split(",")[oldType]+'');
          }
        }
        var strFirstAlarm  = ''
        var strSecondAlarm = ''
        var strThirdAlarm  = ''
        if(shell.firstAlarm  != undefined && shell.firstAlarm.indexOf('\n') != -1){
          strFirstAlarm = shell.firstAlarm.split("\n")[0]
          this.tempScriptConfig.firstAlarm   = strFirstAlarm;
           this.tempScriptConfig.secondAlarm =  shell.secondAlarm;
          this.tempScriptConfig.thirdAlarm   =  shell.thirdAlarm;
        }else if(shell.secondAlarm  != undefined && shell.secondAlarm.indexOf('\n') != -1){
          strSecondAlarm = shell.secondAlarm.split("\n")[0]
          this.tempScriptConfig.firstAlarm  =  shell.firstAlarm;
          this.tempScriptConfig.secondAlarm = strSecondAlarm;
          this.tempScriptConfig.thirdAlarm  =  shell.thirdAlarm;
        }else if(shell.thirdAlarm  != undefined && shell.thirdAlarm.indexOf('\n') != -1){
          strThirdAlarm = shell.thirdAlarm.split("\n")[0]
          this.tempScriptConfig.thirdAlarm  = strSecondAlarm;
          this.tempScriptConfig.firstAlarm  =  shell.firstAlarm;
          this.tempScriptConfig.secondAlarm =  shell.secondAlarm;
        }else{
          this.tempScriptConfig.firstAlarm      =  shell.firstAlarm;
          this.tempScriptConfig.secondAlarm     =  shell.secondAlarm;
          this.tempScriptConfig.thirdAlarm      =  shell.thirdAlarm;
        }
        
        this.tempScriptConfig.alarmLevel      =  shell.alarmLevel;  
        this.tempScriptConfig.alarmGroup      =  shell.alarmGroup; 
        this.tempScriptConfig.alarmLevel      = [];
        this.tempScriptConfig.alarmSelect     = [];
        this.tempScriptConfig.weChat          =  shell.weChat; 
        this.tempScriptConfig.wechatStats     =  shell.wechatStats; 
        
        this.tempScriptConfig.alarmSelect     = arrStringTypes;
        this.tempScriptConfig.alarmLevel      = arrStringLevel;
       
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

      showCreateUser($index) {
        //显示新增对话框
        let shell_out                         =  this.list[$index];
        this.tempScriptConfig.userName        =  "";  
        this.tempScriptConfig.mail            =  "";
        this.tempScriptConfig.mailStats       =  "";
        this.tempScriptConfig.mobile          =  "";
        this.tempScriptConfig.mobileStats     =  "";
        this.tempScriptConfig.dbContact       =  "";
        this.tempScriptConfig.alarmGroup      =  shell_out.alarmGroup;  
        this.dialogStatus                     =  "create"
        this.dialogFormUser                   =  true
      },
      selectFn(e){
        debugger
        //查询列表
        this.listLoading    = true;
        this.listQuery_select.userName   = e;
        this.api({ 
          url: "/sendMailConfig/listUser",
          method: "get",
          params: this.listQuery_select
        }).then(data => {
          this.selectUserInfo = data.list[0];
          this.tempScriptConfig.userName        =  this.selectUserInfo.userName;  
          this.tempScriptConfig.id              =  this.selectUserInfo.id; 
          this.tempScriptConfig.mail            =  this.selectUserInfo.mail;
          this.tempScriptConfig.mailStats       =  this.selectUserInfo.mailStats;
          this.tempScriptConfig.mobile          =  this.selectUserInfo.mobile;
          this.tempScriptConfig.mobileStats     =  this.selectUserInfo.mobileStats;
          this.tempScriptConfig.dbContact       =  this.selectUserInfo.dbContact;
          this.listLoading      = false;
        })
        
        
      },
      // showUpdateUser($index) {
      //   debugger
      //   let shell                             =  this.listUser[$index];
      //   this.tempScriptConfig.userName        =  shell.userName;  
      //   this.tempScriptConfig.mail            =  shell.mail;
      //   this.tempScriptConfig.mailStats       =  shell.mailStats;
      //   this.tempScriptConfig.wechat          =  shell.wechat;
      //   this.tempScriptConfig.wechatStats     =  shell.wechatStats;
      //   this.tempScriptConfig.mobile          =  shell.mobile;
      //   this.tempScriptConfig.mobileStats     =  shell.mobileStats;
      //   this.tempScriptConfig.alarmGroup      =  shell.alarmGroup; 
      //   this.tempScriptConfig.dbContact       =  shell.dbContact;
      //   this.tempScriptConfig.id              =  shell.id;
      //   this.dialogStatus                     =  "update"
      //   this.dialogFormUser                =  true
      // },

      createScriptUser() {
        let _vue = this;
        //添加新用户
        this.api({
          url: "/sendMailConfig/addMailUser",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          _vue.$message.success("新增成功")
          this.getList();
          this.dialogFormUser = false
        })
      },
      updateScriptUser() {
        debugger
        //修改用户信息
        let _vue = this;
        this.api({
          url: "/sendMailConfig/updateMailUser",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          let msg = "修改成功";
          this.dialogFormUser = false
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
        debugger
        this.$confirm('确定删除此用户?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let script = _vue.listUser[$index];
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
      removeGroup($index) {
        let _vue = this;
        debugger
        this.$confirm('确定删除此告警组?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let script = _vue.list[$index];
          //user.deleteStatus = '2';
          this.tempScriptConfig.id = script.id;
          _vue.api({
            url: "/sendMailConfig/deleteMailGroup",
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
        //debugger
        this.listUser.pageRow = val
        this.handleInnerFilter();
      },
      handleInnerCurrentChange(val) {
        //debugger
        this.listUser.pageNum = val
        this.getListUser();         
      },
      handleInnerFilter() {
        //debugger
        //查询事件       
        this.listUser.pageNum = val
        this.getListUser();   
      },
      getIndex($index) {
        //表格序号
        //debugger
        return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
      },
    }
  }
</script>
<style >
  .success{
    color: #008000;font-weight: 500;
  }
  .fail{
    color: #888888;font-weight: 500; text-decoration: line-through;
  }
  .first{
    color: #FF0000;;font-weight: 500;
  }
  .second{
    color: #EE9A00;font-weight: 500;
  }
  .third{
    color: #4169E1;font-weight: 500;
  }
  /* .el-table /deep/ .cell.el-tooltip {
      white-space: pre-wrap;
  } */
</style>
