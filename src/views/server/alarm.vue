<template>
  <div class="app-container">    <div class="filter-container">
      <el-form>
        <el-form-item>
          <el-input v-model="listQuery.ip" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input>      
          <el-date-picker
             v-model="listQuery.dataTime"
             type="date"
             placeholder="选择日期"
             value-format="yyyy-MM-dd" format="yyyy-MM-dd" style='width: 150px;'>
          </el-date-picker>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>        
        </el-form-item>  
      </el-form>
  </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :row-style="checkDel" height="530"  @expand-change="getInnerAlarm">
      <!-- <span v-if="scope.row.execStatus=2" style="color:red">{{ scope.row.execStatus }}</span>         -->
      <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column type="expand" >
        <template  slot-scope="scope">
          <el-table :data="listAlarm" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row :row-style="checkDelInner">
            <!-- <el-table-column align="center" width="50"     label="序号"       prop="id" fixed="left">
                <span v-text="getIndex(scope.$index)"> </span>
            </el-table-column>   -->
            <el-table-column align="center" label="ip"      prop="ip" width="130"></el-table-column> 
            <el-table-column align="center" label="实例名"   prop="serviceName" width="80"> </el-table-column>
            <el-table-column align="center" label="code"    prop="code"  width="70">         </el-table-column> 
            <el-table-column align="center" label="采集时间"  width="120">
              <template slot-scope="scope">
                <dt>{{ scope.row.execTimeDay  }}</dt>
                <dt>{{ scope.row.execTimeHour }}</dt> 
              </template>
            </el-table-column> 
            <el-table-column align="center" label="执行结果" prop="execResult"  width="540">   </el-table-column> 
            <el-table-column align="center" label="执行状态" prop="resultStatus" :cell-class-name="checkDelInner" width="120"></el-table-column> 
            <el-table-column align="center" label="命令描述" prop="shellDesc"></el-table-column> 
          </el-table>
          <el-pagination
            @size-change   ="handleInnerSizeChange"
            @current-change="handleInnerCurrentChange"
            :current-page  ="listData.pageNum"
            :page-size     ="listData.pageRow"
            :total         ="totalInnerCount"
            :page-sizes    ="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper">
          </el-pagination>
        </template>
      </el-table-column>
      <el-table-column align="center"     label="IP"            prop="ip" sortable  width="130"> </el-table-column>
      <el-table-column align="center"     label="实例名"         prop="serviceName"  width="80"></el-table-column>
      <el-table-column align="center"     label="机房位置"       prop="location"     width="80">    </el-table-column>
      <el-table-column align="center"     label="code"          prop="code"         width="70">        </el-table-column>
      <el-table-column align="center"     label="命令描述"       prop="shellDesc">   </el-table-column>
      <el-table-column align="center"     label="结果状态"       prop="resultStatus" width="120"></el-table-column>
      <el-table-column align="center"     label="恢复状态"       prop="status"       width="120" :cell-class-name="checkDel">      </el-table-column>
      <el-table-column align="center"     label="告警起始时间"    prop="alarmStartTime" width="210">
        <template  slot-scope="timeScope">
          <el-date-picker
            v-model="timeScope.row.alarmStartTime"
            type="datetime"
            placeholder="选择日期"
            value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" style='width: 185px;'
            @change="updateAlarmTime(timeScope.$index)">
          </el-date-picker>
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
  </div>

</template>

<script>
  import {mapGetters} from 'vuex'
  export default {
    data() {
      return {
        totalCount: 0, //分页组件--数据总条数
        dataTime    : '',
        list        : [],//表格的数据
        allLocation : '',
        listLoading: false,//数据加载等待动画     
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
          dataTime  : new Date()
          //execStatus : '',
        },

        listData: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
          dataTime  : new Date()
          //execStatus : '',
        },
        
        tempScriptConfig: {
          shellDesc      : '',
          code           : '',
          execTime       : '',
          serviceName    : '',
          location       : '',
          execResult     : '',
          resultStatus   : '',
          status         : '',
          ip             : '',
          execTimeDay    : '',
          execTimeHour   : '',
          alarmStartTime : '',
          maxExecTime    : ''
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
      checkDelInner({row, column, rowIndex, columnIndex}){
        if (this.listAlarm[rowIndex].resultStatus=='FAIL' || this.listAlarm[rowIndex].resultStatus=='CRITICAL'){
          return 'color: #FF0000;font-weight: 500;'
        }
        if (this.listAlarm[rowIndex].resultStatus=='WARNING'){
          return 'color: #CD6600;font-weight: 500;'
        }
        if (this.listAlarm[rowIndex].resultStatus=='SUCCESS'){
          return 'color: #008000;font-weight: 500;'
        }
      },
      checkDel({row, column, rowIndex, columnIndex}){
        if (this.list[rowIndex].status=='NG'){
          return 'color: #FF0000;font-weight: 500;'
        }
        if (this.list[rowIndex].status=='OK'){
          return 'color: #008000;font-weight: 500;'
        }
      },  
      getList() {
        debugger
        //查询列表
        this.listLoading = true;
        //parseTime(this.listQuery.dataTime)
        this.api({ 
          url: "/alarmConfig/getAllAlarm",
          method: "get",
          params: this.listQuery

        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },
      updateAlarmTime($index) {
        //修改告警开始时间
        debugger
        let _vue = this;
       
        this.api({
          url: "/alarmConfig/updateAlarmTimeConfig",
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
      async getInnerAlarm(data,expandedRows) {
        debugger
        //查询列表
        this.listLoading = true;
        data.dataTime = this.listQuery.dataTime
        data.pageNum  = this.listData.pageNum
        data.pageRow  = this.listData.pageRow
        this.api({ 
          url: "/alarmConfig/getAllInnerAlarm",
          method: "get",
          params: data

        }).then(data => {
          this.listLoading = false;
          this.listAlarm   = data.list;
          this.totalInnerCount  = data.totalCount;
        })
        //如果展开行数大于1
        if(expandedRows.length>1){
        //shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
          expandedRows.shift();
        }  
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
        this.listData.pageRow = val
        this.handleInnerFilter();
      },
      handleInnerCurrentChange(val) {
        this.listData.pageNum = val
        this.getInnerAlarm();         
      },
      handleInnerFilter() {
        //查询事件       
        this.listData.pageNum = val
        this.getInnerAlarm();   
      },
      getIndex($index) {
        //表格序号
        //debugger
        return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
      },
      getInnerIndex($index) {
        //表格序号
        //alert(($index+1))
        return (this.listData.pageNum - 1) * this.listData.pageRow + $index
      },
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
</style>
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