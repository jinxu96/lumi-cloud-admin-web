# 用户管理 API 文档

## 通用说明
- 基础路径：`/admin-api`
- 认证方式：请求头携带 `Authorization: Bearer {token}`（要求已登录后台并拥有对应权限）
- 返回格式：所有接口均返回下列结构

```json
{
		"success": true,
		"code": 0,
		"message": "获取成功",
		"data": { /* 实际数据 */ }
}
```

## 控制台统计
- **权限标识**：`app-admin.dashboard.stats`
- **接口**：`GET /admin-api/dashboard/stats`
- **说明**：聚合返回控制台卡片所需的统计数据，默认缓存 30 秒。
- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"admin_total": 2,
		"attachment_total": 6,
		"extension_total": 1,
		"auth_group_total": 2,
		"user_total": 132
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.admin_total` | integer | 后台管理员数量 |
| `data.attachment_total` | integer | 附件总数 |
| `data.extension_total` | integer | 已启用扩展数量（`status=1`） |
| `data.auth_group_total` | integer | 管理员分组数量 |
| `data.user_total` | integer | 前台注册用户数量 |

## 控制台趋势分析
- **权限标识**：`app-admin.dashboard.analytics`
- **接口**：`GET /admin-api/dashboard/analytics`
- **说明**：返回控制台图表所需的趋势与榜单数据，可通过 `days` 参数（7-90，默认 30）控制统计范围。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `days` | integer | 否 | 统计天数，默认 `30`，取值范围 `7`-`90` |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"range": {
			"start_date": "2025-12-02",
			"end_date": "2025-12-31",
			"days": 30
		},
		"user_trend": [
			{"date": "2025-12-02", "new_users": 3},
			{"date": "2025-12-03", "new_users": 5}
		],
		"project_trend": [
			{"date": "2025-12-02", "created": 1, "published": 0}
		],
		"top_templates": [
			{"id": 101, "title": "圣诞贺卡", "likes_count": 36, "downloads_count": 124, "published_at": "2025-12-15 08:00:00"}
		],
		"material_usage": [
			{"category_id": 11, "name": "木材", "project_count": 18}
		],
		"material_detail_usage": [
			{"material_id": 101, "material_name": "胡桃木板", "material_code": "WOOD-001", "project_count": 12}
		],
		"machine_usage": [
			{"machine_id": 3, "machine_name": "Lumi X2", "project_count": 22}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.range.start_date` | string | 统计开始日期（含） |
| `data.range.end_date` | string | 统计结束日期（含） |
| `data.range.days` | integer | 实际统计天数 |
| `data.user_trend[]` | array | 用户新增趋势（按天） |
| `data.user_trend[].date` | string | 日期 |
| `data.user_trend[].new_users` | integer | 当天新增前台用户数 |
| `data.project_trend[]` | array | 模板创建/发布趋势（按天） |
| `data.project_trend[].created` | integer | 当天新创建模板数 |
| `data.project_trend[].published` | integer | 当天发布模板数 |
| `data.top_templates[]` | array | 下载量排名前 10 的模板 |
| `data.top_templates[].likes_count` | integer | 点赞总数 |
| `data.top_templates[].downloads_count` | integer | 下载总数 |
| `data.material_usage[]` | array | 材料分类使用榜（按模板数量） |
| `data.material_usage[].project_count` | integer | 使用该分类的模板数量 |
| `data.material_detail_usage[]` | array | 材料使用榜（按模板数量） |
| `data.material_detail_usage[].material_code` | string/null | 材料编码 |
| `data.material_detail_usage[].project_count` | integer | 使用该材料的模板数量 |
| `data.machine_usage[]` | array | 机器使用榜（按模板数量） |
| `data.machine_usage[].machine_id` | integer | 机器 ID |
| `data.machine_usage[].machine_name` | string | 机器名称 |

## 重新生成预览任务（用户）

- **endpoint**: `POST /api/files/{id}/preview`
- **认证**: `Authorization: Bearer {token}` (Sanctum)
- **参数**:
  - Path: `id` (required) 文件ID
  - Body(JSON): `force` (optional boolean) 是否在重新排队前清空已有预览结果，默认为 `false`
- **说明**:
  - 仅文件所有者可以触发。
  - 成功后会将设计预览任务放入队列，前端可结合文件 `preview_status` 轮询最新状态。
- **返回示例**:
```json
{
  "code": 0,
  "message": "预览任务已提交",
  "data": {
    "queued": true
  }
}
```
- **示例**:
```bash
curl -X POST http://localhost:8000/api/files/1/preview \
  -H "Authorization: Bearer {your_api_token}" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

## 后台触发预览任务（域名白名单）

- **endpoint**: `POST /api/admin/files/{id}/preview`
- **访问限制**: 请求域名需命中 `services.admin_panel.allowed_domains` 配置（或 `ADMIN_PANEL_ALLOWED_DOMAINS` 环境变量），无需用户登录。
- **参数**:
  - Path: `id` (required) 文件ID
  - Body(JSON): `force` (optional boolean) 同上，控制是否清空旧预览
- **说明**:
  - 调用前确保文件已上传并支持预览格式。
- **返回示例**:
```json
{
  "code": 0,
  "message": "预览任务已提交",
  "data": {
    "queued": true
  }
}
```
- **示例**:
```bash
curl -X POST https://admin.example.com/api/admin/files/1/preview \
  -H "Content-Type: application/json" \
  -d '{"force": false}'
```

## 用户列表
- **权限标识**：`app-admin.users.index`
- **接口**：`GET /admin-api/users`
- **说明**：按条件分页查询前台用户。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `100` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`（亦兼容 `字段_ASC/字段_DESC`），可选 `id`、`name`、`email`、`created_at`、`updated_at`、`projects_count`、`files_count`、`is_blocked`、`is_project_publish_banned` |
| `keyword` | string | 否 | 模糊搜索（用户名或邮箱） |
| `email_verified` | boolean | 否 | 邮箱是否已验证（`true`/`false`） |
| `has_google` | boolean | 否 | 是否已绑定 Google（`true`/`false`） |
| `is_blocked` | boolean | 否 | 是否只查看被封禁或未封禁用户 |
| `is_project_publish_banned` | boolean | 否 | 是否只查看被禁止发布项目或未被禁止的用户 |
| `created_start` | string | 否 | 创建时间起始（YYYY-MM-DD 或完整 ISO 时间） |
| `created_end` | string | 否 | 创建时间结束 |

- **请求示例**：

