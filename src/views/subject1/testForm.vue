<template>
  <el-form ref="testForm" :model="test" label-width="80px">
    <el-form-item label="名称">
      <el-input v-model="test.name"></el-input>
    </el-form-item>
    <el-row :gutter="10">
      <el-col :span="12">
        <el-form-item label="编码">
          <el-input v-model="test.code"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
export default {
  data() {
    return {
      testTypes: []
    }
  },
  props: {
    test: {
      type: Object,
      required: true
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      let testTypes = await axios.get('/ui/codes/TestTypeCode/items')
      this.testTypes = testTypes.data.data
    }
  }
}
</script>

<style scoped>

</style>
