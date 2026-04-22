const STORAGE_KEY = 'studyActivity';

function getLocalDateString(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
}

export function trackActivity() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const today = getLocalDateString();
  
  data[today] = (data[today] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getActivityData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

export function calculateStats(data) {
  const dates = Object.keys(data).sort();
  if (dates.length === 0) return { streak: 0, total: 0, best: 'None' };

  let total = 0;
  let bestCount = 0;
  let bestDay = 'None';
  
  for (const date in data) {
    total += data[date];
    if (data[date] > bestCount) {
      bestCount = data[date];
      bestDay = date;
    }
  }

  // Calculate Streak (Daily)
  let streak = 0;
  let checkDate = new Date();
  const todayStr = getLocalDateString(checkDate);
  
  // If no activity today, check if yesterday was active to maintain streak
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (!data[todayStr] && !data[yesterdayStr]) {
    return { streak: 0, total, best: bestDay };
  }

  // Start from the most recent active day (today or yesterday)
  let currentCheck = data[todayStr] ? new Date() : yesterday;
  
  while (true) {
    const dateStr = getLocalDateString(currentCheck);
    if (data[dateStr]) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else {
      break;
    }
  }

  return { streak, total, best: bestDay };
}
