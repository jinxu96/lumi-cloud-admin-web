<template>
  <div class="tab-panel-content">
    <el-form-item :label="$t('templateLibrary.edit_form_title')" prop="title">
      <el-input v-model="form.title" maxlength="150" show-word-limit />
    </el-form-item>

    <el-form-item :label="$t('templateLibrary.edit_form_description')">
      <tinymce
        id="template-description-editor"
        v-model="form.description"
        :height="260"
        :toolbar="instructionDescriptionToolbar"
        :menubar="false"
        :show-upload="false"
      />
    </el-form-item>

    <el-form-item :label="$t('templateLibrary.edit_form_tags')">
      <el-select
        v-model="form.tags"
        multiple
        filterable
        allow-create
        default-first-option
        :placeholder="$t('templateLibrary.edit_tags_placeholder')"
        style="width: 100%;"
      >
        <el-option
          v-for="tag in form.tags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>
    </el-form-item>

    <el-form-item :label="$t('templateLibrary.edit_form_machine_modules')" prop="machineModuleIds">
      <el-select v-model="form.machineModuleIds" multiple filterable style="width: 100%;">
        <el-option-group
          v-for="group in moduleOptions"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="item in group.children"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-option-group>
      </el-select>
    </el-form-item>

    <el-form-item :label="$t('templateLibrary.edit_form_materials')">
      <el-select v-model="form.materialIds" multiple filterable style="width: 100%;">
        <el-option
          v-for="item in materialOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item :label="$t('templateLibrary.edit_form_scenarios')">
      <el-select v-model="form.scenarioIds" multiple filterable style="width: 100%;">
        <el-option
          v-for="item in scenarioOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'

export default {
  name: 'TemplateEditBasicTab',
  components: {
    Tinymce
  },
  inject: ['templateEditDialogContext'],
  computed: {
    // 使用父组件共享的表单引用
    form() {
      return this.templateEditDialogContext.localForm
    },
    moduleOptions() {
      return this.templateEditDialogContext.moduleOptions
    },
    materialOptions() {
      return this.templateEditDialogContext.materialOptions
    },
    scenarioOptions() {
      return this.templateEditDialogContext.scenarioOptions
    },
    instructionDescriptionToolbar() {
      return this.templateEditDialogContext.instructionDescriptionToolbar
    }
  }
}
</script>

<style scoped>
.tab-panel-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
