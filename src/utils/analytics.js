const STORAGE_KEY = 'wte_analytics_events';

export function trackEvent(name, payload = {}) {
  const entry = {
    name,
    payload,
    at: new Date().toISOString(),
  };

  try {
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    events.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 300)));
  } catch {
    // no-op
  }

  if (import.meta.env.DEV) {
    console.log('[analytics]', entry);
  }
}

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearEvents() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getConversionStats() {
  const events = getEvents();

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - 7);
  const weekStart = weekStartDate.toISOString();

  const calcStats = (list) => {
    const recommendations = list.filter((e) => e.name === 'recommendation_complete').length;
    const orderClicks = list.filter((e) => e.name === 'order_link_click').length;
    const sponsorClicks = list.filter((e) => e.name === 'sponsor_slot_click').length;

    const conversionRate = recommendations > 0
      ? Number(((orderClicks / recommendations) * 100).toFixed(1))
      : 0;

    return { recommendations, orderClicks, sponsorClicks, conversionRate };
  };

  return {
    today: calcStats(events.filter((e) => e.at >= dayStart)),
    week: calcStats(events.filter((e) => e.at >= weekStart)),
    total: calcStats(events),
    totalEvents: events.length,
  };
}
