<template>
  <div class="layout-no-cols">
    <!-- 链接分组导航栏 -->
    <el-toolbar>
      <el-button>
        <i class="fa fa-plus"></i>新建</el-button>
    </el-toolbar>
    <div v-loading="loading">
      <el-list-view :data="dbCollectionTaskData" data-read-url="/api/fromdb" :auto-get-data="false" ref="dataTable">
        <template slot-scope="row">
          <div class="panel-card">
            <el-row>
              <a class="list-card-title" href="javascript:void(0)" @click.stop="gotoDetailPage(row.ID)">{{row.name}}</a>
            </el-row>
            <el-row>
              <el-col :span="8">
                <span>任务ID：</span>
                <em>{{row.ID}}</em>
              </el-col>
              <el-col :span="8">
                <span>任务名称：</span>
                <em>{{row.name}}</em>
              </el-col>
              <el-col :span="8">
                <span>采集到此栏目：</span>
                <em>{{row.catalogName}}</em>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <span>数据库名称：</span>
                <em>{{row.databaseName}}</em>
              </el-col>
              <el-col :span="8">
                <span>数据表名称：</span>
                <em>{{row.tableName}}</em>
              </el-col>
              <el-col :span="8">
                <span>采集后内容类型状态：</span>
                <em>{{row.articleStatusName}}</em>
              </el-col>
            </el-row>
            <el-row class="list-card-buttons">
              <el-col :span="10">
                <el-tag v-if="row.status === 'Y'" size="small">启用</el-tag>
                <el-tag v-else type="danger" size='medium'>停用</el-tag>
              </el-col>
              <el-col :span="14" class="tar">
                <el-button @click.stop="similarAdd(row.ID)" type="text" title="类似创建">
                  <i class="fa fa-plus"></i>类似创建</el-button>
                <el-button @click.stop="gotoDetailPage(row.ID)" type="text" title="编辑">
                  <i class="fa fa-edit"></i>编辑</el-button>
                <el-button @click.stop="del(row.ID)" type="text" title="删除">
                  <i class="fa fa-remove"></i>删除</el-button>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-list-view>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      loading: false, // 数据加载动画
      dbCollectionTaskData: [{
        'ID': 28,
        'name': 'asdf',
        'databaseID': 9,
        'tableName': 'zccontent',
        'catalogID': 9190,
        'articleStatus': 0,
        'status': 'Y',
        'catalogName': '国内新闻',
        'articleStatusName': '初稿',
        'databaseName': '测试'
      }] // 数据库采集任务数据
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>
<style scoped>

</style>
