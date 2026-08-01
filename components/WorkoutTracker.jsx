'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Footprints, MapPin, Flame, Trophy, Calendar, Plus, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_ABBR_MAP = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };

// ---- Seed data: verified historical workout log (2 Jan - 17 Jul 2026) ----
const SEED_WORKOUTS = [
  { srNo:1, date:'2026-01-02', workout:'Running', distanceKm:1.73, time:'13:33', pace:'7:50', calories:136, pushups:null },
  { srNo:2, date:'2026-01-03', workout:'Running', distanceKm:2.10, time:'14:49', pace:'7:04', calories:164, pushups:null },
  { srNo:3, date:'2026-01-04', workout:'Running', distanceKm:1.30, time:'18:23', pace:'14:06', calories:70, pushups:null },
  { srNo:4, date:'2026-01-05', workout:'Running', distanceKm:1.98, time:'13:09', pace:'6:38', calories:159, pushups:null },
  { srNo:5, date:'2026-01-06', workout:'Running', distanceKm:2.14, time:'14:08', pace:'6:36', calories:170, pushups:null },
  { srNo:6, date:'2026-01-07', workout:'Running', distanceKm:2.11, time:'13:35', pace:'6:27', calories:167, pushups:null },
  { srNo:7, date:'2026-01-09', workout:'Running', distanceKm:2.15, time:'13:39', pace:'6:22', calories:171, pushups:null },
  { srNo:8, date:'2026-01-11', workout:'Running', distanceKm:1.32, time:'12:17', pace:'9:18', calories:91, pushups:null },
  { srNo:9, date:'2026-01-12', workout:'Running', distanceKm:1.88, time:'12:34', pace:'6:41', calories:146, pushups:null },
  { srNo:10, date:'2026-01-13', workout:'Running', distanceKm:1.67, time:'12:03', pace:'7:13', calories:129, pushups:null },
  { srNo:11, date:'2026-01-14', workout:'Running', distanceKm:2.06, time:'13:37', pace:'6:36', calories:165, pushups:null },
  { srNo:12, date:'2026-01-15', workout:'Running', distanceKm:2.25, time:'13:55', pace:'6:12', calories:177, pushups:null },
  { srNo:13, date:'2026-01-16', workout:'Running', distanceKm:2.07, time:'13:40', pace:'6:36', calories:163, pushups:null },
  { srNo:14, date:'2026-01-19', workout:'Running', distanceKm:2.62, time:'17:07', pace:'6:32', calories:207, pushups:null },
  { srNo:15, date:'2026-01-21', workout:'Running', distanceKm:2.78, time:'17:22', pace:'6:15', calories:219, pushups:null },
  { srNo:16, date:'2026-01-22', workout:'Running', distanceKm:2.77, time:'17:30', pace:'6:19', calories:215, pushups:null },
  { srNo:17, date:'2026-01-28', workout:'Running', distanceKm:3.28, time:'20:45', pace:'6:19', calories:264, pushups:null },
  { srNo:18, date:'2026-01-29', workout:'Running', distanceKm:2.03, time:'12:42', pace:'6:16', calories:164, pushups:null },
  { srNo:19, date:'2026-01-30', workout:'Running', distanceKm:4.08, time:'25:12', pace:'6:11', calories:322, pushups:null },
  { srNo:20, date:'2026-01-31', workout:'Running', distanceKm:4.43, time:'27:26', pace:'6:11', calories:347, pushups:null },
  { srNo:21, date:'2026-02-02', workout:'Running', distanceKm:4.02, time:'25:00', pace:'6:13', calories:315, pushups:null },
  { srNo:22, date:'2026-02-13', workout:'Running', distanceKm:3.35, time:'23:21', pace:'6:58', calories:260, pushups:null },
  { srNo:23, date:'2026-02-25', workout:'Running', distanceKm:2.70, time:'18:30', pace:'6:51', calories:215, pushups:null },
  { srNo:24, date:'2026-02-26', workout:'Running', distanceKm:3.50, time:'22:37', pace:'6:28', calories:273, pushups:null },
  { srNo:25, date:'2026-02-27', workout:'Running', distanceKm:4.13, time:'25:51', pace:'6:15', calories:322, pushups:null },
  { srNo:26, date:'2026-03-01', workout:'Running', distanceKm:2.16, time:'14:21', pace:'6:39', calories:167, pushups:null },
  { srNo:27, date:'2026-03-02', workout:'Running', distanceKm:4.10, time:'25:20', pace:'6:10', calories:318, pushups:null },
  { srNo:28, date:'2026-03-03', workout:'Running', distanceKm:2.48, time:'15:40', pace:'6:18', calories:190, pushups:null },
  { srNo:29, date:'2026-03-04', workout:'Running', distanceKm:4.11, time:'25:36', pace:'6:13', calories:322, pushups:null },
  { srNo:30, date:'2026-04-08', workout:'Running', distanceKm:1.66, time:'11:55', pace:'7:11', calories:127, pushups:null },
  { srNo:31, date:'2026-04-17', workout:'Running', distanceKm:2.09, time:'13:42', pace:'6:33', calories:166, pushups:null },
  { srNo:32, date:'2026-04-18', workout:'Running', distanceKm:2.11, time:'13:48', pace:'6:32', calories:168, pushups:null },
  { srNo:33, date:'2026-04-21', workout:'Running', distanceKm:2.06, time:'13:21', pace:'6:29', calories:163, pushups:null },
  { srNo:34, date:'2026-04-22', workout:'Walking', distanceKm:2.92, time:'36:55', pace:'12:39', calories:195, pushups:null },
  { srNo:35, date:'2026-04-23', workout:'Running', distanceKm:2.07, time:'13:34', pace:'6:33', calories:164, pushups:null },
  { srNo:36, date:'2026-04-24', workout:'Running', distanceKm:2.10, time:'13:18', pace:'6:20', calories:165, pushups:null },
  { srNo:37, date:'2026-05-03', workout:'Running', distanceKm:2.05, time:'12:54', pace:'6:18', calories:162, pushups:null },
  { srNo:38, date:'2026-05-19', workout:'Running', distanceKm:1.67, time:'10:34', pace:'6:18', calories:131, pushups:null },
  { srNo:39, date:'2026-06-16', workout:'Running', distanceKm:1.65, time:'10:44', pace:'6:30', calories:131, pushups:null },
  { srNo:40, date:'2026-06-17', workout:'Running', distanceKm:2.06, time:'13:34', pace:'6:36', calories:164, pushups:null },
  { srNo:41, date:'2026-06-18', workout:'Running', distanceKm:2.05, time:'13:06', pace:'6:24', calories:163, pushups:null },
  { srNo:42, date:'2026-06-19', workout:'Running', distanceKm:2.06, time:'12:53', pace:'6:15', calories:164, pushups:null },
  { srNo:43, date:'2026-06-20', workout:'Running', distanceKm:2.05, time:'12:22', pace:'6:01', calories:163, pushups:null },
  { srNo:44, date:'2026-06-21', workout:'Running', distanceKm:2.06, time:'12:43', pace:'6:11', calories:164, pushups:null },
  { srNo:45, date:'2026-06-22', workout:'Running', distanceKm:2.08, time:'13:04', pace:'6:16', calories:167, pushups:null },
  { srNo:46, date:'2026-06-23', workout:'Running', distanceKm:2.15, time:'13:42', pace:'6:23', calories:171, pushups:null },
  { srNo:47, date:'2026-06-24', workout:'Running', distanceKm:2.51, time:'16:07', pace:'6:25', calories:192, pushups:null },
  { srNo:48, date:'2026-06-25', workout:'Running', distanceKm:2.46, time:'15:57', pace:'6:29', calories:195, pushups:null },
  { srNo:49, date:'2026-06-26', workout:'Running', distanceKm:2.52, time:'18:26', pace:'7:19', calories:192, pushups:null },
  { srNo:50, date:'2026-06-27', workout:'Running', distanceKm:2.53, time:'16:53', pace:'6:41', calories:199, pushups:null },
  { srNo:51, date:'2026-06-28', workout:'Walking', distanceKm:4.67, time:'1:00:14', pace:'12:53', calories:242, pushups:null },
  { srNo:52, date:'2026-06-29', workout:'Running', distanceKm:2.64, time:'17:44', pace:'6:43', calories:208, pushups:null },
  { srNo:53, date:'2026-06-30', workout:'Running', distanceKm:2.70, time:'18:28', pace:'6:50', calories:213, pushups:null },
  { srNo:54, date:'2026-07-02', workout:'Walking', distanceKm:1.80, time:'21:43', pace:'12:05', calories:93, pushups:null },
  { srNo:55, date:'2026-07-03', workout:'Walking', distanceKm:3.49, time:'41:05', pace:'11:47', calories:180, pushups:null },
  { srNo:56, date:'2026-07-09', workout:'Walking', distanceKm:5.21, time:'1:03:44', pace:'12:14', calories:270, pushups:null },
  { srNo:57, date:'2026-07-10', workout:'Walking', distanceKm:5.42, time:'1:02:26', pace:'11:31', calories:281, pushups:null },
  { srNo:58, date:'2026-07-11', workout:'Walking', distanceKm:5.31, time:'1:02:17', pace:'11:44', calories:270, pushups:null },
  { srNo:59, date:'2026-07-12', workout:'Walking', distanceKm:6.68, time:'1:20:08', pace:'12:00', calories:341, pushups:null },
  { srNo:60, date:'2026-07-13', workout:'Walking', distanceKm:5.12, time:'1:00:47', pace:'11:53', calories:265, pushups:null },
  { srNo:61, date:'2026-07-14', workout:'Walking', distanceKm:9.18, time:'1:50:32', pace:'12:02', calories:468, pushups:null },
  { srNo:62, date:'2026-07-15', workout:'Walking', distanceKm:5.78, time:'1:15:08', pace:'13:02', calories:298, pushups:null },
  { srNo:63, date:'2026-07-16', workout:'Walking', distanceKm:5.27, time:'1:05:11', pace:'12:23', calories:268, pushups:null },
  { srNo:64, date:'2026-07-17', workout:'Walking', distanceKm:5.19, time:'1:06:21', pace:'12:46', calories:270, pushups:null },
];