```bash
curl -X GET "https://example.com/admin-api/users?limit=10&keyword=john&order=id_DESC" \
	-H "Authorization: Bearer <token>"
```
- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 10,
		"total": 132,
		"list": [
			{
				"id": 1,
				"name": "john",
				"email": "john@example.com",
				"avatar": null,
				"google_id": "1234567890",
				"has_google_binding": true,
				"email_verified": true,
				"email_verified_at": "2025-12-01 08:00:00",
				"is_blocked": false,
				"is_project_publish_banned": false,
				"upload_quota_bytes": 10737418240,
				"upload_quota_mb": 10240,
				"upload_quota_bytes_custom": 10737418240,
				"upload_quota_source": "user",
				"storage_used_bytes": 5242880,
				"storage_used_mb": 5,
				"projects_count": 5,
				"files_count": 12,
				"projects_likes_sum": 36,
				"projects_downloads_sum": 84,
				"created_at": "2025-11-01 10:20:00",
				"updated_at": "2025-12-17 19:21:00"
			},
			{
				"id": 2,
				"name": "alice",
				"email": "alice@example.com",
				"avatar": null,
				"google_id": null,
				"has_google_binding": false,
				"email_verified": false,
				"email_verified_at": null,
				"is_blocked": true,
				"is_project_publish_banned": true,
				"upload_quota_bytes": 8589934592,
				"upload_quota_mb": 8192,
				"upload_quota_bytes_custom": null,
				"upload_quota_source": "config",
				"storage_used_bytes": 8192,
				"storage_used_mb": 0.01,
				"projects_count": 1,
				"files_count": 3,
				"projects_likes_sum": 2,
				"projects_downloads_sum": 5,
				"created_at": "2025-11-05 12:00:00",
				"updated_at": "2025-12-16 09:15:00"
			}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `success` | boolean | 接口调用是否成功 |
| `code` | integer | 业务状态码，`0` 表示成功，其余代表具体错误 |
| `message` | string | 结果描述 |
| `data.start` | integer | 本次列表查询起始偏移量 |
| `data.limit` | integer | 每页数量 |
| `data.total` | integer | 符合条件的用户总数 |
| `data.list[].id` | integer | 用户 ID |
| `data.list[].name` | string | 用户名 |
| `data.list[].email` | string | 邮箱 |
| `data.list[].avatar` | string/null | 头像地址 |
| `data.list[].google_id` | string/null | Google 账号 ID |
| `data.list[].has_google_binding` | boolean | 是否已绑定 Google |
| `data.list[].email_verified` | boolean | 邮箱是否已验证 |
| `data.list[].email_verified_at` | string/null | 邮箱验证时间 |
| `data.list[].is_blocked` | boolean | 是否已被封禁（封禁后不可登录） |
| `data.list[].is_project_publish_banned` | boolean | 是否被禁止发布项目模板 |
| `data.list[].upload_quota_bytes` | integer/null | 实际生效的上传额度（字节），如果配置也为空则返回 null |
| `data.list[].upload_quota_mb` | number/null | 实际生效上传额度（MB），保留两位小数，便于直接展示 |
| `data.list[].upload_quota_bytes_custom` | integer/null | 用户表中的自定义额度，null 表示继承默认值 |
| `data.list[].upload_quota_source` | string | 上传额度来源：`user`（用户自定义）、`config`（系统配置）、`none`（未设置） |
| `data.list[].storage_used_bytes` | integer | 已使用存储（字节） |
| `data.list[].storage_used_mb` | number | 已使用存储（MB），保留两位小数 |
| `data.list[].projects_count` | integer | 用户项目数量 |
| `data.list[].files_count` | integer | 用户上传文件数量 |
| `data.list[].projects_likes_sum` | integer | 用户项目获得点赞总数 |
| `data.list[].projects_downloads_sum` | integer | 用户项目下载总数 |
| `data.list[].created_at` | string | 用户创建时间 |
| `data.list[].updated_at` | string | 最近更新时间 |

## 用户文件列表
- **权限标识**：`app-admin.user-files.index`
- **接口**：`GET /admin-api/users/{userId}/files`
- **说明**：分页查看指定用户的文件，并返回当前空间占用情况。
- **路径参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `userId` | integer | 是 | 用户 ID |

- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `search` | string | 否 | 按原始文件名或备注模糊搜索 |
| `page` | integer | 否 | 页码，默认 `1` |
| `limit` | integer | 否 | 每页数量，默认 `20`，最大 `100` |

- **响应字段补充**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.user` | object | 当前查询对应的用户概要，含 `id`、`name`、`email` |
| `data.page` | integer | 当前页码 |
| `data.limit` | integer | 每页数量 |
| `data.total` | integer | 总记录数 |
| `data.list[].id` | integer | 文件记录 ID |
| `data.list[].original_name` | string/null | 上传时的原始文件名 |
| `data.list[].name` | string | 存储使用的文件名 |
| `data.list[].size` | integer | 文件大小（字节） |
| `data.list[].extension` | string | 统一为小写的文件扩展名 |
| `data.list[].comment` | string/null | 运营备注 |
| `data.list[].created_at` | string/null | 上传时间 |
| `data.list[].updated_at` | string/null | 最近更新时间 |
| `data.list[].download_url` | string/null | 临时下载链接，优先带签名 |
| `data.list[].preview_url` | string/null | 预览链接（若存在） |
| `data.usage.used_bytes` | integer | 已使用空间（字节） |
| `data.usage.quota_bytes` | integer | 当前可用总额度（字节） |
| `data.usage.remaining_bytes` | integer | 剩余空间（字节，最小为 0） |

### 全部用户文件列表
- **权限标识**：`app-admin.user-files.all`
- **接口**：`GET /admin-api/user-files`
- **说明**：跨用户查看全部文件，可按用户或文件关键字过滤。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `user` | string | 否 | 用户名称或邮箱关键字，支持模糊匹配 |
| `user_id` | integer | 否 | 精确指定用户 ID |
| `search` | string | 否 | 文件名称或备注关键字 |
| `page` | integer | 否 | 页码，默认 `1` |
| `limit` | integer | 否 | 每页数量，默认 `20`，最大 `100` |

- **响应字段补充**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.list[].user` | object/null | 所属用户概要，含 `id`、`name`、`email`，若用户已被删除则为 null |

### 获取用户文件直传凭证
- **权限标识**：`app-admin.user-files.signature`
- **接口**：`POST /admin-api/users/{userId}/files/signature`
- **说明**：为指定用户申请 OSS 直传所需的临时凭证，前端拿到数据后可直接向 OSS 上传文件。
- **路径参数**：同“用户文件列表”。
- **请求体字段**（`application/json`）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `file_name` | string | 是 | 原始文件名，用于识别扩展名 |
| `size` | integer | 是 | 文件大小（字节） |
| `extension` | string | 否 | 指定扩展名，需属于响应中的 `allowed_extensions`，留空时自动从 `file_name` 推断 |

- **成功响应**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取上传凭证成功",
	"data": {
		"object_key": "users/xxxx/files/2025/12/uuid.laser",
		"upload_host": "https://bucket.oss-cn-hangzhou.aliyuncs.com",
		"max_size": 104857600,
		"allowed_extensions": ["chb","laser","dxf","svg","png","jpg","jpeg","webp","tif","tiff","pdf"],
		"credentials": {
			"access_key_id": "LTAIxxxx",
			"access_key_secret": "xxxx",
			"security_token": "xxxx",
			"expiration": "2025-12-26T12:30:00Z",
			"duration_seconds": 1800,
			"role_session_name": "lumi-admin"
		}
	}
}
```

- **提示**：
	- 返回的 `object_key` 需原样用于 OSS 直传，禁止修改目录结构。
	- 若返回 `upload_host` 为 `null`，可直接使用 OSS SDK 默认 Endpoint。
	- `allowed_extensions` 为后端实时白名单，前端需据此限制文件上传并在确认接口中填写相同扩展名。
	- 上传前会校验文件大小与剩余配额，若失败请重新申请凭证。

### 确认用户文件直传
- **权限标识**：`app-admin.user-files.complete`
- **接口**：`POST /admin-api/users/{userId}/files/direct-complete`
- **说明**：前端直传成功后调用此接口写入数据库、刷新配额并触发预览任务。
- **路径参数**：同“用户文件列表”。
- **请求体字段**（`application/json`）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `object_key` | string | 是 | OSS 对象路径，需与凭证返回值一致 |
| `original_name` | string | 是 | 上传时的原始文件名 |
| `size` | integer | 是 | 文件大小（字节） |
| `extension` | string | 是 | 文件扩展名，小写，必须在凭证返回的 `allowed_extensions` 中 |
| `comment` | string | 否 | 运营备注，最长 1000 字符 |

- **成功响应**：同“新增用户文件”接口。
- **提示**：
	- 接口会校验 `object_key` 是否属于当前用户并确认 OSS 上已存在该文件。
	- 同一 `object_key` 重复请求会直接返回既有记录。

## 新增用户文件
- **权限标识**：`app-admin.user-files.store`
- **接口**：`POST /admin-api/users/{userId}/files`
- **说明**：为指定用户上传文件，接口会自动校验空间配额并记录文件信息。
- **请求方式**：`multipart/form-data`
- **路径参数**：同“用户文件列表”。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `file` | file | 是 | 待上传文件，遵循文件类型白名单与大小限制 |
| `comment` | string | 否 | 备注信息，最长 1000 字符 |

- **成功响应**：返回与“用户文件列表”单项一致的结构。
- **额外说明**：
	- 当上传扩展名为 `.laser` 的文件时，接口在保存成功后会自动调用前台提供的 `/api/admin/files/{id}/preview` 以重新排队生成预览；若调用失败会记录日志但不影响本次上传结果。
- **失败场景**：
	- 上传类型不在白名单或缺少扩展名。
	- 文件尺寸超过后台配置的单文件上限。
	- 用户剩余空间不足（将返回提示信息）。

## 替换或备注用户文件
- **权限标识**：`app-admin.user-files.update`
- **接口**：`PUT /admin-api/user-files/{id}` 或 `PATCH /admin-api/user-files/{id}`
- **说明**：可仅更新备注，也可以重新上传文件覆盖原文件，系统会同步调整用户配额。
- **路径参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `id` | integer | 是 | 文件记录 ID |

- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `file` | file | 否 | 新文件，上传后会删除旧文件并重新统计配额 |
| `comment` | string | 否 | 备注信息，最长 1000 字符 |

- **响应**：返回最新的文件信息（同列表结构）。
- **提示**：
	- 若只提交 `comment`，文件内容保持不变。
	- 当提交新文件时，接口会先释放旧文件占用空间，再写入新文件并更新配额。

## 删除用户文件
- **权限标识**：`app-admin.user-files.destroy`
- **接口**：`DELETE /admin-api/user-files/{id}`
- **说明**：删除文件记录，并清理 OSS 存储与用户配额占用。
- **路径参数**：同“替换或备注用户文件”。
- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "删除成功",
	"data": []
}
```

## 用户详情
- **权限标识**：`app-admin.users.show`
- **接口**：`GET /admin-api/users/{id}`
- **说明**：查询单个用户基础信息和最近动态。
- **路径参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `id` | integer | 是 | 用户 ID |

- **请求示例**：

```bash
curl -X GET "https://example.com/admin-api/users/1" \
	 -H "Authorization: Bearer <token>"
```

- **成功响应示例**：
```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"id": 1,
		"name": "john",
		"email": "john@example.com",
		"avatar": null,
		"google_id": "1234567890",
		"has_google_binding": true,
		"email_verified": true,
		"email_verified_at": "2025-12-01 08:00:00",
		"is_blocked": false,
		"is_project_publish_banned": false,
		"upload_quota_bytes": 10737418240,
		"upload_quota_mb": 10240,
		"upload_quota_bytes_custom": 10737418240,
		"upload_quota_source": "user",
		"storage_used_bytes": 5242880,
		"storage_used_mb": 5,
		"projects_count": 5,
		"files_count": 12,
		"projects_likes_sum": 36,
		"projects_downloads_sum": 84,
		"created_at": "2025-11-01 10:20:00",
		"updated_at": "2025-12-17 19:21:00",
		"stats": {
			"projects_count": 5,
			"files_count": 12,
			"projects_likes_sum": 36,
			"projects_downloads_sum": 84
		},
		"recent_projects": [
			{
				"id": 101,
				"title": "项目 A",
				"status": "published",
				"cover_url": null,
				"likes_count": 10,
				"downloads_count": 20,
				"published_at": "2025-12-01 09:00:00",
				"created_at": "2025-11-20 09:00:00",
				"updated_at": "2025-12-15 09:00:00",
				"deleted_at": null
			}
		],
		"recent_files": [
			{
				"id": 501,
				"name": "upload-1734500000.stl",
				"original_name": "demo.stl",
				"path": "files/2025/12/demo.stl",
				"preview_path": null,
				"preview_disk": null,
				"preview_generated_at": null,
				"mime_type": "application/sla",
				"size": 5242880,
				"created_at": "2025-12-17 09:00:00",
				"updated_at": "2025-12-17 09:00:00"
			}
		]
		,
		"latest_restrictions": {
			"account_block": {
				"reason": "涉嫌刷量",
				"banned_at": "2026-01-12 10:00:00",
				"expires_at": null,
				"is_permanent": true,
				"active": false,
				"banned_by": {"id": "uuid-xxx", "name": "Admin"},
				"unbanned_at": "2026-01-13 10:00:00",
				"unbanned_by": {"id": "uuid-yyy", "name": "Admin2"},
				"unban_reason": "核查后恢复"
			},
			"project_publish_ban": {
				"reason": "内容质量不达标",
				"banned_at": "2026-01-12 11:00:00",
				"expires_at": "2026-01-19 11:00:00",
				"is_permanent": false,
				"active": true,
				"banned_by": {"id": "uuid-xxx", "name": "Admin"},
				"unbanned_at": null,
				"unbanned_by": null,
				"unban_reason": null
			}
		}
	}
}
```
- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.id` | integer | 用户 ID |
| `data.name` | string | 用户名 |
| `data.email` | string | 邮箱 |
| `data.avatar` | string/null | 头像地址 |
| `data.google_id` | string/null | Google 账号 ID |
| `data.has_google_binding` | boolean | 是否已绑定 Google |
| `data.email_verified` | boolean | 邮箱是否已验证 |
| `data.email_verified_at` | string/null | 邮箱验证时间 |
| `data.is_blocked` | boolean | 是否被封禁（封禁后后端会清理 Token） |
| `data.is_project_publish_banned` | boolean | 是否被禁止发布项目模板 |
| `data.upload_quota_bytes` | integer/null | 实际生效的上传额度（字节），若系统与用户均未设置则为 null |
| `data.upload_quota_mb` | number/null | 实际生效上传额度（MB，保留两位） |
| `data.upload_quota_bytes_custom` | integer/null | 用户表中的自定义额度，null 表示继承默认值 |
| `data.upload_quota_source` | string | 上传额度来源：`user` / `config` / `none` |
| `data.storage_used_bytes` | integer | 已使用存储（字节） |
| `data.storage_used_mb` | number | 已使用存储（MB，保留两位） |
| `data.projects_count` | integer | 项目数量（含软删除） |
| `data.files_count` | integer | 上传文件数量 |
| `data.projects_likes_sum` | integer | 项目获得的点赞总数 |
| `data.projects_downloads_sum` | integer | 项目下载总数 |
| `data.stats.*` | 同上 | 与列表统计一致，用于前端展示 |
| `data.recent_projects` | array | 最近 5 个项目，已按更新时间倒序 |
| `data.recent_files` | array | 最近 5 次上传文件 |
| `data.latest_restrictions` | object | 最近一次限制摘要集合 |
| `data.latest_restrictions.account_block` | object/null | 最近一次账号封禁（可能为 null） |
| `data.latest_restrictions.project_publish_ban` | object/null | 最近一次禁发项目（可能为 null） |
| `*.reason` | string | 原因描述 |
| `*.banned_at` | string | 开始时间 |
| `*.expires_at` | string/null | 到期时间，null 表示永久 |
| `*.is_permanent` | boolean | 是否永久 |
| `*.active` | boolean | 是否仍在生效 |
| `*.banned_by` | object/null | 操作管理员概要，含 `id`、`name` |
| `*.unbanned_at` | string/null | 解除时间 |
| `*.unbanned_by` | object/null | 解除管理员概要 |
| `*.unban_reason` | string/null | 解除原因 |

## 用户文件下载
- **权限标识**：`app-admin.user-files.download`
- **接口**：`GET /admin-api/user-files/{id}/download`
- **说明**：后台获取指定用户上传文件的下载（与预览）链接，返回签名 URL 以满足 OSS 强制下载需求。
- **路径参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `id` | integer | 是 | files 表记录 ID |

- **响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取下载链接成功",
	"data": {
		"url": "https://oss-example.aliyuncs.com/users/xxxx?X-Oss-Signature=...",
		"filename": "demo.svg",
		"preview_url": "https://cdn.example.com/users/xxxx"
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.url` | string | 已附带 `Content-Disposition=attachment` 的临时签名 URL，直接触发浏览器下载 |
| `data.filename` | string | 建议保存的文件名，前端可作为下载文件名或展示用 |
| `data.preview_url` | string/null | 可选预览地址，若下载 URL 生成失败会回退到此地址 |

