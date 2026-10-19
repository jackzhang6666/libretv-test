# LibreTV 合法点播测试 API（Cloudflare Workers）

本仓库的 `worker.js` 是一个用于开发测试的 Apple CMS Provide/VOD 兼容演示 API。它只返回两个 Blender Foundation 开放动画项目的元数据与官方公开下载视频地址，不抓取、不聚合第三方影视资源站。

## 重要说明

- **上传代码不等于已部署 API。** 需要在 Cloudflare Workers 创建 Worker 并部署，部署后才能得到真正的 `*.workers.dev` 公网地址。
- 演示影片：Big Buck Bunny（2008）和 Sintel（2010），均为 Blender Open Movies，通常以 Creative Commons Attribution 3.0 许可发布。使用或再分发时请核对各影片官方页面的当前许可与署名要求。
- 这只是测试目录和播放 URL。第三方托管的下载地址未来可能变更；部署成功不保证视频源永远可用。
- Worker 不代理或缓存视频文件，只返回影片元数据与官方演示视频 URL。

## 在 Cloudflare 部署（Dashboard 方法）

1. 登录 https://dash.cloudflare.com/
2. 左侧打开 **Workers & Pages**。
3. 点击 **Create** / **Create application**，选择 **Worker**（界面名称可能略有不同）。
4. 创建 Worker，名称例如 `libretv-demo-vod`。
5. 进入编辑器，打开 `worker.js`，复制完整代码，覆盖编辑器默认代码。
6. 点击 **Deploy**。
7. 打开部署后的 Worker URL，先访问 `/health`。应返回 JSON，包含 `"ok": true`。
8. 再打开 `/api.php/provide/vod?ac=videolist&wd=Big`，应返回含 `Big Buck Bunny` 的 JSON。
9. 详情测试：打开 `/api.php/provide/vod?ac=videolist&ids=1001`，响应应含 `vod_play_url`。

## 加入 LibreTV

假设 Cloudflare 分配的域名是 `https://libretv-demo-vod.<你的子域>.workers.dev`，则在 LibreTV：

1. 设置 → 源管理 → 点播源。
2. 点击「添加 API」。
3. 名称填写 `合法演示点播源`。
4. API 地址填写 `https://libretv-demo-vod.<你的子域>.workers.dev/api.php/provide/vod`（请替换成你真实的 Worker 域名）。
5. 保存并确保该源被勾选。
6. 回到首页搜索 `Big Buck Bunny` 或 `Sintel`。
7. 打开详情并选择「正片」测试播放器。

## 兼容性端点

- `GET /health`：健康检查
- `GET /api.php/provide/vod?ac=list`：基础列表
- `GET /api.php/provide/vod?ac=videolist&wd=Big`：搜索
- `GET /api.php/provide/vod?ac=videolist&ids=1001`：详情（含播放地址）
- `GET /api.php/provide/vod?ac=detail&ids=1002`：详情

## 本地快速检查

部署前可检查语法，但最终应以 Cloudflare 部署后的 HTTP 响应为准。此 Worker 只读、无密钥、无数据库、无额外环境变量。
