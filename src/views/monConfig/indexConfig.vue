<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>

        <el-form-item>
          <el-input v-model="listQuery.host" placeholder="请输入服务器IP地址" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-checkbox-group v-model="allAppServer" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="item in allApplicaServer" 
                        :label="item.appType" 
                        :key  ="item.appId"
                        :value="item.appType" disabled>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530">
      <el-table-column align="center" label="序号" prop="id" width="40" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>  
        <el-table-column align="center"   label="服务器信息" width="215">
          <template slot-scope="scope">
            <dt>服务器地址: {{ scope.row.host }}</dt>
            <dt>实例名:     {{ scope.row.serviceName }}</dt> 
            <dt>服务器类型: {{ scope.row.systemType }}</dt>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center"   label="服务器"         prop="host" width="75"></el-table-column>
        <el-table-column align="center"   label="实例名"         prop="serviceName" width="75"></el-table-column>
        <el-table-column align="center"   label="服务器类型"      prop="systemType" width="70"></el-table-column> -->
        <el-table-column align="center"   label="命令信息" width="260" :show-overflow-tooltip="true" @contextmenu="showMenu">
          <template slot-scope="scope">
            <dt>命令:     {{ scope.row.shellName }}</dt>
            <dt>命令描述: {{ scope.row.shellDesc }}</dt> 
            <dt>适用版本: {{ scope.row.systemVersion }}</dt>
            <dt>输入参数: {{ scope.row.inputParam }}</dt>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center"   label="命令"           prop="shellName" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
        <el-table-column align="center"   label="命令描述"       prop="shellDesc"  width="170" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
        <el-table-column align="center"   label="适用版本"       prop="systemVersion" width="100"></el-table-column> -->
        <el-table-column align="center"   label="通用阀值">
          <el-table-column align="center" label="日检阀值">
            <el-table-column align="center" label="WAR" prop="dailyWarning"  width="60"></el-table-column>
            <el-table-column align="center" label="CRI" prop="dailyCritical" width="60"></el-table-column>
          </el-table-column>
          <el-table-column align="center"   label="监控阀值">
            <el-table-column align="center" label="WAR" prop="monitorWarning"  width="60"></el-table-column>
            <el-table-column align="center" label="CRI" prop="monitorCritical" width="60"></el-table-column>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center"     label="私有阀值">
          <el-table-column align="center"   label="日检阀值">
            <el-table-column align="center" label="WAR" prop="dailyWarningPriv"  width="60"></el-table-column>
            <el-table-column align="center" label="CRI" prop="dailyCriticalPriv" width="60"></el-table-column>
          </el-table-column>
          <el-table-column align="center"   label="监控阀值">
            <el-table-column align="center" label="WAR" prop="monitorWarningPriv"  width="60"></el-table-column>
            <el-table-column align="center" label="CRI" prop="monitorCriticalPriv" width="60"></el-table-column>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="是否执行"     prop="crontab" width="60" :formatter = "stateFormat">
        </el-table-column>
        <el-table-column align="center"   label="分时间段处理" width="80">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.dateRange"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="1"
              inactive-value="0"
              @change="updateDateRange(scope.$index)"
            >
            </el-switch>
            <el-button type="text" prefix-icon="el-icon-search" @click="goToDateRange(scope.$index)">GO
            </el-button>
          </template>
        </el-table-column> 
        <el-table-column align="center" label="执行频率"     prop="execTime"></el-table-column>
        <el-table-column align="center" width="70" label="管理" v-if="hasPerm('scriptConfig:update')">
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
               style='width: 350px; margin-left:50px;' label="right">
               <!--label-width="100px" 设置长度 -->
        <el-form-item label="服务器"  required  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.host"           disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="监控服务器" required label-width="120px">
          <el-select v-model="tempScriptConfig.applicationServer"         disabled="true" placeholder="请选择" label-width="80px" style='width: 230px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allApplicaServer"
              :key="item.appId"
              :label="item.appType"
              :value="item.appType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="端口"  required  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.post"           disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="OS用户"  required  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.userName"       disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="OS密码"  required  label-width="120px">
          <el-input type="password" v-model="tempScriptConfig.password"   disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="DB用户"  required  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.dbUsername"     disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="DB密码"  required  label-width="120px">
          <el-input type="password" v-model="tempScriptConfig.dbPassword" disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="服务器类型" required label-width="120px">
          <el-select v-model="tempScriptConfig.systemType"  placeholder="请选择" disabled="true" label-width="80px" style='width: 230px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allServer"
              :key="item.serverId"
              :label="item.serverType"
              :value="item.serverType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适用版本" required label-width="120px">
          <el-select v-model="tempScriptConfig.systemVersion" disabled="true"  placeholder="请选择" label-width="80px" style='width: 230px;'> 
            <el-option
              v-for="item in alltype"
              :key="item.versionId"
              :label="item.versionType"
              :value="item.versionType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="命令"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='update'"   disabled="true" v-model="tempScriptConfig.shellName" ></el-input>
          <el-input type="text" v-else  disabled="true" v-model="tempScriptConfig.shellName" ></el-input>
        </el-form-item>
        <el-form-item label="命令描述"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='update'"   disabled="true" v-model="tempScriptConfig.shellDesc" ></el-input>
          <el-input type="text" v-else disabled="true" v-model="tempScriptConfig.shellDesc" ></el-input>
        </el-form-item>
        <el-form-item label="输入参数"  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.inputParam" ></el-input>
        </el-form-item>
        <el-form-item label="通用日检 WAR"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='update'"   disabled="true" v-model="tempScriptConfig.dailyWarning" ></el-input>
          <el-input type="text" v-else   disabled="true"  v-model="tempScriptConfig.dailyWarning" ></el-input>
        </el-form-item>
        <el-form-item label="私有日检 WAR"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='create'"   disabled="true" v-model="tempScriptConfig.dailyWarningPriv" ></el-input>
          <el-input type="text" v-else v-model="tempScriptConfig.dailyWarningPriv" ></el-input>
        </el-form-item>
        <el-form-item label="通用日检 CRI"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='update'"   disabled="true" v-model="tempScriptConfig.dailyCritical" ></el-input>
          <el-input type="text" v-else  disabled="true" v-model="tempScriptConfig.dailyCritical" ></el-input>
        </el-form-item>
        <el-form-item label="私有日检 CRI"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='create'"   disabled="true" v-model="tempScriptConfig.dailyCriticalPriv" ></el-input>
          <el-input type="text" v-else v-model="tempScriptConfig.dailyCriticalPriv" ></el-input>
        </el-form-item>
        <el-form-item label="通用监控 WAR"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='update'"   disabled="true" v-model="tempScriptConfig.monitorWarning" ></el-input>
          <el-input type="text" v-else  disabled="true" v-model="tempScriptConfig.monitorWarning" ></el-input>
        </el-form-item>
        <el-form-item label="私有监控 WAR"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='create'"   disabled="true" v-model="tempScriptConfig.monitorWarningPriv" ></el-input>
          <el-input type="text" v-else v-model="tempScriptConfig.monitorWarningPriv" ></el-input>
        </el-form-item>
        <el-form-item label="通用监控 CRI"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='update'"   disabled="true" v-model="tempScriptConfig.monitorCritical" ></el-input>
          <el-input type="text" v-else disabled="true" v-model="tempScriptConfig.monitorCritical" ></el-input>
        </el-form-item>        
        <el-form-item label="私有监控 CRI"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='create'"   disabled="true" v-model="tempScriptConfig.monitorCriticalPriv" ></el-input>
          <el-input type="text" v-else v-model="tempScriptConfig.monitorCriticalPriv" ></el-input>
        </el-form-item>
        <el-form-item label="超时时间"  label-width="120px">
          <el-input type="text" v-if="dialogStatus=='create'"   disabled="true" v-model="tempScriptConfig.timeOut" ></el-input>
          <el-input type="text" v-else v-model="tempScriptConfig.timeOut" ></el-input>
        </el-form-item>
        <el-form-item label="自动启动"  label-width="120px">
          <el-switch
            v-model="tempScriptConfig.crontab"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="0"
            inactive-value="1">
          </el-switch>
        </el-form-item>
         
        <el-form-item label="执行频率" label-width="120px" >
          <el-input v-model="tempScriptConfig.execTime" v-if="dialogStatus=='create'" >                                                  
            <el-button slot="append" v-if="!showCronBox" icon="el-icon-arrow-up" @click="showCronBox = true" title="打开图形配置"></el-button>
            <el-button slot="append" v-else icon="el-icon-arrow-down" @click="showCronBox = false" title="关闭图形配置"></el-button>
          </el-input>
          <el-input v-model="tempScriptConfig.execTime" v-else>                                                  
            <el-button slot="append" v-if="!showCronBox" icon="el-icon-arrow-up" @click="showCronBox = true" title="打开图形配置"></el-button>
            <el-button slot="append" v-else icon="el-icon-arrow-down" @click="showCronBox = false" title="关闭图形配置"></el-button>
          </el-input>
        </el-form-item>
        <cron v-if="showCronBox" v-model="tempScriptConfig.execTime"  style="width:640px;color:#2c3e50;margin-left:-35px;"></cron> 
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false;alltype=[]">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="success" @click="createScript">创 建</el-button>
        <el-button type="primary" v-else @click="updateScript">修 改</el-button>
      </div>
    </el-dialog>
  </div>
 

