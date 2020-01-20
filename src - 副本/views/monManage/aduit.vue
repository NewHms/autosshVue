<template>
  <div >
    <el-card> 
      <el-row>            
        <el-col span="10">
          <el-alert show-icon>SQL语句优化</el-alert>
          <br>
          <div>
            <el-form class="step-form" label-width="100px">
              <el-form-item label="数据库">
                <el-select v-model="tempScriptConfig.IP" style="width: 100%" @change="selectFn($event)" clearable> 
                  <el-option
                    v-for="item in allServiceHost"
                    :key="item.id"
                    :label="item.host"
                    :value="item.host">
                  </el-option>
                </el-select>
              </el-form-item> 
              <el-form-item label="实例名">
                <el-select v-model="tempScriptConfig.serName" style="width: 100%" clearable> 
                  <el-option
                    v-for="item in allServiceName"
                    :key="item.id"
                    :label="item.serviceName"
                    :value="item.serviceName">
                  </el-option>
                </el-select>
              </el-form-item> 
              <el-form-item label="优化类型">
                <el-radio-group v-model="tempScriptConfig.optimizeRule">
                  <el-radio label="MySQL"></el-radio>
                  <el-radio label="ORACLE"></el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="SQL语句" prop="sql">
                <VueEditor style="width: 100%" v-model="tempScriptConfig.sql" :editorToolbar="customToolbar"></VueEditor>
              </el-form-item>
              
              <el-form-item label="操作">
                <div>
                  <el-row>
                    <el-col span="6">
                      <center>
                        <el-button type="primary" prefix-icon="el-icon-search" @click="SOARAllowOnline">SQL评分</el-button>
                      </center>
                    </el-col>
                    <el-col span="6">
                      <center>
                        <el-button type="primary" prefix-icon="el-icon-search" @click="SOARBnlySyntax">语法检查</el-button>
                      </center>
                    </el-col>
                    <!-- <el-col span="5">
                      <center>
                        <el-button type="primary" @click="SOARFingerPrint">SQL指纹</el-button>
                      </center>
                    </el-col> -->
                    <el-col span="6">
                      <center>
                        <el-button type="primary" prefix-icon="el-icon-search" @click="SOARPretty">SQL美化</el-button>
                      </center>
                    </el-col>
                  </el-row>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-col>

        <el-col span="12" >
            <el-alert show-icon style='margin-left:6%'>
              <icon type="ios-lightbulb-outline" slot="icon"></Icon>
                查询结果 {{queryType}}
            </el-alert>
            <div class="mavonRightSide">
              <mavon-editor ref="md"  v-model="optimizeInfo" :codeStyle="markdown.codeStyle" :toolbars="markdown.toolbars" 
                :subfield="false" defaultOpen="preview" :scrollStyle="true" :ishljs = "true" >
              </mavon-editor>  
            </div>
        </el-col>
      </el-row>
    </el-card>
<!-- 
    <copyright> </copyright> -->
  </div>
</template>

