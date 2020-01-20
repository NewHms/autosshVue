<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
        <el-form-item>
          <el-input v-model="listQuery.ip" placeholder="请输入服务器IP地址" style='width: 300px;' type="text" 
           @input="change($event)" clearable/>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加 </el-button>
        </el-form-item> 
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row height="530">
      <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column label="服务器信息"  width="200">
        <template slot-scope="scope"> 
          <dt>IP地址:    {{ scope.row.host }}</dt> 
          <dt>逻辑名:    {{ scope.row.logicalInfo }}</dt>
          <dt>机房位置:  {{ scope.row.location }}</dt>
          <dt>执行频率:  {{ scope.row.execTime }}</dt>          
        </template>
      </el-table-column>
      <el-table-column align="center"     label="实例名"       prop="serviceName"     width="80">  </el-table-column>
      <!-- <el-table-column align="center"     label="code"          prop="code"         width="70">  </el-table-column> -->
      <el-table-column align="center"     label="命令描述"       prop="shellDesc">   </el-table-column>
      <el-table-column align="center" label="阀值"  width="300">
        <template slot-scope="scope_alarm">
          <dt style="text-align:center;" v-if="scope_alarm.row.rangeSuccess == null">
            {{ scope_alarm.row.rangeWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope_alarm.row.rangeCritical }} &lt;=&nbsp;C
          </dt>
          <dt style="text-align:center;" v-else>
            SUCC&nbsp;=&nbsp;{{ scope_alarm.row.rangeSuccess }}
          </dt>
        </template>     
      </el-table-column>
      <el-table-column align="center"     label="时间范围"       prop="dateRange">   </el-table-column>
      <!-- <el-table-column align="center"     label="时间范围"    prop="dateRange" width="380">
        <template  slot-scope="timeScope">
          <el-time-picker
            is-range
            v-model      = "timeScope.row.dateRange"
            value-format ="HH:mm" 
            format       ="HH:mm"
            range-separator  =" -- "
            start-placeholder="开始时间"
            end-placeholder  ="结束时间"
            placeholder      ="选择时间范围"
            style            ='width: 350px;'
            @change="updateRangeTime(timeScope.$index)">
          </el-time-picker>
        </template>  
      </el-table-column> -->
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
        <el-form-item label="IP" required label-width="150px">
          <el-select v-model="tempScriptConfig.host" v-if="dialogStatus=='update'"   :disabled="true" placeholder="请选择"  style="width:235px"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allRangeServer"
              :key="item.id"
              :label="item.host"
              :value="item.host">
            </el-option>
          </el-select>
          <el-select v-model="tempScriptConfig.host" v-else placeholder="请选择"  style="width:235px" @change="selectFn($event)"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allRangeServer"
              :key="item.id"
              :label="item.host"
              :value="item.host">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="实例名" label-width="150px">
          <el-select v-model="tempScriptConfig.serviceName" v-if="dialogStatus=='update'"   :disabled="true" placeholder="请选择"  style="width:235px"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in selectServiceinfo"
              :key="item.id"
              :label="item.serviceName"
              :value="item.serviceName">
            </el-option>
          </el-select>
          <el-select v-model="tempScriptConfig.serviceName" v-else placeholder="请选择"  @change="selectCode($event)" style="width:235px"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in selectServiceinfo"
              :key="item.id"
              :label="item.serviceName"
              :value="item.serviceName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="命令描述"  label-width="150px">
          <el-select v-model="tempScriptConfig.shellDesc" v-if="dialogStatus=='update'"   :disabled="true" placeholder="请选择"  style="width:235px"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in selectServerCode"
              :key="item.id"
              :label="item.shellDesc"
              :value="item.shellDesc">
            </el-option>
          </el-select>
          <el-select v-model="tempScriptConfig.shellDesc" v-else placeholder="请选择"   @change="selectCode_input($event)" style="width:235px"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in selectServerCode"
              :key="item.id"
              :label="item.shellDesc"
              :value="item.shellDesc">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监控阀值"  label-width="150px">
          <el-row v-if="dialogStatus=='update' && tempScriptConfig.rangeSuccess == null">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.rangeWarning"
                   /></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.rangeCritical"
                   /></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else-if="dialogStatus=='update' && tempScriptConfig.rangeSuccess != null">
            <el-col :span="6">&nbsp;&nbsp;SUCC&nbsp;</el-col>
            <el-col :span="2">&nbsp;=&nbsp;</el-col>
            <el-col :span="10" :offset="4"><el-input type="text" v-model="tempScriptConfig.rangeSuccess"
                   /></el-col>
          </el-row>
          <el-row v-else-if="dialogStatus=='create' && dailyRule == '区间'">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.rangeWarning"
                   /></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.rangeCritical"
                   /></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else-if="dialogStatus=='create' && dailyRule == '等式'">
            <el-col :span="6">&nbsp;&nbsp;SUCC&nbsp;</el-col>
            <el-col :span="2">&nbsp;=&nbsp;</el-col>
            <el-col :span="10" :offset="4"><el-input type="text" v-model="tempScriptConfig.rangeSuccess"
                   /></el-col>
          </el-row>
           <el-row v-else>
            <el-input type="text" style="width:235px" :disabled="true"></el-input>
          </el-row>
        </el-form-item>
        <el-form-item label="开始时间"  required label-width="150px" >
         <el-time-select
            v-model     = "tempScriptConfig.dateRangeStart"
            :picker-options="{
               start: '00:00',
               step: '00:10',
               end : '24:00'
            }"
            value-format="HH:mm" 
            format      ="HH:mm"
            start-placeholder="开始时间"
            placeholder      ="选开始时间"
            style            ='width: 235px;'>
         </el-time-select>
        </el-form-item>
        <el-form-item label="结束时间" required label-width="150px">
         <el-time-select
            v-model     = "tempScriptConfig.dateRangeEnd"
            :picker-options="{
               minTime : tempScriptConfig.dateRangeStart,
               start   : tempScriptConfig.dateRangeStart,
               step: '00:10',
               end : '24:00'
            }"
            value-format="HH:mm" 
            format      ="HH:mm"
            start-placeholder="结束时间"
            placeholder      ="选结束择时间"
            style            ='width: 235px;'>
          </el-time-select>
        </el-form-item>
        <el-form-item label="执行频率" required label-width="150px" >
          <el-input v-model="tempScriptConfig.execTime" style="width:235px">                                                  
            <el-button slot="append" v-if="!showCronBox" icon="el-icon-arrow-up" @click="showCronBox = true" title="打开图形配置"></el-button>
            <el-button slot="append" v-else icon="el-icon-arrow-down" @click="showCronBox = false" title="关闭图形配置"></el-button>
          </el-input>
        </el-form-item>
        <cron v-if="showCronBox" v-model="tempScriptConfig.execTime"></cron> 
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
        selectServiceinfo : [],
        selectServerCode  : [],
        dailyRule         : '',
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        listQuery_get: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        dateRange : '',
        allRangeServer : '',
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑配置',
          create: '新建配置'
        },
        tempScriptConfig: {
          shellDesc      : '',
          code           : '',
          rangeWarning   : '',
          serviceName    : '',
          location       : '',
          rangeCritical  : '',
          dateRangeStart : '',
          dateRangeEnd   : '',
          dateRange      : [],
          execTime       : '',
          host           : '',
          rangeSuccess   : '',
          logicalInfo    : '',
          dailyRule      : '',
        },
      }
    
    },
    created() {
      this.getList();
      this.getAllRangeServer();
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
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
      getList() {
        debugger
        //查询列表
        this.listLoading = true;
        if(this.$route.params.host  != undefined && this.$route.params.serviceName != undefined && this.$route.params.code != undefined) {
          this.listQuery.ip          =  this.$route.params.host
          this.listQuery.serviceName =  this.$route.params.serviceName
          this.listQuery.code  =  this.$route.params.code
        }else{
          this.listQuery.ip = this.listQuery.ip
        } 
        this.api({
          
          url: "/dateRangeConfig/listDateRange",
          method: "get",
          params: this.listQuery
        }).then(data => {
          debugger
          this.listLoading = false;
          this.list = data.list
          // this.list.push({
          //   ranges : [data.dateRangeStart,data.dateRangeEnd]
          // })
          this.totalCount = data.totalCount;
        })
      },
      getAllRangeServer() {
        this.api({
          url: "/dateRangeConfig/getRangeServer",
          method: "get"
        }).then(data => {
          this.allRangeServer = data.list;
        })
      },
      selectFn(e){
        debugger
        //查询列表
        this.listLoading    = true;
        this.listQuery_get.IP   = e;
        this.api({ 
          url: "/dateRangeConfig/getServerName",
          method: "get",
          params: this.listQuery_get
        }).then(data => {
          this.selectServiceinfo = data.list;
          this.listLoading      = false;
        })
      },
      selectCode_input(e){
        debugger
        //查询列表
        this.listLoading             = true;
        this.listQuery_get.shellDesc   = e;
        this.api({ 
          url: "/dateRangeConfig/getServerDailyRule",
          method: "get",
          params: this.listQuery_get
        }).then(data => {
          this.selectServerCode = data.list;
          this.listLoading      = false;  
          this.dailyRule        =  this.selectServerCode[0]['dailyRule']       
        })
      },
      selectCode(e){
        debugger
        //查询列表
        this.listLoading             = true;
        this.listQuery_get.serviceName   = e;
        this.api({ 
          url: "/dateRangeConfig/getServerCode",
          method: "get",
          params: this.listQuery_get
        }).then(data => {
          this.selectServerCode = data.list;
          this.listLoading      = false;  
         
        })
      },

      updateRangeTime($index) {
        //修改告警开始时间
        debugger
        let _vue = this;
       
        this.api({
          url: "/dateRangeConfig/updateRangeTime",
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
        let shell = this.list[1];
        this.tempScriptConfig.host           =  "";  
        this.tempScriptConfig.serviceName    =  "";
        this.tempScriptConfig.shellDesc      =  "";
        this.tempScriptConfig.rangeWarning   =  "";  
        this.tempScriptConfig.rangeCritical  =  "";  
        this.tempScriptConfig.code           =  "";
        this.tempScriptConfig.dateRangeStart =  "";
        this.tempScriptConfig.dateRangeEnd   =  "";  
        this.tempScriptConfig.execTime       =  "";
        this.tempScriptConfig.rangeSuccess   =  "";
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      },
      showUpdate($index) {
        debugger
        let shell                             = this.list[$index];        
        this.tempScriptConfig.host            =  shell.host;  
        this.tempScriptConfig.serviceName     =  shell.serviceName;
        this.tempScriptConfig.rangeWarning    =  shell.rangeWarning;  
        this.tempScriptConfig.rangeCritical   =  shell.rangeCritical;  
        this.tempScriptConfig.shellDesc       =  shell.shellDesc;
        this.tempScriptConfig.dateRangeStart  =  shell.dateRangeStart;
        this.tempScriptConfig.dateRangeEnd    =  shell.dateRangeEnd; 
        this.tempScriptConfig.execTime        =  shell.execTime;
        this.tempScriptConfig.rangeSuccess    =  shell.rangeSuccess;
        this.tempScriptConfig.deleteStatus    = '1';
        this.tempScriptConfig.id              = shell.id;
        this.dialogStatus                     = "update"
        this.dialogFormVisible                = true
      },

      createScript() {
        debugger
        let _vue = this;
        //添加新用户
        this.api({
          url: "/dateRangeConfig/addDateRange",
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
          url: "/dateRangeConfig/updateDateRange",
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
            url: "/dateRangeConfig/deleteDateRange",
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
      change(e){
        debugger
        this.$forceUpdate()
      },

    }
  }
</script>
<style>
 dt {text-align:left;  margin-left:5px;}
 </style>

