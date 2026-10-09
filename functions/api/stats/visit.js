import { checkKV, json, getUserFromRequest, ADMIN_EMAIL } from "../../_lib.js";

function getVisitorInfo(request) {
  const ua = request.headers.get("User-Agent") || "";
  const referer = request.headers.get("Referer") || "direct";

  // Detect OS — 细分 Windows 版本
  let os = "其它";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6\.2/.test(ua)) os = "Windows 8";
  else if (/Windows NT 6\.1/.test(ua)) os = "Windows 7";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  // Detect device type
  let device = "电脑";
  if (/Mobile|Android|iPhone|iPod/.test(ua)) device = "手机";
  else if (/iPad|Tablet/.test(ua)) device = "平板";

  // Detect source — 搜索引擎来源
  let source = "直接访问";
  if (referer && referer !== "direct") {
    try {
      const url = new URL(referer);
      const domain = url.hostname.replace(/^www\./, "");
      if (/google\./.test(domain)) source = "Google";
      else if (/baidu\./.test(domain)) source = "百度";
      else if (/bing\./.test(domain)) source = "Bing";
      else if (/so\.com/.test(domain)) source = "360";
      else if (/sogou\./.test(domain)) source = "搜狗";
      else source = domain;
    } catch {
      source = "直接访问";
    }
  }

  // Detect region — 使用 Cloudflare 的 cf 对象获取 IP 地理位置
  let region = "未知";
  const cf = request.cf;
  if (cf) {
    const country = cf.country || cf.countryName;
    const city = cf.city || cf.colo;
    if (country) {
      // 国家中文映射
      const countryMap = {
        "CN": "中国", "US": "美国", "JP": "日本", "KR": "韩国",
        "GB": "英国", "DE": "德国", "FR": "法国", "CA": "加拿大",
        "AU": "澳大利亚", "SG": "新加坡", "HK": "中国香港", "TW": "中国台湾",
        "RU": "俄罗斯", "IN": "印度", "BR": "巴西",
      };
      const countryName = countryMap[country] || country;
      if (country === "CN" && city) {
        region = `中国·${city}`;
      } else {
        region = countryName;
      }
    }
  }

  return { os, device, source, region };
}

async function getStats(env) {
  const raw = await env.USERS.get("visit_stats");
  return raw ? JSON.parse(raw) : {
    totalVisits: 0,
    uniqueVisitors: 0,
    osStats: {},
    deviceStats: {},
    sourceStats: {},
    regionStats: {},
    dailyVisits: {},
  };
}

async function saveStats(env, stats) {
  await env.USERS.put("visit_stats", JSON.stringify(stats));
}

// Record a visit
export async function onRequestPost({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const stats = await getStats(env);
  const { os, device, source, region } = getVisitorInfo(request);
  const today = new Date().toISOString().split("T")[0];

  stats.totalVisits++;
  stats.osStats[os] = (stats.osStats[os] || 0) + 1;
  stats.deviceStats[device] = (stats.deviceStats[device] || 0) + 1;
  stats.sourceStats[source] = (stats.sourceStats[source] || 0) + 1;
  stats.regionStats[region] = (stats.regionStats[region] || 0) + 1;
  stats.dailyVisits[today] = (stats.dailyVisits[today] || 0) + 1;

  const days = Object.keys(stats.dailyVisits).length;
  stats.uniqueVisitors = Math.round(stats.totalVisits / Math.max(1, days) * 0.7);

  await saveStats(env, stats);

  return json({ success: true });
}

// Get stats (admin only for detailed, public for basic)
export async function onRequestGet({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const stats = await getStats(env);
  const user = await getUserFromRequest(request, env);
  const isAdmin = user && user.email === ADMIN_EMAIL.toLowerCase();

  if (isAdmin) {
    return json({ stats });
  } else {
    return json({
      stats: {
        totalVisits: stats.totalVisits,
        uniqueVisitors: stats.uniqueVisitors,
        deviceStats: stats.deviceStats,
      }
    });
  }
}