## 更新用户信息
- **权限标识**：`app-admin.users.update`
- **接口**：`PUT /admin-api/users/{id}`
- **说明**：修改用户基础资料（需要“编辑用户”权限）。
- **路径参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `id` | integer | 是 | 用户 ID |

- **请求体字段**（全部为可选，按需提交）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `name` | string | 否 | 用户名，最大 255 字符 |
| `email` | string | 否 | 邮箱，唯一且最大 255 字符 |
| `avatar` | string | 否 | 头像地址，最大 512 字符 |
| `upload_quota_bytes` | integer/null | 否 | 上传额度（字节），null 表示使用系统默认值 |
| `email_verified` | boolean | 否 | 是否将邮箱标记为已验证 |
| `is_blocked` | boolean | 否 | 是否封禁账号，设为 `true` 时会立即清理现有 Token |
| `is_project_publish_banned` | boolean | 否 | 是否禁止发布项目模板 |

- **请求示例**：

```bash
curl -X PUT "https://example.com/admin-api/users/1" \
	 -H "Authorization: Bearer <token>" \
	 -H "Content-Type: application/json" \
	 -d '{
		 "name": "John Doe",
		 "email": "john.doe@example.com",
		 "email_verified": true,
		 "upload_quota_bytes": 2147483648
	 }'
```

- **成功响应示例**：同“用户列表”单项结构，并附带 `stats`。

> **提示**：当 `is_blocked` 从 `false` 调整为 `true` 时，系统会立即清理用户现有的 Sanctum Token，确保封禁即时生效。

## 重置用户密码
- **权限标识**：`app-admin.users.password`
- **接口**：`PATCH /admin-api/users/{id}/password`
- **说明**：运营人员为用户重置密码，成功后旧 token 将失效。
- **路径参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `id` | integer | 是 | 用户 ID |

- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `password` | string | 是 | 新密码，长度 8~128 |
| `password_confirmation` | string | 否 | 确认密码，如提供需与 `password` 相同 |

- **请求示例**：

```bash
curl -X PATCH "https://example.com/admin-api/users/1/password" \
	 -H "Authorization: Bearer <token>" \
	 -H "Content-Type: application/json" \
	 -d '{
		 "password": "NewPassw0rd",
		 "password_confirmation": "NewPassw0rd"
	 }'
```

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "密码已重置",
	"data": []
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `message` | string | 固定为“密码已重置” |
| `data` | array | 空数组 |

> 提示：密码重置后将删除该用户的所有 Sanctum Token，需要重新登录。

## 禁止用户发布项目模板
- **权限标识**：`app-admin.users.forbid-project-publish`
- **接口**：`POST /admin-api/users/{id}/project-publish/forbid`
- **说明**：禁止指定用户发布新的项目模板。
- **路径参数**：同“更新用户信息”。
- **请求体**（JSON）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `reason` | string | 是 | 限制原因，最大 500 字符 |
| `expires_at` | string | 否 | 到期时间（ISO/日期），留空表示永久 |
- **成功响应**：同“用户列表”单项结构，并附带 `stats`。
- **提示**：
	- 接口幂等，若用户已处于禁止状态会直接返回当前信息。
	- 成功后操作日志会记录限制原因，前台需根据 `is_project_publish_banned` 控制发布入口。

## 解除项目发布限制
- **权限标识**：`app-admin.users.allow-project-publish`
- **接口**：`POST /admin-api/users/{id}/project-publish/allow`
- **说明**：解除项目发布限制，让用户可再次提交项目模板。
- **路径参数**：同“更新用户信息”。
- **请求体**（JSON）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `reason` | string | 是 | 解除原因，最大 500 字符 |
- **成功响应**：同“用户列表”单项结构，并附带 `stats`。
- **提示**：
	- 接口幂等，若用户本就未被限制会直接返回当前信息。
	- 日志会记录解除操作，便于事后审计。

## 封禁用户
- **权限标识**：`app-admin.users.block`
- **接口**：`POST /admin-api/users/{id}/block`
- **说明**：一键封禁用户账号，并清理现有登录令牌。
- **路径参数**：同“更新用户信息”。
- **请求体**（JSON）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `reason` | string | 是 | 封禁原因，最大 500 字符 |
| `expires_at` | string | 否 | 到期时间（ISO/日期），留空表示永久 |
- **成功响应**：同“用户列表”单项结构，并附带 `stats`。
- **提示**：
	- 接口幂等，多次封禁已停用的用户会返回当前状态。
	- 成功后系统会记录操作日志并清理所有 Sanctum Token，确保封禁即时生效。

## 解除用户封禁
- **权限标识**：`app-admin.users.unblock`
- **接口**：`POST /admin-api/users/{id}/unblock`
- **说明**：解除封禁，让用户恢复登录权限。
- **路径参数**：同“更新用户信息”。
- **请求体**（JSON）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `reason` | string | 是 | 解除封禁原因，最大 500 字符 |
- **成功响应**：同“用户列表”单项结构，并附带 `stats`。
- **提示**：
	- 接口幂等，若用户当前未封禁会直接返回当前状态。
	- 操作日志会记录解除封禁的行为，便于追溯。

# 机器管理 API

## 机器列表
- **权限标识**：`app-admin.machines.index`
- **接口**：`GET /admin-api/machines`
- **说明**：分页查询可用机器，支持按关键字与启用状态过滤。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `100` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`name`、`slug`、`brand`、`sort_order`、`created_at`、`updated_at` |
| `keyword` | string | 否 | 模糊搜索（名称、slug、品牌） |
| `is_active` | boolean | 否 | 按启用状态过滤（`true`/`false`/`1`/`0` 等） |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 2,
		"list": [
			{
				"id": 1,
				"name": "LumiMaker X1",
				"slug": "lumimaker-x1",
				"brand": "Lumi",
				"icon_url": "https://cdn.example.com/machines/x1.png",
				"description": "入门级桌面激光机",
				"is_active": true,
				"sort_order": 1,
				"modules_count": 2,
				"created_at": "2025-12-15 09:00:00",
				"updated_at": "2025-12-18 11:20:00"
			}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.list[].slug` | string | 机器唯一标识，创建时保证唯一，支持字母、数字、`-`、`_` |
| `data.list[].brand` | string/null | 品牌名称 |
| `data.list[].icon_url` | string/null | 展示图片地址 |
| `data.list[].description` | string/null | 机器描述 |
| `data.list[].is_active` | boolean | 是否启用 |
| `data.list[].sort_order` | integer | 排序值，越小越靠前 |
| `data.list[].modules_count` | integer | 该机器下的模块数量 |

## 新增机器
- **权限标识**：`app-admin.machines.store`
- **接口**：`POST /admin-api/machines`
- **说明**：创建新的机器记录。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `name` | string | 是 | 机器名称，最大 120 字符 |
| `slug` | string | 是 | 机器标识，最大 120 字符，仅允许字母、数字、`-`、`_`，需保持唯一 |
| `brand` | string | 否 | 品牌名称，最大 60 字符 |
| `icon_url` | string | 否 | 展示图片地址，最大 512 字符（若上传文件可忽略） |
| `icon` | file | 否 | 展示图片文件，`multipart/form-data` 上传，大小约 5 MB 内 |
| `description` | string | 否 | 机器描述 |
| `is_active` | boolean | 否 | 是否启用，默认 `true` |
| `sort_order` | integer | 否 | 排序值，默认 `0` |

- **成功响应**：返回与“机器列表”单项一致的结构；如本次上传了图片，会额外返回 `attachment_id`。

## 机器详情
- **权限标识**：`app-admin.machines.show`
- **接口**：`GET /admin-api/machines/{id}`
- **说明**：查看机器详情及其下模块、加工配置。
- **路径参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `id` | integer | 是 | 机器 ID |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"id": 1,
		"name": "LumiMaker X1",
		"slug": "lumimaker-x1",
		"brand": "Lumi",
		"icon_url": "https://cdn.example.com/machines/x1.png",
		"description": "入门级桌面激光机",
		"is_active": true,
		"sort_order": 1,
		"modules_count": 2,
		"created_at": "2025-12-15 09:00:00",
		"updated_at": "2025-12-18 11:20:00",
		"modules": [
			{
				"id": 11,
				"name": "蓝光 10W 模块",
				"power_watt": 10000,
				"color_hex": "#1E90FF",
				"description": "默认激光头",
				"is_active": true,
				"sort_order": 1,
				"profiles": [
					{
						"id": 101,
						"processing_module": "laser",
						"processing_mode": "vector",
						"process_type": "cut",
						"power_watt": 10000,
						"sort_order": 1
					}
				]
			}
		]
	}
}
```

- **额外字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `modules[].color_hex` | string/null | UI 展示颜色，统一为 `#RRGGBB` |
| `modules[].profiles` | array | 关联加工配置列表 |
| `modules[].profiles[].processing_module` | string/null | 加工模块（如 `laser`、`blade`） |
| `modules[].profiles[].processing_mode` | string/null | 加工模式（如 `vector`、`raster`） |
| `modules[].profiles[].process_type` | string/null | 加工类型（如 `cut`、`engrave`） |

## 更新机器
- **权限标识**：`app-admin.machines.update`
- **接口**：`PUT /admin-api/machines/{id}` 或 `PATCH /admin-api/machines/{id}`
- **说明**：修改机器基础信息，字段同“新增机器”，均为可选。
- **注意**：当提交的值与原值一致时，接口会返回“无需更新”以提示前端无需刷新。

## 启用/禁用机器
- **权限标识**：`app-admin.machines.status`
- **接口**：`PATCH /admin-api/machines/{id}/status`
- **说明**：仅调整机器的启用状态，适用于需要单独权限控制的场景。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `is_active` | boolean | 是 | `true` 表示启用，`false` 表示停用 |

- **响应**：返回更新后的机器信息，结构同“机器列表”单项。

## 上传机器图片
- **权限标识**：`app-admin.machines.icon`
- **接口**：`POST /admin-api/machines/{id}/icon`
- **说明**：上传新的机器展示图，并同步更新机器 `icon_url`。
- **请求方式**：`multipart/form-data`
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `file` | file | 是 | 需上传的图片文件，最大约 5 MB |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "上传成功",
	"data": {
		"attachment_id": "2d9c2a5c-1d84-4f8e-9d4f-8b3c8f5e1234",
		"icon_url": "https://cdn.example.com/machines/x1.png",
		"machine": {
			"id": 1,
			"name": "LumiMaker X1",
			"icon_url": "https://cdn.example.com/machines/x1.png",
			"is_active": true,
			"modules_count": 2
		}
	}
}
```

## 删除机器
- **权限标识**：`app-admin.machines.destroy`
- **接口**：`DELETE /admin-api/machines/{id}`
- **说明**：删除机器前需确保无关联模块，否则会提示“请先删除或迁移该机器下的模块”。

# 机器模块 API

## 模块列表
- **权限标识**：`app-admin.machine-modules.index`
- **接口**：`GET /admin-api/machine-modules`
- **说明**：分页查询机器模块，可按机器、关键字、启用状态过滤。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `100` |
| `machine_id` | integer | 否 | 仅查看指定机器下的模块 |
| `keyword` | string | 否 | 模块名称或描述模糊搜索 |
| `is_active` | boolean | 否 | 启用状态过滤 |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`name`、`power_watt`、`sort_order`、`created_at`、`updated_at` |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 3,
		"list": [
			{
				"id": 11,
				"machine_id": 1,
				"machine": {
					"id": 1,
					"name": "LumiMaker X1",
					"slug": "lumimaker-x1"
				},
				"name": "蓝光 10W 模块",
				"power_watt": 10000,
				"color_hex": "#1E90FF",
				"icon_url": "https://cdn.example.com/modules/laser.png",
				"description": "默认激光头",
				"is_active": true,
				"sort_order": 1,
				"profiles_count": 4,
				"created_at": "2025-12-15 09:10:00",
				"updated_at": "2025-12-18 11:20:00"
			}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.list[].machine` | object/null | 包含 `id`、`name`、`slug` 的机器概要信息 |
