<template>
  <div class="layout-no-cols">
    <el-toolbar>
      <el-row style="width: 100%">
        <el-col :span="2" style="text-align:left">
          <el-button priv="Tests.Manage.Add" @click="add"><i class="fa fa-plus"></i> 新建</el-button>
        </el-col>
        <el-col :span="2" style="text-align:left">
          <el-button priv="Tests.Manage.Delete" @click="deleteTests"><i class="fa fa-remove"></i> 删除</el-button>
        </el-col>
        <el-col :span="10" style="text-align:right;">
          <el-input placeholder="请输入测试名称" @keyup.enter.native="searchTests" v-model="queryObj.word" style="width: 300px">
          </el-input>
          <el-button type="primary" plain @click="searchTests"><i class="fa fa-search "></i> 查询</el-button>
        </el-col>
        <el-col :span="10" style="text-align:right;">
          <el-input placeholder="请输入测试ID" @keyup.enter.native="searchTestsById" v-model="queryObj.code" style="width: 300px">
          </el-input>
          <el-button type="primary" plain @click="searchTestsById"><i class="fa fa-search "></i> 查询</el-button>
        </el-col>
        <el-col :span="12">
          <el-checkbox v-model="checked" @change="checkAll">全选</el-checkbox>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" plain @click="searchTestsPlus"><i class="fa fa-search "></i> 查询Plus</el-button>
        </el-col>
      </el-row>
    </el-toolbar>
    <div>
      <el-list-view :data="testData" data-read-url="/ui/tests" :auto-get-data="false" ref="testTable">
        <template slot-scope="row">
          <div class="panel-card">
            <el-checkbox @change="selsChange(row.ID)" :label="row.ID" v-model="sels">选中</el-checkbox>
            <el-row>
              <a class="list-card-title" href="javascript:void(0)" >{{row.name}}</a>
            </el-row>
            <el-row>
              <el-col :span="8">
                <span>测试ID：</span>
                <em>{{row.ID}}</em>
              </el-col>
              <el-col :span="8">
                <span>测试名称：</span>
                <em>{{row.name}}</em>
              </el-col>
              <el-col :span="8">
                <span>测试编码：</span>
                <em>{{row.code}}</em>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <span>添加人：</span>
                <em>{{row.addUser}}</em>
              </el-col>
              <el-col :span="8">
                <span>添加时间：</span>
                <em>{{row.addTime}}</em>
              </el-col>
              <el-col :span="8">
                <span>修改时间:</span>
                <em>{{row.modifyTime}}</em>
              </el-col>
            </el-row>
            <el-row type="flex" justify="end" class="list-card-buttons" align="right">
              <el-col :span="14" class="tar">
                <el-button @click.stop="edit(row.ID)" type="text" title="编辑">
                  <i class="fa fa-edit"></i>编辑</el-button>
                <el-button priv="Tests.Manage.Delete" @click.stop="del(row.ID)" type="text" title="删除">
                  <i class="fa fa-remove"></i>删除{{row.ID}}</el-button>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-list-view>
    </div>
    <!-- <div class='layout-main-wrap'>
      <el-list-view ref="testsTable" :data="testData" :data-read-url="getTestsURL" :page-size="20">
          <template slot-scope="row">
            <el-row :class="{'new-test': row.newFlag === 'Y'}">
              <el-col :span="6">
                <p>名称</p>
                <p>{{row.name}}</p>
              </el-col>
              <el-col :span="6">
                <p>编码</p>
                <p>{{row.code}}</p>
              </el-col>
              <el-col :span="6">
                <p>添加人</p>
                <p>{{row.addUser}}</p>
              </el-col>
            </el-row>
          </template>
        </el-list-view>
    </div> -->
    <el-dialog :title="testDialogTitle" :visible.sync="testDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <test-form v-if="testDialogVisible" ref="testForm" :test="currentTest"></test-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testDialogVisible = false">关 闭</el-button>
        <el-button type="primary" :loading="testSavingFlag" @click="save" v-text="'保存并关闭'"></el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import TestForm from './testForm.vue'
const util = zving.common.util
export default {
  components: {
    TestForm
  },
  data() {
    return {
      testTypes: [],
      testData: [],
      queryObj: {
        word: '',
        code: ''
      },
      checked: false,
      checkModel: [],
      testDialogVisible: false,
      currentTest: {},
      testDialogTitle: '新建',
      testSavingFlag: false,
      sels: []
    }
  },
  created() {
    this.init()
  },
  methods: {
    checkAll() {
      if (this.checked) {
        this.testTypes.forEach((test) => {
          this.sels.push(test.ID)
        })
      } else {
        this.sels = []
      }
    },
    async init() {
      let testTypes = await axios.get('/ui/tests')
      this.testTypes = testTypes.data.data
      this.testData = this.testTypes
    },
    async searchTests() {
      let url = '/ui/tests' + '?' + 'word=' + this.queryObj.word
      let testTypes = await axios.get(url)
      this.testTypes = testTypes.data.data
      this.testData = this.testTypes
    },
    async searchTestsById() {
      let url = 'ui/tests' + '?' + 'code=' + this.queryObj.code
      let testTypes = await axios.get(url)
      this.testTypes = testTypes.data.data
      this.testData = this.testTypes
    },
    async searchTestsPlus() {
      let url = 'ui/tests' + '?' + 'code=' + this.queryObj.code + '&' + 'word=' + this.queryObj.word
      let testTypes = await axios.get(url)
      this.testTypes = testTypes.data.data
      this.testData = this.testTypes
    },
    getTestsURL() {
      return [
        '/ui/tests',
        {
          params: this.queryObj
        }
      ]
    },
    async del(ID) {
      let res = await axios.delete('/ui/tests/' + ID)
      util.showResponseMessage(res.data)
      if (res.data.status === 1) {
        this.init()
        this.loadTests()
      }
    },
    add() {
      this.testDialogTitle = '新建'
      this.currentTest = {
        name: '',
        code: '',
        newFlag: 'Y'
      }
      this.testDialogVisible = true
    },
    async save() {
      this.testSavingFlag = true
      let res
      if (this.currentTest.ID) {
        res = await axios.put(`/ui/tests/` + this.currentTest.ID, this.currentTest)
      } else {
        res = await axios.post(`/ui/tests`, this.currentTest)
      }
      this.testSavingFlag = false
      util.showResponseMessage(res.data)
      if (res.data.status === 1) {
        this.testDialogVisible = false
        this.init()
      }
    },
    edit(ID) {
      this.testDialogTitle = '编辑'
      let index = this.testData.findIndex(test => test.ID === ID)
      this.currentTest = _.cloneDeep(this.testData[index])
      this.testDialogVisible = true
    },
    async deleteTests() {
      var IDs = this.sels.join(',')
      console.log('执行批量删除逻辑', IDs)
      let res = await axios.delete('/ui/tests/' + IDs)
      zving.common.util.showResponseMessage(res.data)
      if (res.data.status === 1) {
        this.init()
      }
    },
    selsChange(sels) {
      this.$set(this.sels, this.sels.findIndex(ID => ID === sels), sels)
    },
    ifContains(sels){
      if (this.sels.includes(sels)) {
        this.sels.splice(this.sels.findIndex(ID => ID === sels), 1)
      } else {
        this.sels.push(sels)
      }
    }
  }
}
</script>
