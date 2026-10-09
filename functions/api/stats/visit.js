import { checkKV, json, getUserFromRequest, ADMIN_EMAIL } from "../../_lib.js";

function getVisitorInfo(request) {
  const ua = request.headers.get("User-Agent") || "";
  const referer = request.headers.get("Referer") || "direct";
  
  // Detect OS
  let os = "Unknown";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6/.test(ua)) os = "Windows 7/8";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";
  
  // Detect device type
  let device = "Desktop";
  if (/Mobile|Android|iPhone|iPod/.test(ua)) device = "Mobile";
  else if (/iPad|Tablet/.test(ua)) device = "Tablet";
  
  // Detect source (simplified)
  let source = "direct";
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
      source = "direct";
    }
  }
  
  return { os, device, source };
}

async function getStats(env) {
  const raw = await env.USERS.get("visit_stats");
  return raw ? JSON.parse(raw) : {
    totalVisits: 0,
    uniqueVisitors: 0,
    osStats: {},
    deviceStats: {},
    sourceStats: {},
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
  const { os, device, source } = getVisitorInfo(request);
  const today = new Date().toISOString().split("T")[0];
  
  // Total visits
  stats.totalVisits++;
  
  // OS stats
  stats.osStats[os] = (stats.osStats[os] || 0) + 1;
  
  // Device stats
  stats.deviceStats[device] = (stats.deviceStats[device] || 0) + 1;
  
  // Source stats
  stats.sourceStats[source] = (stats.sourceStats[source] || 0) + 1;
  
  // Daily visits
  stats.dailyVisits[today] = (stats.dailyVisits[today] || 0) + 1;
  
  // Unique visitors (approximate by counting today's visits as unique)
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
    // Public: only basic stats
    return json({
      stats: {
        totalVisits: stats.totalVisits,
        uniqueVisitors: stats.uniqueVisitors,
        deviceStats: stats.deviceStats,
      }
    });
  }
}