| `data.list[].power_watt` | integer/null | 模块功率（瓦），为空表示未设置固定功率 |
| `data.list[].color_hex` | string/null | UI 展示颜色，统一输出为 `#RRGGBB` |
| `data.list[].profiles_count` | integer | 关联加工配置数量 |

## 新增模块
- **权限标识**：`app-admin.machine-modules.store`
- **接口**：`POST /admin-api/machine-modules`
- **说明**：创建机器模块，模块名称在同一机器内需唯一。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `machine_id` | integer | 是 | 所属机器 ID，需存在 |
| `name` | string | 是 | 模块名称，最大 120 字符，在同一机器内唯一 |
| `power_watt` | integer | 否 | 模块功率（瓦），范围 `1`~`200000` |
| `color_hex` | string | 否 | 展示颜色，支持 `#RRGGBB` 或不带 `#` 的六位十六进制 |
| `description` | string | 否 | 模块描述 |
| `is_active` | boolean | 否 | 是否启用，默认 `true` |
| `sort_order` | integer | 否 | 排序值，默认 `0` |

- **成功响应**：返回与“模块列表”单项一致的结构。

## 模块详情
- **权限标识**：`app-admin.machine-modules.show`
- **接口**：`GET /admin-api/machine-modules/{id}`
- **说明**：查看模块详情及加工配置。
- **路径参数**：与“机器详情”类似，`id` 为模块 ID。
- **响应字段**：在列表字段基础上新增 `profiles` 数组，结构同“机器详情”中的模块配置说明。

## 更新模块
- **权限标识**：`app-admin.machine-modules.update`
- **接口**：`PUT /admin-api/machine-modules/{id}` 或 `PATCH /admin-api/machine-modules/{id}`
- **说明**：修改模块信息，字段同“新增模块”，均为可选；当更新颜色时支持自动补全 `#` 并转大写。

## 启用/禁用模块
- **权限标识**：`app-admin.machine-modules.status`
- **接口**：`PATCH /admin-api/machine-modules/{id}/status`
- **说明**：仅调整模块的启用状态，可单独授权。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `is_active` | boolean | 是 | `true` 表示启用，`false` 表示停用 |

- **响应**：返回更新后的模块信息，结构同“模块列表”单项。

## 删除模块
- **权限标识**：`app-admin.machine-modules.destroy`
- **接口**：`DELETE /admin-api/machine-modules/{id}`
- **说明**：删除前需确保无关联加工配置，否则会提示“请先删除该模块下的加工配置”。

## 机器模块加工方案列表
- **权限标识**：`app-admin.machine-module-profiles.index`
- **接口**：`GET /admin-api/machine-module-profiles`
- **说明**：分页查询机器模块下的加工方案组合，可按机器、模块、加工类型筛选。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，支持 `id`、`machine_module_id`、`process_type`、`power_watt`、`sort_order`、`created_at`、`updated_at` |
| `machine_module_id` | integer | 否 | 筛选指定机器模块下的方案 |
| `machine_id` | integer | 否 | 筛选指定机器下的方案 |
| `processing_module` | string | 否 | 精确匹配处理模块标识（如 `laser`） |
| `processing_mode` | string | 否 | 精确匹配处理模式（如 `vector`、`raster`） |
| `process_type` | string | 否 | 精确匹配处理类型（如 `cut`、`engrave`） |
| `keyword` | string | 否 | 模糊查询 `processing_module`、`processing_mode`、`process_type` |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 3,
		"list": [
			{
				"id": 301,
				"machine_module_id": 23,
				"processing_module": "laser",
				"processing_mode": "vector",
				"process_type": "cut",
				"power_watt": 10000,
				"sort_order": 10,
				"created_at": "2025-12-18 10:00:00",
				"updated_at": "2025-12-21 11:45:00",
				"machine_module": {
					"id": 23,
					"name": "蓝光 10W 模块",
					"power_watt": 10000,
					"machine": {
						"id": 14,
						"name": "LumiMaker X1",
						"slug": "lumimaker-x1"
					}
				}
			}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.list[].processing_module` | string | 处理模块标识，例如 `laser` |
| `data.list[].processing_mode` | string/null | 处理模式，例如矢量、灰度等 |
| `data.list[].process_type` | string/null | 处理类型，如切割、雕刻 |
| `data.list[].power_watt` | integer/null | 对应模块的额定功率 |
| `data.list[].machine_module` | object/null | 所属机器模块信息，若为空表示尚未绑定模块 |
| `data.list[].machine_module.machine` | object/null | 模块所属的机器信息 |

## 新增加工方案
- **权限标识**：`app-admin.machine-module-profiles.store`
- **接口**：`POST /admin-api/machine-module-profiles`
- **说明**：给指定机器模块新增一条加工方案；同一模块下，相同的“加工模块 + 加工模式 + 加工类型 + 功率”组合不可重复。
- **请求方式**：`application/json`
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `machine_module_id` | integer | 是 | 目标机器模块 ID |
| `processing_module` | string | 是 | 处理模块标识（如 `laser`、`blade`） |
| `processing_mode` | string | 否 | 处理模式（如 `vector`、`raster`），留空表示无需区分 |
| `process_type` | string | 否 | 处理类型（如 `cut`、`engrave`） |
| `power_watt` | integer | 否 | 功率（瓦），默认沿用模块自身功率 |
| `sort_order` | integer | 否 | 排序值，默认 `0` |

- **成功响应**：返回与“加工方案列表”单项一致的结构。

## 加工方案详情
- **权限标识**：`app-admin.machine-module-profiles.show`
- **接口**：`GET /admin-api/machine-module-profiles/{id}`
- **说明**：查询单条加工方案详情，响应结构同列表项。

## 编辑加工方案
- **权限标识**：`app-admin.machine-module-profiles.update`
- **接口**：`PUT /admin-api/machine-module-profiles/{id}` 或 `PATCH /admin-api/machine-module-profiles/{id}`
- **说明**：更新加工方案的核心参数及排序；如需切换模块，确保新模块已存在。
- **请求体字段**：与“新增加工方案”一致，但均为可选字段；未提交的字段保持原值。
- **提示**：如果修改后的“模块 + 模式 + 类型 + 功率”组合已存在，接口会返回错误提示。

## 删除加工方案
- **权限标识**：`app-admin.machine-module-profiles.destroy`
- **接口**：`DELETE /admin-api/machine-module-profiles/{id}`
- **说明**：删除加工方案，删除后与材料加工配置的关联将失效，请确认未被引用再执行。

## 导入机器模块配置
- **权限标识**：`app-admin.machine-modules.import`
- **接口**：`POST /admin-api/machine-modules/import`
- **说明**：批量导入机器、模块与加工配置，需上传官方模板填写完成的文件；模板中的“模块功率(W)”需填写单个数值，不可留空。
- **请求方式**：`multipart/form-data`
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `file` | file | 是 | 填写完成的导入模板（支持 CSV、XLSX），第一列以 `#` 开头的行会被视为注释 |

- **请求示例**：

```bash
curl -X POST "https://example.com/admin-api/machine-modules/import" \
	-H "Authorization: Bearer <token>" \
	-F "file=@/path/to/machine_module_import_template.xlsx"
```

- **成功响应**：

```json
{
	"success": true,
	"code": 0,
	"message": "导入完成",
	"data": {
		"stats": {
			"total_rows": 25,
			"machines_created": 1,
			"machines_updated": 2,
			"modules_created": 5,
			"modules_updated": 3,
			"profiles_created": 12,
			"profiles_updated": 4
		},
		"errors": []
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `stats.total_rows` | integer | 有效数据行数（不含注释行） |
| `stats.*_created`/`stats.*_updated` | integer | 各模型的新增或更新数量 |
| `errors` | array | 导入失败的错误列表（若为空表示全部成功） |

## 导出机器模块配置
- **权限标识**：`app-admin.machine-modules.export`
- **接口**：`GET /admin-api/machine-modules/export`
- **说明**：导出当前机器、模块与加工配置，生成 XLSX 文件。
- **请求示例**：

```bash
curl -X GET "https://example.com/admin-api/machine-modules/export" \
	-H "Authorization: Bearer <token>" -OJ
```

- **响应**：返回二进制 Excel 文件，文件名默认为 `machine_modules_YYYYMMDD_HHMMSS.xlsx`。

## 下载机器模块导入模板
- **权限标识**：`app-admin.machine-modules.template`
- **接口**：`GET /admin-api/machine-modules/template`
- **说明**：下载官方提供的机器模块导入 CSV 模板。
- **请求示例**：

```bash
curl -X GET "https://example.com/admin-api/machine-modules/template" \
	-H "Authorization: Bearer <token>" -OJ
```

- **响应**：返回 `machine_module_import_template.csv` 文件。


# 材料管理 API

## 材料分类列表
- **权限标识**：`app-admin.material-categories.index`
- **接口**：`GET /admin-api/material-categories`
- **说明**：分页查询材料分类信息，支持关键词模糊搜索，默认按排序值升序。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`name`、`sort_order`、`created_at`、`updated_at` |
| `keyword` | string | 否 | 模糊搜索分类名称和描述 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 3,
		"list": [
			{
				"id": 11,
				"name": "木材",
				"description": "常见木材材料",
				"icon_url": "https://static.example.com/icons/material-wood.png",
				"sort_order": 10,
				"created_at": "2025-01-10 09:30:00",
				"updated_at": "2025-01-15 14:05:00"
			}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.list[].name` | string | 分类名称 |
| `data.list[].description` | string/null | 分类描述 |
| `data.list[].icon_url` | string/null | 分类图标 URL |
| `data.list[].sort_order` | integer | 排序权重，数值越小越靠前 |

## 新增材料分类
- **权限标识**：`app-admin.material-categories.store`
- **接口**：`POST /admin-api/material-categories`
- **说明**：创建材料分类，用于在材料列表中引用。
- **请求体字段**（`application/json`）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `name` | string | 是 | 分类名称，最大 120 字符 |
| `description` | string | 否 | 分类描述，最大 255 字符 |
| `icon_url` | string | 否 | 分类图标 URL，最大 512 字符 |
| `sort_order` | integer | 否 | 排序值，默认 `0` |

- **成功响应**：返回材料分类详情结构。

## 材料分类详情
- **权限标识**：`app-admin.material-categories.show`
- **接口**：`GET /admin-api/material-categories/{id}`
- **说明**：查询材料分类的基础信息。
- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"id": 11,
		"name": "木材",
		"description": "常见木材材料",
		"icon_url": "https://static.example.com/icons/material-wood.png",
		"sort_order": 10,
		"created_at": "2025-01-10 09:30:00",
		"updated_at": "2025-01-15 14:05:00"
	}
}
```

## 更新材料分类
- **权限标识**：`app-admin.material-categories.update`
- **接口**：`PUT /admin-api/material-categories/{id}`
- **说明**：更新材料分类的名称、描述或排序值。
- **请求体字段**（`application/json`，至少提交一个字段）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `name` | string | 否 | 分类名称，最大 120 字符 |
| `description` | string | 否 | 分类描述，最大 255 字符 |
| `icon_url` | string | 否 | 分类图标 URL，最大 512 字符 |
| `sort_order` | integer | 否 | 排序值 |

- **成功响应**：返回更新后的材料分类详情结构。

## 删除材料分类
- **权限标识**：`app-admin.material-categories.destroy`
- **接口**：`DELETE /admin-api/material-categories/{id}`
- **说明**：删除指定的材料分类；删除前请确保没有材料引用该分类，以免造成数据不一致。
- **成功响应**：

```json
{
	"success": true,
	"code": 0,
	"message": "删除成功"
}
```

## 材料列表
- **权限标识**：`app-admin.materials.index`
- **接口**：`GET /admin-api/materials`
- **说明**：分页查询材料基础信息，支持关键字、分类、品牌、启用状态、公开状态和关联模块过滤。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`name`、`material_code`、`sku_code`、`material_category_id`、`brand`、`thickness_mm`、`sort_order`、`created_at`、`updated_at` |
| `keyword` | string | 否 | 模糊查询材料名称、物料编码或 SKU |
| `material_category_id` | integer | 否 | 按材料分类 ID 精确筛选 |
| `category` | string | 否 | **兼容字段**：按分类名称精确筛选（建议改用 `material_category_id`） |
| `brand` | string | 否 | 精确匹配品牌 |
| `is_active` | boolean/string | 否 | 是否启用，接受 `true`/`false`/`1`/`0` 等值 |
| `is_public` | boolean/string | 否 | 是否在材料库对外公开 |
| `machine_module_id` | integer | 否 | 仅筛选绑定了指定机器模块的材料 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 36,
		"list": [
			{
				"id": 101,
				"name": "柚木板",
				"material_code": "WOOD-TEAK-3MM",
				"sku_code": "SKU-8810",
				"material_category_id": 6,
				"category": "木材",
				"material_category": {
					"id": 6,
					"name": "木材",
					"description": "常规木质材料",
					"sort_order": 10
				},
				"brand": "Lumi",
				"spec": "300×500×3mm",
				"thickness_mm": 3,
				"color": "棕色",
				"description": "适用于激光雕刻与轻度切割",
				"cover_url": "https://cdn.example.com/materials/wood-teak.png",
				"is_active": true,
				"is_public": true,
				"sort_order": 5,
				"package_contents": [],
				"tags": ["wood", "engrave"],
				"warnings": [],
				"processing_profiles_count": 4,
				"media_count": 2,
				"created_at": "2025-12-18 09:00:00",
				"updated_at": "2025-12-21 10:30:00"
			}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.list[].material_code` | string/null | 材料编号，供导入导出或仓储系统使用 |
