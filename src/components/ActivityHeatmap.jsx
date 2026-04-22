import { useMemo } from 'react';
import { getActivityData, calculateStats } from '../services/activityTracker';
import './ActivityHeatmap.css';

function getLocalDateString(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
}

export default function ActivityHeatmap() {
  const activityData = useMemo(() => getActivityData(), []);
  const stats = useMemo(() => calculateStats(activityData), [activityData]);

  const days = useMemo(() => {
    const result = [];
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);
    
    // Adjust start to previous Sunday for grid alignment
    start.setDate(start.getDate() - start.getDay());

    let current = new Date(start);
    while (current <= end) {
      const dateStr = getLocalDateString(current);
      const count = activityData[dateStr] || 0;
      
      let level = 0;
      if (count > 0) level = 1;
      if (count > 2) level = 2;
      if (count > 5) level = 3;
      if (count > 10) level = 4;

      result.push({
        date: dateStr,
        count,
        level,
        isNewMonth: current.getDate() === 1
      });
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [activityData]);

  return (
    <div className="activity-container">
      <div className="heatmap-card">
        <div className="heatmap-header">
          <h3 className="heatmap-title">Study Activity</h3>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="level-box level-0"></div>
            <div className="level-box level-1"></div>
            <div className="level-box level-2"></div>
            <div className="level-box level-3"></div>
            <div className="level-box level-4"></div>
            <span>More</span>
          </div>
        </div>

        <div className="heatmap-scroll-area">
          <div className="heatmap-grid">
            {days.map((day, i) => (
              <div 
                key={day.date} 
                className={`heatmap-day level-${day.level}`}
                title={`${day.count} activities on ${day.date}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="activity-stats-sidebar">
        <div className="stat-item">
          <span className="stat-label">Current Streak</span>
          <span className="stat-value">{stats.streak} days</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Contributions</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Best Day</span>
          <span className="stat-value">{stats.best}</span>
        </div>
      </div>
    </div>
  );
}
