import { useState } from 'react';
import { getConversionStats, clearEvents } from '../utils/analytics';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('today');
  const [refreshTick, setRefreshTick] = useState(0);

  const stats = getConversionStats();
  const current = stats[period] || stats.today;

  const safeRate = Number(current.conversionRate || 0);

  const handleRefresh = () => setRefreshTick((v) => v + 1);
  const handleClear = () => {
    if (window.confirm('이벤트 로그를 초기화할까요?')) {
      clearEvents();
      handleRefresh();
    }
  };

  return (
    <div className="analytics-box">
      <div className="analytics-head">
        <h3>📈 전환 대시보드</h3>
        <div className="analytics-actions">
          <button onClick={handleRefresh}>새로고침</button>
          <button onClick={handleClear}>초기화</button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button className={period === 'today' ? 'active' : ''} onClick={() => setPeriod('today')}>오늘</button>
        <button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>7일</button>
        <button className={period === 'total' ? 'active' : ''} onClick={() => setPeriod('total')}>전체</button>
      </div>

      <div className="analytics-grid">
        <div className="card"><p>추천 완료</p><strong>{current.recommendations}</strong></div>
        <div className="card"><p>주문 클릭</p><strong>{current.orderClicks}</strong></div>
        <div className="card"><p>스폰서 클릭</p><strong>{current.sponsorClicks}</strong></div>
        <div className="card highlight"><p>전환율</p><strong>{safeRate}%</strong></div>
      </div>

      <div className="progress-wrap">
        <div className="progress-label">추천 대비 주문 클릭 비율</div>
        <div className="progress">
          <div className="fill" style={{ width: `${Math.min(safeRate, 100)}%` }} />
        </div>
      </div>

      <p className="footnote">누적 이벤트: {stats.totalEvents} · 갱신 {refreshTick}</p>
    </div>
  );
}