| `data.list[].sku_code` | string/null | SKU 码，便于与商城对接 |
| `data.list[].material_category_id` | integer/null | 材料所属分类 ID，未绑定分类时返回 `null` |
| `data.list[].category` | string/null | 材料分类名称，兼容旧字段 |
| `data.list[].material_category` | object/null | 分类详情，包含 `id`、`name`、`description`、`sort_order` |
| `data.list[].spec` | string/null | 规格描述或尺寸 |
| `data.list[].thickness_mm` | number/null | 厚度（毫米），精度保留到小数位 |
| `data.list[].package_contents` | array | 套装内包含的物件列表（JSON 数组） |
| `data.list[].tags` | array | 标签集合（JSON 数组） |
| `data.list[].warnings` | array | 来自 `extra.warnings` 的安全提示列表 |
| `data.list[].processing_profiles_count` | integer | 已配置的加工参数数量 |
| `data.list[].media_count` | integer | 已关联的媒体资源数量 |

## 新增材料
- **权限标识**：`app-admin.materials.store`
- **接口**：`POST /admin-api/materials`
- **说明**：创建材料基础档案，可同时上传封面图片。
- **请求方式**：`multipart/form-data`
- **请求体字段**（除 `name` 外均为可选）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `name` | string | 是 | 材料名称，最大 120 字符 |
| `material_code` | string | 否 | 材料编号，最大 60 字符，建议唯一 |
| `sku_code` | string | 否 | SKU 码，最大 60 字符 |
| `material_category_id` | integer | 否 | 材料分类 ID，需先在“材料分类”模块创建 |
| `category` | string | 否 | **兼容字段**：分类名称（仅保留读取，建议改用 `material_category_id`） |
| `brand` | string | 否 | 品牌名称，最大 60 字符 |
| `spec` | string | 否 | 规格描述，最大 120 字符 |
| `thickness_mm` | number | 否 | 材料厚度（毫米），范围 `0~1000` |
| `color` | string | 否 | 颜色描述，最大 60 字符 |
| `description` | string | 否 | 详细描述 |
| `package_contents` | array/json | 否 | 套装内容（JSON 数组或字符串） |
| `tags` | array/json | 否 | 标签列表 |
| `extra` | object/json | 否 | 自定义扩展字段（JSON 对象） |
| `is_active` | boolean | 否 | 是否启用，默认 `true` |
| `is_public` | boolean | 否 | 是否公开，默认 `true` |
| `sort_order` | integer | 否 | 排序值，默认 `0` |
| `cover` | file | 否 | 封面图片，大小不超过 5 MB，支持常见图片格式 |

- **成功响应**：返回材料列表单项结构；如上传封面会额外附带 `attachment_id` 方便前端追踪附件记录。

## 解绑材料机器模块
- **权限标识**：`app-admin.materials.detach-modules`
- **接口**：`DELETE /admin-api/materials/{id}/machine-modules`
- **说明**：移除材料与所有或指定机器模块的关联，同时清理关联的加工配置。
- **请求参数**（Query，可选）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `machine_module_id` | integer | 否 | 指定仅解绑某个机器模块；不填表示解绑全部关联 |

- **成功响应**：

```json
{
	"success": true,
	"code": 0,
	"message": "解绑成功",
	"data": {
		"detached_module_ids": [25],
		"removed_profile_ids": [17, 18]
	}
}
```

## 材料详情
- **权限标识**：`app-admin.materials.show`
- **接口**：`GET /admin-api/materials/{id}`
- **说明**：查询材料基础信息、关联媒体、绑定机器模块以及加工参数。
- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"id": 101,
		"name": "柚木板",
		"material_code": "WOOD-TEAK-3MM",
		"sku_code": "SKU-8810",
		"material_category_id": 6,
		"category": "木材",
		"material_category": {
			"id": 6,
			"name": "木材",
			"description": "常规木质材料",
			"sort_order": 10
		},
		"brand": "Lumi",
		"spec": "300×500×3mm",
		"thickness_mm": 3,
		"color": "棕色",
		"description": "适用于激光雕刻与轻度切割",
		"cover_url": "https://cdn.example.com/materials/wood-teak.png",
		"package_contents": [],
		"tags": ["wood", "engrave"],
		"warnings": [],
		"extra": {},
		"is_active": true,
		"is_public": true,
		"sort_order": 5,
		"processing_profiles_count": 4,
		"media_count": 2,
		"created_at": "2025-12-18 09:00:00",
		"updated_at": "2025-12-21 10:30:00",
		"media": [
			{
				"id": 9001,
				"media_type": "image",
				"url": "https://cdn.example.com/materials/gallery/wood-teak-1.png",
				"is_cover": true,
				"title": "封面",
				"caption": null,
				"sort_order": 0,
				"metadata": {}
			}
		],
		"machine_modules": [
			{
				"id": 11,
				"name": "蓝光 10W 模块",
				"machine": {
					"id": 1,
					"name": "LumiMaker X1",
					"slug": "lumimaker-x1"
				},
				"pivot": {
					"is_default": true,
					"notes": "默认推荐"
				}
			}
		],
		"processing_profiles": [
			{
				"id": 501,
				"machine_module_profile": {
					"id": 301,
					"processing_module": "laser",
					"processing_mode": "vector",
					"process_type": "cut",
					"power_watt": 10000,
					"machine_module": {
						"id": 11,
						"name": "蓝光 10W 模块",
						"machine": {
							"id": 1,
							"name": "LumiMaker X1",
							"slug": "lumimaker-x1"
						}
					}
				},
				"power_percent": 90,
				"speed_mm_per_sec": 8,
				"passes": 2,
				"focus_offset_mm": 0,
				"air_assist": true,
				"parameter_matrix": {},
				"preview_image_url": null,
				"notes": null,
				"is_active": true,
				"sort_order": 0
			}
		]
	}
}
```

- **字段补充**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `media[].is_cover` | boolean | 是否为封面图（与 `cover_url` 对应） |
| `machine_modules[].pivot.is_default` | boolean | 指定机器模块是否为默认推荐 |
| `processing_profiles[].air_assist` | boolean | 是否开启空压辅助 |
| `processing_profiles[].parameter_matrix` | object | 高级参数矩阵（JSON 对象） |

## 材料库导入
- **权限标识**：`app-admin.material-library.import`
- **接口**：`POST /admin-api/material-library/import`
- **说明**：批量导入材料、关联模块与加工参数矩阵，流程与机器模块导入类似。
- **请求方式**：`multipart/form-data`
- **请求体字段**：与“导入机器模块配置”相同，仅上传模板文件。
- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "导入完成",
	"data": {
		"stats": {
			"total_rows": 18,
			"materials_created": 6,
			"materials_updated": 2,
			"profiles_created": 9,
			"profiles_updated": 4
		},
		"errors": [
			"第 7 行：模块名称不能为空"
		]
	}
}
```

- **提示**：请确保使用最新版的模板（位于 `resources/templates/material_library_import_template.csv`），并按照注释说明填写；其中 JSON 字段需填写合法 JSON 字符串；**材料分类列必须填写后台已存在的分类名称**，否则导入将提示错误。

## 下载材料库模板
- **权限标识**：`app-admin.material-library.template`
- **接口**：`GET /admin-api/material-library/template`
- **说明**：下载材料库模块配置导入模板，供运营批量填写材料、模块及加工参数。
- **请求示例**：

```bash
curl -X GET "https://example.com/admin-api/material-library/template" \
	-H "Authorization: Bearer <token>" -OJ
```

- **响应**：返回 `材料库模块配置导入模板.csv`，默认包含 UTF-8 BOM 以确保 Excel 正确识别。

## 更新材料
- **权限标识**：`app-admin.materials.update`
- **接口**：`PUT /admin-api/materials/{id}` 或 `PATCH /admin-api/materials/{id}`
- **说明**：更新材料基础信息，字段与“新增材料”一致；当传入文件字段 `cover` 时会替换封面并自动清理旧图。
- **提示**：若请求内容与当前数据一致，接口返回“无需更新”以提示前端无需刷新。

## 调整材料状态
- **权限标识**：`app-admin.materials.status`
- **接口**：`PATCH /admin-api/materials/{id}/status`
- **说明**：仅切换材料启用状态，可单独授权。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `is_active` | boolean | 是 | `true` 为启用，`false` 为停用 |

- **响应**：返回最新材料数据。

