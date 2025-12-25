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

## 用户列表
- **权限标识**：`app-admin.users.index`
- **接口**：`GET /admin-api/users`
- **说明**：按条件分页查询前台用户。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `100` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`（亦兼容 `字段_ASC/字段_DESC`），可选 `id`、`name`、`email`、`created_at`、`updated_at`、`projects_count`、`files_count` |
| `keyword` | string | 否 | 模糊搜索（用户名或邮箱） |
| `email_verified` | boolean | 否 | 邮箱是否已验证（`true`/`false`） |
| `has_google` | boolean | 否 | 是否已绑定 Google（`true`/`false`） |
| `is_blocked` | boolean | 否 | 是否只查看被封禁或未封禁用户 |
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

> 提示：密码重置后将删除该用户的所有 Sanctum Token，前台需要重新登录。

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
- **说明**：批量导入机器、模块与加工配置，需上传官方模板填写完成的文件。
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

## 材料列表
- **权限标识**：`app-admin.materials.index`
- **接口**：`GET /admin-api/materials`
- **说明**：分页查询材料基础信息，支持关键字、分类、品牌、启用状态、公开状态和关联模块过滤。
- **查询参数**：

| 参数名 | 类型 | 是否必填 | 说明 |
| -- | -- | -- | -- |
| `start` | integer | 否 | 起始偏移量，默认 `0` |
| `limit` | integer | 否 | 每页条数，默认 `20`，最大 `200` |
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`name`、`material_code`、`sku_code`、`category`、`brand`、`thickness_mm`、`sort_order`、`created_at`、`updated_at` |
| `keyword` | string | 否 | 模糊查询材料名称、物料编码或 SKU |
| `category` | string | 否 | 精确匹配材料分类 |
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
				"category": "wood",
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
| `category` | string | 否 | 材料分类，最大 60 字符 |
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
		"category": "wood",
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

- **提示**：请确保使用最新版的模板（位于 `resources/templates/material_library_import_template.csv`），并按照注释说明填写；其中 JSON 字段需填写合法 JSON 字符串。

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
| `order` | string | 否 | 排序字段，格式 `字段__ASC/字段__DESC`，可选 `id`、`sort_order`、`power_percent`、`created_at` 等 |
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
					"material_code": "WOOD-TEAK-3MM"
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
| `material` | object/null | 包含材料 ID、名称、编码等基础信息 |
| `machine_module_profile` | object/null | 包含加工方案及所属机器模块、机型信息 |
| `power_percent` | integer | 激光功率百分比 |
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
- **响应**：返回 `material_processing_profiles_template.csv`，默认带 UTF-8 BOM 以兼容 Excel。

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
  - `scenarios[]`：应用场景 ID、名称、编码。
  - `media[]`：媒体资源列表，含 `media_type`、`url`、`title`、`caption`、`sort_order`、`metadata`。

## 更新模板
- **权限标识**：`app-admin.project-templates.update`
- **接口**：`PUT /admin-api/project-templates/{id}`
- **说明**：更新模板基础信息及关联关系，全部字段可选。
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

- **响应**：返回新建模板的完整详情。

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

## 其他注意事项
- 接口需在后台中为对应角色分配 `app-admin.users.*`、`app-admin.machines.*`、`app-admin.machine-modules.*` 等权限，可按按钮粒度选择 `*.status`、`*.import`、`*.export`。
- 返回的时间字段统一为 `YYYY-MM-DD HH:MM:SS` 字符串，可能为 `null`。