// ---- Helpers ----
function formatDateDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTH_NAMES[m - 1]} ${y}`;
}

function formatMonthTick(iso) {
  if (!iso) return '';
  const [y, m] = iso.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} '${y.slice(2)}`;
}

function parseTimeToSeconds(str) {
  if (!str) return 0;
  const s = str.trim();
  if (/^\d+:\d{2}(:\d{2})?$/.test(s)) {
    const parts = s.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  let total = 0;
  const hrMatch = s.match(/(\d+)\s*hr/i);
  const minMatch = s.match(/(\d+)\s*min/i);
  const secMatch = s.match(/(\d+)\s*sec/i);
  if (hrMatch) total += parseInt(hrMatch[1], 10) * 3600;
  if (minMatch) total += parseInt(minMatch[1], 10) * 60;
  if (secMatch) total += parseInt(secMatch[1], 10);
  return total;
}

// Always store/display time as a canonical H:MM:SS or MM:SS string, regardless of
// how the user typed it in (fixes bulk/single entries showing raw "1hr 6min 21sec").
function normalizeTimeDisplay(str) {
  const totalSeconds = parseTimeToSeconds(str);
  if (totalSeconds <= 0) return str.trim();
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parsePaceToSecondsPerKm(str) {
  if (!str) return 0;
  const clean = str.replace(/\/km/i, '').trim();
  const parts = clean.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
  return 0;
}

function formatSecondsAsMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Always store/display pace as canonical "M:SS" (strips stray "/km" suffixes etc.)
function normalizePaceDisplay(str) {
  const sec = parsePaceToSecondsPerKm(str);
  if (sec <= 0) return str.replace(/\/km/i, '').trim();
  return formatSecondsAsMMSS(sec);
}

function parseDateFlexible(str) {
  if (!str) return null;
  const s = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthKey = m[2].slice(0, 3).toLowerCase();
    const month = MONTH_ABBR_MAP[monthKey];
    if (!month) return null;
    return `${m[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return null;
}

function computeStats(workouts) {
  const totalWorkouts = workouts.length;
  const runningCount = workouts.filter(w => w.workout === 'Running').length;
  const walkingCount = workouts.filter(w => w.workout === 'Walking').length;
  const totalDistance = workouts.reduce((sum, w) => sum + w.distanceKm, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  return { totalWorkouts, runningCount, walkingCount, totalDistance, totalCalories };
}

function computeStreaks(workouts) {
  if (workouts.length === 0) return { current: 0, longest: 0, longestRange: null, lastDate: null };
  const uniqueDates = [...new Set(workouts.map(w => w.date))].sort();
  const dateObjs = uniqueDates.map(d => new Date(d + 'T00:00:00'));

  let longest = 1, longestEndIdx = 0, runStart = 0;
  for (let i = 1; i < dateObjs.length; i++) {
    const diffDays = Math.round((dateObjs[i] - dateObjs[i - 1]) / 86400000);
    if (diffDays !== 1) runStart = i;
    const currentRunLen = i - runStart + 1;
    if (currentRunLen > longest) {
      longest = currentRunLen;
      longestEndIdx = i;
    }
  }
  const longestStartIdx = longestEndIdx - longest + 1;
  const longestRange = { start: uniqueDates[longestStartIdx], end: uniqueDates[longestEndIdx] };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = dateObjs[dateObjs.length - 1];
  const diffFromToday = Math.round((today - lastDate) / 86400000);

  let current = 0;
  if (diffFromToday <= 1) {
    let len = 1;
    for (let i = dateObjs.length - 1; i > 0; i--) {
      const diffDays = Math.round((dateObjs[i] - dateObjs[i - 1]) / 86400000);
      if (diffDays === 1) len++;
      else break;
    }
    current = len;
  }
  return { current, longest, longestRange, lastDate: uniqueDates[uniqueDates.length - 1] };
}

function computePersonalRecords(workouts) {
  if (workouts.length === 0) return null;
  const runs = workouts.filter(w => w.workout === 'Running');
  const walks = workouts.filter(w => w.workout === 'Walking');

  const longestRun = runs.length ? runs.reduce((a, b) => (b.distanceKm > a.distanceKm ? b : a)) : null;
  const longestWalk = walks.length ? walks.reduce((a, b) => (b.distanceKm > a.distanceKm ? b : a)) : null;
  const fastestRun = runs.length
    ? runs.reduce((a, b) => (parsePaceToSecondsPerKm(b.pace) < parsePaceToSecondsPerKm(a.pace) ? b : a))
    : null;
  const highestCalories = workouts.reduce((a, b) => (b.calories > a.calories ? b : a));
  const totalDistance = workouts.reduce((s, w) => s + w.distanceKm, 0);

  return { longestRun, longestWalk, fastestRun, highestCalories, totalDistance };
}

function computeMonthlySummary(workouts) {
  if (workouts.length === 0) return null;
  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
  const lastDate = sorted[sorted.length - 1].date;
  const [y, m] = lastDate.split('-');
  const monthEntries = workouts.filter(w => w.date.startsWith(`${y}-${m}`));
  const distance = monthEntries.reduce((s, w) => s + w.distanceKm, 0);
  const calories = monthEntries.reduce((s, w) => s + w.calories, 0);
  return { label: `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`, count: monthEntries.length, distance, calories };
}

function computeMonthlyBars(workouts) {
  const map = {};
  workouts.forEach(w => {
    const key = w.date.slice(0, 7);
    if (!map[key]) map[key] = 0;
    map[key] += w.distanceKm;
  });
  return Object.keys(map).sort().map(key => {
    const [y, m] = key.split('-');
    return { key, label: `${MONTH_NAMES[parseInt(m, 10) - 1]} '${y.slice(2)}`, distance: parseFloat(map[key].toFixed(2)) };
  });
}