## 上传材料封面
- **权限标识**：`app-admin.materials.cover`
- **接口**：`POST /admin-api/materials/{id}/cover`
- **说明**：独立上传或替换材料封面图，适用于编辑页直接替换图片。
- **请求方式**：`multipart/form-data`
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `file` | file | 是 | 封面图片，最大 5 MB |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "上传成功",
	"data": {
		"attachment_id": "8c0db402-0cda-4b73-8a07-9f5f5fbe2b68",
		"cover_url": "https://cdn.example.com/materials/wood-teak.png",
		"material": {
			"id": 101,
			"name": "柚木板",
			"cover_url": "https://cdn.example.com/materials/wood-teak.png",
			"is_active": true,
			"is_public": true,
			"processing_profiles_count": 4,
			"media_count": 2
		}
	}
}
```

## 删除材料
- **权限标识**：`app-admin.materials.destroy`
- **接口**：`DELETE /admin-api/materials/{id}`
- **说明**：删除材料前需先解除机器模块关联并清理所有加工参数；成功删除后系统会同步移除封面文件及附件记录。

# 材料加工配置 API

## 配置列表
- **权限标识**：`app-admin.material-processing-profiles.index`
- **接口**：`GET /admin-api/material-processing-profiles`
- **说明**：分页查看指定材料与机器模块的加工参数，支持按材料、模块、机型、加工类型与关键字筛选。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`sort_order`、`power_percent`、`fill_distance_mm`、`frequency_khz`、`pulse_width_us`、`created_at` 等 |
| `material_id` | integer | 否 | 仅查看指定材料的配置 |
| `machine_module_profile_id` | integer | 否 | 仅查看指定模块加工方案下的配置 |
| `machine_module_id` | integer | 否 | 按机器模块过滤（内部通过关联查询） |
| `machine_id` | integer | 否 | 按机型过滤 |
| `process_type` | string | 否 | 按加工类型过滤，例如 `engrave`、`cut` |
| `is_active` | string | 否 | 是否启用，接受 `true`/`false`/`1`/`0` 等值 |
| `keyword` | string | 否 | 模糊搜索备注或材料名称、编号 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 6,
		"list": [
			{
				"id": 501,
				"material": {
					"id": 101,
					"name": "柚木板",
					"material_code": "WOOD-TEAK-3MM",
					"material_category_id": 6,
					"category": "木材",
					"material_category": {
						"id": 6,
						"name": "木材",
						"description": "常规木质材料",
						"sort_order": 10
					}
				},
				"machine_module_profile": {
					"id": 301,
					"processing_module": "laser",
					"processing_mode": "vector",
					"process_type": "cut",
					"machine_module": {
						"id": 11,
						"name": "蓝光 10W 模块",
						"machine": {
							"id": 1,
							"name": "LumiMaker X1",
							"slug": "lumimaker-x1"
						}
					}
				},
				"power_percent": 90,
				"fill_distance_mm": 0.25,
				"frequency_khz": 35,
				"pulse_width_us": 120,
				"speed_mm_per_sec": 8,
				"passes": 2,
				"focus_offset_mm": 0,
				"air_assist": true,
				"parameter_matrix": {},
				"preview_image_url": null,
				"notes": "默认推荐",
				"is_active": true,
				"sort_order": 0,
				"created_at": "2025-12-20 10:00:00",
				"updated_at": "2025-12-21 09:00:00"
			}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `material` | object/null | 包含材料 ID、名称、编号及 `material_category_id`、`material_category` 等分类信息 |
| `machine_module_profile` | object/null | 包含加工方案及所属机器模块、机型信息 |
| `power_percent` | integer | 激光功率百分比 |
| `fill_distance_mm` | number/null | 填充线间距（毫米） |
| `frequency_khz` | integer/null | 激光频率（kHz） |
| `pulse_width_us` | integer/null | 脉宽（微秒） |
| `speed_mm_per_sec` | number/null | 运动速度（毫米/秒） |
| `passes` | integer/null | 重复加工次数 |
| `focus_offset_mm` | number/null | 焦距偏移量（毫米） |
| `air_assist` | boolean/null | 是否启用气辅（`null` 表示未配置） |
| `parameter_matrix` | object | 高级参数矩阵（JSON 对象） |
| `is_active` | boolean | 是否启用该配置 |
| `sort_order` | integer | 排序值，越小越靠前 |

## 配置详情
- **权限标识**：`app-admin.material-processing-profiles.show`
- **接口**：`GET /admin-api/material-processing-profiles/{id}`
- **说明**：返回单条加工配置的完整信息，与列表项结构一致。

## 新增配置
- **权限标识**：`app-admin.material-processing-profiles.store`
- **接口**：`POST /admin-api/material-processing-profiles`
- **说明**：创建材料与模块加工方案之间的参数配置。
- **请求方式**：`application/json`
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `material_id` | integer | 是 | 目标材料 ID |
| `machine_module_profile_id` | integer | 是 | 关联的机器模块加工方案 ID |
| `power_percent` | integer | 是 | 激光功率百分比，范围 `0~100` |
| `fill_distance_mm` | number | 否 | 填充线间距（毫米），未传则默认 `0` |
| `frequency_khz` | integer | 否 | 激光频率（kHz），未传则默认 `0` |
| `pulse_width_us` | integer | 否 | 脉宽（微秒），未传则默认 `0` |
| `speed_mm_per_sec` | number | 否 | 运动速度（毫米/秒） |
| `passes` | integer | 否 | 重复加工次数，最小值 `1` |
| `focus_offset_mm` | number | 否 | 焦距偏移量（毫米，可为负） |
| `air_assist` | boolean | 否 | 是否开启气辅 |
| `preview_image_url` | string | 否 | 预览图地址，最大 500 字符 |
| `notes` | string | 否 | 备注说明，最大 500 字符 |
| `is_active` | boolean | 否 | 是否启用，默认 `true` |
| `sort_order` | integer | 否 | 排序值，默认 `0` |
| `parameter_matrix` | object | 否 | 直接提交完整参数矩阵（JSON 对象） |
| `parameter_matrix_sections` | object | 否 | 结构化参数片段，由后台自动组装矩阵（若同时提交，优先使用该字段） |

- **说明**：`parameter_matrix_sections` 可包含 `fill_engrave`、`line_engrave`、`line_cut`、`line_mark`、`fill_mark` 等子对象，后台会通过内部助手与默认模板合并生成 `parameter_matrix`，避免手写复杂 JSON。

## 更新配置
- **权限标识**：`app-admin.material-processing-profiles.update`
- **接口**：`PUT /admin-api/material-processing-profiles/{id}` 或 `PATCH /admin-api/material-processing-profiles/{id}`
- **说明**：字段同“新增配置”，全部为可选；当参数与当前值一致时会返回“无需更新”。

## 删除配置
- **权限标识**：`app-admin.material-processing-profiles.destroy`
- **接口**：`DELETE /admin-api/material-processing-profiles/{id}`
- **说明**：移除单条加工配置，删除后不可恢复，请确认未在前台引用。

## 上传示例图
- **权限标识**：`app-admin.material-processing-profiles.preview`
- **接口**：`POST /admin-api/material-processing-profiles/{id}/preview`
- **说明**：独立上传或替换加工配置的示例图，适合表单内单独更新图片。
- **请求方式**：`multipart/form-data`
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `file` | file | 是 | 示例图图片，最大 5 MB；支持常见图片格式 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "上传成功",
	"data": {
		"attachment_id": 12345,
		"preview_image_url": "https://cdn.example.com/material-processing/preview-501.png",
		"profile": {
			"id": 501,
			"preview_image_url": "https://cdn.example.com/material-processing/preview-501.png"
		}
	}
}
```

- **说明**：响应会同时返回最新的加工配置详情，便于前端同步界面；附件 ID 可用于后续追踪或清理资源。

## 下载配置模板
- **权限标识**：`app-admin.material-processing-profiles.template`
- **接口**：`GET /admin-api/material-processing-profiles/template`
- **说明**：下载加工配置导入模板（CSV），包含常用列头及填写提示。
- **响应**：返回 [material_processing_profiles_template.csv]，默认带 UTF-8 BOM 以兼容 Excel。

# 应用场景管理 API

## 场景列表
- **权限标识**：`app-admin.application-scenarios.index`
- **接口**：`GET /admin-api/application-scenarios`
- **说明**：分页查询应用场景，支持按关键词与启用状态筛选，默认按排序值升序。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`name`、`code`、`sort_order`、`is_active`、`created_at`、`updated_at` |
| `keyword` | string | 否 | 模糊搜索名称、编码或描述 |
| `is_active` | string | 否 | 是否启用，接受 `true`/`false`/`1`/`0` 等值（其余非空值视为禁用） |

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.list[].id` | integer | 场景 ID |
| `data.list[].name` | string | 场景名称 |
| `data.list[].code` | string | 场景编码，唯一 |
| `data.list[].icon_url` | string/null | 图标地址 |
| `data.list[].description` | string/null | 场景描述 |
| `data.list[].is_active` | boolean | 是否启用 |
| `data.list[].sort_order` | integer | 排序值，越小越靠前 |
| `data.list[].created_at` | string/null | 创建时间 |
| `data.list[].updated_at` | string/null | 最近更新时间 |

## 新增应用场景
- **权限标识**：`app-admin.application-scenarios.store`
- **接口**：`POST /admin-api/application-scenarios`
- **说明**：创建新的应用场景，编码需全局唯一。
- **请求体字段**（`application/json`）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `name` | string | 是 | 场景名称，最大 120 字符 |
| `code` | string | 是 | 场景编码，最大 60 字符，需唯一 |
| `icon_url` | string | 否 | 图标地址，最大 255 字符 |
| `description` | string | 否 | 场景描述 |
| `is_active` | boolean | 否 | 是否启用，默认 `true` |
| `sort_order` | integer | 否 | 排序值，默认 `0` |

- **成功响应**：返回场景详情结构（同“场景列表”单项）。

## 应用场景详情
- **权限标识**：`app-admin.application-scenarios.show`
- **接口**：`GET /admin-api/application-scenarios/{id}`
- **说明**：查看指定应用场景的详细信息。

## 更新应用场景
- **权限标识**：`app-admin.application-scenarios.update`
- **接口**：`PUT /admin-api/application-scenarios/{id}` 或 `PATCH /admin-api/application-scenarios/{id}`
- **说明**：更新应用场景基础信息；当提交内容与当前数据一致时，接口将返回“无需更新”。
- **请求体字段**（`application/json`，至少包含一个字段）：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `name` | string | 否 | 场景名称，最大 120 字符 |
| `code` | string | 否 | 场景编码，最大 60 字符，需保持唯一 |
| `icon_url` | string | 否 | 图标地址，最大 255 字符 |
| `description` | string | 否 | 场景描述 |
| `is_active` | boolean | 否 | 是否启用 |
| `sort_order` | integer | 否 | 排序值，最小为 `0` |

## 调整应用场景状态
- **权限标识**：`app-admin.application-scenarios.status`
- **接口**：`PATCH /admin-api/application-scenarios/{id}/status`
- **说明**：单独切换场景的启用状态，便于细粒度授权。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `is_active` | boolean | 是 | `true` 为启用，`false` 为停用 |

- **返回结果**：成功后返回最新的场景详情。

## 删除应用场景
- **权限标识**：`app-admin.application-scenarios.destroy`
- **接口**：`DELETE /admin-api/application-scenarios/{id}`
- **说明**：删除应用场景前需确保未被项目引用；若关联项目数量大于 0，接口会返回提示信息并拒绝删除。

# 用户日志 API

## 日志列表
- **权限标识**：`app-admin.user-logs.index`
- **接口**：`GET /admin-api/user-logs`
- **说明**：在筛选条件满足时分页返回用户 API 请求日志，时间范围必填。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `created_start` | string | 是 | 起始时间（日期或完整时间），必填 |
| `created_end` | string | 是 | 结束时间，必填；系统默认补全至当日 23:59:59 |
| `start` | integer | 否 | 偏移量，默认 `0` |
| `limit` | integer | 否 | 每页数量，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `created_at`、`duration_ms`、`response_status`、`id` |
| `user_id` | integer | 否 | 指定用户 ID |
| `user_keyword` | string | 否 | 用户名称或邮箱关键字模糊匹配 |
| `path` | string | 否 | 接口路径模糊匹配 |
| `method` | string | 否 | 请求方法（GET/POST...），不区分大小写 |
| `response_status` | integer | 否 | HTTP 状态码，100~599 |
| `ip` | string | 否 | 访问 IP，模糊匹配 |
| `request_id` | string | 否 | 请求唯一 ID |
| `min_duration` | integer | 否 | 最小耗时（毫秒），过滤慢请求 |

- **响应字段**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `data.start` | integer | 起始偏移量 |
| `data.limit` | integer | 每页数量 |
| `data.total` | integer | 符合条件的日志条数 |
| `data.list[].id` | integer | 日志 ID |
| `data.list[].created_at` | string | 记录时间 |
| `data.list[].request_id` | string | 请求唯一标识 |
| `data.list[].method` | string | 请求方法 |
| `data.list[].path` | string | 接口路径 |
| `data.list[].query` | array\|string\|null | 查询参数，解析失败时保留原始字符串 |
| `data.list[].request_body` | array\|string\|null | 请求体内容 |
| `data.list[].response_status` | integer | HTTP 状态码 |
| `data.list[].response_body` | array\|string\|null | 响应内容（截取前端自行处理） |
| `data.list[].duration_ms` | integer | 耗时（毫秒） |
| `data.list[].ip` | string | 客户端 IP |
| `data.list[].user_agent` | string | User-Agent |
| `data.list[].user` | object\|null | 用户信息，含 `id`、`name`、`email` |

- **提示**：未提供时间范围时接口会返回参数错误，避免误拉取整表。

## 导出日志
- **权限标识**：`app-admin.user-logs.export`
- **接口**：`GET /admin-api/user-logs/export`
- **说明**：依据相同筛选条件导出 CSV，限制最多 5000 条；若数据为空或超出限制会返回错误提示。
- **请求参数**：同“日志列表”，但不支持 `start`、`limit`。
- **响应**：下载 `user_logs_YYYYMMDD_HHMMSS.csv` 文件，列包含 ID、请求 ID、时间、用户、接口、状态码、耗时、IP 及请求/响应数据。

# 模板库管理 API

## 模板列表
- **权限标识**：`app-admin.project-templates.index`
- **接口**：`GET /admin-api/project-templates`
- **说明**：分页检索前台项目模板，支持多条件组合筛选与排序。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`created_at`、`updated_at`、`published_at`、`likes_count`、`downloads_count`、`featured_weight`、`featured_at` |
| `status` | string | 否 | 模板状态，`draft` / `published` |
| `keyword` | string | 否 | 模糊搜索标题或描述 |
| `author_id` | integer | 否 | 指定创建者 ID |
| `machine_module_ids` | array\|string | 否 | 机器模块 ID 列表，支持数组或用逗号分隔的字符串 |
| `material_ids` | array\|string | 否 | 材料 ID 列表 |
| `scenario_ids` | array\|string | 否 | 应用场景 ID 列表 |
| `tags` | array\|string | 否 | 标签集合，全部命中才会返回 |
| `is_featured` | string | 否 | 是否推荐，接受 `true`/`false`/`1`/`0` |
| `published_start` | string | 否 | 发布开始时间（日期或完整时间） |
| `published_end` | string | 否 | 发布结束时间 |
| `created_start` | string | 否 | 创建开始时间（日期或完整时间） |
| `created_end` | string | 否 | 创建结束时间 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 42,
		"list": [
			{
				"id": 101,
				"title": "节日灯笼模板",
				"description": "适用于 10W 蓝光模块的春节灯笼。",
				"cover_url": "https://cdn.example.com/projects/cover-101.png",
				"status": "published",
				"tags": ["灯笼", "春节"],
				"published_at": "2025-12-10 09:15:00",
				"created_at": "2025-12-02 10:00:00",
				"updated_at": "2025-12-18 13:20:00",
				"likes_count": 126,
				"downloads_count": 98,
				"is_featured": true,
				"featured_weight": 120,
				"featured_at": "2025-12-12 08:00:00",
				"user": {
					"id": 8,
					"name": "设计馆"
				},
				"file": {
					"id": 5501,
					"original_name": "festival-lantern.zip",
					"size": 7340032,
					"extension": "zip",
					"download_url": "https://oss-example.com/path?X-Oss-Signature=..."
				}
			}
		]
	}
}
```

