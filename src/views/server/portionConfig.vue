<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
        <el-form-item>
          <el-input v-model="listQuery.IP" placeholder="请输入IP地址" style='width: 300px;' type="text" clearable></el-input>
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
          <el-button type="primary" icon="plus" v-if="hasPerm('scriptConfig:add')" @click="showCreate">添加 </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit
              highlight-current-row>
      <el-table-column align="center" label="序号"     prop="id" width="40">
        <template slot-scope="scope">
          <span v-text="getIndex(scope.$index)"> </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="IP"         prop="IP"></el-table-column>
      <el-table-column align="center" label="主机名"      prop="hostName"></el-table-column>
      <el-table-column align="center" label="适用版本"    prop="sysVersion"></el-table-column>
      <el-table-column align="center" label="服务器类型"  prop="systemType"></el-table-column>
      <el-table-column align="center" label="超时时间(s)"    prop="timeOut"  width="100"></el-table-column>
      <el-table-column align="center" label="执行时间"    prop="execTime"></el-table-column>
      <el-table-column align="center" label="创建时间"    prop="createTime"></el-table-column>
      <el-table-column align="center" label="编辑"     width="200" v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="primary" icon="edit" @click="showUpdate(scope.$index)">修改</el-button>
          <el-button type="danger" icon="delete" 
                     @click="removeUser(scope.$index)">删除
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
               style='width: 300px; margin-left:50px;'>
        <el-form-item label="IP" required label-width="100px">
          <el-input type="text" v-model="tempScriptConfig.IP">
          </el-input>
        </el-form-item>
        <el-form-item label="主机名"  required label-width="100px">
          <el-input type="text" v-model="tempScriptConfig.hostName">
          </el-input>
        </el-form-item>
        <el-form-item label="适用版本" required label-width="100px">
          <el-select v-model="tempScriptConfig.sysVersion"  multiple placeholder="请选择" label-width="80px" style='width: 200px;'> 
            <el-option
              v-for="item in alltype"
              :key="item.serverId"
              :label="item.serverType"
              :value="item.serverType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务器类型"  required label-width="100px">
          <el-input type="text" v-model="tempScriptConfig.systemType">
          </el-input>
        </el-form-item>
        <el-form-item label="超时时间(s)" label-width="100px">
          <el-input type="text" v-model="tempScriptConfig.timeOut">
          </el-input>
        </el-form-item>
        <el-form-item label="执行时间" required label-width="100px" >
          <el-input v-model="tempScriptConfig.execTime">                                                  
            <el-button slot="append" v-if="!showCronBox" icon="el-icon-arrow-up" @click="showCronBox = true" title="打开图形配置"></el-button>
            <el-button slot="append" v-else icon="el-icon-arrow-down" @click="showCronBox = false" title="关闭图形配置"></el-button>
          </el-input>
        </el-form-item>
        <cron v-if="showCronBox" v-model="tempScriptConfig.execTime"  style="width:640px;color:#2c3e50;margin-left:-35px;"></cron>
      </el-form>
      <div slot="footer" class="dialog-footer" >
        <el-button @click="dialogFormVisible = false;alltypes=[]">取 消</el-button>
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
        alltype : [],
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
          shellDesc : '',//查询条件
        },
        // sysVersion1: [{
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
          update: '编辑',
          create: '新增配置'
        },
        tempScriptConfig: {
          IP        : '',
          hostName  : '',
          systemType  : '',
          sysVersion: [],
          timeOut   : '',
          execTime  : ''
        },
        
      }
    
    },
    created() {
      this.getList();
      // if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
      //   this.getAllRoles();
      // }
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getAllServerType();
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
      getAllServerType() {
        this.api({
          url: "/scriptConfig/getAllSystemType",
          method: "get"
        }).then(data => {
          this.alltype = data.list;
        })
      },
      getList() {
        //查询列表
        this.listLoading = true;
        this.api({
          
          url: "/portionConfig/listPortionConfig",
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
        this.tempScriptConfig.IP         = "";
        this.tempScriptConfig.hostName   = "";
        this.tempScriptConfig.sysVersion = [];
        this.tempScriptConfig.systemType = "";
        this.tempScriptConfig.timeOut    = "";
        this.tempScriptConfig.execTime   = "";
      
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      },
      showUpdate($index) {
        debugger
        let shell = this.list[$index];
        //获取已选择的sysVersion
        let sysVersion  = shell.sysVersion;
        //定义遍历数组
        var arrStringTypes = new Array();
        //以and分割 将类型存储数组中
        for(var oldType in sysVersion.split(",")){
            // vue是数组类型是用push赋值
						arrStringTypes.push(sysVersion.split(",")[oldType]+'');
					}
        this.tempScriptConfig.sysVersion   = [];
        this.tempScriptConfig.systemType   = shell.systemType;
        this.tempScriptConfig.IP           = shell.IP;
        this.tempScriptConfig.hostName     = shell.hostName;
        // this.tempScriptConfig.sysVersion.push(shell.sysVersion)
        this.tempScriptConfig.sysVersion   = arrStringTypes;
        this.tempScriptConfig.timeOut      = shell.timeOut;
        this.tempScriptConfig.execTime     = shell.execTime;
        this.tempScriptConfig.deleteStatus = '1';
        this.tempScriptConfig.id           = shell.id;
        this.dialogStatus                  = "update"
        this.dialogFormVisible             = true
      },
      
      createScript() {
        let _vue = this;
        //添加新配置
        this.api({
          url: "/portionConfig/addPortion",
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
        let _vue = this;
        debugger
        this.api({
          url: "/portionConfig/updatePortion",
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
            url: "/portionConfig/deletePortion",
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
