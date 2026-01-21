<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="card-header">
        <span class="card-title">{{ $t('material.search_title') }}</span>
        <div class="card-actions">
          <el-button
            v-if="checkPermission(['app-admin.materials.store'])"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="openCreate"
          >
            {{ $t('material.action_create') }}
          </el-button>
        </div>
      </div>

      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          :placeholder="$t('material.search_keyword')"
          clearable
          class="filter-item"
          style="width: 220px;margin-right: 12px;"
          @keyup.enter.native="handleFilter"
        />

        <el-select
          v-model="listQuery.material_category_id"
          :placeholder="$t('material.search_category')"
          clearable
          filterable
          :loading="categoryLoading"
          class="filter-item"
          style="width: 200px;margin-right: 12px;"
          @visible-change="handleCategoryVisible"
          @change="handleFilter"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-input
          v-model="listQuery.brand"
          :placeholder="$t('material.search_brand')"
          clearable
          class="filter-item"
          style="width: 160px;margin-right: 12px;"
          @keyup.enter.native="handleFilter"
        />

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('material.search_status') }}</span>
          <el-select
            v-model="listQuery.is_active"
            :placeholder="$t('material.search_status')"
            clearable
            class="filter-select"
            style="width: 140px;"
            @change="handleFilter"
          >
            <el-option :label="$t('material.option_all')" value="" />
            <el-option :label="$t('material.option_enabled')" value="true" />
            <el-option :label="$t('material.option_disabled')" value="false" />
          </el-select>
        </div>

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('material.search_public') }}</span>
          <el-select
            v-model="listQuery.is_public"
            :placeholder="$t('material.search_public')"
            clearable
            class="filter-select"
            style="width: 140px;"
            @change="handleFilter"
          >
            <el-option :label="$t('material.option_all')" value="" />
            <el-option :label="$t('material.option_public')" value="true" />
            <el-option :label="$t('material.option_private')" value="false" />
          </el-select>
        </div>

        <el-select
          v-model="listQuery.order"
          :placeholder="$t('material.search_order')"
          class="filter-item"
          style="width: 200px;margin-right: 12px;"
          @change="handleFilter"
        >
          <el-option v-for="item in orderOptions" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>

        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('material.search_btn') }}
        </el-button>
        <el-button class="filter-item" @click="resetFilter">
          {{ $t('material.search_reset') }}
        </el-button>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
        :empty-text="$t('material.empty_text')"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column min-width="220" :label="$t('material.table_name')">
          <template slot-scope="{ row }">
            <div class="material-name">
              <span class="material-name__title">{{ row.name }}</span>
              <div class="material-name__meta">
                <span v-if="row.material_code">{{ $t('material.table_material_code') }}: {{ row.material_code }}</span>
                <span v-if="row.sku_code">{{ $t('material.table_sku_code') }}: {{ row.sku_code }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="$t('material.table_category')">
          <template slot-scope="{ row }">
            <span>{{ row.category || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="$t('material.table_brand')">
          <template slot-scope="{ row }">
            <span>{{ row.brand || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('material.table_cover')">
          <template slot-scope="{ row }">
            <el-image
              v-if="row.cover_url"
              :src="row.cover_url"
              fit="cover"
              class="material-cover-thumb"
              :lazy="true"
            >
              <div slot="error" class="cover-placeholder">-</div>
            </el-image>
            <div v-else class="cover-placeholder">-</div>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('material.table_thickness')">
          <template slot-scope="{ row }">
            <span>{{ formatThickness(row.thickness_mm) }}</span>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('material.table_is_active')">
          <template slot-scope="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? $t('material.status_enabled') : $t('material.status_disabled') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('material.table_is_public')">
          <template slot-scope="{ row }">
            <el-tag :type="row.is_public ? 'success' : 'warning'">
              {{ row.is_public ? $t('material.status_public') : $t('material.status_private') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('material.table_sort')">
          <template slot-scope="{ row }">
            <span>{{ row.sort_order }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="$t('material.table_updated')">
          <template slot-scope="{ row }">
            <span>{{ row.updated_at }}</span>
          </template>
        </el-table-column>

        <el-table-column width="320" align="center" :label="$t('material.table_actions')">
          <template slot-scope="{ row }">
            <el-button
              v-waves
              size="mini"
              type="primary"
              plain
              icon="el-icon-edit"
              :disabled="!checkPermission(['app-admin.materials.update'])"
              @click="openEdit(row)"
            >
              {{ $t('material.action_edit') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              :type="row.is_active ? 'warning' : 'success'"
              plain
              icon="el-icon-switch-button"
              :loading="loading.status === row.id"
              :disabled="!checkPermission(['app-admin.materials.status'])"
              @click="toggleStatus(row)"
            >
              {{ row.is_active ? $t('material.action_disable') : $t('material.action_enable') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              type="danger"
              plain
              icon="el-icon-unlock"
              :loading="loading.detach === row.id"
              :disabled="!checkPermission(['app-admin.materials.detach-modules'])"
              @click="handleDetachModules(row)"
            >
              {{ $t('material.action_detach_modules') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              type="danger"
              icon="el-icon-delete"
              :loading="loading.delete === row.id"
              :disabled="!checkPermission(['app-admin.materials.destroy'])"
              @click="handleDelete(row)"
            >
              {{ $t('material.action_delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>

    <el-dialog
      :title="dialog.isEdit ? $t('material.dialog_edit_title') : $t('material.dialog_create_title')"
      :visible.sync="dialog.visible"
      width="720px"
      :close-on-click-modal="false"
      @closed="resetDialog"
    >
      <el-form ref="materialForm" :model="dialog.form" :rules="dialog.rules" label-width="120px">
        <el-form-item :label="$t('material.form_name')" prop="name">
          <el-input v-model="dialog.form.name" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('material.form_material_code')" prop="material_code">
          <el-input v-model="dialog.form.material_code" maxlength="60" />
        </el-form-item>
        <el-form-item :label="$t('material.form_sku_code')">
          <el-input v-model="dialog.form.sku_code" maxlength="60" />
        </el-form-item>
        <el-form-item :label="$t('material.form_category')">
          <el-select
            v-model="dialog.form.material_category_id"
            :placeholder="$t('material.form_category_placeholder')"
            clearable
            filterable
            :loading="categoryLoading"
            style="width: 100%;"
            @visible-change="handleCategoryVisible"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('material.form_brand')">
          <el-input v-model="dialog.form.brand" maxlength="60" />
        </el-form-item>
        <el-form-item :label="$t('material.form_spec')">
          <el-input v-model="dialog.form.spec" maxlength="120" />
        </el-form-item>
        <el-form-item :label="$t('material.form_thickness')">
          <el-input-number
            v-model="dialog.form.thickness_mm"
            :min="0"
            :max="1000"
            :step="0.1"
            :precision="2"
            controls-position="right"
            style="width: 160px;"
          />
          <span class="form-tip">{{ $t('material.form_thickness_tip') }}</span>
        </el-form-item>
        <el-form-item :label="$t('material.form_color')">
          <el-input v-model="dialog.form.color" maxlength="60" />
        </el-form-item>
        <el-form-item :label="$t('material.form_cover_url')">
          <el-input
            v-model="dialog.form.cover_url"
            maxlength="512"
            :placeholder="$t('material.form_cover_placeholder')"
            @input="handleCoverUrlInput"
          />
          <div class="cover-upload-actions">
            <el-upload
              v-if="checkPermission(['app-admin.materials.store', 'app-admin.materials.update', 'app-admin.materials.cover'])"
              class="cover-upload"
              :show-file-list="false"
              :action="uploadPlaceholderAction"
              :before-upload="beforeCoverUpload"
              :http-request="handleCoverUpload"
              accept="image/*"
            >
              <el-button size="mini" type="primary">
                {{ $t('material.action_upload_cover') }}
              </el-button>
            </el-upload>
            <span class="cover-tip">{{ $t('material.form_cover_tip') }}</span>
          </div>
          <div v-if="coverPreviewUrl" class="cover-preview">
            <span class="cover-preview-title">{{ $t('material.preview_title') }}</span>
            <el-image :src="coverPreviewUrl" fit="cover" class="cover-preview-image">
              <div slot="error" class="cover-preview-error">-</div>
            </el-image>
          </div>
        </el-form-item>
        <el-form-item :label="$t('material.form_description')">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('material.form_package_contents')" prop="package_contents">
          <div class="package-content-group">
            <div class="package-content-row">
              <span class="package-content-label">{{ $t('material.form_package_sheets') }}</span>
              <el-input-number
                v-model="dialog.form.package_contents.sheets"
                :min="1"
                :max="999999"
                :step="1"
                :precision="0"
                controls-position="right"
                class="package-content-number"
              />
            </div>
            <div class="package-content-row">
              <span class="package-content-label">{{ $t('material.form_package_size') }}</span>
              <div class="package-content-size">
                <el-input-number
                  v-model="dialog.form.package_contents.size_width_mm"
                  :min="1"
                  :max="100000"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                  class="package-content-size-input"
                />
                <span class="package-content-divider">×</span>
                <el-input-number
                  v-model="dialog.form.package_contents.size_height_mm"
                  :min="1"
                  :max="100000"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                  class="package-content-size-input"
                />
                <span class="package-content-unit">{{ $t('material.form_package_unit_mm') }}</span>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('material.form_tags')">
          <div class="form-list">
            <div
              v-for="(tag, index) in dialog.form.tags"
              :key="`tag-${index}`"
              class="form-list-item"
            >
              <el-input
                v-model="dialog.form.tags[index]"
                maxlength="40"
                :placeholder="$t('material.form_tags_item_placeholder')"
                class="form-list-item__input"
              />
              <el-button
                v-if="dialog.form.tags.length > 1"
                type="text"
                class="form-list-item__remove"
                icon="el-icon-delete"
                @click="removeTag(index)"
              >
                {{ $t('material.form_remove_item') }}
              </el-button>
            </div>
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="addTag">
              {{ $t('material.form_tags_add') }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item :label="$t('material.form_warnings')">
          <div class="form-warning-list">
            <div
              v-for="(warning, index) in dialog.form.warnings"
              :key="`warning-${index}`"
              class="form-warning-item"
            >
              <div class="form-warning-header">
                <span class="form-warning-title">{{ $t('material.form_warning_index', { index: index + 1 }) }}</span>
                <el-button
                  v-if="dialog.form.warnings.length > 1"
                  type="text"
                  icon="el-icon-delete"
                  @click="removeWarningItem(index)"
                >
                  {{ $t('material.form_warning_remove') }}
                </el-button>
              </div>
              <div class="form-warning-grid">
                <el-input
                  v-model="dialog.form.warnings[index].icon"
                  maxlength="120"
                  :placeholder="$t('material.form_warning_icon_placeholder')"
                />
                <el-input
                  v-model="dialog.form.warnings[index].title"
                  maxlength="120"
                  :placeholder="$t('material.form_warning_title_placeholder')"
                />
              </div>
              <el-input
                v-model="dialog.form.warnings[index].description"
                type="textarea"
                :rows="2"
                maxlength="300"
                :placeholder="$t('material.form_warning_description_placeholder')"
                class="form-warning-description"
              />
              <el-input
                v-model="dialog.form.warnings[index].detail_url"
                maxlength="512"
                :placeholder="$t('material.form_warning_detail_placeholder')"
              />
            </div>
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="addWarningItem">
              {{ $t('material.form_warning_add') }}
            </el-button>
          </div>
        </el-form-item>
        <!-- <el-form-item :label="$t('material.form_extra')">
          <el-input
            v-model="dialog.form.extra"
            type="textarea"
            :rows="3"
            :placeholder="$t('material.form_extra_placeholder')"
          />
        </el-form-item> -->
        <el-form-item :label="$t('material.form_is_active')">
          <el-switch v-model="dialog.form.is_active" active-color="#13ce66" inactive-color="#dcdfe6" />
        </el-form-item>
        <el-form-item :label="$t('material.form_is_public')">
          <el-switch v-model="dialog.form.is_public" active-color="#13ce66" inactive-color="#dcdfe6" />
        </el-form-item>
        <el-form-item :label="$t('material.form_sort')">
          <el-input-number v-model="dialog.form.sort_order" :min="0" :max="9999" :step="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="dialog.loading" @click="submitDialog">{{ $t('common.save') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import checkPermission from '@/utils/permission'
import Pagination from '@/components/Pagination'
import { getMaterials, createMaterial, updateMaterial, deleteMaterial, updateMaterialStatus, uploadMaterialCover, detachMaterialModules } from '@/api/materials'
import { getMaterialCategories } from '@/api/materialCategories'

const toInputText = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch (error) {
    return ''
  }
}

const createWarningItem = (data = {}) => ({
  icon: toInputText(data.icon),
  title: toInputText(data.title),
  description: toInputText(data.description),
  detail_url: toInputText(data.detail_url)
})

const createDefaultPackageContents = () => ({
  sheets: null,
  size_width_mm: null,
  size_height_mm: null
})

const normalizePackageContents = (input) => {
  const fallback = createDefaultPackageContents()
  if (input === null || input === undefined || input === '') {
    return fallback
  }

  let value = input
  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (!trimmed) {
      return fallback
    }
    try {
      value = JSON.parse(trimmed)
    } catch (error) {
      return fallback
    }
  }

  if (Array.isArray(value)) {
    const [first] = value
    if (typeof first === 'string') {
      try {
        return normalizePackageContents(JSON.parse(first))
      } catch (error) {
        return fallback
      }
    }
    if (first && typeof first === 'object') {
      return normalizePackageContents(first)
    }
    return fallback
  }

  if (typeof value === 'object') {
    if (value === null) {
      return fallback
    }
    const normalized = createDefaultPackageContents()
    const sheetsValue = Number(value.sheets)
    normalized.sheets = Number.isFinite(sheetsValue) ? sheetsValue : null

    if (Array.isArray(value.size_mm) && value.size_mm.length >= 2) {
      const widthValue = Number(value.size_mm[0])
      const heightValue = Number(value.size_mm[1])
      normalized.size_width_mm = Number.isFinite(widthValue) ? widthValue : null
      normalized.size_height_mm = Number.isFinite(heightValue) ? heightValue : null
    } else {
      const widthValue = Number(value.width_mm !== undefined ? value.width_mm : value.width)
      const heightValue = Number(value.height_mm !== undefined ? value.height_mm : value.height)
      normalized.size_width_mm = Number.isFinite(widthValue) ? widthValue : null
      normalized.size_height_mm = Number.isFinite(heightValue) ? heightValue : null
    }

    return normalized
  }

  return fallback
}

const toPositiveNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) {
    return null
  }
  return num
}

const toPositiveInteger = (value) => {
  const num = toPositiveNumber(value)
  if (num === null) {
    return null
  }
  return Math.round(num)
}

const buildPackageContentsPayload = (content) => {
  if (!content) {
    return null
  }
  const sheets = toPositiveInteger(content.sheets)
  const width = toPositiveNumber(content.size_width_mm)
  const height = toPositiveNumber(content.size_height_mm)

  if (sheets === null || width === null || height === null) {
    return null
  }

  return {
    sheets,
    size_mm: [width, height]
  }
}

const createDefaultForm = () => ({
  id: '',
  name: '',
  material_code: '',
  sku_code: '',
  material_category_id: '',
  brand: '',
  spec: '',
  thickness_mm: null,
  color: '',
  cover_url: '',
  description: '',
  package_contents: createDefaultPackageContents(),
  tags: [''],
  warnings: [createWarningItem()],
  extra: '',
  is_active: true,
  is_public: true,
  sort_order: 0
})

const normalizeStringArray = (input) => {
  if (Array.isArray(input)) {
    return input.map(item => toInputText(item)).filter(item => item !== '')
  }
  if (typeof input === 'string' && input.trim()) {
    try {
      const parsed = JSON.parse(input)
      if (Array.isArray(parsed)) {
        return parsed.map(item => toInputText(item)).filter(item => item !== '')
      }
    } catch (error) {
      return input.split(/[\n,]/).map(part => part.trim()).filter(part => part !== '')
    }
    return input.split(/[\n,]/).map(part => part.trim()).filter(part => part !== '')
  }
  return []
}

const normalizeWarnings = (input) => {
  if (Array.isArray(input)) {
    return input.map(item => createWarningItem(item))
  }
  if (typeof input === 'string' && input.trim()) {
    try {
      const parsed = JSON.parse(input)
      if (Array.isArray(parsed)) {
        return parsed.map(item => createWarningItem(item))
      }
    } catch (error) {
      return []
    }
  }
  return []
}

const isValidUrl = (value) => {
  if (!value) {
    return false
  }
  try {
    const parsed = new URL(value)
    return Boolean(parsed.protocol && parsed.host)
  } catch (error) {
    return false
  }
}

export default {
  name: 'MaterialIndex',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        keyword: '',
        material_category_id: '',
        brand: '',
        is_active: '',
        is_public: '',
        order: 'created_at__DESC',
        limit: 20,
        page: 1
      },
      orderOptions: [],
      categoryOptions: [],
      categoryLoading: false,
      uploadPlaceholderAction: '/noop-upload',
      loading: {
        delete: '',
        status: '',
        detach: ''
      },
      dialog: {
        visible: false,
        loading: false,
        isEdit: false,
        coverFile: null,
        coverPreview: '',
        form: createDefaultForm(),
        rules: {
          name: [{ required: true, message: this.$t('material.form_rules_name'), trigger: 'blur' }],
          material_code: [{ required: true, message: this.$t('material.form_rules_material_code'), trigger: 'blur' }],
          package_contents: [{ validator: (rule, value, callback) => this.validatePackageContents(rule, value, callback), trigger: 'change' }]
        }
      }
    }
  },
  computed: {
    coverPreviewUrl() {
      return this.dialog.coverPreview || this.dialog.form.cover_url || ''
    }
  },
  created() {
    this.orderOptions = [
      { key: 'created_at__DESC', label: this.$t('material.order_created_desc') },
      { key: 'created_at__ASC', label: this.$t('material.order_created_asc') },
      { key: 'name__ASC', label: this.$t('material.order_name_asc') },
      { key: 'name__DESC', label: this.$t('material.order_name_desc') },
      { key: 'sort_order__ASC', label: this.$t('material.order_sort_asc') },
      { key: 'sort_order__DESC', label: this.$t('material.order_sort_desc') }
    ]
    this.fetchCategoryOptions()
    this.getList()
  },
  beforeDestroy() {
    this.clearLocalCoverFile()
  },
  methods: {
    checkPermission,
    // 拉取材料列表
    getList() {
      this.listLoading = true
      const params = {
        start: (this.listQuery.page - 1) * this.listQuery.limit,
        limit: this.listQuery.limit,
        order: this.listQuery.order || 'created_at__DESC'
      }
      if (this.listQuery.keyword) {
        params.keyword = this.listQuery.keyword
      }
      if (this.listQuery.material_category_id) {
        const categoryId = Number(this.listQuery.material_category_id)
        if (Number.isFinite(categoryId)) {
          params.material_category_id = categoryId
        }
      }
      if (this.listQuery.brand) {
        params.brand = this.listQuery.brand
      }
      if (this.listQuery.is_active !== '' && this.listQuery.is_active !== null) {
        params.is_active = this.listQuery.is_active === 'true'
      }
      if (this.listQuery.is_public !== '' && this.listQuery.is_public !== null) {
        params.is_public = this.listQuery.is_public === 'true'
      }
      getMaterials(params)
        .then(res => {
          const payload = res.data || {}
          this.list = payload.list || []
          this.total = payload.total || 0
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    // 获取材料分类选项
    fetchCategoryOptions() {
      this.categoryLoading = true
      const params = {
        start: 0,
        limit: 200,
        order: 'sort_order__ASC'
      }
      getMaterialCategories(params)
        .then(res => {
          const list = res && res.data && Array.isArray(res.data.list) ? res.data.list : []
          const mapped = list.map(item => ({
            value: String(item.id),
            label: item && item.name ? item.name : `#${item.id}`
          }))
          const preservedValues = [
            this.listQuery && this.listQuery.material_category_id ? String(this.listQuery.material_category_id) : '',
            this.dialog && this.dialog.form && this.dialog.form.material_category_id
              ? String(this.dialog.form.material_category_id)
              : ''
          ].filter(value => value !== '')

          preservedValues.forEach(value => {
            if (mapped.some(option => option.value === value)) {
              return
            }
            const preserved = this.categoryOptions.find(option => option.value === value)
            if (preserved) {
              mapped.push(preserved)
            } else {
              mapped.push({ value, label: `#${value}` })
            }
          })

          this.categoryOptions = mapped
        })
        .finally(() => {
          this.categoryLoading = false
        })
    },
    ensureCategoryOption(value, label) {
      if (value === undefined || value === null || value === '') {
        return
      }
      const optionValue = String(value)
      if (this.categoryOptions.some(item => item.value === optionValue)) {
        return
      }
      const optionLabel = label && String(label).trim() ? String(label).trim() : `#${optionValue}`
      this.categoryOptions = this.categoryOptions.concat({
        value: optionValue,
        label: optionLabel
      })
    },
    handleCategoryVisible(visible) {
      if (visible && this.categoryOptions.length === 0 && !this.categoryLoading) {
        this.fetchCategoryOptions()
      }
    },
    // 应用筛选条件
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 重置筛选条件
    resetFilter() {
      const limit = this.listQuery.limit
      this.listQuery = {
        keyword: '',
        material_category_id: '',
        brand: '',
        is_active: '',
        is_public: '',
        order: 'created_at__DESC',
        limit,
        page: 1
      }
      this.getList()
    },
    // 打开新增弹窗
    openCreate() {
      this.dialog.visible = true
      this.dialog.isEdit = false
      this.dialog.coverFile = null
      this.dialog.coverPreview = ''
      this.dialog.form = createDefaultForm()
      if (!this.categoryOptions.length && !this.categoryLoading) {
        this.fetchCategoryOptions()
      }
      this.$nextTick(() => {
        if (this.$refs.materialForm) {
          this.$refs.materialForm.clearValidate()
        }
      })
    },
    // 打开编辑弹窗
    openEdit(row) {
      if (!row || !row.id) {
        return
      }
      this.dialog.visible = true
      this.dialog.isEdit = true
      this.dialog.coverFile = null
      this.dialog.coverPreview = ''
      const packageContents = normalizePackageContents(row.package_contents)
      const tags = normalizeStringArray(row.tags)
      const warnings = normalizeWarnings(row.warnings)
      const materialCategoryId = row && row.material_category_id ? String(row.material_category_id) : ''
      if (materialCategoryId) {
        const categoryName = row && row.material_category && row.material_category.name
          ? row.material_category.name
          : (row && row.category ? String(row.category) : '')
        this.ensureCategoryOption(materialCategoryId, categoryName)
      }
      this.dialog.form = {
        id: row.id,
        name: toInputText(row.name),
        material_code: toInputText(row.material_code),
        sku_code: toInputText(row.sku_code),
        material_category_id: materialCategoryId,
        brand: toInputText(row.brand),
        spec: toInputText(row.spec),
        thickness_mm: typeof row.thickness_mm === 'number' ? row.thickness_mm : (row.thickness_mm ? Number(row.thickness_mm) : null),
        color: toInputText(row.color),
        cover_url: toInputText(row.cover_url),
        description: toInputText(row.description),
        package_contents: packageContents,
        tags: tags.length ? tags : [''],
        warnings: warnings.length ? warnings : [createWarningItem()],
        extra: row && typeof row.extra === 'object' && row.extra !== null ? JSON.stringify(row.extra) : toInputText(row.extra),
        is_active: Boolean(row.is_active),
        is_public: row.is_public !== undefined ? Boolean(row.is_public) : true,
        sort_order: typeof row.sort_order === 'number' ? row.sort_order : Number(row.sort_order) || 0
      }
      this.$nextTick(() => {
        if (this.$refs.materialForm) {
          this.$refs.materialForm.clearValidate()
        }
      })
    },
    // 删除材料
    handleDelete(row) {
      if (!row || !row.id) {
        return
      }
      this.$confirm(this.$t('material.confirm_delete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.delete = row.id
        deleteMaterial(row.id)
          .then(() => {
            this.$message.success(this.$t('material.message_delete_success'))
            this.getList()
          })
          .finally(() => {
            this.loading.delete = ''
          })
      }).catch(() => {})
    },
    // 切换启用状态
    toggleStatus(row) {
      if (!row || !row.id) {
        return
      }
      const targetStatus = !row.is_active
      const confirmKey = targetStatus ? 'material.confirm_enable' : 'material.confirm_disable'
      this.$confirm(this.$t(confirmKey), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.status = row.id
        updateMaterialStatus(row.id, targetStatus)
          .then(() => {
            const messageKey = targetStatus ? 'material.message_enable_success' : 'material.message_disable_success'
            this.$message.success(this.$t(messageKey))
            this.getList()
          })
          .finally(() => {
            this.loading.status = ''
          })
      }).catch(() => {})
    },
    // 解绑材料与机器模块
    handleDetachModules(row) {
      if (!row || !row.id) {
        return
      }
      this.$confirm(this.$t('material.confirm_detach'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.detach = row.id
        detachMaterialModules(row.id)
          .then(() => {
            this.$message.success(this.$t('material.message_detach_success'))
            this.getList()
          })
          .finally(() => {
            this.loading.detach = ''
          })
      }).catch(() => {})
    },
    validatePackageContents(rule, value, callback) {
      const info = value || {}
      const hasSheets = info.sheets !== null && info.sheets !== undefined && info.sheets !== ''
      if (!hasSheets) {
        callback(new Error(this.$t('material.form_rules_package_sheets')))
        return
      }
      const sheetsNumber = Number(info.sheets)
      if (!Number.isFinite(sheetsNumber) || sheetsNumber <= 0) {
        callback(new Error(this.$t('material.form_rules_package_sheets_positive')))
        return
      }
      const hasWidth = info.size_width_mm !== null && info.size_width_mm !== undefined && info.size_width_mm !== ''
      const hasHeight = info.size_height_mm !== null && info.size_height_mm !== undefined && info.size_height_mm !== ''
      if (!hasWidth || !hasHeight) {
        callback(new Error(this.$t('material.form_rules_package_size')))
        return
      }
      const widthNumber = Number(info.size_width_mm)
      const heightNumber = Number(info.size_height_mm)
      if (!Number.isFinite(widthNumber) || !Number.isFinite(heightNumber) || widthNumber <= 0 || heightNumber <= 0) {
        callback(new Error(this.$t('material.form_rules_package_size_positive')))
        return
      }
      callback()
    },
    // 提交新增或编辑
    submitDialog() {
      this.$refs.materialForm.validate(valid => {
        if (!valid) {
          return
        }
        const baseForm = this.dialog.form
        const packagePayload = buildPackageContentsPayload(baseForm.package_contents)
        if (!packagePayload) {
          this.$message.error(this.$t('material.message_package_invalid'))
          return
        }
        const tagItems = baseForm.tags
          .map(item => (item === null || item === undefined) ? '' : String(item).trim())
          .filter(item => item !== '')

        const warnings = []
        let hasValidationError = false
        baseForm.warnings.forEach((warning, index) => {
          const icon = warning && warning.icon !== undefined && warning.icon !== null ? String(warning.icon).trim() : ''
          const title = warning && warning.title !== undefined && warning.title !== null ? String(warning.title).trim() : ''
          const description = warning && warning.description !== undefined && warning.description !== null ? String(warning.description).trim() : ''
          const detailUrl = warning && warning.detail_url !== undefined && warning.detail_url !== null ? String(warning.detail_url).trim() : ''

          if (!icon && !title && !description && !detailUrl) {
            return
          }
          if (!icon || !title) {
            this.$message.error(this.$t('material.message_warning_required', { index: index + 1 }))
            hasValidationError = true
            return
          }
          if (detailUrl && !isValidUrl(detailUrl)) {
            this.$message.error(this.$t('material.message_warning_invalid_url', { index: index + 1 }))
            hasValidationError = true
            return
          }
          warnings.push({
            icon,
            title,
            description,
            detail_url: detailUrl
          })
        })

        if (hasValidationError) {
          return
        }

        const payload = {
          name: (baseForm.name || '').trim(),
          material_code: (baseForm.material_code || '').trim(),
          sku_code: (baseForm.sku_code || '').trim(),
          brand: (baseForm.brand || '').trim(),
          spec: (baseForm.spec || '').trim(),
          color: (baseForm.color || '').trim(),
          cover_url: (baseForm.cover_url || '').trim(),
          description: (baseForm.description || '').trim(),
          extra: (baseForm.extra || '').trim(),
          is_active: Boolean(baseForm.is_active),
          is_public: Boolean(baseForm.is_public),
          sort_order: Number(baseForm.sort_order) || 0
        }

        if (baseForm.material_category_id !== '' && baseForm.material_category_id !== null && baseForm.material_category_id !== undefined) {
          const parsedCategoryId = Number(baseForm.material_category_id)
          if (!Number.isNaN(parsedCategoryId)) {
            payload.material_category_id = parsedCategoryId
          }
        } else {
          payload.material_category_id = null
        }

        if (baseForm.thickness_mm !== null && baseForm.thickness_mm !== undefined && baseForm.thickness_mm !== '') {
          const parsedThickness = Number(baseForm.thickness_mm)
          if (!Number.isNaN(parsedThickness)) {
            payload.thickness_mm = parsedThickness
          }
        }

        const extrasPayload = {
          packageContents: packagePayload,
          tagItems,
          warnings
        }
        const hasCoverUpload = Boolean(this.dialog.coverFile)
        this.dialog.loading = true

        let request
        if (this.dialog.isEdit) {
          // 编辑时仅发 JSON，避免 Laravel PUT + multipart 解析失败
          const updateData = this.buildMaterialJsonPayload(payload, extrasPayload)
          request = updateMaterial(this.dialog.form.id, updateData).then(() => {
            if (hasCoverUpload) {
              // 封面单独调专用接口，保证图片能落地
              return uploadMaterialCover(this.dialog.form.id, this.dialog.coverFile).then(res => {
                const response = res && res.data ? res.data : {}
                const nextCoverUrl = response.cover_url || (response.material && response.material.cover_url)
                if (nextCoverUrl) {
                  this.dialog.form.cover_url = nextCoverUrl
                }
              })
            }
            return null
          })
        } else {
          // 新增仍按是否有文件选择 JSON 或 FormData
          const submitData = hasCoverUpload
            ? this.buildMaterialFormData(payload, extrasPayload)
            : this.buildMaterialJsonPayload(payload, extrasPayload)
          request = createMaterial(submitData)
        }

        request
          .then(() => {
            const messageKey = this.dialog.isEdit ? 'material.message_update_success' : 'material.message_create_success'
            this.$message.success(this.$t(messageKey))
            this.dialog.visible = false
            this.getList()
          })
          .finally(() => {
            this.dialog.loading = false
            this.clearLocalCoverFile()
          })
      })
    },
    // 重置弹窗状态
    resetDialog() {
      this.dialog.loading = false
      this.dialog.coverFile = null
      this.clearLocalCoverFile()
      this.dialog.form = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.materialForm) {
          this.$refs.materialForm.clearValidate()
        }
      })
    },
    addTag() {
      this.dialog.form.tags.push('')
    },
    removeTag(index) {
      if (this.dialog.form.tags.length <= 1) {
        this.dialog.form.tags.splice(0, 1, '')
        return
      }
      this.dialog.form.tags.splice(index, 1)
    },
    addWarningItem() {
      this.dialog.form.warnings.push(createWarningItem())
    },
    removeWarningItem(index) {
      if (this.dialog.form.warnings.length <= 1) {
        this.dialog.form.warnings.splice(0, 1, createWarningItem())
        return
      }
      this.dialog.form.warnings.splice(index, 1)
    },
    // 校验上传文件
    beforeCoverUpload(file) {
      const isImage = /^image\//.test(file.type)
      if (!isImage) {
        this.$message.error(this.$t('material.message_cover_upload_error_type'))
        return false
      }
      const isLt5M = file.size / 1024 / 1024 <= 5
      if (!isLt5M) {
        this.$message.error(this.$t('material.message_cover_upload_error_size'))
        return false
      }
      return true
    },
    // 处理封面上传
    handleCoverUpload(uploadOption) {
      const { file, onSuccess, onError } = uploadOption || {}
      if (!file) {
        if (typeof onError === 'function') {
          onError()
        }
        return
      }
      this.setLocalCoverFile(file)
      if (typeof onSuccess === 'function') {
        onSuccess({})
      }
    },
    // 输入地址时重置本地文件
    handleCoverUrlInput() {
      if (this.dialog.coverFile || this.dialog.coverPreview) {
        this.clearLocalCoverFile()
      }
    },
    // 设置本地封面文件
    setLocalCoverFile(file) {
      this.clearLocalCoverFile()
      if (file) {
        let previewUrl = ''
        if (typeof window !== 'undefined' && window.URL && typeof window.URL.createObjectURL === 'function') {
          previewUrl = window.URL.createObjectURL(file)
        }
        this.dialog.coverFile = file
        this.dialog.coverPreview = previewUrl
      }
    },
    // 清理封面文件与预览
    clearLocalCoverFile() {
      if (this.dialog.coverPreview && typeof window !== 'undefined' && window.URL && typeof window.URL.revokeObjectURL === 'function') {
        window.URL.revokeObjectURL(this.dialog.coverPreview)
      }
      this.dialog.coverPreview = ''
      this.dialog.coverFile = null
    },
    // 构建提交数据
    buildMaterialFormData(payload, extras = {}) {
      // 仅在创建且有文件时走 FormData
      const formData = new FormData()
      Object.keys(payload).forEach(key => {
        const value = payload[key]
        if (value !== '' && value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0')
          } else {
            formData.append(key, value)
          }
        }
      })
      const packageContents = extras && typeof extras.packageContents === 'object' ? extras.packageContents : null
      const tagItems = Array.isArray(extras.tagItems) ? extras.tagItems : []
      const warnings = Array.isArray(extras.warnings) ? extras.warnings : []

      if (packageContents) {
        // 以嵌套字段方式提交，确保后端按数组解析
        if (packageContents.sheets !== undefined && packageContents.sheets !== null) {
          formData.append('package_contents[sheets]', packageContents.sheets)
        }
        if (Array.isArray(packageContents.size_mm) && packageContents.size_mm.length >= 2) {
          formData.append('package_contents[size_mm][]', packageContents.size_mm[0])
          formData.append('package_contents[size_mm][]', packageContents.size_mm[1])
        }
      }

      tagItems.forEach(item => {
        formData.append('tags[]', item)
      })

      warnings.forEach((item, index) => {
        formData.append(`warnings[${index}][icon]`, item.icon)
        formData.append(`warnings[${index}][title]`, item.title)
        if (item.description) {
          formData.append(`warnings[${index}][description]`, item.description)
        }
        if (item.detail_url) {
          formData.append(`warnings[${index}][detail_url]`, item.detail_url)
        }
      })

      if (this.dialog.coverFile) {
        formData.append('cover', this.dialog.coverFile)
      }
      return formData
    },
    buildMaterialJsonPayload(payload, extras = {}) {
      // 编辑及无文件创建走纯 JSON
      const data = { ...payload }
      const packageContents = extras && typeof extras.packageContents === 'object' ? extras.packageContents : null
      const tagItems = Array.isArray(extras.tagItems) ? extras.tagItems : []
      const warnings = Array.isArray(extras.warnings) ? extras.warnings : []

      data.package_contents = packageContents || null
      data.tags = tagItems
      data.warnings = warnings

      return data
    },
    // 厚度显示
    formatThickness(value) {
      if (value === null || value === undefined || value === '') {
        return '-'
      }
      const num = Number(value)
      if (Number.isNaN(num)) {
        return '-'
      }
      return `${num} mm`
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-weight: 600;
  font-size: 16px;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.filter-item {
  margin-bottom: 12px;
}
.filter-field {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}
.material-name__title {
  font-weight: 600;
}
.material-name__meta {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}
.material-cover-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}
.cover-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 20px;
}
.cover-upload-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.cover-tip {
  font-size: 12px;
  color: #909399;
}
.cover-preview {
  margin-top: 12px;
}
.cover-preview-title {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #606266;
}
.cover-preview-image {
  width: 140px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
}
.cover-preview-error {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 20px;
}
.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}
.form-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.package-content-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.package-content-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.package-content-label {
  font-size: 13px;
  color: #606266;
  min-width: 48px;
}
.package-content-number {
  width: 160px;
}
.package-content-size {
  display: flex;
  align-items: center;
  gap: 8px;
}
.package-content-size-input {
  width: 140px;
}
.package-content-divider {
  color: #909399;
}
.package-content-unit {
  color: #909399;
  font-size: 13px;
}
.form-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-list-item__input {
  flex: 1;
}
.form-list-item__remove {
  padding: 0;
  color: #f56c6c;
}
.form-warning-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-warning-item {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-warning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.form-warning-title {
  font-weight: 600;
  color: #606266;
}
.form-warning-grid {
  display: flex;
  gap: 12px;
}
.form-warning-grid .el-input {
  flex: 1;
}
.form-warning-description {
  margin-top: 4px;
}
</style>
