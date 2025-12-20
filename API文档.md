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
| `icon_url` | string | 否 | 展示图片地址，最大 512 字符 |
| `description` | string | 否 | 机器描述 |
| `is_active` | boolean | 否 | 是否启用，默认 `true` |
| `sort_order` | integer | 否 | 排序值，默认 `0` |

- **成功响应**：返回与“机器列表”单项一致的结构。

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

## 删除模块
- **权限标识**：`app-admin.machine-modules.destroy`
- **接口**：`DELETE /admin-api/machine-modules/{id}`
- **说明**：删除前需确保无关联加工配置，否则会提示“请先删除该模块下的加工配置”。

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

## 其他注意事项
- 接口需在后台中为对应角色分配 `app-admin.users.*`、`app-admin.machines.*`、`app-admin.machine-modules.*` 等权限。
- 返回的时间字段统一为 `YYYY-MM-DD HH:MM:SS` 字符串，可能为 `null`。

