<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
        <el-form-item>
          <el-input v-model="listQuery.shellDesc" placeholder="请输入命令描述" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加 </el-button>
        </el-form-item> 
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530">
      <el-table-column align="center" label="序号" width="40" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>        
      <el-table-column align="center" label="命令" prop="shellName" style="width: 60px;" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
      <el-table-column align="center" label="命令描述" width = '200' prop="shellDesc"></el-table-column>
      <el-table-column align="center" label="命令类型"   prop="type"></el-table-column>
      <el-table-column align="center" label="适用系统"   prop="systemType"></el-table-column>
      <el-table-column align="center" label="适配正则"   prop="shellUseRe"></el-table-column>
      <el-table-column align="center" label="判断规则"   prop="dailyRule"></el-table-column>
      <el-table-column align="center" label="等式阀值 =" prop="dailySuccess" width = '80'></el-table-column>
      <el-table-column align="center" label="日检阀值">
        <el-table-column align="center" label="WAR >=" prop="dailyWarning"></el-table-column>
        <el-table-column align="center" label="CRI <"  prop="dailyCritical"></el-table-column>
      </el-table-column>
      <el-table-column align="center" label="监控阀值">
        <el-table-column align="center" label="WAR >=" prop="monitorWarning"></el-table-column>
        <el-table-column align="center" label="CRI <"  prop="monitorCritical"></el-table-column>
      </el-table-column>
      <el-table-column align="center" label="执行频率" prop="execTime"></el-table-column>
      <el-table-column align="center" label="超时时间" prop="timeOut"></el-table-column>
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
               style='width: 400px; margin-left:50px;'>
        <el-form-item label="当前编号" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.maxCode"  :disabled="true"> 
          </el-input>
        </el-form-item>          
        <el-form-item label="命令编号" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.code"  placeholder="请输入10的倍数" > 
          </el-input>
        </el-form-item>
        <el-form-item label="命令" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.shellName"> 
          </el-input>
        </el-form-item>
        <el-form-item label="关联参数" label-width="150px">
          <el-select v-model="tempScriptConfig.withColumns"  placeholder="请选择" style='width: 255px;' multiple> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for ="item in allColumns"
              :key  ="item.columnId"
              :label="item.columnName"
              :value="item.columnName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="命令描述" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.shellDesc"> 
          </el-input>
        </el-form-item>
        <el-form-item label="命令类型" required label-width="150px">
          <el-select v-model="tempScriptConfig.type" placeholder="请选择" style='width: 255px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allShell"
              :key="item.shellId"
              :label="item.shellType"
              :value="item.shellType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适用系统" required label-width="150px">
          <el-select v-model="tempScriptConfig.systemType" placeholder="请选择" style='width: 255px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allVersion"
              :key="item.versionId"
              :label="item.versionType"
              :value="item.versionType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适配正则"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.shellUseRe"> 
          </el-input>
        </el-form-item>
        <el-form-item label="判断规则"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.dailyRule" placeholder="0->等式;1->不等式"> 
          </el-input>
        </el-form-item>       
        <el-form-item label="SUCCESS 阀值"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.dailySuccess">
          </el-input>
        </el-form-item>
        <el-form-item label="日检 WARNING 阀值"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.dailyWarning">
          </el-input>
        </el-form-item>
        <el-form-item label="日检 CRITICAL 阀值"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.dailyCritical">
          </el-input>
        </el-form-item>
        <el-form-item label="监控 WARNING 阀值"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.monitorWarning">
          </el-input>
        </el-form-item>
        <el-form-item label="监控 CRITICAL 阀值"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.monitorCritical">
          </el-input>
        </el-form-item>
        <el-form-item label="超时时间(s)" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.timeOut">
          </el-input>
        </el-form-item>
        <el-form-item label="执行频率" required label-width="150px" >
          <el-input v-model="tempScriptConfig.execTime">                                                  
            <el-button slot="append" v-if="!showCronBox" icon="el-icon-arrow-up" @click="showCronBox = true" title="打开图形配置"></el-button>
            <el-button slot="append" v-else icon="el-icon-arrow-down" @click="showCronBox = false" title="关闭图形配置"></el-button>
          </el-input>
        </el-form-item>
        <cron v-if="showCronBox" v-model="tempScriptConfig.execTime"  style="width:640px;color:#2c3e50;margin-left:-35px;"></cron>
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
  import cron from './cron'
  export default {
    components: {
      cron
    },
    data() {
      return {
        showCronBox: false,
        totalCount: 0, //分页组件--数据总条数
        list: [],//表格的数据
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        allVersion : '',
        allShell   : '',
        allColumns : [],
        // sysVersion: [{
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
          update: '编辑脚本',
          create: '新建脚本'
        },
        tempScriptConfig: {
          type            : '',  
          shellName       : '',
          shellDesc       : '',  
          code            : '',
          dailyRule       : '',  
          shellUseRe      : '',
          dailySuccess    : '',  
          dailyWarning    : '',
          dailyCritical   : '',  
          monitorWarning  : '', 
          monitorCritical : '',  
          execTime        : '',
          timeOut         : '',
          systemType      : '',
          withColumns     : []
        },
        
      }
    
    },
    created() {
      this.getList();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllVersion();
        this.getAllShellType();
        this.getAllColumns();
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      getAllShellType() {
        debugger
        this.api({
          url: "/commonsConfig/getAllShellType",
          method: "get"
        }).then(data => {
          this.allShell = data.list;
        })
      },
      getAllVersion() {
        debugger
        this.api({
          url: "/commonsConfig/getAllVersionType",
          method: "get"
        }).then(data => {
          this.allVersion = data.list;
        })
      },
      getAllColumns() {
        debugger
        this.api({
          url: "/scriptConfig/getAllColumns",
          method: "get"
        }).then(data => {
          this.allColumns = data.list;
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
        debugger
        let shell = this.list[0];
        this.tempScriptConfig.type            =  "";  
        this.tempScriptConfig.shellName       =  "";
        this.tempScriptConfig.shellDesc       =  "";  
        this.tempScriptConfig.code            =  "";
        this.tempScriptConfig.dailyRule       =  null;  
        this.tempScriptConfig.shellUseRe      =  null;
        this.tempScriptConfig.dailySuccess    =  null;  
        this.tempScriptConfig.dailyWarning    =  null;
        this.tempScriptConfig.dailyCritical   =  null;  
        this.tempScriptConfig.monitorWarning  =  null; 
        this.tempScriptConfig.monitorCritical =  null;  
        this.tempScriptConfig.execTime        =  "";
        this.tempScriptConfig.timeOut         =  "";
        this.tempScriptConfig.systemType      =  "";  
        this.tempScriptConfig.withColumns     =  [];  
        if (shell === undefined) {
          this.tempScriptConfig.maxCode = '0';    
        }else{
          this.tempScriptConfig.maxCode         = shell.maxCode;
        };
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      },
      showUpdate($index) {
        debugger
        let shell            = this.list[$index];
        let withColumns      = shell.withColumns;
        if (withColumns != ""){
          var arrStringColumns = new Array();
          //以and分割 将类型存储数组中
          for(var oldType in withColumns.split(",")){
            // vue是数组类型是用push赋值
            arrStringColumns.push(withColumns.split(",")[oldType]+'');
          }
        }else{
          arrStringColumns = ""
        }
        this.tempScriptConfig.type            =  shell.type;  
        this.tempScriptConfig.shellName       =  shell.shellName;
        this.tempScriptConfig.shellDesc       =  shell.shellDesc; 
        this.tempScriptConfig.withColumns     =  [];
        this.tempScriptConfig.code            =  shell.code;
        this.tempScriptConfig.dailyRule       =  shell.dailyRule;
        this.tempScriptConfig.shellUseRe      =  shell.shellUseRe;
        this.tempScriptConfig.dailySuccess    =  shell.dailySuccess;
        this.tempScriptConfig.dailyWarning    =  shell.dailyWarning;
        this.tempScriptConfig.dailyCritical   =  shell.dailyCritical;  
        this.tempScriptConfig.monitorWarning  =  shell.monitorWarning; 
        this.tempScriptConfig.monitorCritical =  shell.monitorCritical;  
        this.tempScriptConfig.execTime        =  shell.execTime;
        this.tempScriptConfig.timeOut         =  shell.timeOut;
        this.tempScriptConfig.systemType      =  shell.systemType;
        this.tempScriptConfig.withColumns     =  arrStringColumns;
        this.tempScriptConfig.deleteStatus    = '1';
        this.tempScriptConfig.id              = shell.id;
        this.dialogStatus                     = "update"
        this.dialogFormVisible                = true
      },
      createScript() {
        let _vue = this;
        //添加新用户
        this.api({
          url: "/scriptConfig/addScript",
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
          url: "/scriptConfig/updateScript",
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
            url: "/scriptConfig/deleteScript",
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