function computeComparison(entry, allWorkouts) {
  if (!entry) return null;
  const sameType = allWorkouts.filter(w => w.workout === entry.workout);
  const paceSec = parsePaceToSecondsPerKm(entry.pace);

  const yDate = new Date(entry.date + 'T00:00:00');
  yDate.setDate(yDate.getDate() - 1);
  const yIso = yDate.toISOString().slice(0, 10);
  const yesterdayEntry = allWorkouts.find(w => w.date === yIso) || null;
  const yesterday = yesterdayEntry
    ? { distanceKm: yesterdayEntry.distanceKm, calories: yesterdayEntry.calories, paceSec: parsePaceToSecondsPerKm(yesterdayEntry.pace) }
    : null;

  const entryDate = new Date(entry.date + 'T00:00:00');
  const weekStart = new Date(entryDate);
  weekStart.setDate(weekStart.getDate() - 7);
  const prevWeekEntries = sameType.filter(w => {
    const d = new Date(w.date + 'T00:00:00');
    return d >= weekStart && d < entryDate;
  });
  const prevWeekAvg = prevWeekEntries.length
    ? {
        distanceKm: prevWeekEntries.reduce((s, w) => s + w.distanceKm, 0) / prevWeekEntries.length,
        calories: prevWeekEntries.reduce((s, w) => s + w.calories, 0) / prevWeekEntries.length,
        paceSec: prevWeekEntries.reduce((s, w) => s + parsePaceToSecondsPerKm(w.pace), 0) / prevWeekEntries.length,
        count: prevWeekEntries.length,
      }
    : null;

  const overallEntries = sameType.filter(w => w.srNo !== entry.srNo);
  const overallAvg = overallEntries.length
    ? {
        distanceKm: overallEntries.reduce((s, w) => s + w.distanceKm, 0) / overallEntries.length,
        calories: overallEntries.reduce((s, w) => s + w.calories, 0) / overallEntries.length,
        paceSec: overallEntries.reduce((s, w) => s + parsePaceToSecondsPerKm(w.pace), 0) / overallEntries.length,
        count: overallEntries.length,
      }
    : null;

  return { entry, paceSec, yesterday, prevWeekAvg, overallAvg };
}

