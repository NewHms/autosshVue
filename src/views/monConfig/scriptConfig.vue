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
      <el-table-column align="center"   label="命令信息" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-row>
              <!-- <el-col :span="">
                &nbsp;命令:
              </el-col> -->
              <el-col :span="1">
                &nbsp;&nbsp;命令: 
              </el-col>
              <el-col :span="1" :offset="2">
                <el-button type="text" 
                  class="fa fa-copy"
                  v-clipboard:copy=scope.row.shellName 
                  v-clipboard:success="onCopy"
                  v-clipboard:error="onError"
                  style="margin-top:-8px;height: 10px;">
                </el-button>
              </el-col>
              <el-col :span="1">
                <dt>{{ scope.row.shellName }}</dt>  
              </el-col>
            </el-row> 
            <dt>命令描述: {{ scope.row.shellDesc }}</dt> 
            <dt>命令类型: {{ scope.row.type }}</dt>
            <dt>适用版本: {{ scope.row.systemType }}</dt> 
          </template>
      </el-table-column>        
      <!-- <el-table-column align="center" label="命令" prop="shellName" style="width: 60px;" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column align="center" label="命令描述" width = '200' prop="shellDesc"></el-table-column>
      <el-table-column align="center"   label="命令信息" width="210" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <dt>命令类型: {{ scope.row.type }}</dt>
          <dt>适用版本: {{ scope.row.systemType }}</dt> 
        </template>
      </el-table-column> -->
      <el-table-column align="center" label="适配正则"   prop="shellUseRe" width="200"></el-table-column>
      <!-- <el-table-column align="center" label="判断规则"   prop="dailyRule" width = '80'></el-table-column> -->
      <el-table-column align="center" label="等式阀值" width = '110'>
        <template slot-scope="scope" >
          <dt v-if="scope.row.dailySuccess != null && scope.row.dailySuccess != ''">
            SUC&nbsp;=&nbsp;{{ scope.row.dailySuccess  }}
          </dt>
        </template>
      </el-table-column>  
      <el-table-column align="center" label="日检阀值" width="150">
        <template slot-scope="scope" >
          <dt v-if="scope.row.dailyWarning != null && scope.row.dailyCritical != null
                 && scope.row.dailyWarning != '' && scope.row.dailyCritical != ''">
            {{ scope.row.dailyWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope.row.dailyCritical }}
              &lt;=&nbsp;C
          </dt>
          <!-- <dt v-if="scope.row.dailyCritical != null && scope.row.dailyCritical != ''">
            {{ scope.row.dailyCritical  }}&nbsp;&lt;=&nbsp;CRI
          </dt> -->
        </template>
      </el-table-column>  
      <el-table-column align="center" label="监控阀值" width="150">
        <template slot-scope="scope" >
          <dt v-if="scope.row.monitorWarning != null && scope.row.monitorCritical != null
                 && scope.row.monitorWarning != '' && scope.row.monitorCritical != ''">
            {{ scope.row.monitorWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope.row.monitorCritical }}
              &lt;=&nbsp;C
          </dt>
          <!-- <dt v-if="scope.row.monitorCritical != null && scope.row.monitorCritical != ''">
            {{ scope.row.monitorCritical  }}&nbsp;&lt;=&nbsp;CRI
          </dt> -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="超时时间" prop="timeOut" width = "80"></el-table-column>
      <el-table-column align="center" label="执行频率" prop="execTime" width="150"></el-table-column>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form class="small-space" :model="tempScriptConfig" label-position="left" label-width="80px"
               style='width: 400px; margin-left:50px;'>        
        <el-form-item label="命令编号" required label-width="150px" v-if="dialogStatus=='create'" >
          <el-input type="text" v-model="tempScriptConfig.maxCode"  placeholder="请输入10的倍数" :disabled="true" style="width:235px"> 
          </el-input>
        </el-form-item>
        <el-form-item label="命令编号" required label-width="150px" v-else >
          <el-input type="text" v-model="tempScriptConfig.code"  placeholder="请输入10的倍数" :disabled="true" style="width:235px"> 
          </el-input>
        </el-form-item>
        <el-form-item label="命令" required label-width="150px">
          <el-input type="textarea" v-model="tempScriptConfig.shellName" :autosize="{ minRows: 2, maxRows: 4}" style="width:235px"> 
          </el-input>
        </el-form-item>
        <el-form-item label="关联参数" label-width="150px">
          <el-select v-model="tempScriptConfig.withColumns"  placeholder="请选择" style='width: 235px;' multiple> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for ="item in allColumns"
              :key  ="item.columnId"
              :label="item.columnName"
              :value="item.columnName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="命令描述" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.shellDesc" style="width:235px"> 
          </el-input>
        </el-form-item>
        <el-form-item label="命令类型" required label-width="150px">
          <el-select el-select v-model="tempScriptConfig.type" placeholder="请选择"  @change="selectSystemType($event)" style='width: 235px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option-group
              v-for="group in allShell"
              :key="group.Title"
              :label="group.Title">
            <el-option
              v-for="item in group.List"
              :key="item.shellId"
              :label="item.shellType"
              :value="item.shellType">
            </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="适用版本"   required label-width="150px">
          <el-select v-model="tempScriptConfig.systemType" multiple placeholder="请选择" style='width: 235px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option-group
              v-for="group in allVersion"
              :key="group.Title"
              :label="group.Title">
            <el-option
              v-for="item in group.List"
              :key="item.versionId"
              :label="item.versionType"
              :value="item.versionType">
            </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="判断规则" label-width="150px">
          <el-select v-model="tempScriptConfig.dailyRule"  placeholder="请选择" @change="selectFn($event)" style='width: 235px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for ="item in allReRule"
              :key  ="item.ruleId"
              :label="item.ruleType"
              :value="item.ruleType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适配正则"  label-width="150px">
          <el-input v-if="tempScriptConfig.dailyRule == '空值比对'" type="text" 
          :disabled="true" v-model="tempScriptConfig.shellUseRe" style="width:235px"> 
          </el-input>
          <el-input v-else type="text" v-model="tempScriptConfig.shellUseRe" Style="width:235px"> 
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="判断规则"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.dailyRule" placeholder="0->等式;1->不等式"> 
          </el-input>
        </el-form-item>        -->
        <!-- <el-form-item label="SUCCESS 阀值"  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.dailySuccess">
          </el-input>
        </el-form-item> -->
        <el-form-item label="SUCCESS 阀值" label-width="150px">
          <el-row v-if="tempScriptConfig.dailyRule == '区间' || tempScriptConfig.dailyRule == '空值比对'
            || tempScriptConfig.dailyRule == ''">
            <el-col :span="15" class="fail" >&nbsp;&nbsp;SUC&nbsp;&nbsp;=&nbsp;</el-col>
            <el-col :span="8">
              <el-input type="text" v-model="tempScriptConfig.dailySuccess"  :disabled="true" style="width:79px"/>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-col :span="15">&nbsp;&nbsp;SUC&nbsp;&nbsp;=&nbsp;</el-col>
            <el-col :span="8">
              <el-input type="text" v-model="tempScriptConfig.dailySuccess" 
                   style="width:79px" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="日检阀值"  label-width="150px">
          <el-row v-if="tempScriptConfig.dailyRule == '等式' || tempScriptConfig.dailyRule == '空值比对'
            || tempScriptConfig.dailyRule == ''">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyWarning"
                  :disabled="true"/></el-col>
            <el-col :span="6" class="fail">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyCritical"
                  :disabled="true"/></el-col>
            <el-col :span="6" class="fail">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyWarning"
                  @keyup.native="number($event)"/></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyCritical"
                  @keyup.native="number($event)"/></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
            <!-- <el-col :span="4"><el-input type="text" v-model="tempScriptConfig.monitorCritical" 
                  @keyup.native="number($event)"/></el-col>       -->
          </el-row>
        </el-form-item>

        <!-- <el-form-item label="日检 CRITICAL 阀值"  label-width="150px">
          <el-row v-if="tempScriptConfig.dailyRule == '等式'">
            <el-col :span="16" class="fail">&nbsp;&nbsp;CRI&nbsp;&nbsp;&lt;=&nbsp;</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.dailyCritical" :disabled="true"/></el-col>
          </el-row>
          <el-row v-else-if="tempScriptConfig.dailyRule == '空值比对'">
            <el-col :span="16" class="fail">&nbsp;&nbsp;CRI&nbsp;&nbsp;&lt;=&nbsp;</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.dailyCritical" :disabled="true"/></el-col>
          </el-row>
          <el-row v-else>
            <el-col :span="16">&nbsp;&nbsp;CRI&nbsp;&nbsp;=&nbsp;</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.dailyCritical"
                   @keyup.native="number($event)"/></el-col>
          </el-row>
        </el-form-item> -->

        <el-form-item label="监控阀值"  label-width="150px">
          <el-row v-if="tempScriptConfig.dailyRule == '等式' || tempScriptConfig.dailyRule == '空值比对'
              || tempScriptConfig.dailyRule == ''">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorWarning"
                  :disabled="true"/></el-col>
            <el-col :span="6" class="fail">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorCritical"
                  :disabled="true"/></el-col>
            <el-col :span="6" class="fail">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorWarning"
                  @keyup.native="number($event)"/></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorCritical"
                  @keyup.native="number($event)"/></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
            <!-- <el-col :span="4"><el-input type="text" v-model="tempScriptConfig.monitorCritical" 
                  @keyup.native="number($event)"/></el-col>       -->
          </el-row>
        </el-form-item>

        <!-- <el-form-item label="监控 CRITICAL 阀值"  label-width="150px">
          <el-row v-if="tempScriptConfig.dailyRule == '等式'">
            <el-col :span="16" class="fail">&nbsp;&nbsp;CRI&nbsp;&nbsp;=&nbsp;</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.monitorCritical" :disabled="true"/></el-col>
          </el-row>
          <el-row v-else-if="tempScriptConfig.dailyRule == '空值比对'">
            <el-col :span="16" class="fail">&nbsp;&nbsp;CRI&nbsp;&nbsp;=&nbsp;</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.monitorCritical" :disabled="true"/></el-col>
          </el-row>
          <el-row v-else>
            <el-col :span="16">&nbsp;&nbsp;CRI&nbsp;&nbsp;&lt;=&nbsp;</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.monitorCritical"
                   @keyup.native="number($event)"/></el-col>
          </el-row>
        </el-form-item> -->

        <el-form-item label="超时时间(s)" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.timeOut" @keyup.native="number($event)" style="width:235px">
          </el-input>
        </el-form-item>
        <el-form-item label="执行频率" required label-width="150px" >
          <el-input v-model="tempScriptConfig.execTime" style="width:235px">                                                  
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
        listLoading: false,//数据加载等待动画
        //定义变量
        list       : [],//表格的数据
        allVersion : [],
        allShell   : [],
        allColumns : [],
        allReRule  : [],
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        listQuery_get: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        
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
          systemType      : [],
          withColumns     : []
        },
        
      }
    
    },
    created() {
      this.getList();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllShellType();
        this.getAllColumns();
        this.getReRule();
      }
    },
    watch:{
      "$route":"getList"  
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      onCopy (e) {
        this.$message.success("内容已复制到剪切板！")
      },
      // 复制失败时的回调函数
      onError (e) {
        this.$message.error("抱歉，复制失败！")
      },
      //判断只能输入数字
      number(e) {
        if(e.target.value != ''){
          let  flag = new RegExp("^[1-9]([0-9])*$").test(e.target.value);
          if (!flag) {
            e.target.value = "";
            this.$message({
              showClose: true,
              message: "请输入正整数",
              type: "warning"
            });
          }
        }
      },
      selectSystemType(e){
        debugger
        //查询列表
        this.listLoading             = true;
        this.listQuery_get.type      = e;
        this.api({ 
          url: "/commonsConfig/getAllVersionType",
          method: "get",
          params: this.listQuery_get
        }).then(data => {
          this.allVersion       = data.list;
          this.listLoading      = false;
        })
      },
      getAllShellType() {
        debugger
        this.api({
          url: "/commonsConfig/getAllShellType",
          method: "get"
        }).then(data => {
          this.allShell = data.list;
        })
      },
      // getAllVersion() {
      //   debugger
      //   this.api({
      //     url: "/commonsConfig/getAllVersionType",
      //     method: "get"
      //   }).then(data => {
      //     this.allVersion = data.list;
      //   })
      // },
      getReRule() {
        debugger
        this.api({
          url: "/commonsConfig/getAllReRule",
          method: "get"
        }).then(data => {
          this.allReRule = data.list;
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
      selectFn(){
        this.tempScriptConfig.shellUseRe      =  "";  
        this.tempScriptConfig.dailySuccess    =  "";
        this.tempScriptConfig.dailyWarning    =  "";
        this.tempScriptConfig.dailyCritical   =  "";  
        this.tempScriptConfig.monitorWarning  =  ""; 
        this.tempScriptConfig.monitorCritical =  ""; 
      },
      showCreate() {
        //显示新增对话框
        debugger
        let shell = this.list[0];
        this.tempScriptConfig.type            =  "";  
        this.tempScriptConfig.shellName       =  "";
        this.tempScriptConfig.shellDesc       =  "";  
        this.tempScriptConfig.code            =  "";
        this.tempScriptConfig.dailyRule       =  "";  
        this.tempScriptConfig.shellUseRe      =  "";
        this.tempScriptConfig.dailySuccess    =  "";  
        this.tempScriptConfig.dailyWarning    =  "";
        this.tempScriptConfig.dailyCritical   =  "";  
        this.tempScriptConfig.monitorWarning  =  ""; 
        this.tempScriptConfig.monitorCritical =  "";  
        this.tempScriptConfig.execTime        =  "";
        this.tempScriptConfig.timeOut         =  "";
        this.tempScriptConfig.systemType      =  [];  
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
        if (withColumns != "" ){
          var arrStringColumns = new Array();
          //以and分割 将类型存储数组中
          for(var oldType in withColumns.split(",")){
            // vue是数组类型是用push赋值
            arrStringColumns.push(withColumns.split(",")[oldType]+'');
          }
        }else{
          arrStringColumns = ""
        }
        let systemType  = shell.systemType;
        if (systemType != ""){
          var arrSystemType = new Array();
          //以and分割 将类型存储数组中
          for(var oldType in systemType.split(",")){
            // vue是数组类型是用push赋值
            arrSystemType.push(systemType.split(",")[oldType]+'');
          }
        }else{
          arrSystemType = ""
        }
        this.tempScriptConfig.type            =  shell.type;  
        this.tempScriptConfig.shellName       =  shell.shellName;
        this.tempScriptConfig.shellDesc       =  shell.shellDesc; 
        this.tempScriptConfig.withColumns     =  [];
        this.tempScriptConfig.systemType      =  [];
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
        this.tempScriptConfig.systemType      =  arrSystemType;
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
<style lang="scss" scoped>
  dt {text-align:left;  margin-left:5px;}
  .fail{
    color: #888888;font-weight: 500; text-decoration: line-through;
  }
</style>