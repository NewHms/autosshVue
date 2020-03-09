<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>
 
        <el-form-item>
          <el-input v-model="listQuery.module" placeholder="请输入model" style='width: 300px;' type="text" clearable></el-input>
          <el-input v-model="listQuery.valuesDesc" placeholder="请输入资源描述" style='width: 300px;' type="text" clearable></el-input>
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
      <el-table-column align="center" label="模块名" prop="module"></el-table-column>
      <el-table-column align="center" label="资源编号"   prop="code"></el-table-column>
      <el-table-column align="center" label="值"     prop="values"></el-table-column>
      <el-table-column align="center" label="说明"    prop="valuesDesc"></el-table-column>
      <el-table-column align="center" label="备注"    prop="remark"></el-table-column>
      <el-table-column align="center" width="70" label="管理" v-if="hasPerm('scriptConfig:update')">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-edit" @click="showUpdate(scope.$index)"></el-button>
          <el-button type="text" icon="el-icon-delete" 
                     @click="removeUser(scope.$index)" :loading=this.listLoading>
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
        
        <el-form-item label="模块名" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.module"> 
          </el-input>
        </el-form-item>
        <el-form-item label="资源编号" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.code"  placeholder="请输入10的倍数"> 
          </el-input>
        </el-form-item>
        <el-form-item label="值" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.values"> 
          </el-input>
        </el-form-item>
        <el-form-item label="资源类型" label-width="150px">
          <el-select v-model="tempScriptConfig.Title"  placeholder="请选择" style="width:250px"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for ="item in allResType"
              :key  ="item.resTypeId"
              :label="item.resTypeType"
              :value="item.resTypeType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明" required label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.valuesDesc"> 
          </el-input>
        </el-form-item>
        <el-form-item label="备注" required label-width="150px">
          <el-input type="textarea" v-model="tempScriptConfig.remark" :autosize="{ minRows: 2, maxRows: 4}" style="width:250px"> 
          </el-input>
        </el-form-item>   
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="success" @click="createScript" :loading=this.listLoading>创 建</el-button>
        <el-button type="primary" v-else @click="updateScript" :loading=this.listLoading>修 改</el-button>
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
        list: [],//表格的数据
        allResType : [],
        listLoading: false,//数据加载等待动画
        listQuery: {
          pageNum: 1,//页码
          pageRow: 50,//每页条数
        },
        dialogStatus: 'create',
        dialogFormVisible: false,
        textMap: {
          update: '编辑资源',
          create: '新建资源'
        },
        tempScriptConfig: {
          module        : '',  
          code          : '',
          values        : '',  
          valuesDesc    : '',
          maxCode       : '',
          Title         : '',
          remark        : '',
        },
        
      }
    
    },
    created() {
      this.getList();
      if (this.hasPerm('scriptConfig:add') || this.hasPerm('scriptConfig:update')) {
        this.getResType();
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    methods: {
      getList() {
        //查询列表
        this.listLoading = true;
        this.api({
          
          url: "/resourcesConfig/listResourcesConfig",
          method: "get",
          params: this.listQuery
        }).then(data => {
          this.listLoading = false;
          this.list = data.list;
          this.totalCount = data.totalCount;
        })
      },
      getResType() {
        debugger
        this.api({
          url: "/commonsConfig/getResType",
          method: "get"
        }).then(data => {
          this.allResType = data.list;
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
        if (shell === undefined) {
          this.tempScriptConfig.maxCode = '0';    
        }else{
          this.tempScriptConfig.maxCode         = shell.maxCode;
        };
        this.tempScriptConfig.module       =  "";  
        this.tempScriptConfig.code         =  "";
        this.tempScriptConfig.values       =  "";  
        this.tempScriptConfig.valuesDesc   =  "";
        this.tempScriptConfig.Title        =  "";
        this.tempScriptConfig.remark       =  "";
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      },
      showUpdate($index) {
        let shell                          = this.list[$index];
        this.tempScriptConfig.module       =  shell.module;  
        this.tempScriptConfig.code         =  shell.code;
        this.tempScriptConfig.values       =  shell.values; 
        this.tempScriptConfig.valuesDesc   =  shell.valuesDesc; 
        this.tempScriptConfig.Title        =  shell.Title;
        this.tempScriptConfig.remark       =  shell.remark; 
        this.tempScriptConfig.id           =  shell.id;
        this.dialogStatus                  =  "update"
        this.dialogFormVisible             =  true
      },
      createScript() {
        let _vue = this;
        this.listLoading = true;
        //添加新用户
        this.api({
          url: "/resourcesConfig/addResources",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          this.listLoading = false;
          _vue.$message.success("新增成功")
          this.getList();
          this.dialogFormVisible = false
        })
      },
      updateScript() {
        debugger
        //修改用户信息
        let _vue = this;
        this.listLoading = true;
        this.api({
          url: "/resourcesConfig/updateResources",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          this.listLoading = false;
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
        this.listLoading = true;
        this.$confirm('确定删除此配置?', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'warning'
        }).then(() => {
          let script = _vue.list[$index];
          //user.deleteStatus = '2';
          this.tempScriptConfig.id = script.id;
          _vue.api({
            url: "/resourcesConfig/deleteResources",
            method: "post",
            data: this.tempScriptConfig
          }).then(() => {
            this.listLoading = false;
            _vue.$message.success("删除成功")
            _vue.getList()
          }).catch(() => {
            this.listLoading = false;
            _vue.$message.error("删除失败")
          })
        })
      },

    }
  }
</script>

