<template>
  <section> 
    <!--表单-->
    <el-form :inline="true" :model="formData" ref="queryForm">
        <el-row>
          <el-col :span="14">              
            <el-form-item label="开始日期"
              prop="startDate"
                :rules="[
                  { required: true, message: '请选择开始日期', trigger: 'blur' }
                ]"
            >
              <el-date-picker
                  v-model="formData.startDate"
                  align="right"
                  type="date"
                  value-format="yyyy-MM-dd"
                  placeholder="选择开始日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="结束日期"
              prop="endDate"
              :rules="[
                { required: true, message: '请选择结束日期', trigger: 'blur' }
              ]"
            >
              <el-date-picker
                  v-model="formData.endDate"
                  align="right"
                  type="date"
                  value-format="yyyy-MM-dd"
                  placeholder="选择结束日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="门店编码">
             <el-input v-model="formData.orgId" placeholder="输入门店编码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="14">
            &nbsp;
            <el-form-item label="盘点单号">
              <el-input v-model="formData.checkNo" placeholder="输入盘点单号"></el-input>
            </el-form-item>
            &nbsp;
            <el-form-item label="盘点人员">
              <el-input v-model="formData.actorId" placeholder="输入盘点人员"></el-input>
            </el-form-item>                    
            <el-form-item>
              <el-button type="primary" @click="submitForm('queryForm')" width="100px">查询</el-button>
            </el-form-item>
            <el-form-item>   
              <el-upload
                  class="upload-excel"
                  action=""
                  accept=".xlsx"
                  :before-upload="handleUpload"
                  :show-file-list="false">
                  <el-button slot="trigger" type="primary">导出数据</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
    </el-form>
    <!--表格-->
    <el-table
        :data="tableData"
        border
        show-summary
        :summary-method="getSummaries"
        style="width: 100%;">
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="checkNo" label="盘点单号"></el-table-column>
        <el-table-column prop="orgId" label="门店编码"></el-table-column>
        <el-table-column prop="actDate" label="导入时间"></el-table-column>
        <el-table-column prop="actorId" label="导入人"></el-table-column>
    </el-table>
    <div v-loading="loading" element-loading-text="拼命加载中">
    </div>
  </section>
</template>
<script type="text/ecmascript-6">
import { fetchHeadList, uploadData } from '@/api/inventory'
var moment = require('moment')
var util = require('util')

export default {
  data() {
    return {
      formData: {
        startDate: '',
        endDate: '',
        orgId: '',
        checkNo: '',
        actorId: '',
        page: 1,
        rows: 500
      },
      loading: false,
      total: 0,
      tableData: []
    }
  },
  created() {
    this.formData.startDate = moment().subtract(1, 'week').format('YYYY-MM-DD')
    this.formData.endDate = moment().format('YYYY-MM-DD')
    window.addEventListener('scroll', this.handleScroll)
  },
  computed: {
    pages: {
      get: function() {
        return Math.ceil(this.total / this.formData.rows)
      }
    }
  },
  watch: {
    'formData.page'(val) {
      this.fetchData()
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.formData.page = 1
          this.tableData = []
          this.fetchData()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    fetchData() {
      if (this.loading) {
        console.log('fetchData runing')
        return
      }
      this.loading = true
      console.log('fetchData start...')
      new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve('sleep')
        }, 0)
      }).then(() => {
        fetchHeadList(this.formData)
          .then(response => {
            console.log('fetchHeadList then start')
            if (response.data.code === 0) {
              if (!response.data.data.rows || response.data.data.rows.length === 0) {
                return
              }
              this.total = response.data.data.total
              this.tableData = this.tableData.concat(response.data.data.rows)
            } else {
              this.$message(response.data.message)
            }
            console.log('fetchHeadList then end')
          })
          .catch(err => {
            console.log(err)
            this.$message.error(err)
          })
          .finally(() => {
            this.loading = false
            console.log('fetchHeadList finally')
          })
      })
    },
    handleUpload(file) {
      var form = new FormData()
      form.append('file', file, file.name)
      this.loading = true
      uploadData(form)
        .then(response => {
          if (response.data.code === 0) {
            this.$message(response.data.message)
            this.fetchData()
          } else {
            this.$message(response.data.message)
          }
        })
        .catch(err => {
          console.log(err)
          this.$message.error(err)
        })
        .finally(() => {
          this.loading = false
        })
      return false
    },
    handleScroll(event) {
      var scrollTop = document.body.scrollTop || document.documentElement.scrollTop
      // console.log(document.documentElement.clientHeight + '-----------' + window.innerHeight) // 可视区域高度
      // console.log(scrollTop) // 滚动高度
      // console.log(document.body.offsetHeight) // 文档高度
      // console.log(document.body.scrollHeight) // 滚动条高度
      if (scrollTop + document.body.offsetHeight + 50 >= document.body.scrollHeight) {
        if (this.loading) {
          console.log('handleScroll loading')
        } else if (this.formData.page < this.pages) {
          this.formData.page = this.formData.page + 1
          console.log('handleScroll loadmore')
        }
      }
    },
    getSummaries(param) {
      const columns = param.columns
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
        } else if (index === columns.length - 1) {
          sums[index] = util.format('共%s条', this.total)
        }
      })
      return sums
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-form {
  margin: 10px 0px 0px 10px;
  .el-input {
    width: 150px;
  }
}
.el-table {
  margin: 0px 5px 5px 5px;
}
</style>