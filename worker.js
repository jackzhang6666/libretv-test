/**
 * LibreTV legal demo VOD API — Cloudflare Workers
 * Implements the Apple CMS "provide/vod" JSON shape for testing only.
 * All catalog entries are Creative Commons animated films from Blender Open Movies.
 * No scraping, third-party streaming-site aggregation, or copyrighted TV/movie sources.
 */
const DEMOS = [
  {
    vod_id: "1001",
    vod_name: "Big Buck Bunny（大兔子）",
    vod_en: "Big Buck Bunny",
    type_id: 1,
    type_name: "合法演示影片",
    vod_pic: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
    vod_remarks: "Creative Commons · Blender Open Movie",
    vod_year: "2008",
    vod_area: "全球",
    vod_lang: "无对白/英语",
    vod_actor: "Blender Foundation",
    vod_director: "Sacha Goedegebure",
    vod_content: "Blender Foundation 发布的开放动画短片。请遵守影片随附的 Creative Commons Attribution 3.0 授权与署名要求。",
    vod_time: "2026-10-19 00:00:00",
    vod_play_from: "合法演示视频",
    vod_play_url: "正片$https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4"
  },
  {
    vod_id: "1002",
    vod_name: "Sintel（辛特尔）",
    vod_en: "Sintel",
    type_id: 1,
    type_name: "合法演示影片",
    vod_pic: "https://durian.blender.org/wp-content/uploads/2010/05/03.jpg",
    vod_remarks: "Creative Commons · Blender Open Movie",
    vod_year: "2010",
    vod_area: "全球",
    vod_lang: "英语",
    vod_actor: "Blender Foundation",
    vod_director: "Colin Levy",
    vod_content: "Blender Foundation 发布的开放动画短片。请遵守影片随附的 Creative Commons Attribution 3.0 授权与署名要求。",
    vod_time: "2026-10-19 00:00:00",
    vod_play_from: "合法演示视频",
    vod_play_url: "正片$https://download.blender.org/durian/movies/sintel-1024-surround.mp4"
  }
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
  });
}

function envelope(list, page = 1, limit = 20, includeClass = false) {
  const result = {
    code: 1,
    msg: "数据列表",
    page: String(page),
    pagecount: "1",
    limit: String(limit),
    total: String(list.length),
    list
  };
  if (includeClass) result.class = [{ type_id: 1, type_name: "合法演示影片" }];
  return result;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (!["GET", "HEAD"].includes(request.method)) {
      return json({ code: 0, msg: "Only GET is supported" }, 405);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return json({
        ok: true,
        service: "LibreTV Legal Demo VOD API",
        api: "/api.php/provide/vod",
        supported: ["ac=list", "ac=videolist&wd=keyword", "ac=videolist&ids=1001", "ac=detail&ids=1001"],
        demoCount: DEMOS.length,
        note: "Test catalog only; Blender Open Movies are Creative Commons demos."
      });
    }

    // LibreTV expects an Apple CMS provide/vod endpoint. Accept the common paths.
    if (!url.pathname.endsWith("/api.php/provide/vod") &&
        !url.pathname.endsWith("/api.php/provide/vod/") &&
        !url.pathname.endsWith("/provide/vod") &&
        !url.pathname.endsWith("/provide/vod/")) {
      return json({ code: 0, msg: "Not found. Try /api.php/provide/vod or /health" }, 404);
    }

    const ac = (url.searchParams.get("ac") || "list").toLowerCase();
    const wd = (url.searchParams.get("wd") || "").trim().toLowerCase();
    const ids = (url.searchParams.get("ids") || "").split(",").map(s => s.trim()).filter(Boolean);
    const pg = Math.max(1, Number.parseInt(url.searchParams.get("pg") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("pagesize") || "20", 10) || 20));

    let found = DEMOS;
    if (ids.length) found = found.filter(item => ids.includes(item.vod_id));
    if (wd) found = found.filter(item =>
      [item.vod_name, item.vod_en, item.vod_content, item.type_name]
        .some(value => String(value || "").toLowerCase().includes(wd))
    );

    if (ac === "list") {
      return json(envelope(found.slice((pg - 1) * pageSize, pg * pageSize).map(item => {
        const { vod_play_url, ...basic } = item;
        return basic;
      }), pg, pageSize, true));
    }
    if (ac === "videolist" || ac === "detail") {
      return json(envelope(found.slice((pg - 1) * pageSize, pg * pageSize), pg, pageSize));
    }
    return json({ code: 0, msg: "Unsupported ac. Use list, videolist, or detail." }, 400);
  }
};