</template>
<script>
  import {mapGetters} from 'vuex'
  import cron from './cron'
  export default {
    components: {
          cron
    },
    data() {
      
      return {    
        isIndeterminate: true,
        showCronBox: false,
        totalCount: 0, //分页组件--数据总条数
        list: [],//表格的数据
        allAppServer: [],
        allServer: '',
        alltype : [],
        e       : "",
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        crontab: [{
          value:'0',
          lable:'ON'
        },{
          value:'1',
          lable:'OFF'
        }],
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑配置',
          create: '新增配置'
        },
        tempScriptConfig: {
          id                     : '',
          host                   : '',
          allInfo                : '',
          serviceName            : '',
          post                   : '',
          applicationServer      : '',
          creationDate           : '',
          createdBy              : '',
          updatedBy              : '',
          systemType             : '',
          systemVersion          : [],
          isDelete               : '',
          userName               : '',
          dbUsername             : '',
          password               : '',
          dbPassword             : '',
          subject                : '',
          type                   : '',
          timeOut                : '',
          execTime               : '',
          dailyWarningPriv       : '',
          dailyCriticalPriv      : '',
          monitorWarningPriv     : '',
          monitorCriticalPriv    : '',
          shellName              : '',
          shellDesc              : '',
          crontab                : '',
          dailyCritical          : '',
          dailySuccess           : '',
          dailyWarning           : '',
          monitorCritical        : '',
          monitorWarning         : '',
          inputParam             : ''
        },
        
      }

    },
    
     watch: {
      
        applicationServer (now,old) {
        console.log(now,old)
      }
    },
    created() {
      this.getList();
      
      
      // if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
      //   this.getAllRoles();
      // }
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllVersionType();
        this.getAllAppServer();
        this.getAllServer();
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      // getAllRoles() {
      //   this.api({
      //     url: "/user/getAllRoles",
      //     method: "get"
      //   }).then(data => {
      //     this.roles = data.list;
      //   })
      // },
      // 列字段翻译 ZS
      stateFormat(row, column) {
        console.log(row.crontab)
        if (row.crontab === '0') {
          return '是'
        } else if (row.crontab === '1') {
          return '否'
        } 
      },
      goToDateRange($index) {
        debugger
        let _vue = this;
        let details = _vue.list[$index];
        this.$router.push({name: '时间范围配置', params: {host: details.host,
                                                        serviceName : details.serviceName,
                                                        code  : details.shellCode}})
      },
      getAllVersionType() {
        this.api({
          url: "/commonsConfig/getAllVersionType",
          method: "get"
        }).then(data => {
          this.alltype = data.list;
        })
      },
      getAllServer() {
        this.api({
          url: "/commonsConfig/getAllServer",
          method: "get"
        }).then(data => {
          this.allServer = data.list;
        })
      },
      getAllAppServer() {
        this.api({
          url: "/commonsConfig/getAllAppServer",
          method: "get"
        }).then(data => {
          this.allApplicaServer = data.list;
        })
      },
      getList() {
        debugger
        //查询列表
        this.listLoading = true;
        //this.listQuery.test = this.allAppServer;
        if(this.$route.params.host != undefined && this.$route.params.serviceName != undefined && this.$route.params.systemType != undefined) {
          this.listQuery.host        =  this.$route.params.host
          this.listQuery.serviceName =  this.$route.params.serviceName
          this.listQuery.systemType  =  this.$route.params.systemType
        }else{
          this.listQuery.host = this.listQuery.host
        } 
        this.api({

          url: "/serverConfig/listServerConfig",
          method: "get",
          params: this.listQuery
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
          this.$route.params.host        =  undefined;
          this.$route.params.serviceName =  undefined;
          this.$route.params.systemType  =  undefined;
          this.listQuery.serviceName     =  undefined;
          this.listQuery.systemType      =  undefined;
        })
        
      },
      updateDateRange($index) {
        //修改告警开始时间
        debugger
        let _vue = this;
       
        this.api({
          url: "/serverConfig/updateDateRange",
          method: "post",
          data:  this.list[$index]
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
        if(this.list[$index].dateRange == '1'){
          this.goToDateRange($index)
        }
        
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
        this.tempScriptConfig.host                   = "";
        this.tempScriptConfig.type                   = "";
        this.tempScriptConfig.systemVersion          = [];
        this.tempScriptConfig.serviceName            = "";
        this.tempScriptConfig.post                   = "";
        this.tempScriptConfig.applicationServer      = "";
        this.tempScriptConfig.creationDate           = "";
        this.tempScriptConfig.systemType             = "";
        this.tempScriptConfig.userName               = "";
        this.tempScriptConfig.dbUsername             = "";
        this.tempScriptConfig.password               = "";
        this.tempScriptConfig.dbPassword             = "";
        this.tempScriptConfig.systemType             = "";
        this.tempScriptConfig.timeOut                = "";
        this.tempScriptConfig.execTime               = "";
        this.tempScriptConfig.dailyWarningPriv       = "";
        this.tempScriptConfig.dailyCriticalPriv      = "";
        this.tempScriptConfig.monitorWarningPriv     = "";
        this.tempScriptConfig.monitorCriticalPriv    = "";
        this.tempScriptConfig.shellName              = "";
        this.tempScriptConfig.shellDesc              = "";
        this.tempScriptConfig.dailyCritical          = "";
        this.tempScriptConfig.dailySuccess           = "";
        this.tempScriptConfig.dailyWarning           = "";
        this.tempScriptConfig.monitorCritical        = "";
        this.tempScriptConfig.monitorWarning         = "";
        this.tempScriptConfig.inputParam             = "";
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      
   
      },
      showUpdate($index) {
        debugger
        let shell = this.list[$index];
        this.tempScriptConfig.id                     = shell.id;
        this.tempScriptConfig.host                   = shell.host;
        this.tempScriptConfig.serviceName            = shell.serviceName;
        this.tempScriptConfig.post                   = shell.post;
        this.tempScriptConfig.applicationServer      = shell.applicationServer;
        this.tempScriptConfig.crontab                = shell.crontab;
        this.tempScriptConfig.creationDate           = shell.creationDate;
        this.tempScriptConfig.systemType             = shell.systemType;
        this.tempScriptConfig.systemVersion          = shell.systemVersion;
        this.tempScriptConfig.userName               = shell.userName;
        this.tempScriptConfig.dbUsername             = shell.dbUsername;
        this.tempScriptConfig.password               = shell.password;
        this.tempScriptConfig.dbPassword             = shell.dbPassword;
        this.tempScriptConfig.type                   = shell.type;
        this.tempScriptConfig.timeOut                = shell.timeOut;
        this.tempScriptConfig.execTime               = shell.execTime;
        this.tempScriptConfig.dailyWarningPriv       = shell.dailyWarningPriv;
        this.tempScriptConfig.dailyCriticalPriv      = shell.dailyCriticalPriv;
        this.tempScriptConfig.monitorWarningPriv     = shell.monitorWarningPriv;
        this.tempScriptConfig.monitorCriticalPriv    = shell.monitorCriticalPriv;
        this.tempScriptConfig.shellName              = shell.shellName;
        this.tempScriptConfig.shellDesc              = shell.shellDesc;
        this.tempScriptConfig.dailyCritical          = shell.dailyCritical;
        this.tempScriptConfig.dailySuccess           = shell.dailySuccess;
        this.tempScriptConfig.dailyWarning           = shell.dailyWarning;
        this.tempScriptConfig.monitorCritical        = shell.monitorCritical;
        this.tempScriptConfig.monitorWarning         = shell.monitorWarning;
        this.tempScriptConfig.inputParam             = shell.inputParam;
        this.tempScriptConfig.deleteStatus          = '1';
        this.tempScriptConfig.id                    = shell.id;
        this.dialogStatus                           = "update"
        this.dialogFormVisible                      = true
      },
      
      createScript() {
        debugger
        let _vue = this;
        //添加新配置
        this.api({
          url: "/serverConfig/addServer",
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
        debugger
        let _vue = this;
        
        this.api({
          url: "/serverConfig/updateRuleSetting",
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
        this.$confirm('确定删除此配置?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let script = _vue.list[$index];
          //user.deleteStatus = '2';
          this.tempScriptConfig.id = script.id;
          _vue.api({
            url: "/serverConfig/deleteServer",
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
<style>
 dt {text-align:left;  margin-left:5px;}
</style>