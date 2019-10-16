<template>
  <div class="layout-no-cols right-list-toolbar">

    <el-toolbar>
      <el-button @click="addClick" priv="CommentFaceManage.Add"><i class="fa fa-plus"></i>新建</el-button>
      <el-button @click="faceViewModal = true"><i class="fa fa-search"></i>预览</el-button>
      <el-button @click="newBtnClick"><i class="fa fa-plus"></i>二次开发加的</el-button>
    </el-toolbar>

    <div>
      <el-table :data="faces" data-read-url="/ui/faces" :page-size="10" ref="datatable" tooltip-effect="dark" style="width: 100%">
        <!-- <el-table-column type="selection" width="60" align="center"></el-table-column> -->
        <el-table-column label="表情名称">
          <template slot-scope="scope">
            <el-button type="text" class="table-title-button" :title="scope.row.faceName" priv="CommentFaceManage.Edit" @click.stop="editClick(scope.row.ID)">{{scope.row.faceName}}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="表情图片" width="180" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.facePath" onerror="this.src='assets/images/picture404-'+((row.ID||row.$index) % 4)+'.png';" width="24" height="24" />
          </template>
        </el-table-column>
        <el-table-column label="是否启用" width="100" align="center">
          <template slot-scope="scope">
            <i class="fa fa-check icon-success" v-if="scope.row.status=='Y'"></i>
            <i class="fa fa-times icon-danger" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right">
          <template slot-scope="scope">
            <el-button @click.stop="editClick(scope.row.ID)" type="text" priv="CommentFaceManage.Edit" title="编辑">
              <i class="fa fa-edit f16"></i></el-button>
            <el-button @click.stop="deleteClickHandler([scope.row])" type="text" priv="CommentFaceManage.Delete" title="删除">
              <i class="fa fa-times f16"></i></el-button>
          </template>
        </el-table-column>
      </el-table>
   </div>
   <face-view-dialog :show.sync="faceViewModal" :faces="faces"></face-view-dialog>
  </div>
</template>
<script>
import faceViewDialog from './faceViewDialog.vue'
import util from '@src/common/util.js'

export default {
  components: {
    faceViewDialog
  },
  data() {
    return {
      faceViewModal: false,
      faces: [] // 表情data
    }
  },
  methods: {
    // 点击添加
    addClick() {
      this.$router.push(`${this.$route.path}/new`)
    },
    // 点击编辑
    async editClick(ID) {
      this.$router.push(`${this.$route.path}/${ID}`)
    },
    // 点击删除
    async deleteClickHandler(rows) {
      if (rows.length === 0) {
        this.$alert('请先选择一条记录！', '提示', {
          type: 'info'
        })
        return
      }
      try {
        await this.$confirm('确定删除吗？删除后无法恢复。是否继续删除？', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch (e) {
        return
      }
      let ids = util.getSelectedIDs(rows)
      try {
        let res = await axios.delete(`/ui/faces/${ids.join()}`)
        util.showMessage(res)
        if (res.data.status === 1) {
          this.loadFacesList()
        }
      } catch (e) {
        util.showErrorNotification(e)
      }
    },
    // 加载列表数据
    loadFacesList() {
      this.$refs.datatable.getData()
    },
    newBtnClick(){
      util.showInfoMessage('二次开发加的按钮点击后触发的事件')
    }
  }
}
</script>
