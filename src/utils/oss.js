import OSS from 'ali-oss'

// 视频扩展名列表，用于类型推断
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'ogg', 'mkv'])
// 图片扩展名列表，用于类型推断
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'])

// 根据文件信息推断媒体类型，默认回退为图片
export function inferMediaTypeByMime(mimeType, extension) {
  if (mimeType) {
    if (mimeType.startsWith('video/')) {
      return 'video'
    }
    if (mimeType.startsWith('image/')) {
      return 'image'
    }
  }

  if (extension) {
    const lowerExt = extension.toLowerCase()
    if (VIDEO_EXTENSIONS.has(lowerExt)) {
      return 'video'
    }
    if (IMAGE_EXTENSIONS.has(lowerExt)) {
      return 'image'
    }
  }

  return 'image'
}

// 使用临时凭证执行 OSS 分片上传
export async function uploadFileToOss(signature, file, onProgress) {
  // 兼容后端 region 返回为 cn-xxx 的情况，自动补齐 oss- 前缀
  const rawRegion = signature.region || ''
  const region = rawRegion.startsWith('oss-') ? rawRegion : (rawRegion ? `oss-${rawRegion}` : undefined)

  // 如果后端未直接返回 bucket，则尝试从 upload_host 自动推断
  let bucket = signature.bucket || ''
  if ((!bucket || !region) && signature.upload_host) {
    try {
      const url = new URL(signature.upload_host)
      const host = url.hostname
      const segments = host.split('.')
      if (segments.length >= 4) {
        bucket = bucket || segments[0]
        const hostRegion = segments[1] // 例如 oss-cn-beijing
        if (!rawRegion && hostRegion.startsWith('oss-')) {
          signature.region = hostRegion
        }
      }
    } catch (error) {
      // ignore URL parse errors, rely on后端提供字段
    }
  }

  if (!bucket) {
    throw new Error('OSS bucket missing in upload signature')
  }
  signature.bucket = bucket

  const finalRegionValue = signature.region || region

  // 组装 ali-oss 客户端配置
  const clientOptions = {
    accessKeyId: signature.credentials.access_key_id,
    accessKeySecret: signature.credentials.access_key_secret,
    stsToken: signature.credentials.security_token,
    bucket,
    secure: true
  }

  if (finalRegionValue) {
    clientOptions.region = finalRegionValue
  }

  // 根据签名返回的上传域名决定 endpoint 与是否使用自定义域名模式
  if (signature.upload_host) {
    const endpointHost = signature.upload_host.replace(/^https?:\/\//, '')
    if (endpointHost.endsWith('aliyuncs.com')) {
      const bucketPrefix = `${signature.bucket}.`
      clientOptions.endpoint = endpointHost.startsWith(bucketPrefix)
        ? endpointHost.slice(bucketPrefix.length)
        : endpointHost
    } else {
      clientOptions.endpoint = endpointHost
      clientOptions.cname = true
    }
  }

  const client = new OSS(clientOptions)

  // 上传进度回调包装，转为百分比整数
  const options = {
    // 分片大小设为 10MB，只有超出该阈值时才会拆分上传
    partSize: 10 * 1024 * 1024
  }
  if (typeof onProgress === 'function') {
    options.progress = (value) => {
      const percentage = Math.round((value || 0) * 100)
      onProgress(percentage)
    }
  }

  // 发起分片上传并整理返回的访问地址
  const result = await client.multipartUpload(signature.object_key, file, options)
  const requestUrls = result && result.res && Array.isArray(result.res.requestUrls) ? result.res.requestUrls : []
  const uploadedUrl = requestUrls.length ? requestUrls[0].split('?')[0] : (result.url || '')

  return {
    objectKey: signature.object_key,
    uploadedUrl,
    previewUrl: signature.preview_url || uploadedUrl,
    thumbnailUrl: signature.thumbnail_url || null
  }
}
