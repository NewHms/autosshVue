<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>

        <el-form-item>
          <el-input v-model="listQuery.host" placeholder="请输入服务器IP地址" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加 </el-button>
          <el-button type="text" prefix-icon="el-icon-search" @click="flushScheduler" style="float:right">刷新定时器</el-button>
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
        <el-table-column align="center"   label="服务器"       prop="host"  width="150"  sortable></el-table-column>
        <el-table-column align="center"   label="实例名"       prop="serviceName" ></el-table-column>
        <el-table-column align="center"   label="机房"         prop="location" ></el-table-column>
        <el-table-column align="center"   label="监控服务器"   prop="applicationServer" width="150" sortable></el-table-column>
        <el-table-column align="center"   label="用户名"       width="100">
          <el-table-column align="center" label="OS用户名"     prop="userName" width="120"></el-table-column>
          <el-table-column align="center" label="DB用户名"     prop="dbUsername" ></el-table-column>
        </el-table-column>
        <el-table-column align="center"   label="备份配置"  width="100">
          <el-table-column align="center" label="路径"     prop="backupUrl" ></el-table-column>
          <el-table-column align="center" label="个数"     prop="backupNum" ></el-table-column>
        </el-table-column>
        <el-table-column align="center"   label="服务器类型"     prop="systemType" ></el-table-column>
        <el-table-column align="center"   label="适用版本"       prop="systemVersion" width="160" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
        <el-table-column align="center" width="160" v-if="hasPerm('scriptConfig:update')">
          <template slot-scope="scope">
            <el-button type="text" prefix-icon="el-icon-search" @click="goToDetails(scope.$index)">详细信息
            </el-button>
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
          <el-input type="text" v-model="tempScriptConfig.host">
          </el-input>
        </el-form-item>
        <el-form-item label="实例名"  required  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.serviceName">
          </el-input>
        </el-form-item>
        <el-form-item label="机房" required label-width="120px">
          <el-select v-model="tempScriptConfig.location"  placeholder="请选择" label-width="80px" style='width: 230px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allLocation"
              :key="item.locationId"
              :label="item.locationType"
              :value="item.locationType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监控服务器" required label-width="120px">
          <el-select v-model="tempScriptConfig.applicationServer"  placeholder="请选择" label-width="80px" style='width: 230px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allApplicaServer"
              :key="item.appId"
              :label="item.appType"
              :value="item.appType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="端口"  required  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.post">
          </el-input>
        </el-form-item>
        <el-form-item label="OS用户"  required  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.userName">
          </el-input>
        </el-form-item>
        <el-form-item label="OS密码"  required  label-width="120px">
          <el-input type="password" v-model="tempScriptConfig.password">
          </el-input>
        </el-form-item>
        <el-form-item label="DB用户"  required  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.dbUsername">
          </el-input>
        </el-form-item>
        <el-form-item label="DB密码"  required  label-width="120px">
          <el-input type="password" v-model="tempScriptConfig.dbPassword">
          </el-input>
        </el-form-item>
        <el-form-item label="备份路径"  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.backupUrl">
          </el-input>
        </el-form-item>
        <el-form-item label="备份个数"  label-width="120px">
          <el-input type="text" v-model="tempScriptConfig.backupNum">
          </el-input>
        </el-form-item>
        <el-form-item label="服务器类型" required label-width="120px">
          <el-select v-model="tempScriptConfig.systemType"  placeholder="请选择" label-width="80px" style='width: 230px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allServer"
              :key="item.serverId"
              :label="item.serverType"
              :value="item.serverType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适用版本" required label-width="120px">
          <el-select v-model="tempScriptConfig.systemVersion" multiple  placeholder="请选择" label-width="80px" style='width: 230px;'> 
            <el-option
              v-for="item in alltype"
              :key="item.versionId"
              :label="item.versionType"
              :value="item.versionType">
            </el-option>
          </el-select>
        </el-form-item>
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
  export default {
    data() {
      
      return {    
        isIndeterminate: true,
        showCronBox: false,
        totalCount: 0, //分页组件--数据总条数
        list: [],//表格的数据
        allAppServer: [],
        allServer   : '',
        alltype     : [],
        allLocation : '',
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑配置',
          create: '新增配置'
        },
        tempScriptConfig: {
          host                   : '',
          serviceName            : '',
          post                   : '',
          applicationServer      : '',
          location               : '',
          systemType             : '',
          systemVersion          : [],   
          userName               : '',
          dbUsername             : '',
          password               : '',
          dbPassword             : '',
          backupUrl              : '',
          backupNum              : ''
        },
        
      }

    },
    
    created() {
      this.getList();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllLocation();
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
      goToDetails($index) {
        debugger
        let _vue = this;
        let details = _vue.list[$index];
        this.$router.push({name: '私有阀值配置', params: {host: details.host,
                                                       serviceName : details.serviceName,
                                                       systemType  : details.systemType}})
      },
      getAllVersionType() {
        this.api({
          url: "/scriptConfig/getAllVersionType",
          method: "get"
        }).then(data => {
          this.alltype = data.list;
        })
      },
      getAllLocation() {
        this.api({
          url: "/scriptConfig/getAllLocation",
          method: "get"
        }).then(data => {
          this.allLocation = data.list;
        })
      },
      getAllServer() {
        this.api({
          url: "/scriptConfig/getAllServer",
          method: "get"
        }).then(data => {
          this.allServer = data.list;
        })
      },
      getAllAppServer() {
        this.api({
          url: "/scriptConfig/getAllAppServer",
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
        this.api({

          url: "/serverConfig/getDetails",
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
        this.tempScriptConfig.host                   = "";
        this.tempScriptConfig.type                   = "";
        this.tempScriptConfig.systemVersion          = [];
        this.tempScriptConfig.serviceName            = "";
        this.tempScriptConfig.post                   = "";
        this.tempScriptConfig.applicationServer      = "";
        this.tempScriptConfig.creationDate           = "";
        this.tempScriptConfig.systemType             = "";
        this.tempScriptConfig.location               = "";
        this.tempScriptConfig.userName               = "";
        this.tempScriptConfig.dbUsername             = "";
        this.tempScriptConfig.password               = "";
        this.tempScriptConfig.dbPassword             = "";
        this.tempScriptConfig.systemType             = "";
        this.tempScriptConfig.timeOut                = "";
        this.tempScriptConfig.execTime               = "";
        this.tempScriptConfig.dailyWarningPriv       = "";
        this.tempScriptConfig.dailyCritical_Priv     = "";
        this.tempScriptConfig.monitorWarningPriv     = "";
        this.tempScriptConfig.monitorCriticalPriv    = "";
        this.tempScriptConfig.shellName              = "";
        this.tempScriptConfig.shellDesc              = "";
        this.tempScriptConfig.dailyCritical          = "";
        this.tempScriptConfig.dailySuccess           = "";
        this.tempScriptConfig.dailyWarning           = "";
        this.tempScriptConfig.monitorCritical        = "";
        this.tempScriptConfig.monitorWarning         = "";
        this.tempScriptConfig.backupUrl              = "";
        this.tempScriptConfig.backupNum              = "";
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      
   
      },
      showUpdate($index) {
        debugger
        let shell = this.list[$index];
        let systemVersion  = shell.systemVersion;
        var arrStringTypes = new Array();
        //以and分割 将类型存储数组中
        for(var oldType in systemVersion.split(",")){
            // vue是数组类型是用push赋值
            arrStringTypes.push(systemVersion.split(",")[oldType]+'');
          }
        this.tempScriptConfig.host                   = shell.host;
        this.tempScriptConfig.systemVersion          = [];
        this.tempScriptConfig.serviceName            = shell.serviceName;
        this.tempScriptConfig.post                   = shell.post;
        this.tempScriptConfig.applicationServer      = shell.applicationServer;
        this.tempScriptConfig.creationDate           = shell.creationDate;
        this.tempScriptConfig.systemType             = shell.systemType;
        this.tempScriptConfig.location               = shell.location;
        this.tempScriptConfig.systemVersion          = arrStringTypes;
        this.tempScriptConfig.userName               = shell.userName;
        this.tempScriptConfig.dbUsername             = shell.dbUsername;
        this.tempScriptConfig.password               = shell.password;
        this.tempScriptConfig.dbPassword             = shell.dbPassword;
        this.tempScriptConfig.type                   = shell.type;
        this.tempScriptConfig.timeOut                = shell.timeOut;
        this.tempScriptConfig.execTime               = shell.execTime;
        this.tempScriptConfig.dailyWarningPriv       = shell.dailyWarningPriv;
        this.tempScriptConfig.dailyCritical_Priv     = shell.dailyCritical_Priv;
        this.tempScriptConfig.monitorWarningPriv     = shell.monitorWarningPriv;
        this.tempScriptConfig.monitorCriticalPriv    = shell.monitorCriticalPriv;
        this.tempScriptConfig.shellName              = shell.shellName;
        this.tempScriptConfig.shellDesc              = shell.shellDesc;
        this.tempScriptConfig.dailyCritical          = shell.dailyCritical;
        this.tempScriptConfig.dailySuccess           = shell.dailySuccess;
        this.tempScriptConfig.dailyWarning           = shell.dailyWarning;
        this.tempScriptConfig.monitorCritical        = shell.monitorCritical;
        this.tempScriptConfig.monitorWarning         = shell.monitorWarning;
        this.tempScriptConfig.backupUrl              = shell.backupUrl;
        this.tempScriptConfig.backupNum              = shell.backupNum;
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
          url: "/serverConfig/updateServer",
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
<style scoped>
.el-table /deep/ .cell.el-tooltip {
      white-space: pre-wrap;
  }
</style>