<script>
   import { VueMarkdown } from 'vue-markdown'
   import { VueEditor   } from 'vue2-editor'
   import { mavonEditor } from 'mavon-editor'
   import { mapGetters  } from 'vuex'
   import 'mavon-editor/dist/css/index.css'
   export default {
    components: {VueEditor, VueMarkdown, mavonEditor},
    data () {
      return {
        queryType      : '',
        allServiceHost : '',
        allServiceName : '',
        query_result   : '',
        optimizeInfo   : '',
        listLoading    : false,//数据加载等待动画
        customToolbar:[
                    ['bold', 'italic', 'underline'],
                    [{'align':''},{'align':'center'},{'align':'right'}],
                    [{'background':[]},{'color':[]}],
                    ['clean'],
        ],//更多工具栏选项在下面

        listQuery: {
          pageNum   : 1,//页码
          pageRow   : 50//每页条数
         
        },
        tempScriptConfig: {
          IP            : '',
          serName       : '',
          optimizeType  : '',
          optimizeRule  : '',
          sql           : '',
        
        },
        markdown:{
        scrollStyle : 'flase',
        codeStyle:'atom-one-dark',
        toolbars:{
            // bold: true, // 粗体
            // italic: true, // 斜体
            // header: true, // 标题
            // underline: true, // 下划线
            // strikethrough: true, // 中划线
            // mark: true, // 标记
            // superscript: true, // 上角标
            // subscript: true, // 下角标
            // quote: true, // 引用
            // ol: true, // 有序列表
            // ul: true, // 无序列表
            // link: true, // 链接
            // imagelink: true, // 图片链接
            // code: true, // code
            // table: true, // 表格
            // fullscreen: true, // 全屏编辑
            // readmodel: true, // 沉浸式阅读
            // htmlcode: true, // 展示html源码
            // help: true, // 帮助
            // /* 1.3.5 */
            // undo: true, // 上一步
            // redo: true, // 下一步
            // trash: true, // 清空
            // save: true, // 保存（触发events中的save事件）
            // /* 1.4.2 */
            // navigation: true, // 导航目录
            // /* 2.1.8 */
            // alignleft: true, // 左对齐
            // aligncenter: true, // 居中
            // alignright: true, // 右对齐
            // /* 2.2.1 */
            // subfield: true, // 单双栏模式
            // preview: false, // 预览
            }
        },
      }
    },

    created () {
      this.getList();  
    },

    computed: {
      ...mapGetters([
        'userId'
      ])
    },

    methods: {

      getList() {
        debugger
        //this.listQuery.IP =  this.tempScriptConfig.IP
        //查询列表
        this.listLoading = true;
        this.api({ 
          url: "/optimizeConfig/listOptimizeServer",
          method: "get"
        }).then(data => {
          this.allServiceHost = data.list;
        })
      },
      
      getListResult() {
        debugger
        //查询列表
        this.listLoading = true;
        this.api({ 
          url: "/optimizeConfig/listOptimizeResult",
          method: "get",
          params: this.tempScriptConfig
        }).then(data => {
          this.query_result = data.list;
          this.optimizeInfo = this.query_result[0].optimizeText
        })
        //alert(this.query_result)
      },

      selectFn(e){
        debugger
        //查询列表
        this.listLoading    = true;
        this.listQuery.IP   = e;
        this.tempScriptConfig.serName = '',
        this.api({ 
          url: "/optimizeConfig/listOptimizeServerName",
          method: "get",
          params: this.listQuery
        }).then(data => {
          this.allServiceName = data.list;
        })

      },

      SOARAllowOnline() {
        debugger
        this.listLoading = true;
        let _vue = this;
        //添加新配置'
        this.queryType = ' / SQL 分析'
        this.tempScriptConfig.optimizeType = "allow_online"
        this.api({
          url: "/optimizeConfig/doOptimize",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          this.listLoading = false;
          this.getListResult();
        })
        
      },

      SOARBnlySyntax() {
        debugger
        this.listLoading = true;
        let _vue = this;
        //添加新配置'
        this.queryType = ' / SQL 语法检查'
        this.tempScriptConfig.optimizeType = "only_syntax"
        this.api({
          url: "/optimizeConfig/doOptimize",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          this.getListResult();
          this.listLoading = false;
        })
      },

      SOARPretty() {
        debugger
        this.listLoading = true;
        let _vue = this;
        //添加新配置'
        this.queryType = ' / SQL 美化'
        this.tempScriptConfig.optimizeType = "pretty"
        this.api({
          url: "/optimizeConfig/doOptimize",
          method: "post",
          data: this.tempScriptConfig
        }).then(() => {
          this.getListResult();
          this.listLoading = false;
        })
      },
         

      SOARFingerPrint () {
        this.query_type = ' / SOAR SQL指纹'
        let soar_type = 'fingerprint'
        
      },

    },

  }
</script>

<style scoped>
.mavonRightSide {
  width: 100%;
  height: 480px;
  margin-left:40px;
  overflow:auto;
}
</style>