// ---- Small presentational components ----
function StatCard({ icon: Icon, label, value, subValue, bg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-2xl font-mono font-bold tabular-nums text-slate-800 mt-0.5">{value}</p>
        {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

function StreakCard({ workouts, streaks }) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const entry = workouts.find(w => w.date === iso);
    days.push({ iso, workout: entry ? entry.workout : null });
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FCE7F3' }}>
        <Flame size={20} style={{ color: '#DB2777' }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Streak</p>
        <p className="text-2xl font-mono font-bold tabular-nums text-slate-800 mt-0.5">
          {streaks.current} {streaks.current === 1 ? 'day' : 'days'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Best: {streaks.longest} days · Last: {streaks.lastDate ? formatDateDisplay(streaks.lastDate) : '—'}
        </p>
      </div>
      <div className="flex gap-1 mt-1">
        {days.map(d => (
          <div
            key={d.iso}
            title={d.iso}
            className="flex-1 h-2 rounded-full"
            style={{
              backgroundColor: d.workout === 'Running' ? '#3B82F6' : d.workout === 'Walking' ? '#22C55E' : '#E2E8F0',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PRCard({ pr }) {
  if (!pr) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF9C3' }}>
        <Trophy size={20} style={{ color: '#CA8A04' }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Personal Records</p>
        <p className="text-sm text-slate-700 mt-1.5">
          Longest run: <span className="font-mono font-semibold">{pr.longestRun ? pr.longestRun.distanceKm.toFixed(2) : '—'} km</span>
        </p>
        <p className="text-sm text-slate-700">
          Fastest pace: <span className="font-mono font-semibold">{pr.fastestRun ? pr.fastestRun.pace : '—'}/km</span>
        </p>
      </div>
    </div>
  );
}

function MonthlyCard({ monthly }) {
  if (!monthly) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
        <Calendar size={20} style={{ color: '#4F46E5' }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Monthly Summary</p>
        <p className="text-lg font-mono font-bold text-slate-800 mt-0.5">{monthly.label}</p>
        <p className="text-xs text-slate-500 mt-1">
          {monthly.count} workouts · {monthly.distance.toFixed(2)} km · {monthly.calories.toLocaleString()} kcal
        </p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{formatDateDisplay(point.fullDate)}</p>
      {point.running != null && <p style={{ color: '#3B82F6' }}>Running: {point.running.toFixed(2)} km</p>}
      {point.walking != null && <p style={{ color: '#22C55E' }}>Walking: {point.walking.toFixed(2)} km</p>}
    </div>
  );
}

function DetailedTooltip({ active, payload, workouts }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  const entry = workouts.find(w => w.date === point.fullDate);
  if (!entry) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2.5 text-xs space-y-1 min-w-[150px]">
      <p className="font-semibold text-slate-700">{formatDateDisplay(entry.date)} · {entry.workout}</p>
      <p className="text-slate-500">Distance: <span className="font-mono text-slate-700">{entry.distanceKm.toFixed(2)} km</span></p>
      <p className="text-slate-500">Time: <span className="font-mono text-slate-700">{entry.time}</span></p>
      <p className="text-slate-500">Pace: <span className="font-mono text-slate-700">{entry.pace}/km</span></p>
      <p className="text-slate-500">Calories: <span className="font-mono text-slate-700">{entry.calories} kcal</span></p>
    </div>
  );
}

function ChartCard({ workouts, detailed }) {
  const chartData = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map(w => ({
      fullDate: w.date,
      running: w.workout === 'Running' ? w.distanceKm : null,
      walking: w.workout === 'Walking' ? w.distanceKm : null,
    }));
  }, [workouts]);

  const tickInterval = Math.max(0, Math.floor(chartData.length / 6));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Running vs Walking — Distance Over Time</h3>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
            Running
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22C55E' }} />
            Walking
          </span>
          {detailed && <span className="text-slate-400">Hover a point for full details</span>}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="fullDate"
            tickFormatter={formatMonthTick}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            interval={tickInterval}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'km', position: 'insideLeft', style: { fontSize: 11, fill: '#94A3B8' } }}
          />
          <Tooltip content={detailed ? <DetailedTooltip workouts={workouts} /> : <CustomTooltip />} />
          <Line type="monotone" dataKey="running" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6' }} connectNulls={false} name="Running" />
          <Line type="monotone" dataKey="walking" stroke="#22C55E" strokeWidth={2} dot={{ r: 4, fill: '#22C55E' }} connectNulls={false} name="Walking" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DashboardPage({ workouts, stats, streaks, pr, monthly }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Workouts" value={stats.totalWorkouts} bg="#EDE9FE" iconColor="#7C3AED" />
        <StatCard icon={Footprints} label="Running" value={stats.runningCount} bg="#DBEAFE" iconColor="#2563EB" />
        <StatCard icon={Footprints} label="Walking" value={stats.walkingCount} bg="#DCFCE7" iconColor="#16A34A" />
        <StatCard icon={MapPin} label="Distance" value={`${stats.totalDistance.toFixed(2)} km`} bg="#E0F2FE" iconColor="#0284C7" />
        <StatCard icon={Flame} label="Calories" value={`${stats.totalCalories.toLocaleString()} kcal`} bg="#FFEDD5" iconColor="#EA580C" />
        <StreakCard workouts={workouts} streaks={streaks} />
        <PRCard pr={pr} />
        <MonthlyCard monthly={monthly} />
      </div>
      <ChartCard workouts={workouts} />
    </div>
  );
}

function HistoryTable({ workouts, onEdit, onCopy, onDelete }) {
  const [confirmDeleteSrNo, setConfirmDeleteSrNo] = useState(null);
  const sorted = [...workouts].sort((a, b) => a.srNo - b.srNo);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">No.</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Workout</th>
              <th className="px-4 py-3 text-right font-medium">Distance</th>
              <th className="px-4 py-3 text-right font-medium">Time</th>
              <th className="px-4 py-3 text-right font-medium">Pace</th>
              <th className="px-4 py-3 text-right font-medium">Calories</th>
              <th className="px-4 py-3 text-right font-medium">Push-ups</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(w => (
              <tr key={w.srNo} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-2.5 text-slate-400 font-mono">{w.srNo}</td>
                <td className="px-4 py-2.5 text-slate-700">{formatDateDisplay(w.date)}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      w.workout === 'Running' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: w.workout === 'Running' ? '#3B82F6' : '#22C55E' }}
                    />
                    {w.workout}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{w.distanceKm.toFixed(2)} km</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{w.time}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{w.pace}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{w.calories}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-400">{w.pushups ?? '—'}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {confirmDeleteSrNo === w.srNo ? (
                    <span className="inline-flex gap-2 items-center">
                      <button onClick={() => { onDelete(w.srNo); setConfirmDeleteSrNo(null); }} className="text-xs font-semibold text-red-600 underline">
                        Confirm
                      </button>
                      <button onClick={() => setConfirmDeleteSrNo(null)} className="text-xs text-slate-400 underline">
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span className="inline-flex gap-2.5 items-center text-xs">
                      <button onClick={() => onEdit(w)} className="text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => onCopy(w)} className="text-slate-500 hover:underline">
                        Copy
                      </button>
                      <button onClick={() => setConfirmDeleteSrNo(w.srNo)} className="text-red-500 hover:underline">
                        Delete
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryPage({ workouts, onEdit, onCopy, onDelete }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-700">All Entries ({workouts.length})</h2>
      <HistoryTable workouts={workouts} onEdit={onEdit} onCopy={onCopy} onDelete={onDelete} />
    </div>
  );
}

// ---- Add / Edit / Copy Workout form ----
function AddWorkoutForm({ workouts, initialData, editSrNo, onSave, autoCloseOnSuccess }) {
  const [form, setForm] = useState(() =>
    initialData
      ? {
          date: initialData.date,
          workout: initialData.workout,
          distance: String(initialData.distanceKm),
          time: initialData.time,
          pace: initialData.pace,
          calories: String(initialData.calories),
          pushups: initialData.pushups != null ? String(initialData.pushups) : '',
        }
      : { date: '', workout: 'Running', distance: '', time: '', pace: '', calories: '', pushups: '' }
  );
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [success, setSuccess] = useState(null);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setWarning(null);
    setError(null);
  }

  function trySubmit(force) {
    setError(null);
    if (!force) setWarning(null);

    if (!form.date || !form.distance || !form.time || !form.pace || !form.calories) {
      setError('Please fill in date, distance, time, pace, and calories.');
      return;
    }
    const distanceKm = parseFloat(form.distance);
    const calories = parseInt(form.calories, 10);
    if (isNaN(distanceKm) || distanceKm <= 0) {
      setError('Distance must be a positive number.');
      return;
    }
    if (isNaN(calories) || calories < 0) {
      setError('Calories must be 0 or greater.');
      return;
    }

    if (!force) {
      const isDuplicate = workouts.some(w => w.date === form.date && w.srNo !== editSrNo);
      if (isDuplicate) {
        setWarning(`An entry already exists for ${formatDateDisplay(form.date)}. Click "Save anyway" if that's correct.`);
        return;
      }
      const timeSeconds = parseTimeToSeconds(form.time);
      const paceSeconds = parsePaceToSecondsPerKm(form.pace);
      if (timeSeconds > 0 && paceSeconds > 0) {
        const expectedPace = timeSeconds / distanceKm;
        if (Math.abs(expectedPace - paceSeconds) > 15) {
          setWarning(
            `Based on distance & time, expected pace is about ${formatSecondsAsMMSS(expectedPace)}/km, but you entered ${form.pace}/km. Click "Save anyway" if that's correct.`
          );
          return;
        }
      }
    }

    try {
      const isEdit = editSrNo != null;
      const srNo = isEdit ? editSrNo : (workouts.length ? Math.max(...workouts.map(w => w.srNo)) + 1 : 1);
      const savedEntry = {
        srNo,
        date: form.date,
        workout: form.workout,
        distanceKm,
        time: normalizeTimeDisplay(form.time),
        pace: normalizePaceDisplay(form.pace),
        calories,
        pushups: form.pushups ? parseInt(form.pushups, 10) : null,
      };
      onSave(savedEntry, isEdit);
      setWarning(null);
      setSuccess(isEdit ? `Saved changes to workout #${srNo}.` : `Added workout #${srNo} — ${distanceKm.toFixed(2)} km ${form.workout} on ${formatDateDisplay(form.date)}.`);
      const wasOpenedFromExistingEntry = initialData != null; // true for Edit and Copy, false for a fresh blank Add
      if (wasOpenedFromExistingEntry && autoCloseOnSuccess) {
        setTimeout(() => autoCloseOnSuccess(), 900);
      } else {
        setForm({ date: '', workout: 'Running', distance: '', time: '', pace: '', calories: '', pushups: '' });
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (e) {
      setError('Something went wrong saving this workout. Please try again — nothing was lost.');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      trySubmit(false);
    }
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => update('date', e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Workout Type</label>
          <select
            value={form.workout}
            onChange={e => update('workout', e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="Running">Running</option>
            <option value="Walking">Walking</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Distance (km)</label>
          <input
            type="number"
            step="0.01"
            value={form.distance}
            onChange={e => update('distance', e.target.value)}
            placeholder="2.10"
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500">Time</label>
          <input
            type="text"
            value={form.time}
            onChange={e => update('time', e.target.value)}
            placeholder="13:33 or 1 hr 50 min 32 sec"
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Pace (min/km)</label>
          <input
            type="text"
            value={form.pace}
            onChange={e => update('pace', e.target.value)}
            placeholder="7:04"
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Calories</label>
          <input
            type="number"
            value={form.calories}
            onChange={e => update('calories', e.target.value)}
            placeholder="164"
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-slate-500">Push-ups (optional)</label>
          <input
            type="number"
            value={form.pushups}
            onChange={e => update('pushups', e.target.value)}
            placeholder="—"
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={() => trySubmit(false)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {editSrNo != null ? 'Save Changes' : 'Save Workout'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2.5 rounded-lg">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {warning && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-sm px-3 py-2.5 rounded-lg">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p>{warning}</p>
            <button type="button" onClick={() => trySubmit(true)} className="mt-1.5 text-xs font-semibold underline">
              Save anyway
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2.5 rounded-lg font-medium">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
    </div>
  );
}

function BulkAddForm({ workouts, onBulkAdd }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState([]);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);

  function parseLines() {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const results = [];
    const errs = [];
    let nextSrNo = workouts.length ? Math.max(...workouts.map(w => w.srNo)) + 1 : 1;
    lines.forEach((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 6) {
        errs.push(`Line ${idx + 1}: expected at least 6 comma-separated fields, got ${parts.length}.`);
        return;
      }
      const [dateStr, workoutType, distanceStr, timeStr, paceStr, caloriesStr, pushupsStr] = parts;
      const iso = parseDateFlexible(dateStr);
      if (!iso) {
        errs.push(`Line ${idx + 1}: couldn't parse date "${dateStr}". Use "14 Jul 2026" or "2026-07-14".`);
        return;
      }
      const distanceKm = parseFloat(distanceStr.replace(/km/i, '').trim());
      const calories = parseInt(caloriesStr.replace(/kcal/i, '').trim(), 10);
      if (isNaN(distanceKm) || distanceKm <= 0) {
        errs.push(`Line ${idx + 1}: invalid distance "${distanceStr}".`);
        return;
      }
      if (isNaN(calories) || calories < 0) {
        errs.push(`Line ${idx + 1}: invalid calories "${caloriesStr}".`);
        return;
      }
      const workout = /walk/i.test(workoutType) ? 'Walking' : 'Running';
      results.push({
        srNo: nextSrNo++,
        date: iso,
        workout,
        distanceKm,
        time: normalizeTimeDisplay(timeStr),
        pace: normalizePaceDisplay(paceStr),
        calories,
        pushups: pushupsStr ? parseInt(pushupsStr, 10) : null,
      });
    });
    setParsed(results);
    setErrors(errs);
  }

  function confirmAdd() {
    onBulkAdd(parsed);
    setSuccess(`Added ${parsed.length} workout${parsed.length === 1 ? '' : 's'}.`);
    setText('');
    setParsed([]);
    setTimeout(() => setSuccess(null), 4000);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        One workout per line: <span className="font-mono">Date, Workout, Distance, Time, Pace, Calories</span> — e.g.{' '}
        <span className="font-mono">14 Jul 2026, Walking, 9.18km, 1hr 50min 32sec, 12:02, 468</span>
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
        placeholder="Paste multiple lines here..."
      />
      <button type="button" onClick={parseLines} className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
        Preview
      </button>
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg space-y-0.5">
          {errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}
      {parsed.length > 0 && (
        <div className="border border-slate-100 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <tbody>
              {parsed.map(p => (
                <tr key={p.srNo} className="border-b border-slate-50 last:border-0">
                  <td className="px-2 py-1.5 text-slate-400 font-mono">#{p.srNo}</td>
                  <td className="px-2 py-1.5">{formatDateDisplay(p.date)}</td>
                  <td className="px-2 py-1.5">{p.workout}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{p.distanceKm.toFixed(2)} km</td>
                  <td className="px-2 py-1.5 text-right font-mono">{p.time}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{p.calories} kcal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {parsed.length > 0 && (
        <button type="button" onClick={confirmAdd} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
          Confirm Add {parsed.length} Workout{parsed.length === 1 ? '' : 's'}
        </button>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg font-medium">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}
    </div>
  );
}

function AddWorkoutModal({ open, onClose, workouts, entry, isEdit, onSave, onBulkAdd }) {
  const [mode, setMode] = useState('single');
  useEffect(() => {
    if (open) setMode('single');
  }, [open, entry]);
  if (!open) return null;

  const title = isEdit ? 'Edit Workout' : entry ? 'Copy Workout (new entry)' : 'Add Workout';

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-start justify-center p-4 overflow-y-auto z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mt-10 p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
            Close
          </button>
        </div>
        {!entry && (
          <div className="flex gap-1 mb-4 border-b border-slate-200">
            <button
              onClick={() => setMode('single')}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${mode === 'single' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}
            >
              Single Entry
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${mode === 'bulk' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}
            >
              Bulk Paste
            </button>
          </div>
        )}
        {entry || mode === 'single' ? (
          <AddWorkoutForm
            workouts={workouts}
            initialData={entry}
            editSrNo={isEdit ? entry.srNo : null}
            onSave={onSave}
            autoCloseOnSuccess={onClose}
          />
        ) : (
          <BulkAddForm workouts={workouts} onBulkAdd={onBulkAdd} />
        )}
      </div>
    </div>
  );
}

// ---- Comparison panel (used by Analytics) ----
function DeltaRow({ label, current, compareValue, lowerIsBetter }) {
  if (compareValue == null || isNaN(compareValue)) {
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs text-slate-300">No data</span>
      </div>
    );
  }
  const diff = current - compareValue;
  const pct = compareValue !== 0 ? (diff / compareValue) * 100 : 0;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  const isFlat = Math.abs(pct) < 1;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-semibold ${isFlat ? 'text-slate-400' : improved ? 'text-green-600' : 'text-amber-600'}`}>
        {isFlat ? 'About the same' : `${diff > 0 ? '+' : ''}${pct.toFixed(0)}% ${improved ? '▲' : '▼'}`}
      </span>
    </div>
  );
}

function CompareBlock({ title, data, entry, paceSec }) {
  return (
    <div className="border border-slate-100 rounded-lg p-3">
      <p className="text-xs font-semibold text-slate-500 mb-2">
        {title}
        {data && data.count ? ` (${data.count} workout${data.count === 1 ? '' : 's'})` : ''}
      </p>
      {!data ? (
        <p className="text-xs text-slate-300">No comparable data yet</p>
      ) : (
        <div>
          <DeltaRow label="Distance" current={entry.distanceKm} compareValue={data.distanceKm} lowerIsBetter={false} />
          <DeltaRow label="Pace" current={paceSec} compareValue={data.paceSec} lowerIsBetter={true} />
          <DeltaRow label="Calories" current={entry.calories} compareValue={data.calories} lowerIsBetter={false} />
        </div>
      )}
    </div>
  );
}

function ComparisonPanel({ comparison }) {
  if (!comparison || !comparison.entry) return <p className="text-sm text-slate-400">No workout selected.</p>;
  const { entry, paceSec, yesterday, prevWeekAvg, overallAvg } = comparison;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
        <span>
          <strong className="text-slate-800">{formatDateDisplay(entry.date)}</strong> · {entry.workout}
        </span>
        <span>{entry.distanceKm.toFixed(2)} km</span>
        <span>{entry.time}</span>
        <span>{entry.pace}/km</span>
        <span>{entry.calories} kcal</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <CompareBlock title="vs Yesterday" data={yesterday} entry={entry} paceSec={paceSec} />
        <CompareBlock title="vs Previous Week Avg" data={prevWeekAvg} entry={entry} paceSec={paceSec} />
        <CompareBlock title="vs Overall Avg" data={overallAvg} entry={entry} paceSec={paceSec} />
      </div>
    </div>
  );
}

// ---- Analytics page ----
function AnalyticsPage({ workouts }) {
  const sorted = useMemo(() => [...workouts].sort((a, b) => a.date.localeCompare(b.date)), [workouts]);
  const [focusDate, setFocusDate] = useState(sorted.length ? sorted[sorted.length - 1].date : null);
  const focusEntry = workouts.find(w => w.date === focusDate) || null;
  const comparison = useMemo(() => computeComparison(focusEntry, workouts), [focusEntry, workouts]);
  const monthlyBars = useMemo(() => computeMonthlyBars(workouts), [workouts]);

  return (
    <div className="space-y-6">
      <ChartCard workouts={workouts} detailed />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Distance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyBars}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={value => [`${value} km`, 'Distance']} />
            <Bar dataKey="distance" fill="#93C5FD" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Compare a Day</h3>
          <select
            value={focusDate || ''}
            onChange={e => setFocusDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {sorted
              .slice()
              .reverse()
              .map(w => (
                <option key={w.srNo} value={w.date}>
                  {formatDateDisplay(w.date)} — {w.workout}
                </option>
              ))}
          </select>
        </div>
        {focusEntry ? <ComparisonPanel comparison={comparison} /> : <p className="text-sm text-slate-400">No data yet.</p>}
      </div>
    </div>
  );
}

// ---- Personal Records page ----
function RecordStat({ icon: Icon, label, value, sub, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xl font-mono font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Leaderboard({ title, entries, valueFn }) {
  if (!entries.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
      <div>
        {entries.map((w, i) => (
          <div key={w.srNo} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-semibold">
                {i + 1}
              </span>
              <span className="text-sm text-slate-600">{formatDateDisplay(w.date)}</span>
            </div>
            <span className="text-sm font-mono font-semibold text-slate-800">{valueFn(w)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecordsPage({ workouts, pr, streaks }) {
  if (!pr) return <p className="text-sm text-slate-400">No data yet.</p>;
  const runsByDistance = [...workouts.filter(w => w.workout === 'Running')].sort((a, b) => b.distanceKm - a.distanceKm);
  const runsByPace = [...workouts.filter(w => w.workout === 'Running')].sort(
    (a, b) => parsePaceToSecondsPerKm(a.pace) - parsePaceToSecondsPerKm(b.pace)
  );
  const topCalories = [...workouts].sort((a, b) => b.calories - a.calories);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <RecordStat
          icon={Trophy}
          label="Longest Run"
          value={pr.longestRun ? `${pr.longestRun.distanceKm.toFixed(2)} km` : '—'}
          sub={pr.longestRun ? formatDateDisplay(pr.longestRun.date) : ''}
          bg="#FEF9C3"
          color="#CA8A04"
        />
        <RecordStat
          icon={Trophy}
          label="Longest Walk"
          value={pr.longestWalk ? `${pr.longestWalk.distanceKm.toFixed(2)} km` : '—'}
          sub={pr.longestWalk ? formatDateDisplay(pr.longestWalk.date) : ''}
          bg="#DCFCE7"
          color="#16A34A"
        />
        <RecordStat
          icon={Flame}
          label="Fastest Running Pace"
          value={pr.fastestRun ? `${pr.fastestRun.pace}/km` : '—'}
          sub={pr.fastestRun ? formatDateDisplay(pr.fastestRun.date) : ''}
          bg="#DBEAFE"
          color="#2563EB"
        />
        <RecordStat
          icon={Flame}
          label="Highest Calories"
          value={`${pr.highestCalories.calories} kcal`}
          sub={formatDateDisplay(pr.highestCalories.date)}
          bg="#FFEDD5"
          color="#EA580C"
        />
        <RecordStat
          icon={Activity}
          label="Longest Streak"
          value={`${streaks.longest} days`}
          sub={streaks.longestRange ? `${formatDateDisplay(streaks.longestRange.start)} – ${formatDateDisplay(streaks.longestRange.end)}` : ''}
          bg="#FCE7F3"
          color="#DB2777"
        />
        <RecordStat icon={MapPin} label="Total Distance" value={`${pr.totalDistance.toFixed(2)} km`} sub={`${workouts.length} workouts`} bg="#E0E7FF" color="#4F46E5" />
      </div>

      <Leaderboard title="Top 5 Longest Runs" entries={runsByDistance.slice(0, 5)} valueFn={w => `${w.distanceKm.toFixed(2)} km`} />
      <Leaderboard title="Top 5 Fastest Runs" entries={runsByPace.slice(0, 5)} valueFn={w => `${w.pace}/km`} />
      <Leaderboard title="Top 5 Highest Calorie Burns" entries={topCalories.slice(0, 5)} valueFn={w => `${w.calories} kcal`} />
    </div>
  );
}

// ---- Settings page ----
function SettingsPage({ workouts, onExport, onReset }) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  return (
    <div className="space-y-4 max-w-xl">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Data</h3>
        <p className="text-xs text-slate-500">{workouts.length} workouts stored in your Upstash Redis database.</p>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Download size={14} /> Export full database as JSON
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
        <p className="text-xs text-slate-500">This clears all locally saved data and reloads the original seed history. Export a backup first.</p>
        {!confirmingReset ? (
          <button onClick={() => setConfirmingReset(true)} className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
            Reset to seed data
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReset();
                setConfirmingReset(false);
              }}
              className="text-sm px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Confirm reset
            </button>
            <button onClick={() => setConfirmingReset(false)} className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- App ----
export default function App() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [storageError, setStorageError] = useState(false);
  const [opError, setOpError] = useState(null);
  const [modalState, setModalState] = useState({ open: false, entry: null, isEdit: false });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/workouts');
        const data = await res.json();
        if (mounted) {
          if (data && data.workouts && data.workouts.length) {
            setWorkouts(data.workouts);
          } else {
            setWorkouts(SEED_WORKOUTS);
            fetch('/api/workouts', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workouts: SEED_WORKOUTS }),
            }).catch(() => {});
          }
        }
      } catch (e) {
        if (mounted) setWorkouts(SEED_WORKOUTS);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function persist(updated) {
    try {
      const res = await fetch('/api/workouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workouts: updated }),
      });
      setStorageError(!res.ok);
    } catch (e) {
      setStorageError(true);
    }
  }

  function openAddModal() {
    setModalState({ open: true, entry: null, isEdit: false });
  }
  function openEditModal(w) {
    setModalState({ open: true, entry: w, isEdit: true });
  }
  function openCopyModal(w) {
    setModalState({ open: true, entry: w, isEdit: false });
  }
  function closeModal() {
    setModalState({ open: false, entry: null, isEdit: false });
  }

  async function handleSaveWorkout(entry, isEdit) {
    try {
      setOpError(null);
      const updated = isEdit ? workouts.map(w => (w.srNo === entry.srNo ? entry : w)) : [...workouts, entry];
      setWorkouts(updated);
      await persist(updated);
    } catch (e) {
      setOpError('Could not save that workout. Please try again.');
    }
  }

  async function handleBulkAdd(entries) {
    try {
      setOpError(null);
      const updated = [...workouts, ...entries];
      setWorkouts(updated);
      await persist(updated);
    } catch (e) {
      setOpError('Could not save those workouts. Please try again.');
    }
  }

  async function handleDeleteWorkout(srNo) {
    try {
      setOpError(null);
      const updated = workouts.filter(w => w.srNo !== srNo);
      setWorkouts(updated);
      await persist(updated);
    } catch (e) {
      setOpError('Could not delete that workout. Please try again.');
    }
  }

  async function handleReset() {
    setWorkouts(SEED_WORKOUTS);
    await persist(SEED_WORKOUTS);
  }

  function handleExport() {
    const payload = {
      schema: ['srNo', 'date', 'workout', 'distanceKm', 'time', 'pace', 'calories', 'pushups'],
      exportedAt: new Date().toISOString().slice(0, 10),
      workouts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workout_database.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = useMemo(() => computeStats(workouts), [workouts]);
  const streaks = useMemo(() => computeStreaks(workouts), [workouts]);
  const pr = useMemo(() => computePersonalRecords(workouts), [workouts]);
  const monthly = useMemo(() => computeMonthlySummary(workouts), [workouts]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'Workout History' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'records', label: 'Personal Records' },
    { id: 'settings', label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">Loading your workout data…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Workout Progress Tracker</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {stats.totalWorkouts} workouts logged · {stats.totalDistance.toFixed(2)} km total · synced to your database
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Plus size={16} /> Add Workout
          </button>
        </header>

        <nav className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors focus:outline-none ${
                activeTab === t.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {storageError && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2.5 rounded-lg">
            Your last change couldn't be saved to the database. It's visible now, but may not persist after a refresh — check your Upstash connection, and use Export JSON as a backup.
          </div>
        )}
        {opError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{opError}</div>
        )}

        {activeTab === 'dashboard' && <DashboardPage workouts={workouts} stats={stats} streaks={streaks} pr={pr} monthly={monthly} />}
        {activeTab === 'history' && (
          <HistoryPage workouts={workouts} onEdit={openEditModal} onCopy={openCopyModal} onDelete={handleDeleteWorkout} />
        )}
        {activeTab === 'analytics' && <AnalyticsPage workouts={workouts} />}
        {activeTab === 'records' && <RecordsPage workouts={workouts} pr={pr} streaks={streaks} />}
        {activeTab === 'settings' && <SettingsPage workouts={workouts} onExport={handleExport} onReset={handleReset} />}
      </div>

      <AddWorkoutModal
        open={modalState.open}
        onClose={closeModal}
        workouts={workouts}
        entry={modalState.entry}
        isEdit={modalState.isEdit}
        onSave={handleSaveWorkout}
        onBulkAdd={handleBulkAdd}
      />
    </div>
  );
}
