// Shared helpers for material processing profiles view and dialog.
// Keep pure functions here to avoid cross-component duplication.

const baseColorDefaults = {
  passes: 1,
  air_assist: false,
  frequency_khz: 100,
  power_percent: 80,
  pulse_width_us: 10,
  focus_offset_mm: null,
  fill_distance_mm: 0.01,
  speed_mm_per_sec: 500
}

export const COLOR_PRINT_COLOR_PRESETS = [
  {
    key: 'black',
    label: '黑色',
    isDefault: true,
    defaults: {
      ...baseColorDefaults,
      label: '黑色',
      power_percent: 80,
      pulse_width_us: 9
    }
  },
  {
    key: 'blue',
    label: '蓝色',
    isDefault: true,
    defaults: {
      ...baseColorDefaults,
      label: '蓝色',
      pulse_width_us: 11
    }
  },
  {
    key: 'yellow',
    label: '黄色',
    isDefault: true,
    defaults: {
      ...baseColorDefaults,
      label: '黄色',
      power_percent: 100,
      pulse_width_us: 11,
      fill_distance_mm: 0.002,
      speed_mm_per_sec: 1500
    }
  },
  {
    key: 'purple',
    label: '紫色',
    defaults: {
      ...baseColorDefaults,
      label: '紫色'
    }
  },
  {
    key: 'orange',
    label: '橙色',
    defaults: {
      ...baseColorDefaults,
      label: '橙色',
      power_percent: 85
    }
  },
  {
    key: 'light_blue',
    label: '浅蓝',
    defaults: {
      ...baseColorDefaults,
      label: '浅蓝',
      power_percent: 70
    }
  },
  {
    key: 'green',
    label: '绿色',
    defaults: {
      ...baseColorDefaults,
      label: '绿色',
      power_percent: 75
    }
  }
]

export const createDefaultColorPrintColors = () => {
  const colors = {}
  COLOR_PRINT_COLOR_PRESETS.forEach(preset => {
    if (preset.isDefault) {
      colors[preset.key] = { ...preset.defaults }
    }
  })
  return colors
}

export const createDefaultParameterSections = () => ({
  fill_engrave: {
    enabled: false,
    engrave_density: 100,
    scan_mode: 'bi_directional',
    overscan_mm: 1
  },
  color_print: {
    enabled: false,
    engrave_density: 100,
    scan_mode: 'bi_directional',
    colors: createDefaultColorPrintColors()
  },
  line_engrave: {
    enabled: false,
    kerf_compensation_enabled: false,
    kerf_compensation_width_mm: 0
  },
  line_cut: {
    enabled: false,
    kerf_compensation_enabled: true,
    kerf_compensation_width_mm: 0,
    focus_down_enabled: true,
    focus_down_distance_mm: 1,
    perforation: true,
    assist_gas_enabled: true,
    assist_gas_pressure_kpa: 150,
    generation_rule: 'by_distance',
    break_enabled: true,
    break_spacing_rule: 'by_distance',
    break_spacing_mm: 100,
    break_size_mm: 0.5,
    break_power_percent: 0
  },
  line_mark: {
    enabled: false,
    kerf_compensation_enabled: false,
    kerf_compensation_width_mm: 0,
    repeat: 1
  },
  fill_mark: {
    enabled: false,
    engrave_density: 80,
    scan_mode: 'uni_directional'
  }
})

export const createDefaultForm = () => ({
  id: null,
  material_id: '',
  machine_id: '',
  machine_module_id: '',
  machine_module_profile_id: '',
  power_percent: null,
  speed_mm_per_sec: null,
  passes: null,
  focus_offset_mm: null,
  air_assist: '',
  fill_distance_mm: null,
  frequency_khz: null,
  pulse_width_us: null,
  preview_image_url: '',
  notes: '',
  is_active: true,
  sort_order: 0,
  parameterSections: createDefaultParameterSections(),
  parameter_matrix_sections_raw: '',
  parameter_matrix_raw: ''
})

export const formatMaterialLabel = material => {
  if (!material) {
    return '-'
  }
  const parts = [material.name]
  if (material.material_code) {
    parts.push(`#${material.material_code}`)
  }
  return parts.filter(Boolean).join(' ')
}

export const formatMachineLabel = machine => {
  if (!machine) {
    return '-'
  }
  const parts = [machine.name]
  if (machine.slug) {
    parts.push(`(${machine.slug})`)
  }
  return parts.filter(Boolean).join(' ')
}

export const formatModuleLabel = module => {
  if (!module) {
    return '-'
  }
  const parts = [module.name]
  const power = module.power_watt || (module.machine_module_power && module.machine_module_power.power_watt)
  if (power) {
    parts.push(`${power}W`)
  }
  return parts.filter(Boolean).join(' ')
}

export const formatProfileTitle = profile => {
  if (!profile) {
    return '-'
  }
  const module = profile.machine_module || {}
  const machine = module.machine || {}
  const parts = []
  if (machine.name) {
    parts.push(machine.name)
  }
  if (module.name) {
    parts.push(module.name)
  }
  if (profile.processing_module) {
    parts.push(profile.processing_module)
  }
  if (profile.processing_mode) {
    parts.push(profile.processing_mode)
  }
  if (profile.process_type) {
    parts.push(profile.process_type)
  }
  return parts.filter(Boolean).join(' · ') || `#${profile.id}`
}