- **字段说明**：

| 字段 | 类型 | 说明 |
| -- | -- | -- |
| `list[].likes_count` | integer | 点赞总数 |
| `list[].downloads_count` | integer | 下载总数 |
| `list[].user` | object/null | 创建者信息，含 `id`、`name`、`avatar` |
| `list[].file.download_url` | string/null | 系统生成的临时下载链接 |
| 其余字段 | — | 与项目模型字段一致 |

## 模板详情
- **权限标识**：`app-admin.project-templates.show`
- **接口**：`GET /admin-api/project-templates/{id}`
- **说明**：返回指定模板的完整信息，包含机器模块、材料、场景与媒体资源等关联数据。
- **响应结构**：在列表字段基础上新增：
  - `machine_modules[]`：模块 ID、名称及所属机器。
  - `materials[]`：材料 ID、名称、编码。
	- `material_categories[]`：材料分类 ID、名称、排序值（根据材料自动推导）。
  - `scenarios[]`：应用场景 ID、名称、编码。
  - `media[]`：媒体资源列表，含 `media_type`、`url`、`title`、`caption`、`sort_order`、`metadata`。
	- `instruction_steps[]`：操作说明步骤列表，包含 `title`、`description`、`settings`、`sort_order` 以及 `media[]`（含 `media_type`、`media_url`/`external_url`、`media_metadata`、`sort_order`）。
	- `instruction_file`：操作说明文件信息，含 `url`、`name`、`media_asset_id`，为空代表未配置。

## 更新模板
- **权限标识**：`app-admin.project-templates.update`
- **接口**：`PUT /admin-api/project-templates/{id}`
- **说明**：更新模板基础信息及关联关系，全部字段可选。
- **提示**：`material_ids` 提交后系统会自动维护 `material_categories` 关联，无需单独上传分类 ID。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `title` | string | 否 | 模板标题，最大 150 字符 |
| `description` | string | 否 | 模板描述，markdown 或富文本均可 |
| `cover_url` | string | 否 | 封面地址 |
| `cover_metadata` | object | 否 | 封面媒体资源的元数据（需包含 `object_key`，可附带 `disk`、`hash`、尺寸等） |
| `tags` | array | 否 | 最多 20 个标签，单个不超过 30 字符 |
| `machine_module_ids` | array | 否 | 关联的机器模块 ID 列表，至少 1 个 |
| `material_ids` | array | 否 | 关联的材料 ID 列表 |
| `scenario_ids` | array | 否 | 关联的应用场景 ID 列表 |
| `media` | array | 否 | 媒体资源列表（最多 20 项） |
| `media[].media_type` | string | 是 | 媒体类型，`image` / `video` |
| `media[].url` | string | 是 | 媒体地址 |
| `media[].title` | string | 否 | 标题 |
| `media[].caption` | string | 否 | 描述 |
| `media[].sort_order` | integer | 否 | 排序值，缺省按提交顺序 |
| `media[].metadata` | object | 否 | 自定义元数据 |
| `instruction_steps` | array | 否 | 操作说明步骤列表；不传保持不变，传空数组表示清空 |
| `instruction_steps[].title` | string | 否 | 步骤标题，最长 150 字符 |
| `instruction_steps[].description` | string | 否 | 步骤描述，支持富文本 |
| `instruction_steps[].settings` | array | 否 | 设置信息（前端自定义结构） |
| `instruction_steps[].sort_order` | integer | 否 | 步骤排序，默认按提交顺序 |
| `instruction_steps[].media` | array | 否 | 单个步骤的媒体列表，最多 10 条 |
| `instruction_steps[].media[].media_type` | string | 否 | `image` / `video` / `youtube`，默认为 `image` |
| `instruction_steps[].media[].media_url` | string | 否 | 图片或视频地址，`youtube` 类型可留空 |
| `instruction_steps[].media[].external_url` | string | 否 | 外部地址（用于 `youtube`） |
| `instruction_steps[].media[].media_metadata` | object | 否 | 媒体元数据，建议带上 `object_key` |
| `instruction_steps[].media[].sort_order` | integer | 否 | 步骤媒体排序值 |
| `instruction_file` | object | 否 | 操作说明文件，包含 OSS URL 与名称 |
| `instruction_file.url` | string | 是 | 文件访问地址 |
| `instruction_file.name` | string | 否 | 文件名称（前端展示用） |
| `instruction_file.metadata` | object | 否 | 媒资元数据，例如 `object_key`、`hash` |

- **提示**：
	- 当 `cover_url` 未提供且媒体列表不为空时，后端会自动取首张媒体图片补全封面。
	- `cover_metadata` 与 `media[].metadata` 建议携带 `object_key`、`disk`、`hash` 等信息，便于媒体资源引用计数同步。

## 调整模板状态
- **权限标识**：`app-admin.project-templates.status`
- **接口**：`PATCH /admin-api/project-templates/{id}/status`
- **说明**：上架或下架模板，自动维护 `published_at`。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `status` | string | 是 | `draft` 代表下架，`published` 代表上架 |

## 设置模板推荐
- **权限标识**：`app-admin.project-templates.feature`
- **接口**：`PATCH /admin-api/project-templates/{id}/feature`
- **说明**：控制推荐状态与排序权重。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `is_featured` | boolean | 是 | 是否推荐 |
| `featured_weight` | integer | 否 | 推荐排序权重，范围 `0~32767` |
| `featured_at` | string | 否 | 推荐时间，未填写则默认当前时间 |

## 复制模板
- **权限标识**：`app-admin.project-templates.duplicate`
- **接口**：`POST /admin-api/project-templates/{id}/duplicate`
- **说明**：将模板复制为新项目，可指定归属用户、目标状态与是否拷贝媒体。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `title` | string | 否 | 新模板标题，默认在原标题后追加“ - 副本” |
| `status` | string | 否 | 新模板状态，默认 `draft` |
| `target_user_id` | integer | 否 | 指定归属用户 ID，默认沿用原作者 |
| `copy_media` | boolean | 否 | 是否复制媒体，默认 `true` |
| `file_id` | integer | 是 | 目标用户下的文件 ID，必须归属同一用户 |

- **响应**：返回新建模板的完整详情。
- **提示**：
	- 若目标用户下不存在可用文件，请先在“文件管理”上传后再执行复制。
	- 操作说明步骤及说明文件会随模板一并复制，关联媒资会重新建立引用计数。

## 获取模板媒体资源上传凭证
- **权限标识**：`app-admin.project-templates.upload-signature`
- **接口**：`POST /admin-api/project-templates/upload/signature`
- **说明**：获取上传模板封面或媒体到 OSS 所需的临时凭证，前端拿到凭证后可直接使用阿里云 OSS SDK 分片上传。
- **请求体字段**：

