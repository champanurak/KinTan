export const COOK_STATS_KEY = "cook_stats";

export interface CookStat {
  name: string;
  emoji: string;
  img?: string;
  count: number;
}

export function recordCook(
  menuId: string,
  info: { name: string; emoji: string; img?: string },
) {
  try {
    const raw = localStorage.getItem(COOK_STATS_KEY);
    const stats: Record<string, CookStat> = raw ? JSON.parse(raw) : {};
    const prev = stats[menuId];
    stats[menuId] = {
      name: info.name,
      emoji: info.emoji,
      img: info.img,
      count: (prev?.count ?? 0) + 1,
    };
    localStorage.setItem(COOK_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function getTopMenus(limit = 3): (CookStat & { menuId: string })[] {
  try {
    const raw = localStorage.getItem(COOK_STATS_KEY);
    if (!raw) return [];
    const stats: Record<string, CookStat> = JSON.parse(raw);
    return Object.entries(stats)
      .map(([menuId, stat]) => ({ menuId, ...stat }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch {
    return [];
  }
}
