export function trackEvent(name, payload = {}) {
  const entry = {
    name,
    payload,
    at: new Date().toISOString(),
  };

  try {
    const key = 'wte_analytics_events';
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    events.unshift(entry);
    localStorage.setItem(key, JSON.stringify(events.slice(0, 300)));
  } catch {
    // no-op
  }

  if (import.meta.env.DEV) {
    console.log('[analytics]', entry);
  }
}
