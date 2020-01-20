<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form>

        <el-form-item>
          <el-input v-model="listQuery.host" placeholder="请输入服务器IP地址" style='width: 300px;' type="text" 
           @input="change($event)" clearable></el-input>
          <el-select v-model="tempScriptConfig.shellDesc" placeholder="请选择命令描述" label-width="80px" multiple style='width: 30%;max-height:300px;'> 
            <el-option
              v-for="item in allShellDesc"
              :key="item.code"
              :label="item.shellDesc"
              :value="item.shellDesc"    
            >
            </el-option>
          </el-select> 
          <el-button type="primary" prefix-icon="el-icon-search" @click="getList">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-checkbox-group v-model="allAppServer">
            <el-checkbox v-for="item in allApplicaServer" 
                        :label="item.appType" 
                        :key  ="item.appId"
                        :value="item.appType" :disabled="true">
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
        <el-table-column align="center"   label="服务器信息" width="200">
          <template slot-scope="scope">
            <dt>IP地址: {{ scope.row.host }}</dt>
            <dt>逻辑名: {{ scope.row.logicalInfo }}</dt>
            <dt>类型:   {{ scope.row.systemType }}</dt>
            <dt>实例名: {{ scope.row.serviceName }}</dt> 
          </template>
        </el-table-column>
        <!-- <el-table-column align="center"   label="服务器"         prop="host" width="75"></el-table-column>
        <el-table-column align="center"   label="实例名"         prop="serviceName" width="75"></el-table-column>
        <el-table-column align="center"   label="服务器类型"      prop="systemType" width="70"></el-table-column> -->
        <el-table-column align="center"   label="命令信息"  :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-row>
              <el-col :span="1">
                &nbsp;&nbsp;命令: 
              </el-col>
              <el-col :span="2" :offset="4">
                <el-button type="text" 
                  class="fa fa-copy"
                  v-clipboard:copy=scope.row.shellName 
                  v-clipboard:success="onCopy"
                  v-clipboard:error="onError"
                  style="margin-top:-10px;height: 10px;">
                </el-button>
              </el-col>
              <el-col :span="1">
                <dt>{{ scope.row.shellName }}</dt>  
              </el-col>
            </el-row> 
            <dt>命令描述: {{ scope.row.shellDesc }}</dt> 
            <dt>适用版本: {{ scope.row.systemVersion }}</dt>
            <dt>执行频率: {{ scope.row.execTime }}</dt>
            <dt>输入参数: {{ scope.row.shareParams }}</dt>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center"   label="命令"           prop="shellName" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
        <el-table-column align="center"   label="命令描述"       prop="shellDesc"  width="170" :show-overflow-tooltip="true" @contextmenu="showMenu"></el-table-column>
        <el-table-column align="center"   label="适用版本"       prop="systemVersion" width="100"></el-table-column> -->
        <el-table-column align="center"   label="阀值" >
          <el-table-column align="center" label="日检阀值" width="180">
            <template slot-scope="scope_alarm" >
              <div>
                <div v-if="scope_alarm.row.dailyRule == 0">
                  <dt v-if="scope_alarm.row.dailySuccess != '' && scope_alarm.row.dailySuccess != null
                        &&  Object.keys(scope_alarm.row.dailySuccessPriv).length == 0">
                    通用: SUC&nbsp;=&nbsp;{{ scope_alarm.row.dailySuccess  }} 
                  </dt>
                  <dt v-else-if="Object.keys(scope_alarm.row.dailySuccessPriv).length != 0" class="fail">
                    通用: SUC&nbsp;=&nbsp;{{ scope_alarm.row.dailySuccess  }} 
                  </dt>
                  <dt v-else class="fail">
                    通用:
                  </dt>

                  <dt v-if="Object.keys(scope_alarm.row.dailySuccessPriv).length != 0">
                    私有: SUC&nbsp;=&nbsp;{{ scope_alarm.row.dailySuccessPriv  }} 
                  </dt>
                  <dt v-else class="fail">
                    私有:
                  </dt>
                </div>
                <div v-else-if="scope_alarm.row.dailyRule == 1">
                  <dt v-if="scope_alarm.row.dailyWarning != null && scope_alarm.row.dailyCritical != null
                      && scope_alarm.row.dailyWarning != ''  && scope_alarm.row.dailyCritical != ''
                      && scope_alarm.row.dailyWarningPriv == '' && scope_alarm.row.dailyCriticalPriv == ''">
                    通用:{{ scope_alarm.row.dailyWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope_alarm.row.dailyCritical }} &lt;=&nbsp;C
                  </dt>
                  <dt v-else class="fail">
                    通用:{{ scope_alarm.row.dailyWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope_alarm.row.dailyCritical }} &lt;=&nbsp;C
                  </dt>
                  <dt v-if="scope_alarm.row.dailyCriticalPriv != null && scope_alarm.row.dailyCriticalPriv != null
                      && scope_alarm.row.dailyWarningPriv != ''  && scope_alarm.row.dailyWarningPriv != ''">
                    私有:{{ scope_alarm.row.dailyWarningPriv  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope_alarm.row.dailyCriticalPriv }} &lt;=&nbsp;C
                  </dt>
                  <dt v-else class="fail">
                    私有:
                  </dt>
                </div>
              </div>  
            </template>
          </el-table-column>

          <el-table-column align="center" label="监控阀值" width="180">
            <template slot-scope="scope_alarm" >
              <div>
                <div v-if="scope_alarm.row.dailyRule == 0">
                  <dt v-if="scope_alarm.row.monitorSuccess != '' && scope_alarm.row.monitorSuccess != null
                        &&  Object.keys(scope_alarm.row.monitorSuccessPriv).length == 0">
                    通用: SUC&nbsp;=&nbsp;{{ scope_alarm.row.monitorSuccess  }} 
                  </dt>
                  <dt v-else-if="Object.keys(scope_alarm.row.monitorSuccessPriv).length != 0" class="fail">
                    通用: SUC&nbsp;=&nbsp;{{ scope_alarm.row.monitorSuccess  }} 
                  </dt>
                  <dt v-else class="fail">
                    通用:
                  </dt>

                  <dt v-if="Object.keys(scope_alarm.row.monitorSuccessPriv).length != 0">
                    私有: SUC&nbsp;=&nbsp;{{ scope_alarm.row.monitorSuccessPriv  }} 
                  </dt>
                  <dt v-else class="fail">
                    私有:
                  </dt>
                </div>
                <div v-else-if="scope_alarm.row.dailyRule == 1">
                  <dt v-if="scope_alarm.row.monitorWarning != null && scope_alarm.row.monitorCritical != null
                      && scope_alarm.row.monitorWarning != ''  && scope_alarm.row.monitorCritical != ''
                      && scope_alarm.row.monitorWarningPriv == '' && scope_alarm.row.monitorCriticalPriv == ''">
                    通用:{{ scope_alarm.row.monitorWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope_alarm.row.monitorCritical }} &lt;=&nbsp;C
                  </dt>
                  <dt v-else class="fail">
                    通用:{{ scope_alarm.row.monitorWarning  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope_alarm.row.monitorCritical }} &lt;=&nbsp;C
                  </dt>
                  <dt v-if="scope_alarm.row.dailyCriticalPriv != null && scope_alarm.row.monitorCriticalPriv != null
                      && scope_alarm.row.monitorWarningPriv != ''  && scope_alarm.row.monitorWarningPriv != ''">
                    私有:{{ scope_alarm.row.monitorWarningPriv  }}&nbsp;&lt;=&nbsp;W&nbsp;&lt;&nbsp;{{ scope_alarm.row.monitorCriticalPriv }} &lt;=&nbsp;C
                  </dt>
                  <dt v-else class="fail">
                    私有:
                  </dt>
                </div>
              </div>  
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="超时时间"  width="90">
          <template slot-scope="scope_alarm" >
            <dt v-if="scope_alarm.row.timeOut != '' && scope_alarm.row.timeOutPriv == ''">
              通用:{{ scope_alarm.row.timeOut  }}s
            </dt>
            <dt v-else class="fail">
              通用:{{ scope_alarm.row.timeOut  }}s
            </dt>
            <dt v-if="scope_alarm.row.timeOutPriv != ''">
              私有:{{ scope_alarm.row.timeOutPriv  }}s
            </dt>
            <dt v-else class="fail">
              私有:
            </dt>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center" label="是否执行"     prop="crontab" width="60" :formatter = "stateFormat"> -->
        <el-table-column align="center"   label="是否执行" width="80">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.crontab"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="0"
              inactive-value="1"
              @change="updateDateRange(scope.$index)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center"   label="分时间段处理" width="100">
          <template slot-scope="scope">
            <el-row>
              <el-col >
                <el-switch
                  v-model="scope.row.dateRange"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  active-value="1"
                  inactive-value="0"
                  @change="updateDateRange(scope.$index)"
                ></el-switch>
                <el-button type="text" prefix-icon="el-icon-search" @click="goToDateRange(scope.$index)">&nbsp;&nbsp;GO</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column> 
        <!-- <el-table-column align="center" label="执行频率"     prop="execTime"></el-table-column> -->
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
               style='width: 400px; margin-left:50px;' label="right">
               <!--label-width="100px" 设置长度 -->
        <el-form-item label="服务器"  required  label-width="150px" >
          <el-input type="text" v-model="tempScriptConfig.host"           :disabled="true" style="width:235px">
          </el-input>
        </el-form-item>
        <el-form-item label="逻辑名"  required  label-width="150px" >
          <el-input type="text" v-model="tempScriptConfig.logicalInfo"    :disabled="true" style="width:235px">
          </el-input>
        </el-form-item>
        <el-form-item label="监控服务器" required label-width="150px">
          <el-select v-model="tempScriptConfig.applicationServer"         :disabled="true" placeholder="请选择" label-width="80px" style="width:235px"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allApplicaServer"
              :key="item.appId"
              :label="item.appType"
              :value="item.appType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="端口"  required  label-width="150px" >
          <el-input type="text" v-model="tempScriptConfig.post"   style="width:235px"        :disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="OS用户"  required  label-width="150px" >
          <el-input type="text" v-model="tempScriptConfig.userName" style="width:235px"      :disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="DB用户"  required  label-width="150px">
          <el-input type="text" v-model="tempScriptConfig.dbUsername" style="width:235px"    :disabled="true">
          </el-input>
        </el-form-item>
        <el-form-item label="服务器类型" required label-width="150px">
          <el-select v-model="tempScriptConfig.systemType"  placeholder="请选择" :disabled="true" label-width="80px" style="width:235px"> <!-- 对应列名 clearable 清空当前checkbox-->
            <el-option
              v-for="item in allServer"
              :key="item.serverId"
              :label="item.serverType"
              :value="item.serverType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适用版本" required label-width="150px">
          <el-select v-model="tempScriptConfig.systemVersion" :disabled="true"  placeholder="请选择" label-width="80px" style="width:235px"> 
            <el-option
              v-for="item in alltype"
              :key="item.versionId"
              :label="item.versionType"
              :value="item.versionType">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="命令"  label-width="150px">
          <el-input type="text" v-if="dialogStatus=='update'"  style="width:235px" :disabled="true" v-model="tempScriptConfig.shellName" ></el-input>
          <el-input type="text" v-else  :disabled="true" v-model="tempScriptConfig.shellName" style="width:235px"></el-input>
        </el-form-item>
        <el-form-item label="命令描述"  label-width="150px">
          <el-input type="text" v-if="dialogStatus=='update'" style="width:235px"  :disabled="true" v-model="tempScriptConfig.shellDesc" ></el-input>
          <el-input type="text" v-else :disabled="true" v-model="tempScriptConfig.shellDesc" style="width:235px"></el-input>
        </el-form-item>
        <el-form-item label="输入参数" label-width="150px">
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
        <el-form-item label="通用日检阀值"  label-width="150px">
          <el-row v-if="this.tempScriptConfig.dailyRule == '0'">
            <el-col :span="7" class="fail">SUCC</el-col>
            <el-col :span="7" class="fail">=</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.dailySuccess"
                   :disabled="true" style="width:87px"/></el-col>
          </el-row>
          <el-row v-else-if="this.tempScriptConfig.dailyRule == '1'">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyWarning"
                   :disabled="true"/></el-col>
            <el-col :span="6" class="fail">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyCritical"
                   :disabled="true"/></el-col>
            <el-col :span="6"  class="fail">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else>
            <el-input type="text" :disabled="true"
                class="fail" style="width:235px"></el-input>
          </el-row>
        </el-form-item>
        <el-form-item label="私有日检阀值"  label-width="150px">
          <el-row v-if="this.tempScriptConfig.dailyRule == '0'">
            <el-col :span="7">SUCC</el-col>
            <el-col :span="7">=</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.dailySuccessPriv"
                  style="width:87px"/></el-col>
          </el-row>
          <el-row v-else-if="this.tempScriptConfig.dailyRule == '1'">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyWarningPriv"
                  @keyup.native="number($event)" /></el-col>
            <el-col :span="6" >&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.dailyCriticalPriv"
                  @keyup.native="number($event)" /></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else>
            <el-input type="text" :disabled="true"
                class="fail" style="width:235px"></el-input>
          </el-row>
        </el-form-item>

        <el-form-item label="通用监控阀值"  label-width="150px">
          <el-row v-if="this.tempScriptConfig.dailyRule == '0'">
            <el-col :span="7" class="fail">SUCC</el-col>
            <el-col :span="7" class="fail">=</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.monitorSuccess"
                   :disabled="true" style="width:87px"/></el-col>
          </el-row>
          <el-row v-else-if="this.tempScriptConfig.dailyRule == '1'">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorWarning"
                   :disabled="true"/></el-col>
            <el-col :span="6" class="fail">&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorCritical"
                   :disabled="true"/></el-col>
            <el-col :span="6"  class="fail">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else>
            <el-input type="text" :disabled="true"
                class="fail" style="width:235px"></el-input>
          </el-row>
        </el-form-item>
        <el-form-item label="私有监控阀值"  label-width="150px">
          <el-row v-if="this.tempScriptConfig.dailyRule == '0'">
            <el-col :span="7">SUCC</el-col>
            <el-col :span="7">=</el-col>
            <el-col :span="8"><el-input type="text" v-model="tempScriptConfig.monitorSuccessPriv"
                  style="width:87px"/></el-col>
          </el-row>
          <el-row v-else-if="this.tempScriptConfig.dailyRule == '1'">
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorWarningPriv"
                  @keyup.native="number($event)" /></el-col>
            <el-col :span="6" >&nbsp;&nbsp;&lt;=&nbsp;W&nbsp;&lt;</el-col>
            <el-col :span="6"><el-input type="text" v-model="tempScriptConfig.monitorCriticalPriv"
                  @keyup.native="number($event)" /></el-col>
            <el-col :span="6">&nbsp;&nbsp;&lt;=&nbsp;&nbsp;C</el-col>
          </el-row>
          <el-row v-else>
            <el-input type="text" :disabled="true"
                class="fail" style="width:235px"></el-input>
          </el-row>
        </el-form-item>
        <el-form-item label="通用超时时间"  label-width="150px" >
          <el-input type="text" v-model="tempScriptConfig.timeOut" :disabled="true"
                class="fail" style="width:235px"></el-input>
        </el-form-item> 
        <el-form-item label="私有超时时间"  label-width="150px" >
          <el-input type="text" v-model="tempScriptConfig.timeOutPriv" 
                @keyup.native="number($event)" style="width:235px"></el-input>
        </el-form-item>
        <el-form-item label="执行频率" label-width="150px" >
          <el-input v-model="tempScriptConfig.execTime" v-if="dialogStatus=='create'" style="width:235px">                                                  
            <el-button slot="append" v-if="!showCronBox" icon="el-icon-arrow-up" @click="showCronBox = true" title="打开图形配置"></el-button>
            <el-button slot="append" v-else icon="el-icon-arrow-down" @click="showCronBox = false" title="关闭图形配置"></el-button>
          </el-input>
          <el-input v-model="tempScriptConfig.execTime" v-else style="width:235px">                                                  
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
        totalCount : 0, //分页组件--数据总条数
        listLoading: false,//数据加载等待动画
        //定义变量
        list: [],//表格的数据
        allAppServer: [],
        allServer   : [],
        alltype     : [],
        allShellDesc     : [],
        allApplicaServer : [],
        e       : "",
        listQuery: {
          pageNum   : 1,//页码
          pageRow   : 50,//每页条数
          shellDesc : "",//查询条件
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
          id                     : "",
          host                   : "",
          allInfo                : "",
          serviceName            : "",
          post                   : "",
          applicationServer      : "",
          creationDate           : "",
          createdBy              : "",
          updatedBy              : "",
          systemType             : "",
          systemVersion          : [],
          isDelete               : "",
          userName               : "",
          dbUsername             : "",
          type                   : "",
          timeOut                : "",
          timeOutPriv            : "",
          execTime               : "",
          dailyWarningPriv       : "",
          dailyCriticalPriv      : "",
          monitorWarningPriv     : "",
          monitorCriticalPriv    : "",
          shellName              : "",
          dailyRule              : "",
          shellDesc              : "",
          crontab                : "",
          dailyCritical          : "",
          dailySuccess           : "",
          monitorSuccess         : "",
          monitorSuccessPriv     : "",
          dailyWarning           : "",
          monitorCritical        : "",
          monitorWarning         : "",
          logicalInfo            : "",
          shareParams            : [],
          attributeLen           : ""
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
        this.getAllAppServer();
        this.getAllServer();
        this.getAllShellDesc();
      }
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
      getAllShellDesc() {
        this.api({
          url: "/logConfig/getAllShellDesc",
          method: "get"
        }).then(data => {
          this.allShellDesc = data.list;
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
      // getAllVersionType() {
      //   this.api({
      //     url: "/commonsConfig/getAllVersionType",
      //     method: "get"
      //   }).then(data => {
      //     this.alltype = data.list;
      //   })
      // },
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
        if(this.$route.params.host != undefined && this.$route.params.serviceName != undefined 
              && this.$route.params.systemType != undefined) {
          this.listQuery.host        =  this.$route.params.host
          this.listQuery.serviceName =  this.$route.params.serviceName
          this.listQuery.systemType  =  this.$route.params.systemType
        }if(this.$route.params.host != undefined && this.$route.params.serviceName != undefined 
           && this.$route.params.code != undefined ) {
          this.listQuery.host        =  this.$route.params.host
          this.listQuery.serviceName =  this.$route.params.serviceName
          this.listQuery.code        = this.$route.params.code
        }else{
          this.listQuery = this.listQuery
        } 

        var allValue = '';
        for(var oldType in this.tempScriptConfig.shellDesc){
            // vue是数组类型是用push赋值
            //alert(oldType + (this.tempScriptConfig.shellDesc).length -1)
            allValue  =  allValue+this.tempScriptConfig.shellDesc[oldType]+ ',';           
        }
        this.listQuery.strShellDesc = allValue
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
        this.tempScriptConfig.systemType             = "";
        this.tempScriptConfig.timeOut                = "";
        this.tempScriptConfig.timeOutPriv            = "";
        this.tempScriptConfig.execTime               = "";
        this.tempScriptConfig.monitorSuccess         = "";
        this.tempScriptConfig.monitorSuccessPriv     = "";
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
        this.tempScriptConfig.logicalInfo            = "";
        this.dialogStatus = "create"
        this.dialogFormVisible = true
      
   
      },
      showUpdate($index) {
        debugger
        let shell = this.list[$index];
        this.tempScriptConfig.id                     = shell.id;
        this.tempScriptConfig.host                   = shell.host;
        this.tempScriptConfig.logicalInfo            = shell.logicalInfo;
        this.tempScriptConfig.serviceName            = shell.serviceName;
        this.tempScriptConfig.post                   = shell.post;
        this.tempScriptConfig.applicationServer      = shell.applicationServer;
        this.tempScriptConfig.crontab                = shell.crontab;
        this.tempScriptConfig.creationDate           = shell.creationDate;
        this.tempScriptConfig.systemType             = shell.systemType;
        this.tempScriptConfig.systemVersion          = shell.systemVersion;
        this.tempScriptConfig.userName               = shell.userName;
        this.tempScriptConfig.dbUsername             = shell.dbUsername;
        this.tempScriptConfig.timeOut                = shell.timeOut;
        this.tempScriptConfig.timeOutPriv            = shell.timeOutPriv;
        this.tempScriptConfig.type                   = shell.type;
        this.tempScriptConfig.dailyRule              = shell.dailyRule;
        this.tempScriptConfig.execTime               = shell.execTime;
        this.tempScriptConfig.monitorSuccess         = shell.monitorSuccess;
        this.tempScriptConfig.monitorSuccessPriv     = shell.monitorSuccessPriv;
        this.tempScriptConfig.dailySuccessPriv       = shell.dailySuccessPriv;
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
        if(shell.shareParams == undefined){
          this.tempScriptConfig.shareParams   =  [];
        }else{
          this.tempScriptConfig.shareParams   =  JSON.parse(shell.shareParams);
        }
        this.tempScriptConfig.attributeLen    =  shell.attributeLen;
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
              this.tempScriptConfig.shellDesc = '';
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
      change(e){
        debugger
        this.$forceUpdate()
      },
    }
  }
</script>
<style>
 dt {text-align:left;  margin-left:5px;}
 .top{
   margin-top: 10px;
 }
 .fail{
    color: #888888;font-weight: 500; text-decoration: line-through;
  }
</style>