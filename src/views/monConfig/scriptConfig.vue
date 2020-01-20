<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
        <el-form-item>
          <el-input v-model="listQuery.shellDesc" placeholder="请输入命令描述" style='width: 20%' type="text" clearable></el-input>
          <el-select v-model="listQuery.shellType" placeholder="请选择命令类型" 
            label-width="80px" style='width: 15%' clearable @change="selectShellSum($event)"> 
            <el-option
              v-for="item in allShell"
              :key="item.shellId"
              :label="item.shellType"
              :value="item.shellType">
              <span style="float: left">{{ item.shellType }}</span>
              <span style="float: right"><el-tag type="success" size="mini">
                <div style="margin-top: -6px;">{{ item.shellTypeCount }}</div> </el-tag></span>
              <!-- <span style="float: right; color: #8492a6; font-size: 13px">
                <el-badge></el-badge>
              </span> -->
            </el-option>
          </el-select>
          <el-select v-model="tempScriptConfig.selectSum" placeholder="请选择命令版本" label-width="80px" style='width: 15%' clearable> 
            <el-option
              v-for="item in allSystemType"
              :key="item.shellId"
              :label="item.shellType"
              :value="item.shellType">
              <span style="float: left">{{ item.shellType }}</span>
              <span style="float: right"><el-tag type="warning" size="mini">
                <div style="margin-top: -6px;">{{ item.shellTypeCount }}</div> </el-tag></span>
              <!-- <span style="float: right; color: #8492a6; font-size: 13px">
                <el-badge></el-badge>
              </span> -->
            </el-option>
          </el-select>
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
      <el-table-column align="center" label="判断规则"   prop="dailyRule"  width="80"></el-table-column>
      <el-table-column align="center" label="适配正则"   prop="valuesDesc" width="165%"></el-table-column>
      <!-- <el-table-column align="center" label="等式阀值" width="110%">
        <template slot-scope="scope" >
          <dt v-if="scope.row.dailySuccess != null && scope.row.dailySuccess != ''">
            SUC&nbsp;=&nbsp;{{ scope.row.dailySuccess  }}
          </dt>
        </template>
      </el-table-column>   -->
      <el-table-column align="center" label="日检阀值" width="165%">
        <template slot-scope="scope" >
          <dt v-if="scope.row.dailyWarning != null && scope.row.dailyCritical != null
                 && scope.row.dailyWarning != '' && scope.row.dailyCritical != ''">
            {{ scope.row.dailyWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope.row.dailyCritical }}
              &lt;=&nbsp;C
          </dt>
          <dt v-else-if=" scope.row.dailySuccess != null &&  scope.row.dailySuccess != ''">
            SUC&nbsp;=&nbsp;{{ scope.row.dailySuccess  }}
          </dt>
          <dt v-else></dt>
          <!-- <dt v-if="scope.row.dailyCritical != null && scope.row.dailyCritical != ''">
            {{ scope.row.dailyCritical  }}&nbsp;&lt;=&nbsp;CRI
          </dt> -->
        </template>
      </el-table-column>  
      <el-table-column align="center" label="监控阀值" width="165%">
        <template slot-scope="scope" >
          <dt v-if="scope.row.monitorWarning != null && scope.row.monitorCritical != null
                 && scope.row.monitorWarning != '' && scope.row.monitorCritical != ''">
            {{ scope.row.monitorWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope.row.monitorCritical }}
              &lt;=&nbsp;C
          </dt>
          <dt v-else-if=" scope.row.monitorSuccess != null &&  scope.row.monitorSuccess != ''">
            SUC&nbsp;=&nbsp;{{ scope.row.monitorSuccess  }}
          </dt>
          <dt v-else></dt>
          <!-- <dt v-if="scope.row.monitorCritical != null && scope.row.monitorCritical != ''">
            {{ scope.row.monitorCritical  }}&nbsp;&lt;=&nbsp;CRI
          </dt> -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="超时时间(s)" prop="timeOut"  width="80"></el-table-column>
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
          <el-row :gutter="20">
            <el-col :span="3">
              <el-button class="fa fa-plus-square" type = "text" @click="addShareLink"></el-button>
            </el-col> 
            <el-col :span="3">
              <el-button class="fa fa-minus-square" type = "text" @click="removeParam"></el-button>
            </el-col> 
          </el-row> 
          <el-row v-for="(todo,index) in this.tempScriptConfig.shareParams" :key="index" :gutter="10">
            <el-col :span="10" style="margin-left: -30%;">
              <el-input
                v-model="todo.attribute"
                placeholder="输入内容"
                size="mini" :disabled="true"/>
            </el-col>
            <el-col :span="10">
              <el-input
                v-model="todo.attributeLogic"
                placeholder="逻辑名"
                size="mini" clearable/>
            </el-col> 
            <el-col :span="10">
              <el-input
              v-model="todo.attributeValue"
              placeholder="值"
              size="mini"  clearable/>
            </el-col> 
          </el-row>
        </el-form-item>
        <el-form-item label="命令描述" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.shellDesc" style="width:235px"> 
          </el-input>
        </el-form-item>
        <el-form-item label="命令类型" required label-width="150px">
          <el-select el-select v-model="tempScriptConfig.type" placeholder="请选择"  @change="replaceSystemType($event)" style='width: 235px;'> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option-group
              v-for="group in allCommandType"
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
              v-for ="item in allReMethod"
              :key  ="item.ruleId"
              :label="item.ruleType"
              :value="item.ruleType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适配正则" label-width="150px">
          <el-row>
            <el-select v-if="tempScriptConfig.dailyRule == '空值比对' || tempScriptConfig.dailyRule == '大屏'" 
                v-model="tempScriptConfig.valuesDesc"  placeholder="请选择" style='width: 235px;'
                @change="replaceUseRe($event)" :disabled="true"> <!-- 对应列名 clearable 清空当前checkbox-->
              <el-option
                v-for ="item in allReRule"
                :key  ="item.ruleId"
                :label="item.ruleType"
                :value="item.ruleType">
              </el-option>
            </el-select>
            <el-select v-else 
                v-model="tempScriptConfig.valuesDesc"  placeholder="请选择" style='width: 235px;' @change="replaceUseRe($event)"> <!-- 对应列名 clearable 清空当前checkbox-->
              <el-option
                v-for ="item in allReRule"
                :key  ="item.ruleId"
                :label="item.ruleType"
                :value="item.ruleType">
              </el-option>
            </el-select>
          </el-row>
          <div style="margin-top: -10px; height: 10px;font-size: 1px;">
            <el-row>
             {{this.tempScriptConfig.shellUseRe}}
            </el-row>
          </div>  
        </el-form-item>
        <el-form-item label="日检阀值"  label-width="150px">
          <el-row v-if="tempScriptConfig.dailyRule == '等式'">
            <el-col :span="8">SUCC</el-col>
            <el-col :span="7">=</el-col>
            <el-col :span="8">
              <el-input type="text" v-model="tempScriptConfig.dailySuccess"  style="width:79px"/>
            </el-col>
          </el-row>
          <el-row v-else-if="tempScriptConfig.dailyRule == '区间'">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyWarning"
                  @keyup.native="number($event)"/></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyCritical"
                  @keyup.native="number($event)"/></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else>
             <el-input type="text"   :disabled="true" style='width: 235px;'/> 
          </el-row>
        </el-form-item>

        <el-form-item label="监控阀值"  label-width="150px">
          <el-row v-if="tempScriptConfig.dailyRule == '等式'">
            <el-col :span="8">SUCC</el-col>
            <el-col :span="7">=</el-col>
            <el-col :span="8">
              <el-input type="text" v-model="tempScriptConfig.monitorSuccess"  style="width:79px"/>
            </el-col>
          </el-row>
          <el-row v-else-if="tempScriptConfig.dailyRule == '区间'">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorWarning"
                  @keyup.native="number($event)"/></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorCritical"
                  @keyup.native="number($event)"/></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else>
             <el-input type="text"   :disabled="true" style='width: 235px;'/> 
          </el-row>
        </el-form-item>
        <el-form-item label="超时时间(s)" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.timeOut" @keyup.native="number($event)" style="width:235px">
          </el-input>
        </el-form-item>
        <el-form-item label="测试" required label-width="150px">
          <el-row>
            <el-col :span="13"><el-input type="text" placeholder="输入服务器地址" v-model="listQuery_shell.host"/></el-col>
            <el-col :span="8">
              <el-input v-if="this.tempScriptConfig.type != 'Oracle'" type="text"  placeholder="实例名" 
                v-model="listQuery_shell.serviceName" :disabled="true"/>
              <el-input v-else type="text"  placeholder="实例名" 
                v-model="listQuery_shell.serviceName"/>                
            </el-col>
            <el-col :span="1">
              <el-button class="fa fa-check" type = "text" v-if="this.doTestResult=='OK'"></el-button>
              <el-button class="fa fa-close" type = "text" v-else-if="this.doTestResult=='FAIL'"></el-button>
              <el-button class="fa fa-bolt" type = "text"  v-else-if="this.doTestResult=='Exception'"></el-button>
              <el-button class="fa fa-chain-broken" type = "text" @click="doTestShell" v-else></el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="执行频率" required label-width="150px" >
          <el-input v-model="tempScriptConfig.execTime" style="width:235px">                                                  
            <el-button slot="append" v-if="!showCronBox" icon="el-icon-arrow-up" @click="showCronBox = true" title="打开图形配置"></el-button>
            <el-button slot="append" v-else icon="el-icon-arrow-down" @click="showCronBox = false" title="关闭图形配置"></el-button>
          </el-input>
        </el-form-item>
        <cron v-if="showCronBox" v-model="tempScriptConfig.execTime"  style="width:530px;color:#2c3e50;margin-left:-50px"></cron>
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
        useRe      : '',
        list       : [],//表格的数据
        allVersion : [],
        allShell   : [],
        allColumns : [],
        allReRule  : [],
        allReMethod : [],
        allCommandType : [],
        allSystemType  : [],
        doTestResult   : '',
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        listQuery_get: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        listQuery_Type: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        listQuery_Re: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        listQuery_shell: {
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
          monitorSuccess  : '',  
          dailyWarning    : '',
          dailyCritical   : '',  
          monitorWarning  : '', 
          monitorCritical : '',  
          execTime        : '',
          timeOut         : '',
          selectSum       : '',
          valuesDesc      : '',
          attributeLen    : '',
          systemType      : [],
          shareParams     : []
        },
        
      }
    
    },
    created() {
      this.getList();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getCommandType();
        this.getAllShellType();
        this.getAllColumns();
        this.getReRule();
        this.getReMethod();
      }
    },
    watch:{
      "$route":"getList",
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      // 添加分享链接参数
      addShareLink() {
        debugger
        if(this.tempScriptConfig.attributeLen < 5){
          this.tempScriptConfig.attributeLen += 1;
          this.tempScriptConfig.shareParams.push({
            id: this.tempScriptConfig.attributeLen,
            attribute     : `attribute${this.tempScriptConfig.attributeLen}`,
            attributeLogic: '',
            attributeValue: '',
          });
        } else{
          this.$message({
            showClose:true,
            message:'超过5个参数项'
          })
        }   
      },
      // 删除分享参数
      removeParam() {
        debugger
        var index = this.tempScriptConfig.attributeLen
        if(index  == 0){
           this.tempScriptConfig.shareParams.splice(index, 1);
        }else{
          index = index - 1
          this.tempScriptConfig.shareParams.splice(index, 1);
          this.tempScriptConfig.attributeLen = index
        }
        
      },
      doTestShell() {
        debugger
        //刷新定时器
        let _vue = this;
        this.listLoading = false;
        this.tempScriptConfig.host         = this.listQuery_shell.host 
        this.tempScriptConfig.serviceName  = this.listQuery_shell.serviceName
        this.doTestResult                = ""
        this.api({
          url: "/scriptConfig/shellTest",
          method: "post",
          data : this.tempScriptConfig
        }).then(data => {
          this.doTestResult = data.list[0]['resultStatus'];
        })  
      },
      selectShellSum(e){
        debugger
        //查询列表
        this.listLoading    = true;
        this.listQuery_Type.shellType   = e;
        this.tempScriptConfig.selectSum = ""
        this.api({ 
          url: "/commonsConfig/getAllShellSum",
          method: "get",
          params: this.listQuery_Type
        }).then(data => {
          this.allSystemType = data.list;
          this.listLoading   = false;
        })
      },
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
        // alert(this.oldval)
        // if(this.oldval != e){
        //   this.tempScriptConfig.systemType = [];
        // }
        this.api({ 
          url: "/commonsConfig/getAllVersionType",
          method: "get",
          params: this.listQuery_get
        }).then(data => {
          this.allVersion       = data.list;
          this.listLoading      = false;
        })
      },

      replaceSystemType(e){
        debugger
        //查询列表
        this.listLoading             = true;
        this.listQuery_get.type      = e;
        this.tempScriptConfig.systemType = [];
        // alert(this.oldval)
        // if(this.oldval != e){
        //   
        // }
        this.api({ 
          url: "/commonsConfig/getAllVersionType",
          method: "get",
          params: this.listQuery_get
        }).then(data => {
          this.allVersion       = data.list;
          this.listLoading      = false;
        })
      },
      replaceUseRe(e){
        debugger
        //查询列表
        this.listLoading             = true;
        this.listQuery_Re.valuesDesc = ''   
        this.listQuery_Re.valuesDesc = e        
        this.api({ 
          url: "/commonsConfig/getAllReRule",
          method: "get",
          params: this.listQuery_Re
        }).then(data => {
          this.tempScriptConfig.shellUseRe  = data.list[0]["reValues"];
          this.listLoading      = false;
        })
      },
      getCommandType() {
        debugger
        this.api({
          url: "/commonsConfig/getCommandType",
          method: "get"
        }).then(data => {
          this.allCommandType = data.list;
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
      getReMethod() {
        debugger
        this.api({
          url: "/commonsConfig/getAllReMethod",
          method: "get"
        }).then(data => {
          this.allReMethod = data.list;
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
        if(this.tempScriptConfig.selectSum != undefined){
          this.listQuery.systemType = this.tempScriptConfig.selectSum
        }
        
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
        this.tempScriptConfig.monitorSuccess  =  "";
        this.tempScriptConfig.dailyWarning    =  "";
        this.tempScriptConfig.dailyCritical   =  "";  
        this.tempScriptConfig.monitorWarning  =  ""; 
        this.tempScriptConfig.monitorCritical =  ""; 
      },
      showCreate() {
        //显示新增对话框
        debugger
        let shell = this.list[0];
        this.tempScriptConfig.attributeLen    =  1;
        this.tempScriptConfig.type            =  ""; 
        this.listQuery_shell.host             =  "";
        this.listQuery_shell.serviceName      =  "";
        this.doTestResult                     =  ""; 
        this.tempScriptConfig.shellName       =  "";
        this.tempScriptConfig.shellDesc       =  "";  
        this.tempScriptConfig.code            =  "";
        this.tempScriptConfig.dailyRule       =  "";  
        this.tempScriptConfig.shellUseRe      =  "";
        this.tempScriptConfig.valuesDesc      =  "";
        this.tempScriptConfig.dailySuccess    =  "";  
        this.tempScriptConfig.dailyWarning    =  "";
        this.tempScriptConfig.dailyCritical   =  "";  
        this.tempScriptConfig.monitorSuccess  =  "";
        this.tempScriptConfig.monitorWarning  =  ""; 
        this.tempScriptConfig.monitorCritical =  "";  
        this.tempScriptConfig.execTime        =  "";
        this.tempScriptConfig.timeOut         =  "";
        this.tempScriptConfig.systemType      =  [];  
        this.tempScriptConfig.shareParams     =  [];  
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
        // let withColumns      = shell.withColumns;
        // if (withColumns != "" ){
        //   var arrStringColumns = new Array();
        //   //以and分割 将类型存储数组中
        //   for(var oldType in withColumns.split(",")){
        //     // vue是数组类型是用push赋值
        //     arrStringColumns.push(withColumns.split(",")[oldType]+'');
        //   }
        // }else{
        //   arrStringColumns = ""
        // }
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
        // this.tempScriptConfig.shareParams     =  [];
        this.tempScriptConfig.systemType      =  [];
        this.tempScriptConfig.code            =  shell.code;
        this.tempScriptConfig.dailyRule       =  shell.dailyRule;
        if(shell.valuesDesc == undefined){
          this.tempScriptConfig.valuesDesc    =  "";
        }else{
          this.tempScriptConfig.valuesDesc    =  shell.valuesDesc;  
        }
        this.tempScriptConfig.shellUseRe      =  shell.shellUseRe;
        this.tempScriptConfig.dailySuccess    =  shell.dailySuccess;
        this.tempScriptConfig.dailyWarning    =  shell.dailyWarning;
        this.tempScriptConfig.dailyCritical   =  shell.dailyCritical;  
        this.tempScriptConfig.monitorSuccess  =  shell.monitorSuccess;
        this.tempScriptConfig.monitorWarning  =  shell.monitorWarning; 
        this.tempScriptConfig.monitorCritical =  shell.monitorCritical;  
        this.tempScriptConfig.execTime        =  shell.execTime;
        this.tempScriptConfig.timeOut         =  shell.timeOut;
        this.tempScriptConfig.systemType      =  arrSystemType;
        if(shell.shareParams == undefined){
          this.tempScriptConfig.shareParams   =  [];
        }else{
          this.tempScriptConfig.shareParams   =  JSON.parse(shell.shareParams);
        }
        this.tempScriptConfig.attributeLen    =  shell.attributeLen;
        this.listQuery_shell.host             =  "";
        this.listQuery_shell.serviceName      =  "";
        this.doTestResult                     =  "";
        this.tempScriptConfig.deleteStatus    = '1';
        this.tempScriptConfig.id              = shell.id;
        this.dialogStatus                     = "update"
        this.dialogFormVisible                = true
        this.selectSystemType(this.tempScriptConfig.type)
        this.replaceUseRe(this.tempScriptConfig.shellDesc)
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