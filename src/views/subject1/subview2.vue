<template>
  <div class="layout-no-cols">
    <h4>假数据（mock）示例</h4>
    <el-toolbar>
      <el-button icon="plus" @click="addFormVisible = true">添加</el-button>

      <el-button icon="edit" :disabled="selectedRows.length !== 1">编辑</el-button>
      <el-button
        icon="circle-close"
        :disabled="!(selectedRows.length === 1 && selectedRows[0].status)"
      >停用</el-button>
      <el-button
        icon="circle-check"
        :disabled="!(selectedRows.length === 1 && !selectedRows[0].status)"
      >启用</el-button>
      <el-button icon="delete" :disabled="selectedRows.length === 0">删除</el-button>
    </el-toolbar>
    <el-dialog title="添加用户" :visible.sync ="addFormVisible">
      <el-form :model="form">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input v-model="form.userName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" :label-width="formLabelWidth">
          <el-input v-model="form.realName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户状态" :label-width="formLabelWidth">
          <el-select v-model="value" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属机构" :label-width="formLabelWidth">
          <el-input v-model="form.affiliate" auto-complete="off"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
      <el-button @click="addFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="addFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-table
      :data="users"
      ref="userDataTable"
      @selection-change="onSelectionChange"
      stripe
      tooltip-effect="dark"
      style="width: 100%"
    >
      <el-table-column type="selection" width="30" align="center"></el-table-column>
      <el-table-column prop="userName" label="用户名" min-width="15%"></el-table-column>
      <el-table-column prop="realName" label="真实姓名" min-width="15%"></el-table-column>
      <el-table-column label="用户状态" min-width="10%">
        <template slot-scope="scope">
          <i class="fa fa-check icon-success" v-if="scope.row.status"></i>
          <i class="fa fa-times icon-danger" v-else></i>
        </template>
      </el-table-column>
      <el-table-column label="所属机构" min-width="15%">
        <template slot-scope="scope">
          <span>{{scope.row.branch.name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属角色" min-width="50%">
        <template slot-scope="scope">
          <span v-for="role in scope.row.roles" :key="role.roleCode">{{role.name}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastModifyPassTime" label="最后修改密码时间" min-width="20%"></el-table-column>
    </el-table>
  </div>
</template>

<script>
const getRandomString = (n = 10) => {
  const chrs = ' abcdefg hijklmn opq rst uvw xyz '
  let str = ''
  for (let i = 0; i < n; i++) {
    str += chrs[Math.floor(Math.random() * chrs.length)]
  }
  return str.trim()
}
const users = []
for (let i = 1; i < 11; i++) {
  users.push({
    id: (Math.random() * 99999) | 0,
    userName: getRandomString(8),
    realName: getRandomString(8),
    status: Math.random() > 0.5,
    branch: { id: (Math.random() * 9999) | 0, name: '总公司' },
    roles: [
      { id: (Math.random() * 999) | 0, name: '用户组', roleCode: 'user' }
    ],
    lastModifyPassTime: new Date(
      Date.now() - Math.random() * 9999999999
    ).toLocaleDateString(),
    email: (getRandomString(8) + '@' + getRandomString(4) + '.com').replace(
      / /g,
      ''
    ),
    tel: ((Math.random() * 770000000) | 0) + 13300000000,
    phone: '0' + ((Math.random() * 770000000) | 0) + 13300000000,
    remark: ''
  })
}

export default {
  data() {
    return {
      selectedRows: [],
      users: [],
      addFormVisible: false,
      form: {
        userName: '',
        realName: '',
        affiliate: '',
        role: '',
        lmt: '',
        status: '',
        statuses: [
          {
            status: '1',
            label: '可用'
          },
          {
            status: '2',
            label: '冻结'
          }
        ]
      },
      formLabelWidth: '120px',
      currentUser: {

      }
    }
  },
  computed: {
    disableOrEnable: function() {
      if (this.selectedRows.length !== 1) {
        return ''
      }

      return this.selectedRows[0].status ? '停用' : '启用'
    }
  },
  async created() {
    this.users = users
  },
  methods: {
    onSelectionChange(selection) {
      this.selectedRows = selection
    },
    add(){
      this.currentUser = {
        userName: '',
        realName: '',
        affiliate: ''
      }
    }
    // addForm() {
    //   this.$prompt('用户名', '添加用户', {
    //     confirmButtonText: '添加'
    //   })
    // }
  }
}
</script>
