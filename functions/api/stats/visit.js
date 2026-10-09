import { checkKV, json, getUserFromRequest, ADMIN_EMAIL } from "../../_lib.js";

// 国家代码 → 中文名
const COUNTRY_MAP = {
  CN: "中国", US: "美国", JP: "日本", KR: "韩国",
  GB: "英国", DE: "德国", FR: "法国", CA: "加拿大",
  AU: "澳大利亚", SG: "新加坡", HK: "中国香港", TW: "中国台湾",
  MO: "中国澳门", RU: "俄罗斯", IN: "印度", BR: "巴西",
  IT: "意大利", ES: "西班牙", NL: "荷兰", SE: "瑞典",
  CH: "瑞士", TH: "泰国", MY: "马来西亚", ID: "印度尼西亚",
  PH: "菲律宾", VN: "越南", NZ: "新西兰", AE: "阿联酋",
  SA: "沙特阿拉伯", TR: "土耳其", MX: "墨西哥", ZA: "南非",
  EG: "埃及", PL: "波兰", BE: "比利时", AT: "奥地利",
  DK: "丹麦", FI: "芬兰", NO: "挪威", IE: "爱尔兰",
  PT: "葡萄牙", GR: "希腊", CZ: "捷克", UA: "乌克兰",
};

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
  let country = "未知地区";
  let city = "";
  const cf = request.cf;
  if (cf) {
    const countryCode = cf.country;
    const cfCity = cf.city;
    if (countryCode) {
      country = COUNTRY_MAP[countryCode] || cf.countryName || countryCode;
      if (countryCode === "CN" && cfCity) {
        city = cfCity;
      }
    }
  }

  return { os, device, source, country, city };
}

// 旧数据规范化：合并英文设备名、拆分"中国·城市"格式
function normalizeStats(stats) {
  // 设备：Desktop→电脑, Mobile→手机, Tablet→平板
  const deviceMap = { Desktop: "电脑", Computer: "电脑", PC: "电脑", Mobile: "手机", Phone: "手机", Tablet: "平板" };
  if (stats.deviceStats) {
    for (const [oldName, newName] of Object.entries(deviceMap)) {
      if (stats.deviceStats[oldName] !== undefined) {
        stats.deviceStats[newName] = (stats.deviceStats[newName] || 0) + stats.deviceStats[oldName];
        delete stats.deviceStats[oldName];
      }
    }
  }

  // 地区：从旧的 regionStats（"中国·北京"混合格式）迁移出 countryStats / cityStats
  if (!stats.countryStats || !stats.cityStats) {
    stats.countryStats = {};
    stats.cityStats = {};
    if (stats.regionStats) {
      for (const [region, count] of Object.entries(stats.regionStats)) {
        const idx = region.indexOf("·");
        if (idx >= 0) {
          const c = region.slice(0, idx);
          const cityName = region.slice(idx + 1);
          stats.countryStats[c] = (stats.countryStats[c] || 0) + count;
          stats.cityStats[cityName] = (stats.cityStats[cityName] || 0) + count;
        } else if (region === "未知") {
          stats.countryStats["未知地区"] = (stats.countryStats["未知地区"] || 0) + count;
        } else {
          // 纯国家名
          stats.countryStats[region] = (stats.countryStats[region] || 0) + count;
          stats.cityStats[region] = (stats.cityStats[region] || 0) + count;
        }
      }
    }
  }

  return stats;
}

async function getStats(env) {
  const raw = await env.USERS.get("visit_stats");
  const base = raw ? JSON.parse(raw) : {
    totalVisits: 0,
    uniqueVisitors: 0,
    osStats: {},
    deviceStats: {},
    sourceStats: {},
    regionStats: {},
    countryStats: {},
    cityStats: {},
    dailyVisits: {},
  };
  return normalizeStats(base);
}

async function saveStats(env, stats) {
  await env.USERS.put("visit_stats", JSON.stringify(stats));
}

// Record a visit
export async function onRequestPost({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const stats = await getStats(env);
  const { os, device, source, country, city } = getVisitorInfo(request);
  const today = new Date().toISOString().split("T")[0];

  stats.totalVisits++;
  stats.osStats[os] = (stats.osStats[os] || 0) + 1;
  stats.deviceStats[device] = (stats.deviceStats[device] || 0) + 1;
  stats.sourceStats[source] = (stats.sourceStats[source] || 0) + 1;
  stats.countryStats[country] = (stats.countryStats[country] || 0) + 1;
  // 中国访客记城市，其他国家记国家名（内环可显示）；未知地区不记城市
  if (city) {
    stats.cityStats[city] = (stats.cityStats[city] || 0) + 1;
  } else if (country !== "未知地区") {
    stats.cityStats[country] = (stats.cityStats[country] || 0) + 1;
  }
  // 保留旧字段兼容
  const regionLabel = city ? `${country}·${city}` : country;
  stats.regionStats[regionLabel] = (stats.regionStats[regionLabel] || 0) + 1;
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