| 字段 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `file_name` | string | 是 | 原始文件名，用于识别扩展名 |
| `extension` | string | 否 | 文件扩展名，未提供时将根据 `file_name` 推断 |
| `size` | integer | 是 | 文件大小，单位字节 |
| `mime_type` | string | 否 | MIME 类型，仅用于记录 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取媒体上传凭证成功",
	"data": {
		"object_key": "admin/project-templates/media/2025/12/bb2e3f3d-92e3-4dcd-8b48-6d1cbf8a4e6f.webp",
		"upload_host": "https://bucket.oss-cn-hangzhou.aliyuncs.com",
		"bucket": "bucket",
		"region": "oss-cn-hangzhou",
		"max_size": 62914560,
		"allowed_extensions": ["jpg","jpeg","png","webp","gif","mp4","mov","webm"],
		"preview_url": "https://cdn.example.com/admin/project-templates/media/2025/12/bb2e3f3d-92e3-4dcd-8b48-6d1cbf8a4e6f.webp",
		"thumbnail_url": null,
		"credentials": {
			"access_key_id": "STS.NEs...",
			"access_key_secret": "******",
			"security_token": "******",
			"expiration": "2025-12-25T09:30:00Z",
			"duration_seconds": 1800,
			"role_session_name": "lumi-session-abc123"
		}
	}
}
```

- **提示**：
  - 上传成功后请在模板保存接口里将 `cover_metadata` 或 `media[].metadata` 的 `object_key` 等信息设置为返回值，以便媒体资源引用计数正常运作。

## 删除模板
- **权限标识**：`app-admin.project-templates.destroy`
- **接口**：`DELETE /admin-api/project-templates/{id}`
- **说明**：软删除指定模板，并触发媒体资源引用释放与相关日志记录。
- **响应**：`{"success":true,"code":0,"message":"删除成功","data":[]}`。

## 获取模板选项
- **权限标识**：`app-admin.project-templates.options`
- **接口**：`GET /admin-api/project-templates/options`
- **说明**：获取模板编辑所需的机器、模块、材料与场景选项，用于下拉框渲染。
- **响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"machines": [
			{
				"id": 1,
				"name": "LumiMaker X1",
				"slug": "lumimaker-x1",
				"sort_order": 10,
				"modules": [
					{"id": 11, "name": "蓝光 10W 模块"}
				]
			}
		],
		"materials": [
			{"id": 101, "name": "柚木板", "material_code": "WOOD-TEAK-3MM"}
		],
		"scenarios": [
			{"id": 21, "name": "节日送礼", "code": "festival_gift"}
		]
	}
}
```

- **说明**：仅返回已启用的记录，默认按 `sort_order` 升序。

# 模板评论管理 API 文档

## 评论列表
- **权限标识**：`app-admin.project-template-comments.index`
- **接口**：`GET /admin-api/project-template-comments`
- **说明**：分页检索项目模板评论，支持多条件筛选与排序。该接口可用于获取顶级评论列表或指定评论的回复列表。

### 前端使用场景
1. **评论列表页**（显示顶级评论）：
   ```
   GET /admin-api/project-template-comments?project_id=46&parent_id=0&start=0&limit=20
   ```
   返回该项目的所有顶级评论（`parent_id=null` 的评论）

2. **获取某条评论的回复列表**：
   ```
   GET /admin-api/project-template-comments?parent_id=1001&start=0&limit=20
   ```
   返回评论 ID 1001 下的所有回复

- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始位置，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序规则，格式为 `field__direction`，如 `created_at__DESC`。支持字段：`id`、`created_at`、`updated_at`、`likes_count`、`replies_count` |
| `project_id` | integer | 否 | 按项目ID筛选（包含已软删除的项目） |
| `user_id` | integer | 否 | 按用户ID筛选 |
| `keyword` | string | 否 | 按内容关键字搜索 |
| `status` | string | 否 | 评论状态：`normal`（正常）、`deleted_by_owner`（用户删除）、`deleted_by_admin`（管理员删除） |
| `parent_id` | integer | 否 | **父评论ID**：<br>• 传 `0` 或不传 = 只返回顶级评论<br>• 传具体评论ID（如 `1001`）= 返回该评论的回复列表 |
| `is_pinned` | string | 否 | 是否置顶：`0`/`false`（否）、`1`/`true`（是） |
| `has_reports` | string | 否 | 是否有举报：`0`/`false`（否）、`1`/`true`（是） |
| `created_start` | date | 否 | 评论创建开始日期，如 `2025-01-01` |
| `created_end` | date | 否 | 评论创建结束日期，如 `2025-12-31` |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 156,
		"list": [
			{
				"id": 1001,
				"project": {
					"id": 101,
					"title": "圣诞节贺卡模板",
					"status": "published"
				},
				"user": {
					"id": 5,
					"name": "张三",
					"avatar": "https://example.com/avatar.jpg",
					"email": "zhangsan@example.com"
				},
				"parent_id": null,
				"content_excerpt": "这个模板非常漂亮，制作起来也很简单，强烈推荐！",
				"images": ["https://example.com/comment-image.jpg"],
				"likes_count": 23,
				"dislikes_count": 1,
				"replies_count": 5,
				"reports_count": 0,
				"is_pinned": false,
				"is_deleted_by_owner": false,
				"is_deleted_by_admin": false,
				"created_at": "2025-12-20 14:30:00",
				"updated_at": "2025-12-20 14:30:00"
			}
		]
	}
}
```

## 评论详情
- **权限标识**：`app-admin.project-template-comments.show`
- **接口**：`GET /admin-api/project-template-comments/{id}`
- **说明**：查看评论详细信息，包含完整内容、回复列表、举报记录等。

### 前端使用场景
当用户点击某条评论查看详情时，调用此接口获取：
- 评论的完整内容（未截断）
- 评论的所有回复（`replies` 数组）
- 举报记录（`reports` 数组）

**注意**：`replies` 数组只包含**直接回复**（一级子评论），不会递归加载子回复的子回复。如需查看某个回复的子回复，需单独查询该回复的详情或使用列表接口。

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"id": 1001,
		"project": {
			"id": 101,
			"title": "圣诞节贺卡模板",
			"status": "published",
			"cover_url": "https://example.com/cover.jpg"
		},
		"user": {
			"id": 5,
			"name": "张三",
			"avatar": "https://example.com/avatar.jpg",
			"email": "zhangsan@example.com",
			"is_comment_banned": false
		},
		"parent_id": null,
		"content": "这个模板非常漂亮，制作起来也很简单，强烈推荐！",
		"content_excerpt": "这个模板非常漂亮，制作起来也很简单，强烈推荐！",
		"images": ["https://example.com/image1.jpg"],
		"mentioned_user_ids": [],
		"likes_count": 23,
		"dislikes_count": 1,
		"replies_count": 5,
		"reports_count": 0,
		"is_pinned": false,
		"is_deleted_by_owner": false,
		"is_deleted_by_admin": false,
		"created_at": "2025-12-20 14:30:00",
		"updated_at": "2025-12-20 14:30:00",
		"deleted_at": null,
		"replies": [
			{
				"id": 1002,
				"user": {
					"id": 8,
					"name": "李四",
					"avatar": "https://example.com/avatar2.jpg",
					"email": "lisi@example.com"
				},
				"parent_id": 1001,
				"content_excerpt": "同意，我也做了一个...",
				"likes_count": 5,
				"dislikes_count": 0,
				"replies_count": 2,
				"reports_count": 0,
				"is_pinned": false,
				"is_deleted_by_owner": false,
				"is_deleted_by_admin": false,
				"created_at": "2025-12-20 15:00:00",
				"updated_at": "2025-12-20 15:00:00"
			}
		],
		"reports": []
	}
}
```

### 响应字段说明
- **`replies` 数组**：该评论的所有**直接回复**（一级子评论），按置顶优先+创建时间排序
  - 每个回复项包含基础信息（用户、内容摘要、统计数据等）
  - **不包含**回复的子回复（如需查看，可调用列表接口传 `parent_id=该回复ID`）
- **`reports` 数组**：该评论的所有举报记录

## 管理员发表评论
- **权限标识**：`app-admin.project-template-comments.store`
- **接口**：`POST /admin-api/project-template-comments`
- **说明**：管理员以系统用户身份发表评论或回复。系统用户ID通过环境变量 `ADMIN_COMMENT_USER_ID` 配置。
- **请求参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `project_id` | integer | 是 | 项目ID |
| `content` | string | 是 | 评论内容，1-2000字 |
| `parent_id` | integer | 否 | 父评论ID，用于回复 |
| `images` | array | 否 | 评论附图URL数组，最多8张 |
| `mentioned_user_ids` | array | 否 | @的用户ID列表 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "评论发表成功",
	"data": {
		"id": 1002,
		"project": {
			"id": 101,
			"title": "圣诞节贺卡模板"
		},
		"user": {
			"id": 1,
			"name": "系统管理员",
			"avatar": null,
			"email": "admin@example.com"
		},
		"parent_id": null,
		"content_excerpt": "感谢您的反馈！",
		"likes_count": 0,
		"dislikes_count": 0,
		"replies_count": 0,
		"reports_count": 0,
		"is_pinned": false,
		"is_deleted_by_owner": false,
		"is_deleted_by_admin": false,
		"created_at": "2025-12-25 10:00:00",
		"updated_at": "2025-12-25 10:00:00"
	}
}
```

## 删除评论
- **权限标识**：`app-admin.project-template-comments.destroy`
- **接口**：`DELETE /admin-api/project-template-comments/{id}`
- **说明**：管理员软删除评论（设置 `deleted_at`）。
- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "评论已删除",
	"data": null
}
```

## 恢复评论
- **权限标识**：`app-admin.project-template-comments.restore`
- **接口**：`POST /admin-api/project-template-comments/{id}/restore`
- **说明**：恢复被管理员软删除的评论。
- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "评论已恢复",
	"data": {
		"id": 1001,
		"is_deleted_by_admin": false,
		...
	}
}
```

## 置顶/取消置顶评论
- **权限标识**：`app-admin.project-template-comments.pin`
- **接口**：`PUT /admin-api/project-template-comments/{id}/pin`
- **说明**：设置或取消评论置顶。
- **请求参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `is_pinned` | boolean | 是 | `true` 置顶，`false` 取消置顶 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "评论已置顶",
	"data": {
		"is_pinned": true
	}
}
```

## 禁言用户
- **权限标识**：`app-admin.project-template-comments.ban-user`
- **接口**：`POST /admin-api/project-template-comments/users/{userId}/ban`
- **说明**：禁止指定用户发表评论，更新 `users.is_comment_banned` 字段并记录禁言历史。
- **请求参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `reason` | string | 是 | 禁言原因，最多500字 |
| `expires_at` | datetime | 否 | 禁言到期时间，格式 `2025-12-31 23:59:59`，不填表示永久禁言 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "用户已被禁言",
	"data": {
		"user_id": 5,
		"is_comment_banned": true
	}
}
```

## 解禁用户
- **权限标识**：`app-admin.project-template-comments.unban-user`
- **接口**：`POST /admin-api/project-template-comments/users/{userId}/unban`
- **说明**：解除用户评论禁言，更新 `users.is_comment_banned` 字段并记录解禁信息。
- **请求参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `reason` | string | 否 | 解禁原因，最多500字 |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "用户已解禁",
	"data": {
		"user_id": 5,
		"is_comment_banned": false
	}
}
```

## 用户禁言历史
- **权限标识**：`app-admin.project-template-comments.ban-history`
- **接口**：`GET /admin-api/project-template-comments/users/{userId}/ban-history`
- **说明**：查看用户的禁言记录历史。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始位置，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `100` |

- **成功响应示例**：

```json
{
	"success": true,
	"code": 0,
	"message": "获取成功",
	"data": {
		"start": 0,
		"limit": 20,
		"total": 3,
		"user": {
			"id": 5,
			"name": "张三",
			"is_comment_banned": false
		},
		"list": [
			{
				"id": 1,
				"reason": "发布违规内容",
				"banned_at": "2025-12-01 10:00:00",
				"expires_at": "2025-12-08 10:00:00",
				"is_permanent": false,
				"banned_by": {
					"id": 1,
					"name": "系统管理员"
				},
				"unbanned_at": "2025-12-05 15:30:00",
				"unbanned_by": {
					"id": 1,
					"name": "系统管理员"
				},
				"unban_reason": "已整改",
				"is_active": false
			}
		]
	}
}
```
- 模板详情接口（`GET /admin-api/project-templates/{id}`）返回数据中新增 `comments_count` 字段，表示该模板的评论总数。

## 其他注意事项
- 接口需在后台中为对应角色分配 `app-admin.users.*`、`app-admin.machines.*`、`app-admin.machine-modules.*` 等权限，可按按钮粒度选择 `*.status`、`*.import`、`*.export`。
- 返回的时间字段统一为 `YYYY-MM-DD HH:MM:SS` 字符串，可能为 `null`。