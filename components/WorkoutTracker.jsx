'use client';
import React from "react";
import "./storageShim.js";
import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Footprints, MapPin, Flame, Trophy, CalendarDays, Plus, Download, AlertTriangle, CheckCircle2, Sun, Moon, Dumbbell, Route, Zap, Timer, TrendingUp, ArrowUp, ArrowDown, Bell, X, Globe, Bike, Waves, Mountain, Flower2 } from "lucide-react";

// ── Dark mode context ─────────────────────────────────────────────────────────
const DarkContext = createContext(false);
function useDark() { return useContext(DarkContext); }

// ── Color theme registry ────────────────────────────────────────────────────
// "swatch" is the original 4 palette colors exactly as given — shown as-is in the
// Settings picker and used directly as the light-mode page wash (bgLight is its
// lightest entry). accent/accentHover are contrast-safe deepened versions of the
// palette's most saturated swatch, kept constant across modes since button-text
// contrast doesn't depend on page background. accent2/accent2Hover are a second
// deepened color pulled from a different swatch in the same palette, used to give
// the two hero cards (distance/calories) distinct on-theme gradients instead of
// looking identical. bgDark is a hand-picked deep, hue-matched counterpart per
// theme (not a shared gray) so each theme's dark mode reads as its own theme.
const THEMES = [
  { id:"slate-horizon", name:"Slate Horizon", swatch:["#81A6C6","#AACDDC","#F3E3D0","#D2C4B4"], accent:"#5D8AB3", accentHover:"#4C7699", accent2:"#B08A63", accent2Hover:"#96714E", soft:"93,138,179", bgLight:"#F3E3D0", bgDark:"#0B141C" },
  { id:"blush-lilac",   name:"Blush Lilac",   swatch:["#FBEFEF","#FFE2E2","#F5CBCB","#C5B3D3"], accent:"#8F72A8", accentHover:"#7A5E92", accent2:"#C97A7A", accent2Hover:"#B35F5F", soft:"143,114,168", bgLight:"#FBEFEF", bgDark:"#170F1A" },
  { id:"citrus-sky",    name:"Citrus Sky",    swatch:["#FFF9D2","#FFEBCC","#BFDDF0","#8CC0EB"], accent:"#4A8FC2", accentHover:"#3B76A3", accent2:"#E0A052", accent2Hover:"#C98A3B", soft:"74,143,194", bgLight:"#FFF9D2", bgDark:"#171208" },
];
const DEFAULT_THEME_ID = THEMES[0].id;
function themeVars(themeId, dark) {
  const th = THEMES.find(x => x.id === themeId) || THEMES[0];
  return {
    "--accent": th.accent,
    "--accent-hover": th.accentHover,
    "--accent-soft": `rgba(${th.soft},0.12)`,
    "--accent-ring": `rgba(${th.soft},0.35)`,
    "--accent-wash": `rgba(${th.soft},0.18)`,
    "--page-bg": dark ? th.bgDark : th.bgLight,
  };
}
const ThemeContext = createContext(DEFAULT_THEME_ID);
function useThemeId() { return useContext(ThemeContext); }

// ── Theme helpers ─────────────────────────────────────────────────────────────
// All colour decisions live here so adding a new component never forgets dark mode.
const t = {
  page:        (d) => d ? "bg-theme-page text-gray-100" : "bg-theme-page text-slate-900",
  card:        (d) => d ? "glass-surface bg-gray-900/60 backdrop-blur-xl backdrop-saturate-150 border-white/10" : "glass-surface bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-white/60",
  cardHover:   (d) => d ? "hover:bg-gray-800/50" : "hover:bg-white/50",
  header:      (d) => d ? "bg-gray-900/60 border-gray-800/50 shadow-lg shadow-black/20 backdrop-saturate-150" : "bg-white/60 border-slate-200/50 shadow-sm backdrop-saturate-150",
  nav:         (d) => d ? "border-gray-800" : "border-slate-200",
  navActive:   (d) => "border-accent text-accent",
  navInactive: (d) => d ? "border-transparent text-gray-400 hover:text-gray-200" : "border-transparent text-slate-500 hover:text-slate-700",
  label:       (d) => d ? "text-gray-400" : "text-slate-400",
  labelSm:     (d) => d ? "text-gray-400" : "text-slate-500",
  value:       (d) => d ? "text-gray-100" : "text-slate-800",
  subValue:    (d) => d ? "text-gray-500" : "text-slate-400",
  muted:       (d) => d ? "text-gray-500" : "text-slate-400",
  divider:     (d) => d ? "border-gray-800" : "border-slate-50",
  input:       (d) => d ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 ring-accent" : "bg-white border-slate-200 text-slate-900 ring-accent",
  select:      (d) => d ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-slate-200 text-slate-900",
  modal:       (d) => d ? "glass-surface bg-gray-900/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/10" : "glass-surface bg-white/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/60",
  thead:       (d) => d ? "bg-gray-800/60 text-gray-400" : "bg-slate-50 text-slate-500",
  tooltip:     (d) => d ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-slate-200 text-slate-700",
  filterBtn:   (d, active) => active
    ? "bg-accent text-white"
    : d ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
  warnBox:     (d) => d ? "bg-amber-900/30 border-amber-700 text-amber-300" : "bg-amber-50 border-amber-100 text-amber-700",
  errBox:      (d) => d ? "bg-red-900/30 border-red-700 text-red-300" : "bg-red-50 border-red-100 text-red-600",
  okBox:       (d) => d ? "bg-green-900/30 border-green-700 text-green-300" : "bg-green-50 border-green-200 text-green-700",
  dangerBorder:(d) => d ? "border-red-800" : "border-red-100",
  grid:        (d) => d ? "#374151" : "#F1F5F9",
  axis:        (d) => d ? "#6B7280" : "#94A3B8",
  axisLine:    (d) => d ? "#374151" : "#E2E8F0",
};

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_ABBR_MAP = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};

const TIME_RANGES = [
  { key:"1W",  label:"1W",      days:7   },
  { key:"1M",  label:"1M",      days:30  },
  { key:"3M",  label:"3M",      days:90  },
  { key:"1Y",  label:"1Y",      days:365 },
  { key:"3Y",  label:"3Y",      days:1095},
  { key:"ALL", label:"All",     days:null},
];

// ── Workout type registry ─────────────────────────────────────────────────────
// "Custom" is always first; add new types here and colours/badges update everywhere.
const WORKOUT_TYPES = ["Custom","Running","Walking","Cycling","Swimming","Hiking","HIIT","Yoga"];

// Unified, professional per-type color palette — one saturated accent color per workout type,
// consistent across History badges, Analytics chart lines, the Heatmap, and Goal indicator dots.
const WORKOUT_COLOR = {
  Running:  { dot:"#2563EB", bg:"bg-blue-500/10",    text:"text-blue-400",    stroke:"#2563EB" },
  Walking:  { dot:"#059669", bg:"bg-emerald-500/10", text:"text-emerald-400", stroke:"#059669" },
  Cycling:  { dot:"#EA580C", bg:"bg-orange-500/10",  text:"text-orange-400",  stroke:"#EA580C" },
  Swimming: { dot:"#0891B2", bg:"bg-cyan-500/10",    text:"text-cyan-400",    stroke:"#0891B2" },
  Hiking:   { dot:"#65A30D", bg:"bg-lime-500/10",    text:"text-lime-400",    stroke:"#65A30D" },
  HIIT:     { dot:"#DC2626", bg:"bg-red-500/10",     text:"text-red-400",     stroke:"#DC2626" },
  Yoga:     { dot:"#7C3AED", bg:"bg-violet-500/10",  text:"text-violet-400",  stroke:"#7C3AED" },
  Custom:   { dot:"#64748B", bg:"bg-slate-500/10",   text:"text-slate-400",   stroke:"#64748B" },
};
function workoutColor(type) {
  return WORKOUT_COLOR[type] || WORKOUT_COLOR["Custom"];
}

// Professional line-icon set per workout type (replaces emoji pictograms for on-screen UI).
// Colors match WORKOUT_COLOR exactly so the palette is identical everywhere it appears.
// Chip backgrounds are theme-aware — a soft tint in light mode, a translucent version of the
// same accent color in dark mode, so icon chips read cleanly on both themes.
const WORKOUT_ICON = {
  Running:  { Icon:Route,      color:"#2563EB", chipLight:"#DBEAFE", chipDark:"rgba(37,99,235,0.18)" },
  Walking:  { Icon:Footprints, color:"#059669", chipLight:"#D1FAE5", chipDark:"rgba(5,150,105,0.18)" },
  Cycling:  { Icon:Bike,       color:"#EA580C", chipLight:"#FFEDD5", chipDark:"rgba(234,88,12,0.18)" },
  Swimming: { Icon:Waves,      color:"#0891B2", chipLight:"#CFFAFE", chipDark:"rgba(8,145,178,0.18)" },
  Hiking:   { Icon:Mountain,   color:"#65A30D", chipLight:"#ECFCCB", chipDark:"rgba(101,163,13,0.18)" },
  HIIT:     { Icon:Zap,        color:"#DC2626", chipLight:"#FEE2E2", chipDark:"rgba(220,38,38,0.18)" },
  Yoga:     { Icon:Flower2,    color:"#7C3AED", chipLight:"#EDE9FE", chipDark:"rgba(124,58,237,0.18)" },
  Custom:   { Icon:Dumbbell,   color:"#64748B", chipLight:"#F1F5F9", chipDark:"rgba(100,116,139,0.18)" },
};
function workoutIcon(type, dark=false) {
  const v = WORKOUT_ICON[type] || WORKOUT_ICON["Custom"];
  return { Icon:v.Icon, color:v.color, chip: dark ? v.chipDark : v.chipLight };
}

// Emoji + light icon-chip colours per workout type — powers the Weekly Recap card specifically
// (kept byte-for-byte as-is; that card's design/content is intentionally left untouched).
const TYPE_STAT_STYLE = {
  Running:  { emoji:"🏃", bg:"#DBEAFE", ic:"#2563EB" },
  Walking:  { emoji:"🚶", bg:"#DCFCE7", ic:"#16A34A" },
  Cycling:  { emoji:"🚴", bg:"#FEF3C7", ic:"#D97706" },
  Swimming: { emoji:"🏊", bg:"#CFFAFE", ic:"#0891B2" },
  Hiking:   { emoji:"🥾", bg:"#ECFCCB", ic:"#65A30D" },
  HIIT:     { emoji:"🔥", bg:"#FEE2E2", ic:"#DC2626" },
  Yoga:     { emoji:"🧘", bg:"#F3E8FF", ic:"#9333EA" },
  Custom:   { emoji:"⭐", bg:"#F1F5F9", ic:"#64748B" },
};
function typeStatStyle(type) {
  return TYPE_STAT_STYLE[type] || TYPE_STAT_STYLE["Custom"];
}
// Thin black outline on white text — the "poster" look for text sitting on a bold gradient.
// Used on the hero stat cards and the Weekly Recap card.
const OUTLINE_TEXT = {
  WebkitTextStroke:"1px #000",
  paintOrder:"stroke fill",
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_WORKOUTS = [
  {srNo:1,  date:"2026-01-02",workout:"Running",distanceKm:1.73,time:"13:33",pace:"7:50",calories:136,pushups:null},
  {srNo:2,  date:"2026-01-03",workout:"Running",distanceKm:2.10,time:"14:49",pace:"7:04",calories:164,pushups:null},
  {srNo:3,  date:"2026-01-04",workout:"Running",distanceKm:1.30,time:"18:23",pace:"14:06",calories:70,pushups:null},
  {srNo:4,  date:"2026-01-05",workout:"Running",distanceKm:1.98,time:"13:09",pace:"6:38",calories:159,pushups:null},
  {srNo:5,  date:"2026-01-06",workout:"Running",distanceKm:2.14,time:"14:08",pace:"6:36",calories:170,pushups:null},
  {srNo:6,  date:"2026-01-07",workout:"Running",distanceKm:2.11,time:"13:35",pace:"6:27",calories:167,pushups:null},
  {srNo:7,  date:"2026-01-09",workout:"Running",distanceKm:2.15,time:"13:39",pace:"6:22",calories:171,pushups:null},
  {srNo:8,  date:"2026-01-11",workout:"Running",distanceKm:1.32,time:"12:17",pace:"9:18",calories:91,pushups:null},
  {srNo:9,  date:"2026-01-12",workout:"Running",distanceKm:1.88,time:"12:34",pace:"6:41",calories:146,pushups:null},
  {srNo:10, date:"2026-01-13",workout:"Running",distanceKm:1.67,time:"12:03",pace:"7:13",calories:129,pushups:null},
  {srNo:11, date:"2026-01-14",workout:"Running",distanceKm:2.06,time:"13:37",pace:"6:36",calories:165,pushups:null},
  {srNo:12, date:"2026-01-15",workout:"Running",distanceKm:2.25,time:"13:55",pace:"6:12",calories:177,pushups:null},
  {srNo:13, date:"2026-01-16",workout:"Running",distanceKm:2.07,time:"13:40",pace:"6:36",calories:163,pushups:null},
  {srNo:14, date:"2026-01-19",workout:"Running",distanceKm:2.62,time:"17:07",pace:"6:32",calories:207,pushups:null},
  {srNo:15, date:"2026-01-21",workout:"Running",distanceKm:2.78,time:"17:22",pace:"6:15",calories:219,pushups:null},
  {srNo:16, date:"2026-01-22",workout:"Running",distanceKm:2.77,time:"17:30",pace:"6:19",calories:215,pushups:null},
  {srNo:17, date:"2026-01-28",workout:"Running",distanceKm:3.28,time:"20:45",pace:"6:19",calories:264,pushups:null},
  {srNo:18, date:"2026-01-29",workout:"Running",distanceKm:2.03,time:"12:42",pace:"6:16",calories:164,pushups:null},
  {srNo:19, date:"2026-01-30",workout:"Running",distanceKm:4.08,time:"25:12",pace:"6:11",calories:322,pushups:null},
  {srNo:20, date:"2026-01-31",workout:"Running",distanceKm:4.43,time:"27:26",pace:"6:11",calories:347,pushups:null},
  {srNo:21, date:"2026-02-02",workout:"Running",distanceKm:4.02,time:"25:00",pace:"6:13",calories:315,pushups:null},
  {srNo:22, date:"2026-02-13",workout:"Running",distanceKm:3.35,time:"23:21",pace:"6:58",calories:260,pushups:null},
  {srNo:23, date:"2026-02-25",workout:"Running",distanceKm:2.70,time:"18:30",pace:"6:51",calories:215,pushups:null},
  {srNo:24, date:"2026-02-26",workout:"Running",distanceKm:3.50,time:"22:37",pace:"6:28",calories:273,pushups:null},
  {srNo:25, date:"2026-02-27",workout:"Running",distanceKm:4.13,time:"25:51",pace:"6:15",calories:322,pushups:null},
  {srNo:26, date:"2026-03-01",workout:"Running",distanceKm:2.16,time:"14:21",pace:"6:39",calories:167,pushups:null},
  {srNo:27, date:"2026-03-02",workout:"Running",distanceKm:4.10,time:"25:20",pace:"6:10",calories:318,pushups:null},
  {srNo:28, date:"2026-03-03",workout:"Running",distanceKm:2.48,time:"15:40",pace:"6:18",calories:190,pushups:null},
  {srNo:29, date:"2026-03-04",workout:"Running",distanceKm:4.11,time:"25:36",pace:"6:13",calories:322,pushups:null},
  {srNo:30, date:"2026-04-08",workout:"Running",distanceKm:1.66,time:"11:55",pace:"7:11",calories:127,pushups:null},
  {srNo:31, date:"2026-04-17",workout:"Running",distanceKm:2.09,time:"13:42",pace:"6:33",calories:166,pushups:null},
  {srNo:32, date:"2026-04-18",workout:"Running",distanceKm:2.11,time:"13:48",pace:"6:32",calories:168,pushups:null},
  {srNo:33, date:"2026-04-21",workout:"Running",distanceKm:2.06,time:"13:21",pace:"6:29",calories:163,pushups:null},
  {srNo:34, date:"2026-04-22",workout:"Walking",distanceKm:2.92,time:"36:55",pace:"12:39",calories:195,pushups:null},
  {srNo:35, date:"2026-04-23",workout:"Running",distanceKm:2.07,time:"13:34",pace:"6:33",calories:164,pushups:null},
  {srNo:36, date:"2026-04-24",workout:"Running",distanceKm:2.10,time:"13:18",pace:"6:20",calories:165,pushups:null},
  {srNo:37, date:"2026-05-03",workout:"Running",distanceKm:2.05,time:"12:54",pace:"6:18",calories:162,pushups:null},
  {srNo:38, date:"2026-05-19",workout:"Running",distanceKm:1.67,time:"10:34",pace:"6:18",calories:131,pushups:null},
  {srNo:39, date:"2026-06-16",workout:"Running",distanceKm:1.65,time:"10:44",pace:"6:30",calories:131,pushups:null},
  {srNo:40, date:"2026-06-17",workout:"Running",distanceKm:2.06,time:"13:34",pace:"6:36",calories:164,pushups:null},
  {srNo:41, date:"2026-06-18",workout:"Running",distanceKm:2.05,time:"13:06",pace:"6:24",calories:163,pushups:null},
  {srNo:42, date:"2026-06-19",workout:"Running",distanceKm:2.06,time:"12:53",pace:"6:15",calories:164,pushups:null},
  {srNo:43, date:"2026-06-20",workout:"Running",distanceKm:2.05,time:"12:22",pace:"6:01",calories:163,pushups:null},
  {srNo:44, date:"2026-06-21",workout:"Running",distanceKm:2.06,time:"12:43",pace:"6:11",calories:164,pushups:null},
  {srNo:45, date:"2026-06-22",workout:"Running",distanceKm:2.08,time:"13:04",pace:"6:16",calories:167,pushups:null},
  {srNo:46, date:"2026-06-23",workout:"Running",distanceKm:2.15,time:"13:42",pace:"6:23",calories:171,pushups:null},
  {srNo:47, date:"2026-06-24",workout:"Running",distanceKm:2.51,time:"16:07",pace:"6:25",calories:192,pushups:null},
  {srNo:48, date:"2026-06-25",workout:"Running",distanceKm:2.46,time:"15:57",pace:"6:29",calories:195,pushups:null},
  {srNo:49, date:"2026-06-26",workout:"Running",distanceKm:2.52,time:"18:26",pace:"7:19",calories:192,pushups:null},
  {srNo:50, date:"2026-06-27",workout:"Running",distanceKm:2.53,time:"16:53",pace:"6:41",calories:199,pushups:null},
  {srNo:51, date:"2026-06-28",workout:"Walking",distanceKm:4.67,time:"1:00:14",pace:"12:53",calories:242,pushups:null},
  {srNo:52, date:"2026-06-29",workout:"Running",distanceKm:2.64,time:"17:44",pace:"6:43",calories:208,pushups:null},
  {srNo:53, date:"2026-06-30",workout:"Running",distanceKm:2.70,time:"18:28",pace:"6:50",calories:213,pushups:null},
  {srNo:54, date:"2026-07-02",workout:"Walking",distanceKm:1.80,time:"21:43",pace:"12:05",calories:93,pushups:null},
  {srNo:55, date:"2026-07-03",workout:"Walking",distanceKm:3.49,time:"41:05",pace:"11:47",calories:180,pushups:null},
  {srNo:56, date:"2026-07-09",workout:"Walking",distanceKm:5.21,time:"1:03:44",pace:"12:14",calories:270,pushups:null},
  {srNo:57, date:"2026-07-10",workout:"Walking",distanceKm:5.42,time:"1:02:26",pace:"11:31",calories:281,pushups:null},
  {srNo:58, date:"2026-07-11",workout:"Walking",distanceKm:5.31,time:"1:02:17",pace:"11:44",calories:270,pushups:null},
  {srNo:59, date:"2026-07-12",workout:"Walking",distanceKm:6.68,time:"1:20:08",pace:"12:00",calories:341,pushups:null},
  {srNo:60, date:"2026-07-13",workout:"Walking",distanceKm:5.12,time:"1:00:47",pace:"11:53",calories:265,pushups:null},
  {srNo:61, date:"2026-07-14",workout:"Walking",distanceKm:9.18,time:"1:50:32",pace:"12:02",calories:468,pushups:null},
  {srNo:62, date:"2026-07-15",workout:"Walking",distanceKm:5.78,time:"1:15:08",pace:"13:02",calories:298,pushups:null},
  {srNo:63, date:"2026-07-16",workout:"Walking",distanceKm:5.27,time:"1:05:11",pace:"12:23",calories:268,pushups:null},
  {srNo:64, date:"2026-07-17",workout:"Walking",distanceKm:5.19,time:"1:06:21",pace:"12:46",calories:270,pushups:null},
];

// ── Helpers ───────────────────────────────────────────────────────────────────
// Local calendar date as YYYY-MM-DD (NOT toISOString, which is UTC-based and silently
// shifts to the previous day for anyone in a timezone ahead of UTC, e.g. IST, during
// early morning hours). Workout dates come from local <input type="date"> pickers, so
// every "today" / week-boundary comparison needs to use this same local interpretation.
function toLocalIso(d) {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function formatDateDisplay(iso) {
  if (!iso) return "";
  const [y,m,d] = iso.split("-").map(Number);
  return `${String(d).padStart(2,"0")} ${MONTH_NAMES[m-1]} ${y}`;
}
function formatMonthTick(iso) {
  if (!iso) return "";
  const [y,m] = iso.split("-");
  return `${MONTH_NAMES[parseInt(m,10)-1]} '${y.slice(2)}`;
}
function parseTimeToSeconds(str) {
  if (!str) return 0;
  const s = str.trim();
  if (/^\d+:\d{2}(:\d{2})?$/.test(s)) {
    const p = s.split(":").map(Number);
    if (p.length===2) return p[0]*60+p[1];
    if (p.length===3) return p[0]*3600+p[1]*60+p[2];
  }
  let total=0;
  const hr=s.match(/(\d+)\s*hr/i); const mn=s.match(/(\d+)\s*min/i); const sc=s.match(/(\d+)\s*sec/i);
  if(hr) total+=parseInt(hr[1],10)*3600;
  if(mn) total+=parseInt(mn[1],10)*60;
  if(sc) total+=parseInt(sc[1],10);
  return total;
}
function normalizeTimeDisplay(str) {
  const t=parseTimeToSeconds(str); if(t<=0) return str.trim();
  const h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=Math.round(t%60);
  return h>0?`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${m}:${String(s).padStart(2,"0")}`;
}
function parsePaceToSecondsPerKm(str) {
  if(!str) return 0;
  const p=str.replace(/\/km/i,"").trim().split(":").map(Number);
  return p.length===2&&!isNaN(p[0])&&!isNaN(p[1])?p[0]*60+p[1]:0;
}
function formatSecondsAsMMSS(t) {
  const m=Math.floor(t/60),s=Math.round(t%60);
  return `${m}:${String(s).padStart(2,"0")}`;
}
function normalizePaceDisplay(str) {
  const s=parsePaceToSecondsPerKm(str);
  return s<=0?str.replace(/\/km/i,"").trim():formatSecondsAsMMSS(s);
}
function parseDateFlexible(str) {
  if(!str) return null; const s=str.trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m=s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if(m){const mo=MONTH_ABBR_MAP[m[2].slice(0,3).toLowerCase()];if(!mo)return null;return`${m[3]}-${String(mo).padStart(2,"0")}-${String(parseInt(m[1],10)).padStart(2,"0")}`;}
  return null;
}

// Filter workouts by time range (from today backwards)
function filterByRange(workouts, rangeKey) {
  const range = TIME_RANGES.find(r => r.key === rangeKey);
  if (!range || range.days === null) return workouts;
  const cutoff = new Date();
  cutoff.setHours(0,0,0,0);
  cutoff.setDate(cutoff.getDate() - range.days);
  const cutoffIso = toLocalIso(cutoff);
  return workouts.filter(w => w.date >= cutoffIso);
}

// ── Compute functions ─────────────────────────────────────────────────────────
function computeStats(workouts) {
  const byCounts = {};
  workouts.forEach(w => { byCounts[w.workout] = (byCounts[w.workout]||0)+1; });
  return {
    totalWorkouts: workouts.length,
    runningCount:  byCounts["Running"]  || 0,
    walkingCount:  byCounts["Walking"]  || 0,
    byCounts,
    totalDistance: workouts.reduce((s,w)=>s+w.distanceKm,0),
    totalCalories: workouts.reduce((s,w)=>s+w.calories,0),
  };
}
function useStreaks(workouts) { return useMemo(()=>computeStreaks(workouts),[workouts]); }
function computeStreaks(workouts) {
  if(!workouts.length) return{current:0,longest:0,longestRange:null,lastDate:null};
  const dates=[...new Set(workouts.map(w=>w.date))].sort();
  const objs=dates.map(d=>new Date(d+"T00:00:00"));
  let longest=1,lEnd=0,rStart=0;
  for(let i=1;i<objs.length;i++){
    const diff=Math.round((objs[i]-objs[i-1])/86400000);
    if(diff!==1) rStart=i;
    const len=i-rStart+1;
    if(len>longest){longest=len;lEnd=i;}
  }
  const lStart=lEnd-longest+1;
  const longestRange={start:dates[lStart],end:dates[lEnd]};
  const today=new Date();today.setHours(0,0,0,0);
  const last=objs[objs.length-1];
  const diff=Math.round((today-last)/86400000);
  let current=0;
  if(diff<=1){let len=1;for(let i=objs.length-1;i>0;i--){if(Math.round((objs[i]-objs[i-1])/86400000)===1)len++;else break;}current=len;}
  return{current,longest,longestRange,lastDate:dates[dates.length-1]};
}
function computeWeekStats(workouts, weeksAgo=0) {
  const now = new Date(); now.setHours(0,0,0,0);
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0
  const thisMonday = new Date(now); thisMonday.setDate(now.getDate() - dayOfWeek - weeksAgo*7);
  const thisSunday = new Date(thisMonday); thisSunday.setDate(thisMonday.getDate() + 6);
  const start = toLocalIso(thisMonday);
  const end   = toLocalIso(thisSunday);
  const wks = workouts.filter(w => w.date >= start && w.date <= end);
  const byType = {};
  wks.forEach(w => { byType[w.workout] = (byType[w.workout]||0)+1; });
  return {
    count:    wks.length,
    running:  wks.filter(w=>w.workout==="Running").length,
    walking:  wks.filter(w=>w.workout==="Walking").length,
    byType,
    distance: wks.reduce((s,w)=>s+w.distanceKm,0),
    calories: wks.reduce((s,w)=>s+w.calories,0),
  };
}

function computePersonalRecords(workouts) {
  if(!workouts.length) return null;
  const runs=workouts.filter(w=>w.workout==="Running");
  const walks=workouts.filter(w=>w.workout==="Walking");
  // Longest per-type (all types)
  const byType={};
  workouts.forEach(w=>{
    if(!byType[w.workout]||w.distanceKm>byType[w.workout].distanceKm) byType[w.workout]=w;
  });
  return{
    longestRun:     runs.length?runs.reduce((a,b)=>b.distanceKm>a.distanceKm?b:a):null,
    longestWalk:    walks.length?walks.reduce((a,b)=>b.distanceKm>a.distanceKm?b:a):null,
    fastestRun:     runs.length?runs.reduce((a,b)=>parsePaceToSecondsPerKm(b.pace)<parsePaceToSecondsPerKm(a.pace)?b:a):null,
    highestCalories:workouts.reduce((a,b)=>b.calories>a.calories?b:a),
    totalDistance:  workouts.reduce((s,w)=>s+w.distanceKm,0),
    longestByType:  byType,
  };
}
function computeMonthlySummary(workouts) {
  if(!workouts.length) return null;
  const sorted=[...workouts].sort((a,b)=>a.date.localeCompare(b.date));
  const[y,m]=sorted[sorted.length-1].date.split("-");
  const entries=workouts.filter(w=>w.date.startsWith(`${y}-${m}`));
  return{label:`${MONTH_NAMES[parseInt(m,10)-1]} ${y}`,count:entries.length,distance:entries.reduce((s,w)=>s+w.distanceKm,0),calories:entries.reduce((s,w)=>s+w.calories,0)};
}
function computeMonthlyBars(workouts) {
  const map={};
  workouts.forEach(w=>{const k=w.date.slice(0,7);if(!map[k])map[k]=0;map[k]+=w.distanceKm;});
  return Object.keys(map).sort().map(k=>{const[y,m]=k.split("-");return{key:k,label:`${MONTH_NAMES[parseInt(m,10)-1]} '${y.slice(2)}`,distance:parseFloat(map[k].toFixed(2))};});
}
function computeComparison(entry,all) {
  if(!entry) return null;
  const sameType=all.filter(w=>w.workout===entry.workout);
  const paceSec=parsePaceToSecondsPerKm(entry.pace);
  const yDate=new Date(entry.date+"T00:00:00");yDate.setDate(yDate.getDate()-1);
  const yIso=toLocalIso(yDate);
  const yEntry=all.find(w=>w.date===yIso)||null;
  const yesterday=yEntry?{distanceKm:yEntry.distanceKm,calories:yEntry.calories,paceSec:parsePaceToSecondsPerKm(yEntry.pace)}:null;
  const entryDate=new Date(entry.date+"T00:00:00");
  const weekStart=new Date(entryDate);weekStart.setDate(weekStart.getDate()-7);
  const pwEntries=sameType.filter(w=>{const d=new Date(w.date+"T00:00:00");return d>=weekStart&&d<entryDate;});
  const prevWeekAvg=pwEntries.length?{distanceKm:pwEntries.reduce((s,w)=>s+w.distanceKm,0)/pwEntries.length,calories:pwEntries.reduce((s,w)=>s+w.calories,0)/pwEntries.length,paceSec:pwEntries.reduce((s,w)=>s+parsePaceToSecondsPerKm(w.pace),0)/pwEntries.length,count:pwEntries.length}:null;
  const oa=sameType.filter(w=>w.srNo!==entry.srNo);
  const overallAvg=oa.length?{distanceKm:oa.reduce((s,w)=>s+w.distanceKm,0)/oa.length,calories:oa.reduce((s,w)=>s+w.calories,0)/oa.length,paceSec:oa.reduce((s,w)=>s+parsePaceToSecondsPerKm(w.pace),0)/oa.length,count:oa.length}:null;
  return{entry,paceSec,yesterday,prevWeekAvg,overallAvg};
}

// ── Time Range Picker ─────────────────────────────────────────────────────────
function RangePicker({ value, onChange }) {
  const dark = useDark();
  return (
    <div className="flex gap-1 flex-wrap">
      {TIME_RANGES.map(r => (
        <button
          key={r.key}
          type="button"
          onClick={() => onChange(r.key)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${t.filterBtn(dark, value === r.key)}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ── Tooltips ──────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  const dark = useDark();
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div className={`rounded-lg shadow-md px-3 py-2 text-xs border ${t.tooltip(dark)}`}>
      <p className="font-semibold mb-1">{formatDateDisplay(pt.fullDate)}</p>
      {pt.running != null && <p style={{ color:"#3B82F6" }}>Running: {pt.running.toFixed(2)} km</p>}
      {pt.walking != null && <p style={{ color:"#22C55E" }}>Walking: {pt.walking.toFixed(2)} km</p>}
    </div>
  );
}
function DetailedTooltip({ active, payload, workouts }) {
  const dark = useDark();
  if (!active || !payload?.length) return null;
  const entry = workouts.find(w => w.date === payload[0].payload.fullDate);
  if (!entry) return null;
  return (
    <div className={`rounded-lg shadow-md px-3 py-2.5 text-xs border space-y-1 min-w-[150px] ${t.tooltip(dark)}`}>
      <p className="font-semibold">{formatDateDisplay(entry.date)} · {entry.workout}</p>
      <p className={t.muted(dark)}>Distance: <span className="font-mono">{entry.distanceKm.toFixed(2)} km</span></p>
      <p className={t.muted(dark)}>Time:     <span className="font-mono">{entry.time}</span></p>
      <p className={t.muted(dark)}>Pace:     <span className="font-mono">{entry.pace}/km</span></p>
      <p className={t.muted(dark)}>Calories: <span className="font-mono">{entry.calories} kcal</span></p>
    </div>
  );
}

// ── Chart Card (shared by Dashboard + Analytics) ──────────────────────────────
function ChartCard({ workouts, detailed, rangeKey, onRangeChange }) {
  const dark = useDark();
  const filtered = useMemo(() => filterByRange(workouts, rangeKey), [workouts, rangeKey]);
  // Collect all workout types present in the filtered set
  const presentTypes = useMemo(() =>
    [...new Set(filtered.map(w=>w.workout))].sort(),
  [filtered]);

  const chartData = useMemo(() => {
    const sorted = [...filtered].sort((a,b)=>a.date.localeCompare(b.date));
    return sorted.map(w => {
      const point = { fullDate: w.date };
      presentTypes.forEach(type => {
        point[type] = w.workout === type ? w.distanceKm : null;
      });
      return point;
    });
  }, [filtered, presentTypes]);
  const tickInterval = Math.max(0, Math.floor(chartData.length / 6));

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${t.card(dark)}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className={`text-sm font-semibold ${t.value(dark)}`}>Running vs Walking — Distance Over Time</h3>
          {detailed && <p className={`text-xs mt-0.5 ${t.muted(dark)}`}>Hover a point for full details</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex flex-wrap items-center gap-3 text-xs ${t.muted(dark)}`}>
            {presentTypes.map(type=>(
              <span key={type} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:workoutColor(type).dot}}/>
                {type}
              </span>
            ))}
          </div>
          <RangePicker value={rangeKey} onChange={onRangeChange} />
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className={`flex items-center justify-center h-[300px] text-sm ${t.muted(dark)}`}>
          No workouts in this time range.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{top:5,right:10,left:-10,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid(dark)} />
            <XAxis dataKey="fullDate" tickFormatter={formatMonthTick} tick={{fontSize:11,fill:t.axis(dark)}} interval={tickInterval} axisLine={{stroke:t.axisLine(dark)}} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:t.axis(dark)}} axisLine={false} tickLine={false} label={{value:"km",position:"insideLeft",style:{fontSize:11,fill:t.axis(dark)}}}/>
            <Tooltip content={detailed ? <DetailedTooltip workouts={filtered}/> : <CustomTooltip/>}/>
            {presentTypes.map(type=>(
              <Line key={type} type="monotone" dataKey={type} stroke={workoutColor(type).stroke} strokeWidth={2} dot={{r:3,fill:workoutColor(type).stroke}} connectNulls={false}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Stat Cards ────────────────────────────────────────────────────────────────
function StatCard({icon:Icon,label,value,subValue,bg,iconColor}) {
  const dark = useDark();
  return (
    <div className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-3 ${t.card(dark)}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:bg}}>
        <Icon size={20} style={{color:iconColor}}/>
      </div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${t.label(dark)}`}>{label}</p>
        <p className={`text-2xl font-mono font-bold tabular-nums mt-0.5 ${t.value(dark)}`}>{value}</p>
        {subValue && <p className={`text-xs mt-0.5 ${t.subValue(dark)}`}>{subValue}</p>}
      </div>
    </div>
  );
}
function HeatmapCard({workouts, streaks}) {
  const dark = useDark();
  const [tooltip, setTooltip] = useState(null);

  // Build 12 weeks x 7 days grid (84 days, Sun-Sat columns)
  const WEEKS = 12;
  const today = new Date(); today.setHours(0,0,0,0);
  // Find the most recent Saturday
  const dayOfWeek = today.getDay(); // 0=Sun..6=Sat
  const endDay = new Date(today); endDay.setDate(today.getDate() + (6 - dayOfWeek));
  const startDay = new Date(endDay); startDay.setDate(endDay.getDate() - WEEKS*7 + 1);

  // Map date -> workouts for O(1) lookup
  const byDate = useMemo(() => {
    const map = {};
    workouts.forEach(w => {
      if (!map[w.date]) map[w.date] = [];
      map[w.date].push(w);
    }, []);
    return map;
  }, [workouts]);

  // Build columns (weeks), each has 7 days Sun->Sat
  const columns = [];
  const cur = new Date(startDay);
  while (cur <= endDay) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const iso = toLocalIso(cur);
      const entries = byDate[iso] || [];
      const totalKm = entries.reduce((s,w)=>s+w.distanceKm,0);
      week.push({ iso, entries, totalKm });
      cur.setDate(cur.getDate()+1);
    }
    columns.push(week);
  }

  const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const maxKm = Math.max(...workouts.map(w=>w.distanceKm), 1);

  function cellColor(day) {
    if (!day.entries.length) return dark ? "#1F2937" : "#F1F5F9";
    const intensity = Math.min(day.totalKm / maxKm, 1);
    // Multi-workout day: blend colours; single type: use that type's colour
    const types = [...new Set(day.entries.map(e=>e.workout))];
    if (types.length === 1) {
      const base = workoutColor(types[0]).dot;
      // Lighten based on intensity
      return base + Math.round(40 + intensity*215).toString(16).padStart(2,"0");
    }
    // Mixed: use a teal
    return `rgba(20,184,166,${0.2 + intensity*0.8})`;
  }

  // Month labels for top of grid
  const monthLabels = columns.map((col, i) => {
    const firstDay = col.find(d => d.iso);
    if (!firstDay) return null;
    const [y,m] = firstDay.iso.split("-");
    const prevCol = columns[i-1];
    if (i===0 || !prevCol) return { idx:i, label:`${MONTH_NAMES[parseInt(m)-1]} '${y.slice(2)}` };
    const [,pm] = prevCol[0].iso.split("-");
    return parseInt(m) !== parseInt(pm) ? { idx:i, label:`${MONTH_NAMES[parseInt(m)-1]} '${y.slice(2)}` } : null;
  }).filter(Boolean);

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${t.card(dark)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{backgroundColor:"#FCE7F3"}}>
            <Flame size={18} style={{color:"#DB2777"}}/>
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wide ${t.label(dark)}`}>Activity Heatmap</p>
            <p className={`text-sm font-bold font-mono ${t.value(dark)}`}>
              {streaks.current} day streak
              <span className={`text-xs font-normal ml-2 ${t.muted(dark)}`}>Best: {streaks.longest} days</span>
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs ${t.muted(dark)}`}>
          <span>Less</span>
          {[0.15,0.35,0.55,0.75,1].map(o=>(
            <div key={o} className="w-3 h-3 rounded-sm" style={{backgroundColor:`rgba(59,130,246,${o})`}}/>
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex gap-1 mb-1 pl-6">
        {columns.map((_,i) => {
          const ml = monthLabels.find(l=>l.idx===i);
          return <div key={i} className={`flex-1 text-center`} style={{minWidth:12}}>
            {ml && <span className={`text-[10px] ${t.muted(dark)}`}>{ml.label}</span>}
          </div>;
        })}
      </div>

      {/* Grid: day-of-week rows × week columns */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1">
          {DAY_LABELS.map(d=>(
            <div key={d} className={`text-[10px] leading-none flex items-center justify-end`} style={{height:13}}>
              <span className={d==="Mo"||d==="We"||d==="Fr"?t.muted(dark):"opacity-0"}>{d}</span>
            </div>
          ))}
        </div>
        {/* Week columns */}
        {columns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-1">
            {week.map(day => {
              const bg = cellColor(day);
              const isFuture = day.iso > toLocalIso(today);
              return (
                <div
                  key={day.iso}
                  className="rounded-sm cursor-default transition-transform hover:scale-125"
                  style={{
                    height:13, minWidth:10,
                    backgroundColor: isFuture ? "transparent" : bg,
                    border: day.entries.length ? `1px solid ${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"}` : "none",
                  }}
                  onMouseEnter={e => {
                    if (!isFuture) setTooltip({
                      iso: day.iso,
                      entries: day.entries,
                      totalKm: day.totalKm,
                      x: e.clientX, y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className={`fixed z-50 px-3 py-2 rounded-lg shadow-xl border text-xs pointer-events-none ${t.tooltip(dark)} ${t.card(dark)}`}
          style={{ left: tooltip.x + 12, top: tooltip.y - 40, maxWidth: 200 }}
        >
          <p className="font-semibold mb-1">{formatDateDisplay(tooltip.iso)}</p>
          {tooltip.entries.length === 0
            ? <p className={t.muted(dark)}>No workout</p>
            : tooltip.entries.map((e,i) => (
                <p key={i} style={{color:workoutColor(e.workout).dot}}>
                  {e.workout} · {e.distanceKm.toFixed(2)} km · {e.calories} kcal
                </p>
              ))
          }
          {tooltip.entries.length > 1 && (
            <p className={`mt-1 font-semibold ${t.value(dark)}`}>Total: {tooltip.totalKm.toFixed(2)} km</p>
          )}
        </div>
      )}
    </div>
  );
}
function PRCard({pr}) {
  const dark = useDark();
  if(!pr) return null;
  return (
    <div className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-3 ${t.card(dark)}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:"#FEF9C3"}}><Trophy size={20} style={{color:"#CA8A04"}}/></div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${t.label(dark)}`}>Personal Records</p>
        <p className={`text-sm mt-1.5 ${t.value(dark)}`}>🏃 Longest run: <span className="font-mono font-semibold">{pr.longestRun?`${pr.longestRun.distanceKm.toFixed(2)} km`:"—"}</span></p>
        <p className={`text-sm ${t.value(dark)}`}>⚡ Fastest pace: <span className="font-mono font-semibold">{pr.fastestRun?`${pr.fastestRun.pace}/km`:"—"}</span></p>
      </div>
    </div>
  );
}
function MonthlyCard({monthly}) {
  const dark = useDark();
  if(!monthly) return null;
  return (
    <div className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-3 ${t.card(dark)}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:"#E0E7FF"}}><CalendarDays size={20} style={{color:"#4F46E5"}}/></div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${t.label(dark)}`}>Monthly Summary</p>
        <p className={`text-lg font-mono font-bold mt-0.5 ${t.value(dark)}`}>{monthly.label}</p>
        <p className={`text-xs mt-1 ${t.muted(dark)}`}>{monthly.count} workouts · {monthly.distance.toFixed(2)} km · {monthly.calories.toLocaleString()} kcal</p>
      </div>
    </div>
  );
}

// ── Shareable weekly recap ("wrapped"-style summary) ───────────────────────────
// The visual recap card itself — used both inline on the dashboard and, larger, inside the
// share modal, so what you preview before sharing is exactly what you see on the dashboard.
function RecapVisual({ wb, thisWeek, streaks, breakdown, topType, style, big=false }) {
  return (
    <div
      className={`rounded-3xl text-white shadow-lg relative overflow-hidden ${big?"p-7":"p-6"}`}
      style={{ background:"linear-gradient(150deg,#7C3AED,#DB2777 55%,#EA580C)" }}
    >
      {/* Subtle light blobs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{backgroundImage:"radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)"}}/>

      {/* Header */}
      <p className={`font-semibold uppercase tracking-widest opacity-90 relative ${big?"text-sm":"text-xs"}`} style={OUTLINE_TEXT}>Weekly Recap</p>
      <p className={`opacity-80 relative mt-0.5 ${big?"text-xs":"text-[10px]"}`} style={OUTLINE_TEXT}>{formatDateDisplay(wb.start)} – {formatDateDisplay(wb.end)}</p>

      {thisWeek.count === 0 ? (
        <p className={`relative font-semibold ${big?"text-lg mt-8":"text-sm mt-5"}`} style={OUTLINE_TEXT}>No workouts logged yet this week — get moving! 💪</p>
      ) : (
        <>
          {/* ── Stats row ── */}
          <div className={`grid grid-cols-4 gap-3 relative ${big?"mt-6":"mt-4"}`}>
            {[
              [thisWeek.distance.toFixed(1), "km"],
              [thisWeek.calories.toLocaleString(), "kcal"],
              [String(thisWeek.count), `workout${thisWeek.count!==1?"s":""}`],
              [`${streaks.current}🔥`, "day streak"],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <p className={`font-mono font-black tabular-nums leading-none ${big?"text-3xl":"text-2xl"}`} style={OUTLINE_TEXT}>{val}</p>
                <p className={`mt-1 opacity-90 ${big?"text-xs":"text-[11px]"}`} style={OUTLINE_TEXT}>{lbl}</p>
              </div>
            ))}
          </div>

          {/* ── Divider (matches screenshot) ── */}
          <div className={`relative ${big?"mt-6 mb-4":"mt-4 mb-3"}`}
            style={{height:1, background:"rgba(255,255,255,0.35)"}}/>

          {/* ── Coloured type chips (Running, Walking, etc.) ── */}
          {breakdown.length > 0 && (
            <div className="flex flex-wrap gap-2 relative">
              {breakdown.map(([ty, c]) => {
                const ts = typeStatStyle(ty);
                return (
                  <span
                    key={ty}
                    className={`inline-flex items-center gap-1 font-bold ${big?"text-sm px-3 py-1":"text-xs px-2.5 py-0.5"} rounded-full`}
                    style={{
                      backgroundColor: ts.ic + "33",   // workout colour at 20% opacity
                      border: `1.5px solid ${ts.ic}88`,
                      backdropFilter: "blur(4px)",
                      ...OUTLINE_TEXT,
                    }}
                  >
                    {ts.emoji} {ty} {c}
                  </span>
                );
              })}
            </div>
          )}

          {/* ── Top workout label ── */}
          {topType && (
            <p className={`relative mt-2 ${big?"text-xs":"text-[11px]"}`} style={OUTLINE_TEXT}>
              🏆 Top workout this week: <span className="font-semibold">{style.emoji} {topType}</span>
            </p>
          )}
        </>
      )}

      {big && <p className="text-[11px] opacity-70 relative mt-6 text-center" style={OUTLINE_TEXT}>🏋️ Workout Progress Tracker</p>}
    </div>
  );
}

function WeeklyRecapCard({ workouts, streaks }) {
  const dark = useDark();
  const [status, setStatus]       = useState(null);  // transient button label, e.g. "Copied ✓"
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving]       = useState(false);

  const thisWeek = useMemo(() => computeWeekStats(workouts, 0), [workouts]);
  const wb = useMemo(() => getWeekBounds(0), []);
  // Every workout type logged this week, most-frequent first — e.g. [["Running",3],["Walking",4]]
  const breakdown = useMemo(() => Object.entries(thisWeek.byType || {}).sort((a,b) => b[1]-a[1]), [thisWeek.byType]);
  const topType = breakdown.length ? breakdown[0][0] : null;
  const style = topType ? typeStatStyle(topType) : TYPE_STAT_STYLE.Custom;

  const shareText =
    `🏆 My week in review (${formatDateDisplay(wb.start)} → ${formatDateDisplay(wb.end)})\n` +
    `📍 ${thisWeek.distance.toFixed(2)} km\n` +
    `🔥 ${thisWeek.calories.toLocaleString()} kcal\n` +
    `💪 ${thisWeek.count} workout${thisWeek.count!==1?"s":""}\n` +
    `⚡ ${streaks.current}-day streak\n` +
    (topType ? `Top workout: ${style.emoji} ${topType}\n` : "") +
    (breakdown.length ? breakdown.map(([ty,c]) => `${ty} ${c}`).join(", ") : "No workouts logged yet this week");

  function flash(msg) { setStatus(msg); setTimeout(() => setStatus(null), 2200); }

  function copyText() {
    try {
      const ta = document.createElement("textarea");
      ta.value = shareText;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flash("Copied ✓");
    } catch {
      navigator.clipboard && navigator.clipboard.writeText(shareText).then(() => flash("Copied ✓"));
    }
  }

  function openLink(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Renders the recap as a portrait, story-friendly PNG (1080×1350) using plain Canvas —
  // no external image library needed, and the download pattern below already works in this app
  // (same technique as the existing JSON/XLS export buttons).
  function buildSvgCard() {
    const W = 1080, H = 1350;
    const wbStart = formatDateDisplay(wb.start);
    const wbEnd   = formatDateDisplay(wb.end);
    const dist    = thisWeek.distance.toFixed(1);
    const cal     = thisWeek.calories.toLocaleString();
    const cnt     = thisWeek.count;
    const streak  = streaks.current;
    const bdText  = breakdown.map(([ty,c]) => `${typeStatStyle(ty).emoji} ${ty} ${c}`).join("   ·   ");
    const topLine = topType ? `🏆 Top workout this week: ${style.emoji} ${topType}` : "";

    // Helper: white text with black stroke, poster-style
    function txt(content, x, y, {size=48, weight=800, anchor="start", opacity=1}={}) {
      return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" font-family="-apple-system,Segoe UI,Arial,sans-serif" text-anchor="${anchor}" fill="white" stroke="black" stroke-width="3" stroke-linejoin="round" paint-order="stroke fill" opacity="${opacity}">${content}</text>`;
    }

    const M = 80;
    let statsBlock = "";
    if (cnt === 0) {
      statsBlock = txt("No workouts this week 💪", M, 500, {size:52, weight:800});
    } else {
      const cols = [[dist,"km"],[cal,"kcal"],[String(cnt),`workout${cnt!==1?"s":""}`],[`${streak}🔥`,"day streak"]];
      const colW = (W - M*2) / 2;
      cols.forEach(([val, lbl], i) => {
        const col = i%2, row = Math.floor(i/2);
        const x = M + col*colW, y = 340 + row*220;
        statsBlock += txt(val, x, y, {size:92, weight:900});
        statsBlock += txt(lbl, x, y+55, {size:28, weight:600, opacity:0.9});
      });
    }

    const dividerY = 880;
    const breakdownBlock = bdText
      ? txt(bdText, M, dividerY+50, {size:28, weight:700})
      : "";
    const topBlock = topLine
      ? txt(topLine, M, dividerY+100, {size:24, weight:600, opacity:0.9})
      : "";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="55%" stop-color="#DB2777"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <radialGradient id="blob1" cx="18%" cy="14%" r="55%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="white" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blob2" cx="82%" cy="80%" r="55%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="white" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#blob1)"/>
  <rect width="${W}" height="${H}" fill="url(#blob2)"/>
  ${txt("WEEKLY RECAP", M, 120, {size:38, weight:900})}
  ${txt(`${wbStart} – ${wbEnd}`, M, 168, {size:26, weight:600, opacity:0.85})}
  ${statsBlock}
  <line x1="${M}" y1="${dividerY}" x2="${W-M}" y2="${dividerY}" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  ${breakdownBlock}
  ${topBlock}
  ${txt("🏋️ Workout Progress Tracker", W/2, H-60, {size:22, weight:600, anchor:"middle", opacity:0.7})}
</svg>`;
    return svg;
  }

  async function saveOrShareImage() {
    setSaving(true);
    try {
      const svg = buildSvgCard();
      // SVG data URI — works in every environment, never blocked
      const dataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      const a = document.createElement("a");
      a.href = dataUri;
      a.download = `weekly-recap-${wb.start}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      flash("Saved ✓");
    } catch(e) {
      // Last resort: open native share with text only
      if (navigator.share) {
        navigator.share({ title:"My Weekly Recap", text:shareText }).catch(()=>{});
      }
      flash("Saved ✓");
    }
    setSaving(false);
  }

  const encoded = encodeURIComponent(shareText);
  const actionBtn = `text-xs font-medium px-3 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${dark?"border-gray-700 text-gray-200 hover:bg-gray-800":"border-slate-200 text-slate-700 hover:bg-slate-50"}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-sm font-semibold flex items-center gap-2 ${t.value(dark)}`}>
          ✨ This Week, Wrapped
          <span className={`text-xs font-normal ${t.muted(dark)}`}>{formatDateDisplay(wb.start)} – {formatDateDisplay(wb.end)}</span>
        </h2>
        <button onClick={() => setShareOpen(true)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${dark?"border-gray-700 text-gray-200 hover:bg-gray-800":"border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
          Share
        </button>
      </div>

      <RecapVisual wb={wb} thisWeek={thisWeek} streaks={streaks} breakdown={breakdown} topType={topType} style={style}/>

      {/* ── Share modal: a real, interactive preview card — not just a text menu ── */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.65)"}} onClick={() => setShareOpen(false)}>
          <div className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto ${t.card(dark)}`} onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-semibold ${t.value(dark)}`}>Share your week</p>
                <button onClick={() => setShareOpen(false)} className={`text-sm px-1 hover:opacity-70 ${t.muted(dark)}`}>✕</button>
              </div>

              <RecapVisual wb={wb} thisWeek={thisWeek} streaks={streaks} breakdown={breakdown} topType={topType} style={style} big/>

              <button onClick={saveOrShareImage} disabled={saving} className="w-full mt-4 text-sm font-semibold px-3 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{background:"linear-gradient(135deg,#7C3AED,#DB2777)"}}>
                🖼️ {saving ? "Generating…" : "Save / Share Image"}
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <button onClick={copyText} className={actionBtn}>📋 Copy Text</button>
                <button onClick={() => openLink(`https://wa.me/?text=${encoded}`)} className={actionBtn}>🟢 WhatsApp</button>
                <button onClick={() => openLink(`https://twitter.com/intent/tweet?text=${encoded}`)} className={actionBtn}>🐦 X (Twitter)</button>
                <button onClick={() => openLink(`https://www.facebook.com/sharer/sharer.php?quote=${encoded}`)} className={actionBtn}>📘 Facebook</button>
              </div>

              <p className={`text-[10px] mt-3 text-center leading-relaxed ${t.muted(dark)}`}>
                For Instagram: tap "Save / Share Image," then share the saved image from your gallery (or your device's native share sheet, if it opened automatically).
              </p>
              {status && <p className="text-xs text-center mt-2 text-green-500 font-semibold">{status}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Goal helpers ─────────────────────────────────────────────────────────────
function getWeekBounds(offset=0) {
  const now = new Date(); now.setHours(0,0,0,0);
  const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay()+6)%7) - offset*7);
  const sun = new Date(mon); sun.setDate(mon.getDate()+6);
  return { start: toLocalIso(mon), end: toLocalIso(sun) };
}
function getMonthBounds(offset=0) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth() - offset;
  const d = new Date(y, m, 1);
  const yy = d.getFullYear(), mm = String(d.getMonth()+1).padStart(2,"0");
  return { start:`${yy}-${mm}-01`, end:`${yy}-${mm}-31` };
}
// Value of a given metric for a workout type within a specific date window — mirrors GoalCard's
// pool-filtering rules, but reusable across arbitrary historical periods (powers goal streaks).
function getMetricValueForPeriod(workouts, type, metricKey, bounds) {
  const periodWorkouts = workouts.filter(w => w.date >= bounds.start && w.date <= bounds.end);
  const pool = !ALL_WORKOUT_TYPES_GOAL.slice(0,-1).includes(type)
    ? periodWorkouts.filter(w => !ALL_WORKOUT_TYPES_GOAL.slice(0,-1).includes(w.workout))
    : periodWorkouts.filter(w => w.workout === type);
  if (metricKey === "distance") return pool.reduce((s,w) => s + w.distanceKm, 0);
  if (metricKey === "calories") return pool.reduce((s,w) => s + w.calories, 0);
  if (metricKey === "duration") return pool.reduce((s,w) => s + parseTimeToSeconds(w.time), 0) / 3600;
  if (metricKey === "sessions") return pool.length;
  return 0;
}
// How many consecutive periods (going backward) this exact target would have been met.
// Completed past periods count first; the current in-progress period adds one more if it's already hit.
function computeGoalStreak(workouts, type, metricKey, target, period, maxLookback=52) {
  let streak = 0;
  for (let offset = 1; offset <= maxLookback; offset++) {
    const bounds = period === "week" ? getWeekBounds(offset) : getMonthBounds(offset);
    const value = getMetricValueForPeriod(workouts, type, metricKey, bounds);
    if (value >= target) streak++; else break;
  }
  const curBounds = period === "week" ? getWeekBounds(0) : getMonthBounds(0);
  if (getMetricValueForPeriod(workouts, type, metricKey, curBounds) >= target) streak++;
  return streak;
}

// Goal metric presets — EVERY type gets ALL metrics so user has full freedom
// Metrics shown in the dropdown; user picks whichever makes sense for them.
const ALL_METRICS = [
  { key:"distance", label:"Distance", unit:"km"      },
  { key:"calories", label:"Calories", unit:"kcal"    },
  { key:"duration", label:"Duration", unit:"hrs"     },
  { key:"sessions", label:"Sessions", unit:"sessions"},
];

// Suggested default metric per type (index into ALL_METRICS)
const DEFAULT_METRIC = {
  Running:"distance", Walking:"distance", Cycling:"distance", Hiking:"distance",
  Swimming:"duration", Yoga:"duration", HIIT:"sessions", Custom:"distance",
};

const ALL_WORKOUT_TYPES_GOAL = ["Running","Walking","Cycling","Swimming","Hiking","HIIT","Yoga","Custom"];
const METRIC_COLORS = { distance:"#3B82F6", calories:"#22C55E", duration:"#A855F7", sessions:"#F59E0B" };

// Animated progress bar
function BarProgress({ pct, color, height=7, delay=0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(Math.min(pct, 100)), 120 + delay);
    return () => clearTimeout(id);
  }, [pct, delay]);
  const clamped = Math.min(pct, 100);
  const fill = clamped >= 100 ? "#22C55E" : color;
  return (
    <div className="w-full rounded-full overflow-hidden" style={{height, backgroundColor:"rgba(148,163,184,0.15)"}}>
      <div style={{
        width:`${w}%`, backgroundColor:fill, height, borderRadius:9999,
        transition:"width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: clamped > 0 ? `0 0 8px ${fill}55` : "none",
      }}/>
    </div>
  );
}

function RingProgress({ pct, size=92, stroke=9, color="#3B82F6", children }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(Math.min(pct, 100)));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  const fill = pct >= 100 ? "#22C55E" : color;
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{width:size,height:size}}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor"
          strokeWidth={stroke} className="text-slate-300/20"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={fill}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (animated/100)*circ}
          style={{transition:"stroke-dashoffset 1.1s cubic-bezier(0.34,1.2,0.64,1)"}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function GoalCard({ period, workouts, goals, onSetGoal }) {
  const dark = useDark();
  const [editing,     setEditing]     = useState(false);
  const [expanded,    setExpanded]    = useState(false);
  const [selType,     setSelType]     = useState("Running");
  const [customLabel, setCustomLabel] = useState("");
  // One number input per standard metric
  const [drafts, setDrafts] = useState({ distance:"", calories:"", duration:"", sessions:"" });
  // Free-text custom reminder: name + full description
  const [cpName,  setCpName]  = useState("");
  const [cpValue, setCpValue] = useState("");
  const [saveFlash, setSaveFlash] = useState(false);
  const [fadeIn,    setFadeIn]    = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setFadeIn(true), period === "week" ? 80 : 180);
    return () => clearTimeout(id);
  }, []);

  function handleTypeChange(type) {
    setSelType(type);
    setDrafts({ distance:"", calories:"", duration:"", sessions:"" });
    setCpName(""); setCpValue("");
  }
  function setDraft(key, val) { setDrafts(prev => ({...prev, [key]: val})); }

  const wb = getWeekBounds();
  const mb = getMonthBounds();
  const bounds   = period === "week" ? wb : mb;
  const label    = period === "week" ? "This Week" : "This Month";
  const icon     = period === "week" ? "📅" : "🗓️";
  const rangeStr = period === "week"
    ? `${wb.start} → ${wb.end}`
    : new Date().toLocaleString("default", { month:"long", year:"numeric" });

  const periodWorkouts = workouts.filter(w => w.date >= bounds.start && w.date <= bounds.end);
  const resolvedType   = selType === "Custom" && customLabel.trim() ? customLabel.trim() : selType;

  function getCurrentValue(type, metricKey) {
    const pool = !ALL_WORKOUT_TYPES_GOAL.slice(0,-1).includes(type)
      ? periodWorkouts.filter(w => !ALL_WORKOUT_TYPES_GOAL.slice(0,-1).includes(w.workout))
      : periodWorkouts.filter(w => w.workout === type);
    if (metricKey === "distance") return pool.reduce((s,w) => s + w.distanceKm, 0);
    if (metricKey === "calories") return pool.reduce((s,w) => s + w.calories, 0);
    if (metricKey === "duration") return pool.reduce((s,w) => s + parseTimeToSeconds(w.time), 0) / 3600;
    if (metricKey === "sessions") return pool.length;
    return 0;
  }

  // Parse all active goals for this period from the goals object
  const existingGoals = useMemo(() => Object.entries(goals)
    .filter(([k, v]) => k.startsWith(period + "_") && Number(v) > 0)
    .map(([k, v]) => {
      const withoutPeriod = k.slice(period.length + 1);
      // Freetext keys look like "<type>_freetext_<encoded "name|||value">" — the encoded
      // blob has no underscores of its own, but splitting on the LAST underscore still
      // lands right after "freetext", stripping that marker off metric and gluing it onto
      // type instead. Detect the marker explicitly so freetext goals parse correctly.
      const ftMarker = "_freetext_";
      const ftIdx = withoutPeriod.indexOf(ftMarker);
      if (ftIdx !== -1) {
        const type   = withoutPeriod.slice(0, ftIdx);
        const metric = withoutPeriod.slice(ftIdx + 1); // "freetext_<encoded>"
        return { key: k, type, metric, target: Number(v) };
      }
      const lastUnderscore = withoutPeriod.lastIndexOf("_");
      const type   = withoutPeriod.slice(0, lastUnderscore);
      const metric = withoutPeriod.slice(lastUnderscore + 1);
      return { key: k, type, metric, target: Number(v) };
    }), [goals, period]);

  const standardGoals  = existingGoals.filter(g => !g.metric.startsWith("freetext"));
  const freetextGoals  = existingGoals.filter(g => g.metric.startsWith("freetext"));

  // Overall % = average of all standard goal percentages
  const overallPct = standardGoals.length > 0
    ? standardGoals.reduce((sum, g) => {
        const cur = getCurrentValue(g.type, g.metric);
        return sum + Math.min((cur / g.target) * 100, 100);
      }, 0) / standardGoals.length
    : 0;
  const completedCount = standardGoals.filter(g => getCurrentValue(g.type, g.metric) >= g.target).length;
  const allHit = standardGoals.length > 0 && completedCount === standardGoals.length;
  const ringColor = allHit ? "#22C55E" : "#3B82F6";

  function saveAllGoals() {
    // Collect all updates first, then apply in ONE call to avoid stale closure overwrite
    const updates = {};
    ALL_METRICS.forEach(m => {
      const v = parseFloat(drafts[m.key]);
      if (!isNaN(v) && v > 0) {
        updates[`${period}_${resolvedType}_${m.key}`] = v;
      }
    });
    if (cpName.trim() && cpValue.trim()) {
      const encoded = encodeURIComponent(`${cpName.trim()}|||${cpValue.trim()}`);
      updates[`${period}_${resolvedType}_freetext_${encoded}`] = 1;
    }
    if (Object.keys(updates).length > 0) {
      onSetGoal(updates);   // pass the whole batch
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 2000);
      setDrafts({ distance:"", calories:"", duration:"", sessions:"" });
      setCpName(""); setCpValue("");
    }
  }

  function removeGoal(key) { onSetGoal(key, 0); }

  function getMetricMeta(metricKey) {
    if (metricKey.startsWith("freetext")) {
      try {
        const suffix  = metricKey.indexOf("_") !== -1 ? metricKey.slice(metricKey.indexOf("_") + 1) : metricKey;
        const decoded = decodeURIComponent(suffix);
        const [name, value] = decoded.split("|||");
        return { label: name || "Custom", unit: value || "", color:"#94A3B8", isFreetext:true };
      } catch { return { label:"Custom", unit:"", color:"#94A3B8", isFreetext:true }; }
    }
    const m = ALL_METRICS.find(x => x.key === metricKey);
    return m
      ? { label:m.label, unit:m.unit, color:METRIC_COLORS[m.key]||"#3B82F6", isFreetext:false }
      : { label:metricKey, unit:"", color:"#3B82F6", isFreetext:false };
  }

  function fmtVal(val, metricKey) {
    if (metricKey === "distance" || metricKey === "duration") return parseFloat(val).toFixed(2);
    return Math.round(val).toLocaleString();
  }

  const anyDraftFilled = ALL_METRICS.some(m => parseFloat(drafts[m.key]) > 0)
    || (cpName.trim() && cpValue.trim());
  const totalGoals = existingGoals.length;

  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-all duration-500 hover:shadow-md ${t.card(dark)}`}
      style={{ opacity:fadeIn?1:0, transform:fadeIn?"translateY(0)":"translateY(22px)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-bold ${t.value(dark)}`}>{icon} {label}</p>
          <p className={`text-xs mt-0.5 ${t.muted(dark)}`}>{rangeStr}</p>
        </div>
        <button type="button" onClick={() => setEditing(e => !e)}
          className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
            editing
              ? "bg-accent text-white border-accent"
              : dark?"border-gray-700 text-gray-300 hover:bg-gray-800":"border-slate-200 text-slate-500 hover:bg-slate-50"
          }`}>
          {editing ? "✓ Done" : totalGoals > 0 ? "Edit / Add" : "+ Set a goal"}
        </button>
      </div>

      {/* ── Ring summary + expand/collapse ── */}
      {totalGoals > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <RingProgress pct={overallPct} size={92} stroke={9} color={ringColor}>
              {allHit
                ? <span className="text-2xl animate-bounce">🎉</span>
                : <div className="text-center">
                    <p className={`text-lg font-mono font-bold leading-none ${t.value(dark)}`}>{Math.round(overallPct)}%</p>
                    <p className={`text-[10px] mt-0.5 ${t.muted(dark)}`}>overall</p>
                  </div>
              }
            </RingProgress>
            <div className="flex-1 space-y-2">
              <p className={`text-sm font-semibold leading-tight ${t.value(dark)}`}>
                {allHit ? "All goals crushed! 🔥" : `${completedCount} / ${standardGoals.length} complete`}
              </p>
              <p className={`text-xs ${t.muted(dark)}`}>
                {totalGoals} parameter{totalGoals!==1?"s":""} tracked
                {freetextGoals.length > 0 && ` · ${freetextGoals.length} reminder${freetextGoals.length!==1?"s":""}`}
              </p>
              <BarProgress pct={overallPct} color={ringColor} height={5}/>
              <button type="button" onClick={() => setExpanded(e => !e)}
                className={`text-xs font-medium flex items-center gap-1 transition-colors text-accent text-accent-hover`}>
                {expanded ? "▲ Hide details" : "▼ Show details"}
              </button>
            </div>
          </div>

          {/* Individual bars — expanded */}
          {expanded && (
            <div className={`space-y-4 pt-3 border-t ${dark?"border-gray-700":"border-slate-100"}`}>
              {standardGoals.map((g, i) => {
                const cur    = getCurrentValue(g.type, g.metric);
                const meta   = getMetricMeta(g.metric);
                const pct    = Math.min((cur / g.target) * 100, 100);
                const hit    = cur >= g.target;
                const streak = computeGoalStreak(workouts, g.type, g.metric, g.target, period);
                return (
                  <div key={g.key} className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:meta.color}}/>
                        <span className={`text-xs font-semibold ${t.value(dark)}`}>{g.type}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${dark?"bg-gray-800 text-gray-400":"bg-slate-100 text-slate-500"}`}>{meta.label}</span>
                        {streak >= 2 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${dark?"bg-orange-900/40 text-orange-400":"bg-orange-50 text-orange-600"}`}>
                            🔥 {streak}{period==="week"?"wk":"mo"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold tabular-nums ${hit?"text-green-500":t.value(dark)}`}>
                          {fmtVal(cur, g.metric)} / {fmtVal(g.target, g.metric)} {meta.unit}
                        </span>
                        {editing && (
                          <button type="button" onClick={() => removeGoal(g.key)}
                            className="text-xs text-red-400 px-1 py-0.5 rounded border border-red-300 hover:bg-red-500/10">✕</button>
                        )}
                      </div>
                    </div>
                    <BarProgress pct={pct} color={meta.color} height={7} delay={i*50}/>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs tabular-nums ${t.muted(dark)}`}>{Math.round(pct)}%</span>
                      {hit
                        ? <span className="text-xs font-bold text-green-500 flex items-center gap-1"><span className="animate-bounce">🎉</span> Done!</span>
                        : <span className={`text-xs ${t.muted(dark)}`}>{fmtVal(Math.max(0, g.target - cur), g.metric)} {meta.unit} to go</span>
                      }
                    </div>
                  </div>
                );
              })}
              {freetextGoals.map((g, i) => {
                const meta = getMetricMeta(g.metric);
                const done = g.target >= 2;
                const pct  = done ? 100 : 0;
                return (
                  <div key={g.key} className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:meta.color}}/>
                        <span className={`text-xs font-semibold ${t.value(dark)}`}>📌 {meta.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${dark?"bg-gray-800 text-gray-400":"bg-slate-100 text-slate-500"}`}>{meta.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onSetGoal(g.key, done ? 1 : 2)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-colors ${
                            done
                              ? "bg-green-500/10 text-green-500 border-green-300"
                              : dark?"border-gray-700 text-gray-300 hover:bg-gray-800":"border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}>
                          {done ? "✓ Done" : "Mark done"}
                        </button>
                        {editing && (
                          <button type="button" onClick={() => removeGoal(g.key)}
                            className="text-xs text-red-400 px-1 py-0.5 rounded border border-red-300 hover:bg-red-500/10">✕</button>
                        )}
                      </div>
                    </div>
                    <BarProgress pct={pct} color={meta.color} height={7} delay={(standardGoals.length+i)*50}/>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs tabular-nums ${t.muted(dark)}`}>{pct}%</span>
                      {done
                        ? <span className="text-xs font-bold text-green-500 flex items-center gap-1"><span className="animate-bounce">🎉</span> Done!</span>
                        : <span className={`text-xs ${t.muted(dark)}`}>Not done yet</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {totalGoals === 0 && !editing && (
        <div
          className={`flex flex-col items-center justify-center py-8 gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dark?"border-gray-700 border-accent-hover":"border-slate-200 border-accent-hover"}`}
          onClick={() => setEditing(true)}
        >
          <span className="text-2xl">🎯</span>
          <p className={`text-sm font-medium ${t.muted(dark)}`}>No goals set yet</p>
          <p className="text-xs text-accent font-semibold">Tap to set your first goal →</p>
        </div>
      )}

      {/* ── Edit / Add panel ── */}
      {editing && (
        <div className={`rounded-xl p-4 space-y-4 border ${dark?"border-gray-700 bg-gray-800/40":"border-slate-200 bg-slate-50"}`}>
          <p className={`text-xs font-bold uppercase tracking-wide ${t.label(dark)}`}>Add / Update Goals</p>

          {/* Workout type */}
          <div>
            <label className={`text-xs font-medium ${t.muted(dark)}`}>Workout type</label>
            <select value={selType} onChange={e => handleTypeChange(e.target.value)}
              className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ring-accent ${t.select(dark)}`}>
              {ALL_WORKOUT_TYPES_GOAL.map(ty => <option key={ty} value={ty}>{ty}</option>)}
            </select>
            {selType === "Custom" && (
              <input type="text" value={customLabel} onChange={e => setCustomLabel(e.target.value)}
                placeholder="Name your workout (e.g. Reading, Meditation, Dance…)"
                className={`mt-2 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ring-accent ${t.input(dark)}`}/>
            )}
          </div>

          {/* All 4 standard metric inputs — all visible at once */}
          <div className="space-y-2.5">
            <label className={`text-xs font-medium ${t.muted(dark)}`}>
              Set targets — fill any combination, leave others blank
            </label>
            {ALL_METRICS.map(m => (
              <div key={m.key} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor:METRIC_COLORS[m.key]}}/>
                  <span className={`text-xs font-semibold ${t.value(dark)}`}>{m.label}</span>
                </div>
                <input
                  type="number"
                  value={drafts[m.key]}
                  onChange={e => setDraft(m.key, e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter") saveAllGoals(); }}
                  placeholder={`e.g. ${m.key==="distance"?"20":m.key==="calories"?"1500":m.key==="duration"?"5":"3"}`}
                  className={`flex-1 border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none ring-accent ${t.input(dark)}`}
                />
                <span className={`text-xs w-16 flex-shrink-0 ${t.muted(dark)}`}>{m.unit}</span>
              </div>
            ))}
          </div>

          {/* Free-text custom reminder */}
          <div className={`pt-3 border-t space-y-3 ${dark?"border-gray-700":"border-slate-200"}`}>
            <div>
              <p className={`text-xs font-semibold ${t.value(dark)}`}>📌 Custom reminder <span className={`font-normal ${t.muted(dark)}`}>(optional)</span></p>
              <p className={`text-xs mt-0.5 ${t.muted(dark)}`}>Type anything as the target — e.g. "10 Pages per week", "3 Laps daily"</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`text-xs ${t.muted(dark)}`}>Name</label>
                <input type="text" value={cpName} onChange={e => setCpName(e.target.value)}
                  placeholder="e.g. Book Pages"
                  className={`mt-1 w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ring-accent ${t.input(dark)}`}/>
              </div>
              <div>
                <label className={`text-xs ${t.muted(dark)}`}>Target (free text)</label>
                <input type="text" value={cpValue} onChange={e => setCpValue(e.target.value)}
                  placeholder="e.g. 10 Pages per week"
                  className={`mt-1 w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ring-accent ${t.input(dark)}`}/>
              </div>
            </div>
          </div>

          {/* Save */}
          <button type="button" onClick={saveAllGoals}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
              anyDraftFilled
                ? "bg-accent bg-accent-hover text-white shadow-md shadow-accent-hover scale-[1.01]"
                : dark ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}>
            {saveFlash ? "✓ Goals saved!" : "Save goals"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
// Trend arrow badge — up=green, down=red
function TrendBadge({ thisWeek, lastWeek, lowerIsBetter=false }) {
  const dark = useDark();
  if (lastWeek === 0 || thisWeek === lastWeek) return null;
  const diff = thisWeek - lastWeek;
  const pct  = Math.abs(Math.round((diff / lastWeek) * 100));
  const up   = diff > 0;
  const good = lowerIsBetter ? !up : up;
  const ArrowIcon = up ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
      good
        ? dark?"bg-green-900/40 text-green-400":"bg-green-50 text-green-600"
        : dark?"bg-red-900/40 text-red-400":"bg-red-50 text-red-600"
    }`}>
      <ArrowIcon size={11} strokeWidth={3}/>{pct}%
    </span>
  );
}

function DashboardPage({workouts, stats, streaks, goals, onSetGoal, onNavigate, pr, onAddWorkout}) {
  const dark = useDark();
  const themeId = useThemeId();
  const activeTheme = THEMES.find(x => x.id === themeId) || THEMES[0];
  const [rangeKey, setRangeKey] = useState("ALL");
  const [shown, setShown] = useState(false);
  useEffect(() => { const id = setTimeout(() => setShown(true), 50); return () => clearTimeout(id); }, []);

  const thisWeek = useMemo(() => computeWeekStats(workouts, 0), [workouts]);
  const lastWeek = useMemo(() => computeWeekStats(workouts, 1), [workouts]);

  // The user's top 2 most-logged workout types (all-time) — drives the secondary stat cards below,
  // so someone who does Cycling + Hiking sees those instead of a hardcoded Running/Walking pair.
  const topTypes = useMemo(() => {
    return Object.entries(stats.byCounts || {})
      .filter(([,count]) => count > 0)
      .sort((a,b) => b[1]-a[1])
      .slice(0,2)
      .map(([type]) => type);
  }, [stats.byCounts]);

  // Personal-record nudge — compares the most recent entry of the user's #1 workout type
  // against their all-time longest entry for that type.
  const prNudge = useMemo(() => {
    if (!pr || !topTypes.length) return null;
    const type = topTypes[0];
    const record = pr.longestByType?.[type];
    if (!record || !record.distanceKm) return null; // skip distance-less types (e.g. Yoga)
    const recent = [...workouts].filter(w => w.workout === type).sort((a,b) => b.date.localeCompare(a.date))[0];
    if (!recent) return null;
    if (recent.srNo === record.srNo) return { type, isRecord:true, recent, record };
    const gap = record.distanceKm - recent.distanceKm;
    if (gap <= 0) return null;
    return { type, isRecord:false, recent, record, gap };
  }, [pr, topTypes, workouts]);

  // "No workout today" banner — quiet, dismissible for this browsing session only.
  // (Not persisted, so refreshing the page brings it back if today still has no entry.)
  const todayIso = toLocalIso(new Date());
  const loggedToday = workouts.some(w => w.date === todayIso);
  const [dismissedToday, setDismissedToday] = useState(false);
  function dismissTodayNudge() {
    setDismissedToday(true);
  }

  // Hero stats: large featured cards (distance + calories)
  const heroStats = [
    {
      emoji:"🗺️", label:"Total Distance", value:`${stats.totalDistance.toFixed(2)}`,
      unit:"km", sub:`This week: ${thisWeek.distance.toFixed(2)} km`,
      thisW:thisWeek.distance, lastW:lastWeek.distance,
    },
    {
      emoji:"⚡", label:"Total Calories", value:`${stats.totalCalories.toLocaleString()}`,
      unit:"kcal", sub:`This week: ${thisWeek.calories.toLocaleString()} kcal`,
      thisW:thisWeek.calories, lastW:lastWeek.calories,
    },
  ];

  // Secondary stat cards — Total Workouts is fixed; the other slots are this user's top 2 types.
  const secStats = [
    {
      Icon:Activity, label:"Total Workouts", value:stats.totalWorkouts,
      sub:`${thisWeek.count} this week`,
      thisW:thisWeek.count, lastW:lastWeek.count,
      bg: dark ? "rgba(124,58,237,0.18)" : "#EDE9FE", ic:"#7C3AED", filter:null,
    },
    ...topTypes.map(type => {
      const vis = workoutIcon(type, dark);
      const tw = thisWeek.byType[type] || 0;
      const lw = lastWeek.byType[type] || 0;
      return {
        Icon:vis.Icon, label:type, value: stats.byCounts[type] || 0,
        sub:`${tw} this week`,
        thisW:tw, lastW:lw,
        bg:vis.chip, ic:vis.color, filter:type,
      };
    }),
  ];

  return (
    <div className="space-y-5">

      {/* ── "No workout today" nudge — quiet, dismissible, non-judgmental ── */}
      {!loggedToday && !dismissedToday && (
        <div
          className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 transition-all duration-500 ${dark?"bg-gray-800/60 border-gray-700":"bg-blue-50/70 border-blue-100"}`}
          style={{ opacity:shown?1:0, transform:shown?"translateY(0)":"translateY(-8px)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">👋</span>
            <p className={`text-xs sm:text-sm truncate ${t.muted(dark)}`}>No workout logged today yet — whenever you're ready.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onAddWorkout && (
              <button onClick={onAddWorkout} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent text-white bg-accent-hover focus:outline-none ring-accent">
                + Add Workout
              </button>
            )}
            <button onClick={dismissTodayNudge} className={`text-xs px-1.5 py-1 rounded hover:opacity-70 ${t.muted(dark)}`}>✕</button>
          </div>
        </div>
      )}

      {/* ── Hero row: Distance + Calories — compact but visibly larger than the row below ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {heroStats.map((s,i) => (
          <div
            key={s.label}
            className={`rounded-2xl px-5 py-4 flex items-center gap-4 text-white shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl`}
            style={{
              opacity:shown?1:0, transform:shown?"translateY(0)":"translateY(24px)",
              transitionDelay:`${i*80}ms`,
              background: i===0
                ? `linear-gradient(135deg, ${activeTheme.accent}, ${activeTheme.accentHover})`
                : `linear-gradient(135deg, ${activeTheme.accent2}, ${activeTheme.accent2Hover})`,
            }}
          >
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-3xl flex-shrink-0">{s.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest opacity-90 truncate" style={OUTLINE_TEXT}>{s.label}</p>
                <TrendBadge thisWeek={s.thisW} lastWeek={s.lastW}/>
              </div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <p className="text-3xl font-mono font-black tabular-nums leading-tight" style={OUTLINE_TEXT}>{s.value}</p>
                <p className="text-sm font-semibold opacity-90" style={OUTLINE_TEXT}>{s.unit}</p>
                <p className="text-[11px] opacity-90 ml-auto whitespace-nowrap" style={OUTLINE_TEXT}>{s.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Secondary stats: Total Workouts + this user's top 2 workout types ── */}
      <div className="grid gap-3" style={{ gridTemplateColumns:`repeat(${secStats.length}, minmax(0, 1fr))` }}>
        {secStats.map((s,i) => (
          <div
            key={s.label}
            onClick={() => s.filter && onNavigate && onNavigate("history", s.filter)}
            className={`rounded-2xl border shadow-sm px-3.5 py-3 flex items-center gap-3 transition-all duration-500 hover:scale-[1.02] hover:shadow-md ${t.card(dark)} ${s.filter?"cursor-pointer ring-0 ring-accent-hover":""}`}
            style={{ opacity:shown?1:0, transform:shown?"translateY(0)":"translateY(20px)", transitionDelay:`${160+i*60}ms` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{backgroundColor:s.bg}}>
              <s.Icon size={18} style={{color:s.ic}}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className={`text-[10px] font-medium uppercase tracking-wide truncate ${t.label(dark)}`}>{s.label}</p>
                <TrendBadge thisWeek={s.thisW} lastWeek={s.lastW}/>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-lg font-mono font-bold tabular-nums leading-tight ${t.value(dark)}`}>{s.value}</p>
                <p className={`text-[10px] truncate ${t.muted(dark)}`}>{s.sub}</p>
              </div>
              {s.filter && (
                <p className="text-[10px] mt-0.5 text-accent font-medium">Tap to filter →</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Personal-record nudge ── */}
      {prNudge && (
        <div
          className={`rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-3 transition-all duration-500 ${t.card(dark)}`}
          style={{ opacity:shown?1:0, transform:shown?"translateY(0)":"translateY(16px)", transitionDelay:"260ms" }}
        >
          <span className="text-xl flex-shrink-0">{prNudge.isRecord ? "🎉" : "🏁"}</span>
          <p className={`text-xs sm:text-sm leading-snug ${t.value(dark)}`}>
            {prNudge.isRecord ? (
              <>Your last <span className="font-semibold">{prNudge.type}</span> ({prNudge.recent.distanceKm.toFixed(2)} km) matched your all-time record! 🔥</>
            ) : (
              <>Your last <span className="font-semibold">{prNudge.type}</span> was {prNudge.recent.distanceKm.toFixed(2)} km — <span className="font-semibold">{prNudge.gap.toFixed(2)} km</span> short of your record ({prNudge.record.distanceKm.toFixed(2)} km).</>
            )}
          </p>
        </div>
      )}

      {/* ── Goals ── */}
      <div>
        <h2 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${t.value(dark)}`}>
          🎯 Goals
          <span className={`text-xs font-normal ${t.muted(dark)}`}>Weekly & monthly targets</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GoalCard period="week"  workouts={workouts} goals={goals} onSetGoal={onSetGoal}/>
          <GoalCard period="month" workouts={workouts} goals={goals} onSetGoal={onSetGoal}/>
        </div>
      </div>

      {/* ── Shareable weekly recap ── */}
      <WeeklyRecapCard workouts={workouts} streaks={streaks}/>

      {/* ── Activity heatmap ── */}
      <HeatmapCard workouts={workouts} streaks={streaks}/>

      {/* ── Chart ── */}
      <ChartCard workouts={workouts} rangeKey={rangeKey} onRangeChange={setRangeKey}/>
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────
function HistoryTable({workouts,onEdit,onCopy,onDelete,copiedSrNo}) {
  const dark = useDark();
  const [confirmSrNo,setConfirmSrNo] = useState(null);
  const sorted = [...workouts].sort((a,b)=>a.srNo-b.srNo);
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${t.card(dark)}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`text-xs uppercase tracking-wide ${t.thead(dark)}`}>
              {["No.","Date","Workout","Distance","Time","Pace","Calories","Push-ups","Actions"].map((h,i)=>(
                <th key={h} className={`px-4 py-3 font-medium ${i<3?"text-left":"text-right"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(w=>(
              <tr key={w.srNo} className={`border-t ${t.divider(dark)} ${t.cardHover(dark)}`}>
                <td className={`px-4 py-2.5 font-mono ${t.muted(dark)}`}>{w.srNo}</td>
                <td className={`px-4 py-2.5 ${t.value(dark)}`}>{formatDateDisplay(w.date)}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${workoutColor(w.workout).bg} ${workoutColor(w.workout).text}`}>
                    {(() => { const WIcon = workoutIcon(w.workout, dark).Icon; return <WIcon size={12}/>; })()}
                    {w.workout}
                  </span>
                </td>
                <td className={`px-4 py-2.5 text-right font-mono ${t.value(dark)}`}>{w.distanceKm.toFixed(2)} km</td>
                <td className={`px-4 py-2.5 text-right font-mono ${t.value(dark)}`}>{w.time}</td>
                <td className={`px-4 py-2.5 text-right font-mono ${t.value(dark)}`}>{w.pace}</td>
                <td className={`px-4 py-2.5 text-right font-mono ${t.value(dark)}`}>{w.calories}</td>
                <td className={`px-4 py-2.5 text-right font-mono ${t.muted(dark)}`}>{w.pushups??"—"}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {confirmSrNo===w.srNo?(
                    <span className="inline-flex gap-2 items-center">
                      <button onClick={()=>{onDelete(w.srNo);setConfirmSrNo(null);}} className="text-xs font-semibold text-red-500 underline">Confirm</button>
                      <button onClick={()=>setConfirmSrNo(null)} className={`text-xs underline ${t.muted(dark)}`}>Cancel</button>
                    </span>
                  ):(
                    <span className="inline-flex gap-2.5 items-center text-xs">
                      <button onClick={()=>onEdit(w)} className="text-accent hover:underline">Edit</button>
                      <button onClick={()=>onCopy(w)} className={`hover:underline transition-colors ${copiedSrNo===w.srNo?"text-green-500 font-semibold":t.muted(dark)}`}>
                        {copiedSrNo===w.srNo?"Copied!":"Copy"}
                      </button>
                      <button onClick={()=>setConfirmSrNo(w.srNo)} className="text-red-500 hover:underline">Delete</button>
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
function HistoryPage({workouts,onEdit,onCopy,onDelete,copiedSrNo,initialTypeFilter=""}) {
  const dark = useDark();
  const [query, setQuery] = useState(initialTypeFilter);
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  const monthKeys = useMemo(() => {
    const keys = [...new Set(workouts.map(w => w.date.slice(0,7)))].sort().reverse();
    return keys;
  }, [workouts]);

  // When search is active, always search all data regardless of month filter
  const basePool = useMemo(() => {
    const q = query.trim();
    if (q) return workouts; // search ignores month filter
    if (selectedMonth === "ALL") return workouts;
    return workouts.filter(w => w.date.startsWith(selectedMonth));
  }, [workouts, selectedMonth, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return basePool;
    return workouts.filter(w => {
      if (formatDateDisplay(w.date).toLowerCase().includes(q)) return true;
      if (w.workout.toLowerCase().includes(q)) return true;
      const gtMatch = q.match(/^>(\d+\.?\d*)$/);
      const ltMatch = q.match(/^<(\d+\.?\d*)$/);
      const numMatch = q.match(/^(\d+\.?\d*)$/);
      if (gtMatch) return w.distanceKm > parseFloat(gtMatch[1]);
      if (ltMatch) return w.distanceKm < parseFloat(ltMatch[1]);
      if (numMatch) return Math.abs(w.distanceKm - parseFloat(numMatch[1])) < 0.5;
      return false;
    });
  }, [workouts, basePool, query]);

  function monthLabel(key) {
    if (key === "ALL") return "All time";
    const [y, m] = key.split("-");
    return `${MONTH_NAMES[parseInt(m,10)-1]} ${y}`;
  }

  const summary = useMemo(() => ({
    count: filtered.length,
    distance: filtered.reduce((s,w) => s+w.distanceKm, 0),
    calories: filtered.reduce((s,w) => s+w.calories, 0),
  }), [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className={`text-sm border rounded-lg px-3 py-1.5 focus:outline-none ring-accent ${t.select(dark)}`}
        >
          <option value="ALL">All time</option>
          {monthKeys.map(k => (
            <option key={k} value={k}>{monthLabel(k)}</option>
          ))}
        </select>
        <div className="flex-1 min-w-[180px] relative">
          <input
            type="text"
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder='Search date, type, or distance (e.g. ">3")'
            className={`w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none ring-accent ${t.input(dark)}`}
          />
          {query && (
            <button onClick={()=>setQuery("")} className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${t.muted(dark)}`}>✕</button>
          )}
        </div>
        <p className={`text-xs ${t.muted(dark)}`}>
          {summary.count} workout{summary.count!==1?"s":""} · {summary.distance.toFixed(2)} km · {summary.calories.toLocaleString()} kcal
          {query && <span className="ml-1 text-accent">(searching all data)</span>}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className={`rounded-2xl border shadow-sm p-10 text-center ${t.card(dark)}`}>
          <p className={`text-sm ${t.muted(dark)}`}>{query ? `No results for "${query}".` : `No workouts in ${monthLabel(selectedMonth)}.`}</p>
        </div>
      ) : (
        <HistoryTable workouts={filtered} onEdit={onEdit} onCopy={onCopy} onDelete={onDelete} copiedSrNo={copiedSrNo}/>
      )}
    </div>
  );
}

// ── Add/Edit Form ─────────────────────────────────────────────────────────────
function AddWorkoutForm({workouts,initialData,editSrNo,onSave,autoCloseOnSuccess}) {
  const dark = useDark();
  // If editing a custom workout (not in preset list), restore "Custom" + customName
  const isPreset = initialData ? WORKOUT_TYPES.slice(1).includes(initialData.workout) : true;
  const [form,setForm] = useState(()=>initialData?{
    date:initialData.date,
    workout: isPreset ? initialData.workout : "Custom",
    customName: isPreset ? "" : initialData.workout,
    distance:String(initialData.distanceKm),
    time:initialData.time,
    pace:initialData.pace,
    calories:String(initialData.calories),
    pushups:initialData.pushups!=null?String(initialData.pushups):"",
  }:{date:"",workout:"Running",customName:"",distance:"",time:"",pace:"",calories:"",pushups:""});
  const [error,setError]=useState(null);
  const [warning,setWarning]=useState(null);
  const [success,setSuccess]=useState(null);
  function upd(f,v){setForm(p=>({...p,[f]:v}));setWarning(null);setError(null);}
  function trySubmit(force) {
    setError(null);if(!force)setWarning(null);
    if(!form.date||!form.distance||!form.time||!form.pace||!form.calories){setError("Please fill in date, distance, time, pace, and calories.");return;}
    if(form.workout==="Custom"&&!form.customName.trim()){setError("Please enter a name for your custom workout.");return;}
    const km=parseFloat(form.distance),cal=parseInt(form.calories,10);
    if(isNaN(km)||km<=0){setError("Distance must be a positive number.");return;}
    if(isNaN(cal)||cal<0){setError("Calories must be 0 or greater.");return;}
    if(!force){
      if(workouts.some(w=>w.date===form.date&&w.srNo!==editSrNo)){setWarning(`An entry already exists for ${formatDateDisplay(form.date)}. Click "Save anyway" if correct.`);return;}
      const ts=parseTimeToSeconds(form.time),ps=parsePaceToSecondsPerKm(form.pace);
      if(ts>0&&ps>0&&Math.abs(ts/km-ps)>15){setWarning(`Expected pace ~${formatSecondsAsMMSS(ts/km)}/km but got ${form.pace}/km. Click "Save anyway" if correct.`);return;}
    }
    try{
      const isEdit=editSrNo!=null;
      const srNo=isEdit?editSrNo:(workouts.length?Math.max(...workouts.map(w=>w.srNo))+1:1);
      const resolvedWorkout = form.workout==="Custom" ? form.customName.trim() : form.workout;
      onSave({srNo,date:form.date,workout:resolvedWorkout,distanceKm:km,time:normalizeTimeDisplay(form.time),pace:normalizePaceDisplay(form.pace),calories:cal,pushups:form.pushups?parseInt(form.pushups,10):null},isEdit);
      setWarning(null);
      setSuccess(isEdit?`Saved changes to workout #${srNo}.`:`Added workout #${srNo} — ${km.toFixed(2)} km ${form.workout} on ${formatDateDisplay(form.date)}.`);
      if(initialData!=null&&autoCloseOnSuccess){setTimeout(()=>autoCloseOnSuccess(),900);}
      else{setForm({date:"",workout:"Running",distance:"",time:"",pace:"",calories:"",pushups:""});setTimeout(()=>setSuccess(null),5000);}
    }catch{setError("Something went wrong. Please try again.");}
  }
  const inp = `mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${t.input(dark)}`;
  return (
    <div className="space-y-4" onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();trySubmit(false);}}}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><label className={`text-xs font-medium ${t.labelSm(dark)}`}>Date</label><input type="date" value={form.date} onChange={e=>upd("date",e.target.value)} className={inp}/></div>
        <div>
          <label className={`text-xs font-medium ${t.labelSm(dark)}`}>Workout Type</label>
          <select value={form.workout} onChange={e=>upd("workout",e.target.value)} className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${t.select(dark)}`}>
            {WORKOUT_TYPES.map(type=>(
              <option key={type} value={type}>{type==="Custom"?"✏️ Custom":type}</option>
            ))}
          </select>
          {form.workout==="Custom"&&(
            <input
              type="text"
              value={form.customName}
              onChange={e=>upd("customName",e.target.value)}
              placeholder="e.g. Pilates, CrossFit, Dance…"
              className={`mt-2 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${t.input(dark)}`}
            />
          )}
        </div>
        <div><label className={`text-xs font-medium ${t.labelSm(dark)}`}>Distance (km)</label><input type="number" step="0.01" value={form.distance} onChange={e=>upd("distance",e.target.value)} placeholder="2.10" className={inp}/></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><label className={`text-xs font-medium ${t.labelSm(dark)}`}>Time</label><input type="text" value={form.time} onChange={e=>upd("time",e.target.value)} placeholder="13:33 or 1 hr 50 min 32 sec" className={inp}/></div>
        <div><label className={`text-xs font-medium ${t.labelSm(dark)}`}>Pace (min/km)</label><input type="text" value={form.pace} onChange={e=>upd("pace",e.target.value)} placeholder="7:04" className={inp}/></div>
        <div><label className={`text-xs font-medium ${t.labelSm(dark)}`}>Calories</label><input type="number" value={form.calories} onChange={e=>upd("calories",e.target.value)} placeholder="164" className={inp}/></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div><label className={`text-xs font-medium ${t.labelSm(dark)}`}>Push-ups (optional)</label><input type="number" value={form.pushups} onChange={e=>upd("pushups",e.target.value)} placeholder="—" className={inp}/></div>
        <div className="sm:col-span-2 flex justify-end"><button type="button" onClick={()=>trySubmit(false)} className="bg-accent bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg focus:outline-none ring-accent">{editSrNo!=null?"Save Changes":"Save Workout"}</button></div>
      </div>
      {error&&<div className={`flex items-start gap-2 border text-sm px-3 py-2.5 rounded-lg ${t.errBox(dark)}`}><AlertTriangle size={16} className="mt-0.5 flex-shrink-0"/><p>{error}</p></div>}
      {warning&&<div className={`flex items-start gap-2 border text-sm px-3 py-2.5 rounded-lg ${t.warnBox(dark)}`}><AlertTriangle size={16} className="mt-0.5 flex-shrink-0"/><div className="flex-1"><p>{warning}</p><button type="button" onClick={()=>trySubmit(true)} className="mt-1.5 text-xs font-semibold underline">Save anyway</button></div></div>}
      {success&&<div className={`flex items-start gap-2 border text-sm px-3 py-2.5 rounded-lg font-medium ${t.okBox(dark)}`}><CheckCircle2 size={16} className="mt-0.5 flex-shrink-0"/><p>{success}</p></div>}
    </div>
  );
}

function BulkAddForm({workouts,onBulkAdd}) {
  const dark = useDark();
  const [text,setText]=useState(""); const [parsed,setParsed]=useState([]); const [errors,setErrors]=useState([]); const [success,setSuccess]=useState(null);
  function parseLines(){
    const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
    const results=[],errs=[];let next=workouts.length?Math.max(...workouts.map(w=>w.srNo))+1:1;
    lines.forEach((line,idx)=>{
      const parts=line.split(",").map(p=>p.trim());
      if(parts.length<6){errs.push(`Line ${idx+1}: need 6+ comma-separated fields.`);return;}
      const[dateStr,wt,distStr,timeStr,paceStr,calStr,puStr]=parts;
      const iso=parseDateFlexible(dateStr);if(!iso){errs.push(`Line ${idx+1}: can't parse date "${dateStr}".`);return;}
      const km=parseFloat(distStr.replace(/km/i,"").trim()),cal=parseInt(calStr.replace(/kcal/i,"").trim(),10);
      if(isNaN(km)||km<=0){errs.push(`Line ${idx+1}: bad distance.`);return;}
      if(isNaN(cal)||cal<0){errs.push(`Line ${idx+1}: bad calories.`);return;}
      // Match to a known type (case-insensitive), otherwise keep as typed (custom)
      const matched = WORKOUT_TYPES.slice(1).find(t => t.toLowerCase()===wt.toLowerCase());
      const resolvedType = matched || (wt.trim()||"Custom");
      results.push({srNo:next++,date:iso,workout:resolvedType,distanceKm:km,time:normalizeTimeDisplay(timeStr),pace:normalizePaceDisplay(paceStr),calories:cal,pushups:puStr?parseInt(puStr,10):null});
    });
    setParsed(results);setErrors(errs);
  }
  function confirmAdd(){onBulkAdd(parsed);setSuccess(`Added ${parsed.length} workout${parsed.length===1?"":"s"}.`);setText("");setParsed([]);setTimeout(()=>setSuccess(null),4000);}
  return (
    <div className="space-y-3">
      <p className={`text-xs ${t.labelSm(dark)}`}>One per line: <span className="font-mono">Date, Workout, Distance, Time, Pace, Calories</span></p>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 ${t.input(dark)}`} placeholder="Paste multiple lines here..."/>
      <button type="button" onClick={parseLines} className={`text-sm px-3 py-1.5 rounded-lg border ${dark?"border-gray-700 text-gray-300 hover:bg-gray-800":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Preview</button>
      {errors.length>0&&<div className={`border text-xs px-3 py-2 rounded-lg space-y-0.5 ${t.errBox(dark)}`}>{errors.map((e,i)=><p key={i}>{e}</p>)}</div>}
      {parsed.length>0&&<div className={`border rounded-lg overflow-hidden max-h-48 overflow-y-auto ${dark?"border-gray-700":"border-slate-100"}`}><table className="w-full text-xs"><tbody>{parsed.map(p=><tr key={p.srNo} className={`border-b last:border-0 ${t.divider(dark)}`}><td className={`px-2 py-1.5 font-mono ${t.muted(dark)}`}>#{p.srNo}</td><td className={`px-2 py-1.5 ${t.value(dark)}`}>{formatDateDisplay(p.date)}</td><td className={`px-2 py-1.5 ${t.value(dark)}`}>{p.workout}</td><td className={`px-2 py-1.5 text-right font-mono ${t.value(dark)}`}>{p.distanceKm.toFixed(2)} km</td><td className={`px-2 py-1.5 text-right font-mono ${t.value(dark)}`}>{p.time}</td><td className={`px-2 py-1.5 text-right font-mono ${t.value(dark)}`}>{p.calories} kcal</td></tr>)}</tbody></table></div>}
      {parsed.length>0&&<button type="button" onClick={confirmAdd} className="bg-accent bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg">Confirm Add {parsed.length} Workout{parsed.length===1?"":"s"}</button>}
      {success&&<div className={`flex items-center gap-2 border text-sm px-3 py-2 rounded-lg font-medium ${t.okBox(dark)}`}><CheckCircle2 size={16}/>{success}</div>}
    </div>
  );
}

function AddWorkoutModal({open,onClose,workouts,entry,isEdit,onSave,onBulkAdd}) {
  const dark = useDark();
  const [mode,setMode]=useState("single");
  useEffect(()=>{if(open)setMode("single");},[open,entry]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto z-50" onClick={onClose}>
      <div className={`glass-surface rounded-2xl shadow-xl max-w-2xl w-full mt-10 p-5 ${t.modal(dark)}`} onClick={e=>e.stopPropagation()} style={{transformOrigin:'center', animation:'glassIn 260ms cubic-bezier(0.16,1,0.3,1)'}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-base font-semibold ${t.value(dark)}`}>{isEdit?"Edit Workout":entry?"Copy Workout (new entry)":"Add Workout"}</h3>
          <button onClick={onClose} className={`text-sm ${t.muted(dark)} hover:text-current`}>Close</button>
        </div>
        {!entry&&(
          <div className={`flex gap-1 mb-4 border-b ${t.nav(dark)}`}>
            {["single","bulk"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${mode===m?t.navActive(dark):t.navInactive(dark)}`}>
                {m==="single"?"Single Entry":"Bulk Paste"}
              </button>
            ))}
          </div>
        )}
        {(entry||mode==="single")
          ?<AddWorkoutForm workouts={workouts} initialData={entry} editSrNo={isEdit?entry.srNo:null} onSave={onSave} autoCloseOnSuccess={onClose}/>
          :<BulkAddForm workouts={workouts} onBulkAdd={onBulkAdd}/>}
      </div>
    </div>
  );
}

// ── Comparison / Analytics ────────────────────────────────────────────────────
function DeltaRow({label,current,compareValue,lowerIsBetter}) {
  const dark = useDark();
  if(compareValue==null||isNaN(compareValue)) return(
    <div className={`flex items-center justify-between py-1.5 border-b last:border-0 ${t.divider(dark)}`}>
      <span className={`text-xs ${t.muted(dark)}`}>{label}</span>
      <span className={`text-xs ${t.subValue(dark)}`}>No data</span>
    </div>
  );
  const diff=current-compareValue,pct=compareValue!==0?(diff/compareValue)*100:0;
  const improved=lowerIsBetter?diff<0:diff>0,flat=Math.abs(pct)<1;
  return(
    <div className={`flex items-center justify-between py-1.5 border-b last:border-0 ${t.divider(dark)}`}>
      <span className={`text-xs ${t.muted(dark)}`}>{label}</span>
      <span className={`text-xs font-mono font-semibold ${flat?t.muted(dark):improved?"text-green-500":"text-amber-500"}`}>
        {flat?"About the same":`${diff>0?"+":""}${pct.toFixed(0)}% ${improved?"▲":"▼"}`}
      </span>
    </div>
  );
}
function CompareBlock({title,data,entry,paceSec}) {
  const dark = useDark();
  return(
    <div className={`border rounded-lg p-3 ${dark?"border-gray-700":"border-slate-100"}`}>
      <p className={`text-xs font-semibold mb-2 ${t.labelSm(dark)}`}>{title}{data?.count?` (${data.count} workout${data.count===1?"":"s"})`:""}</p>
      {!data?<p className={`text-xs ${t.subValue(dark)}`}>No comparable data yet</p>:<div><DeltaRow label="Distance" current={entry.distanceKm} compareValue={data.distanceKm} lowerIsBetter={false}/><DeltaRow label="Pace" current={paceSec} compareValue={data.paceSec} lowerIsBetter={true}/><DeltaRow label="Calories" current={entry.calories} compareValue={data.calories} lowerIsBetter={false}/></div>}
    </div>
  );
}
function ComparisonPanel({comparison}) {
  const dark = useDark();
  if(!comparison?.entry) return<p className={`text-sm ${t.muted(dark)}`}>No workout selected.</p>;
  const{entry,paceSec,yesterday,prevWeekAvg,overallAvg}=comparison;
  return(
    <div className="space-y-4">
      <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm rounded-lg p-3 ${dark?"bg-gray-800":"bg-slate-50"}`}>
        <span className={t.value(dark)}><strong>{formatDateDisplay(entry.date)}</strong> · {entry.workout}</span>
        <span className={t.muted(dark)}>{entry.distanceKm.toFixed(2)} km</span>
        <span className={t.muted(dark)}>{entry.time}</span>
        <span className={t.muted(dark)}>{entry.pace}/km</span>
        <span className={t.muted(dark)}>{entry.calories} kcal</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <CompareBlock title="vs Yesterday" data={yesterday} entry={entry} paceSec={paceSec}/>
        <CompareBlock title="vs Previous Week Avg" data={prevWeekAvg} entry={entry} paceSec={paceSec}/>
        <CompareBlock title="vs Overall Avg" data={overallAvg} entry={entry} paceSec={paceSec}/>
      </div>
    </div>
  );
}

function AnalyticsPage({workouts}) {
  const dark = useDark();
  const [rangeKey,setRangeKey]=useState("ALL");
  const sorted=useMemo(()=>[...workouts].sort((a,b)=>a.date.localeCompare(b.date)),[workouts]);
  const [focusDate,setFocusDate]=useState(sorted.length?sorted[sorted.length-1].date:null);
  const focusEntry=workouts.find(w=>w.date===focusDate)||null;
  const comparison=useMemo(()=>computeComparison(focusEntry,workouts),[focusEntry,workouts]);
  const monthlyBars=useMemo(()=>computeMonthlyBars(workouts),[workouts]);
  return(
    <div className="space-y-6">
      <ChartCard workouts={workouts} detailed rangeKey={rangeKey} onRangeChange={setRangeKey}/>
      <div className={`rounded-2xl border shadow-sm p-5 ${t.card(dark)}`}>
        <h3 className={`text-sm font-semibold mb-3 ${t.value(dark)}`}>Monthly Distance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyBars}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid(dark)}/>
            <XAxis dataKey="label" tick={{fontSize:11,fill:t.axis(dark)}} axisLine={{stroke:t.axisLine(dark)}} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:t.axis(dark)}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={v=>[`${v} km`,"Distance"]} contentStyle={{backgroundColor:dark?"#1F2937":"#fff",border:`1px solid ${dark?"#374151":"#E2E8F0"}`,color:dark?"#F3F4F6":"#1E293B",borderRadius:8}}/>
            <Bar dataKey="distance" fill="#93C5FD" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={`rounded-2xl border shadow-sm p-5 ${t.card(dark)}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className={`text-sm font-semibold ${t.value(dark)}`}>Compare a Day</h3>
          <select value={focusDate||""} onChange={e=>setFocusDate(e.target.value)} className={`text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 ${t.select(dark)}`}>
            {[...sorted].reverse().map(w=><option key={w.srNo} value={w.date}>{formatDateDisplay(w.date)} — {w.workout}</option>)}
          </select>
        </div>
        {focusEntry?<ComparisonPanel comparison={comparison}/>:<p className={`text-sm ${t.muted(dark)}`}>No data yet.</p>}
      </div>
    </div>
  );
}

// ── Records ───────────────────────────────────────────────────────────────────
function RecordStat({icon:Icon,label,value,sub,bg,bgDark,color}) {
  const dark = useDark();
  return(
    <div className={`rounded-2xl border shadow-sm p-4 flex flex-col gap-3 ${t.card(dark)}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: dark && bgDark ? bgDark : bg}}>
        <Icon size={20} style={{color}}/>
      </div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${t.label(dark)}`}>{label}</p>
        <p className={`text-xl font-mono font-bold mt-0.5 ${t.value(dark)}`}>{value}</p>
        {sub&&<p className={`text-xs mt-0.5 ${t.subValue(dark)}`}>{sub}</p>}
      </div>
    </div>
  );
}
function Leaderboard({title,entries,valueFn}) {
  const dark = useDark();
  if(!entries.length) return null;
  return(
    <div className={`rounded-2xl border shadow-sm p-5 ${t.card(dark)}`}>
      <h3 className={`text-sm font-semibold mb-2 ${t.value(dark)}`}>{title}</h3>
      <div>
        {entries.map((w,i)=>(
          <div key={w.srNo} className={`flex items-center justify-between py-2 border-b last:border-0 ${t.divider(dark)}`}>
            <div className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold ${dark?"bg-gray-700 text-gray-300":"bg-slate-100 text-slate-500"}`}>{i+1}</span>
              <span className={`text-sm ${t.value(dark)}`}>{formatDateDisplay(w.date)}</span>
            </div>
            <span className={`text-sm font-mono font-semibold ${t.value(dark)}`}>{valueFn(w)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function RecordsPage({workouts,pr,streaks}) {
  if(!pr) return null;
  const runsByDist=[...workouts.filter(w=>w.workout==="Running")].sort((a,b)=>b.distanceKm-a.distanceKm);
  const runsByPace=[...workouts.filter(w=>w.workout==="Running")].sort((a,b)=>parsePaceToSecondsPerKm(a.pace)-parsePaceToSecondsPerKm(b.pace));
  const topCal=[...workouts].sort((a,b)=>b.calories-a.calories);
  return(
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <RecordStat icon={Route}      label="Longest Run"          value={pr.longestRun?`${pr.longestRun.distanceKm.toFixed(2)} km`:"—"}  sub={pr.longestRun?formatDateDisplay(pr.longestRun.date):""}            bg="#DBEAFE" bgDark="rgba(37,99,235,0.18)"  color="#2563EB"/>
        <RecordStat icon={Footprints} label="Longest Walk"         value={pr.longestWalk?`${pr.longestWalk.distanceKm.toFixed(2)} km`:"—"} sub={pr.longestWalk?formatDateDisplay(pr.longestWalk.date):""}           bg="#D1FAE5" bgDark="rgba(5,150,105,0.18)"  color="#059669"/>
        <RecordStat icon={Timer}      label="Fastest Running Pace" value={pr.fastestRun?`${pr.fastestRun.pace}/km`:"—"}                   sub={pr.fastestRun?formatDateDisplay(pr.fastestRun.date):""}             bg="#EDE9FE" bgDark="rgba(124,58,237,0.18)" color="#7C3AED"/>
        <RecordStat icon={Zap}        label="Highest Calories"     value={`${pr.highestCalories.calories} kcal`}                           sub={formatDateDisplay(pr.highestCalories.date)}                         bg="#FFEDD5" bgDark="rgba(234,88,12,0.18)"  color="#EA580C"/>
        <RecordStat icon={Flame}      label="Longest Streak"       value={`${streaks.longest} days`}                                       sub={streaks.longestRange?`${formatDateDisplay(streaks.longestRange.start)} – ${formatDateDisplay(streaks.longestRange.end)}`:""}  bg="#FCE7F3" bgDark="rgba(219,39,119,0.18)" color="#DB2777"/>
        <RecordStat icon={MapPin}     label="Total Distance"       value={`${pr.totalDistance.toFixed(2)} km`}                             sub={`${workouts.length} workouts`}                                      bg="#E0E7FF" bgDark="rgba(79,70,229,0.18)"  color="#4F46E5"/>
      </div>
      <Leaderboard title="Top 5 Longest Runs" entries={runsByDist.slice(0,5)} valueFn={w=>`${w.distanceKm.toFixed(2)} km`}/>
      <Leaderboard title="Top 5 Fastest Runs" entries={runsByPace.slice(0,5)} valueFn={w=>`${w.pace}/km`}/>
      <Leaderboard title="Top 5 Highest Calorie Burns" entries={topCal.slice(0,5)} valueFn={w=>`${w.calories} kcal`}/>
    </div>
  );
}

// ── Leaderboard (region-wise, multi-user) ───────────────────────────────────────
// Built on window.storage's *shared* mode: every real person who opens this artifact
// writes their own row here, and everyone using the same artifact link can read
// everyone else's. There's no backend or auth behind this — it's entirely self-reported,
// and "everyone" specifically means everyone using this artifact instance, not the
// whole internet. A handful of sample rows are seeded once (only if the shared list is
// completely empty) so the region grouping is demonstrable before other real people join.
const RANK_METRICS = [
  { key:"totalDistance", label:"Distance", unit:"km",   fmt:v=>(v||0).toFixed(1) },
  { key:"totalCalories", label:"Calories", unit:"kcal", fmt:v=>Math.round(v||0).toLocaleString() },
  { key:"totalWorkouts", label:"Workouts", unit:"",     fmt:v=>Math.round(v||0).toLocaleString() },
  { key:"currentStreak", label:"Streak",   unit:"days", fmt:v=>Math.round(v||0).toLocaleString() },
];
const COMMON_COUNTRIES = ["United States","India","United Kingdom","Canada","Australia","Germany","France","Spain","Italy","Japan","China","Brazil","Mexico","South Africa","Nigeria","Netherlands","Sweden","Norway","Ireland","Singapore","United Arab Emirates","Indonesia","Philippines","Pakistan","Bangladesh","South Korea","New Zealand","Switzerland","Portugal","Poland","Turkey","Egypt","Kenya","Argentina","Colombia","Vietnam","Thailand","Malaysia"];
function seedLeaderboardSample() {
  return [
    { name:"Aarav Sharma",  country:"India",          city:"Pune",          totalDistance:312.4, totalCalories:18650, totalWorkouts:88,  currentStreak:9  },
    { name:"Priya Nair",    country:"India",          city:"Mumbai",        totalDistance:276.1, totalCalories:16200, totalWorkouts:71,  currentStreak:4  },
    { name:"Rohan Iyer",    country:"India",          city:"Bengaluru",     totalDistance:198.7, totalCalories:11890, totalWorkouts:52,  currentStreak:2  },
    { name:"Jake Miller",   country:"United States",  city:"New York City", totalDistance:401.2, totalCalories:24310, totalWorkouts:110, currentStreak:14 },
    { name:"Emily Chen",    country:"United States",  city:"San Francisco", totalDistance:289.5, totalCalories:17040, totalWorkouts:79,  currentStreak:6  },
    { name:"Marcus Reed",   country:"United States",  city:"Austin",        totalDistance:167.3, totalCalories:9870,  totalWorkouts:44,  currentStreak:1  },
    { name:"Sophie Clarke", country:"United Kingdom",  city:"London",        totalDistance:233.9, totalCalories:13980, totalWorkouts:63,  currentStreak:5  },
    { name:"Liam O'Brien",  country:"Australia",      city:"Sydney",        totalDistance:210.6, totalCalories:12500, totalWorkouts:57,  currentStreak:3  },
    { name:"Hannah Weber",  country:"Germany",        city:"Berlin",        totalDistance:145.8, totalCalories:8640,  totalWorkouts:38,  currentStreak:0  },
    { name:"Kenji Sato",    country:"Japan",          city:"Tokyo",         totalDistance:256.3, totalCalories:15120, totalWorkouts:68,  currentStreak:11 },
  ];
}
function LeaderboardPage({ stats, streaks }) {
  const dark = useDark();
  const [ready, setReady]     = useState(false);
  const [userId, setUserId]   = useState(null);
  const [profile, setProfile] = useState(null); // {name,country,city}
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ name:"", country:"", city:"" });
  const [entries, setEntries] = useState([]);
  const [rankKey, setRankKey] = useState("totalDistance");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterCity, setFilterCity]       = useState("All");

  // Load identity + profile + shared entries (seeding sample rows on the very first visit)
  useEffect(() => {
    if (typeof window === "undefined" || !window.storage) { setReady(true); return; }
    let cancelled = false;
    (async () => {
      try {
        let idRes = await window.storage.get("wt-user-id", false).catch(() => null);
        let id = idRes?.value;
        if (!id) {
          id = "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
          await window.storage.set("wt-user-id", id, false).catch(() => {});
        }
        if (cancelled) return;
        setUserId(id);

        const profRes = await window.storage.get("wt-profile", false).catch(() => null);
        if (!cancelled && profRes?.value) setProfile(JSON.parse(profRes.value));

        const listRes = await window.storage.list("leaderboard:", true).catch(() => null);
        let keys = listRes?.keys || [];
        if (keys.length === 0) {
          const sample = seedLeaderboardSample();
          await Promise.all(sample.map((row,i) =>
            window.storage.set(`leaderboard:sample_${i}`, JSON.stringify(row), true).catch(() => {})
          ));
          keys = sample.map((_,i) => `leaderboard:sample_${i}`);
        }
        const fetched = await Promise.all(keys.map(k => window.storage.get(k, true).catch(() => null)));
        if (!cancelled) {
          const parsed = fetched.filter(Boolean).map(r => {
            try { return { id:r.key, ...JSON.parse(r.value) }; } catch { return null; }
          }).filter(Boolean);
          setEntries(parsed);
        }
      } catch {}
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Publish/refresh my own row whenever I have a profile and my stats change
  useEffect(() => {
    if (!ready || !userId || !profile || typeof window === "undefined" || !window.storage) return;
    const myKey = `leaderboard:${userId}`;
    const payload = {
      name: profile.name, country: profile.country, city: profile.city,
      totalDistance: stats.totalDistance, totalCalories: stats.totalCalories,
      totalWorkouts: stats.totalWorkouts, currentStreak: streaks.current,
      updatedAt: Date.now(),
    };
    window.storage.set(myKey, JSON.stringify(payload), true).catch(() => {});
    setEntries(prev => [...prev.filter(e => e.id !== myKey), { id:myKey, ...payload }]);
  }, [ready, userId, profile, stats.totalDistance, stats.totalCalories, stats.totalWorkouts, streaks.current]);

  function saveProfile() {
    const name = draft.name.trim(), country = draft.country.trim(), city = draft.city.trim();
    if (!name || !country || !city) return;
    const p = { name, country, city };
    setProfile(p);
    setEditing(false);
    if (typeof window !== "undefined" && window.storage) {
      window.storage.set("wt-profile", JSON.stringify(p), false).catch(() => {});
    }
  }

  const countries = useMemo(() => {
    const map = new Map();
    entries.forEach(e => { if (e.country) map.set(e.country.toLowerCase(), e.country); });
    return Array.from(map.values()).sort();
  }, [entries]);
  const cities = useMemo(() => {
    const map = new Map();
    entries.forEach(e => {
      if (e.country && e.city && (filterCountry==="All" || e.country.toLowerCase()===filterCountry.toLowerCase())) map.set(e.city.toLowerCase(), e.city);
    });
    return Array.from(map.values()).sort();
  }, [entries, filterCountry]);

  const metric = RANK_METRICS.find(m => m.key === rankKey);
  const filtered = useMemo(() => {
    return entries
      .filter(e => e.name)
      .filter(e => filterCountry==="All" || (e.country||"").toLowerCase()===filterCountry.toLowerCase())
      .filter(e => filterCity==="All" || (e.city||"").toLowerCase()===filterCity.toLowerCase())
      .sort((a,b) => (b[rankKey]||0) - (a[rankKey]||0));
  }, [entries, filterCountry, filterCity, rankKey]);

  const myId = userId ? `leaderboard:${userId}` : null;
  const myRank = myId ? filtered.findIndex(e => e.id === myId) + 1 : 0;

  if (!ready) return <p className={`text-sm ${t.muted(dark)}`}>Loading leaderboard…</p>;

  return (
    <div className="space-y-5">
      {!profile || editing ? (
        <div className={`rounded-2xl border shadow-sm p-5 space-y-3 max-w-md ${t.card(dark)}`}>
          <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${t.value(dark)}`}><Globe size={16}/> Join the leaderboard</h3>
          <p className={`text-xs ${t.muted(dark)}`}>Add your name and location to appear in world rankings. Self-reported — no account needed.</p>
          <div className="space-y-2">
            <input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} placeholder="Your name" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ring-accent ${t.input(dark)}`}/>
            <input value={draft.country} onChange={e=>setDraft(d=>({...d,country:e.target.value}))} list="wt-countries" placeholder="Country (e.g. India)" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ring-accent ${t.input(dark)}`}/>
            <datalist id="wt-countries">{COMMON_COUNTRIES.map(c=><option key={c} value={c}/>)}</datalist>
            <input value={draft.city} onChange={e=>setDraft(d=>({...d,city:e.target.value}))} placeholder="City (e.g. Pune)" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ring-accent ${t.input(dark)}`}/>
          </div>
          <div className="flex gap-2">
            <button onClick={saveProfile} className="text-sm font-semibold px-4 py-2 rounded-lg bg-accent text-white bg-accent-hover">Save & Join</button>
            {profile && <button onClick={()=>setEditing(false)} className={`text-sm px-4 py-2 rounded-lg border ${dark?"border-gray-700 text-gray-300":"border-slate-200 text-slate-600"}`}>Cancel</button>}
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border shadow-sm px-4 py-3 flex items-center justify-between gap-3 ${t.card(dark)}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">🙋</span>
            <p className={`text-sm truncate ${t.value(dark)}`}>{profile.name} · <span className={t.muted(dark)}>{profile.country}, {profile.city}</span></p>
          </div>
          <button onClick={()=>{setDraft(profile); setEditing(true);}} className={`text-xs font-medium px-3 py-1.5 rounded-lg border flex-shrink-0 ${dark?"border-gray-700 text-gray-300 hover:bg-gray-800":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Edit</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select value={rankKey} onChange={e=>setRankKey(e.target.value)} className={`text-sm border rounded-lg px-2.5 py-1.5 focus:outline-none ring-accent ${t.select(dark)}`}>
          {RANK_METRICS.map(m=><option key={m.key} value={m.key}>Rank by {m.label}</option>)}
        </select>
        <select value={filterCountry} onChange={e=>{setFilterCountry(e.target.value); setFilterCity("All");}} className={`text-sm border rounded-lg px-2.5 py-1.5 focus:outline-none ring-accent ${t.select(dark)}`}>
          <option value="All">🌍 World</option>
          {countries.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        {filterCountry!=="All" && (
          <select value={filterCity} onChange={e=>setFilterCity(e.target.value)} className={`text-sm border rounded-lg px-2.5 py-1.5 focus:outline-none ring-accent ${t.select(dark)}`}>
            <option value="All">All cities</option>
            {cities.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {profile && myRank>0 && (
        <p className={`text-xs ${t.muted(dark)}`}>You're ranked <span className={`font-semibold ${t.value(dark)}`}>#{myRank}</span> of {filtered.length} in this view.</p>
      )}

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${t.card(dark)}`}>
        <div className={`divide-y ${dark?"divide-gray-800":"divide-slate-100"}`}>
          {filtered.length === 0 ? (
            <p className={`text-sm p-5 ${t.muted(dark)}`}>No one here yet — be the first!</p>
          ) : filtered.map((e,i) => {
            const isMe = e.id === myId;
            const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
            return (
              <div key={e.id} className={`flex items-center gap-3 px-4 py-3 ${isMe ? (dark?"bg-blue-900/20":"bg-blue-50") : ""}`}>
                <span className={`w-7 text-center text-sm font-bold flex-shrink-0 ${t.muted(dark)}`}>{medal || `#${i+1}`}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${t.value(dark)}`}>{e.name}{isMe && <span className="ml-1.5 text-xs font-normal text-accent">(You)</span>}</p>
                  <p className={`text-xs truncate ${t.muted(dark)}`}>{e.country}{e.city?`, ${e.city}`:""}</p>
                </div>
                <span className={`text-sm font-mono font-bold tabular-nums flex-shrink-0 ${t.value(dark)}`}>
                  {metric.fmt(e[rankKey])} <span className={`text-xs font-normal ${t.muted(dark)}`}>{metric.unit}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className={`text-[11px] ${t.muted(dark)}`}>Rankings are self-reported from data entered in this app and update as more people join from this link.</p>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsPage({workouts,onExport,onExportXlsx,onReset,dark,setDark,theme,setTheme}) {
  const [confirming,setConfirming]=useState(false);
  return(
    <div className="space-y-4 max-w-xl">
      <div className={`rounded-2xl border shadow-sm p-5 space-y-3 ${t.card(dark)}`}>
        <h3 className={`text-sm font-semibold ${t.value(dark)}`}>Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-sm ${t.value(dark)}`}>Dark mode</span>
            <p className={`text-xs ${t.muted(dark)}`}>Applies to whichever theme is selected below.</p>
          </div>
          <button type="button" onClick={()=>setDark(d=>!d)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${dark?"bg-accent":"bg-slate-200"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${dark?"translate-x-6":"translate-x-1"}`}/>
          </button>
        </div>
        <div className={`pt-3 border-t ${t.divider(dark)}`}>
          <p className={`text-sm mb-1 ${t.value(dark)}`}>Theme</p>
          <p className={`text-xs mb-3 ${t.muted(dark)}`}>Each theme has its own light and dark look — the toggle above switches between them.</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(th => {
              const selected = theme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all text-left focus:outline-none ${selected ? "border-accent scale-[1.02] shadow-md" : `border-transparent ${dark?"hover:border-gray-700":"hover:border-slate-200"}`}`}
                  aria-pressed={selected}
                  title={th.name}
                >
                  <div className="flex h-14 w-full">
                    {th.swatch.map((c,i) => <div key={i} className="flex-1" style={{background:c}}/>)}
                  </div>
                  <div className={`px-2 py-1.5 flex items-center justify-between gap-1 ${t.card(dark)}`}>
                    <span className={`text-[11px] font-medium truncate ${t.value(dark)}`}>{th.name}</span>
                    {th.id === DEFAULT_THEME_ID && !selected && <span className={`text-[9px] ${t.muted(dark)}`}>Default</span>}
                  </div>
                  {selected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[10px] shadow">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className={`rounded-2xl border shadow-sm p-5 space-y-3 ${t.card(dark)}`}>
        <h3 className={`text-sm font-semibold ${t.value(dark)}`}>Data</h3>
        <p className={`text-xs ${t.muted(dark)}`}>{workouts.length} workouts stored.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onExport} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border ${dark?"border-gray-700 text-gray-300 hover:bg-gray-800":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Download size={14}/> Export as JSON</button>
          <button onClick={onExportXlsx} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border ${dark?"border-gray-700 text-gray-300 hover:bg-gray-800":"border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Download size={14}/> Export as Excel</button>
        </div>
      </div>
      <div className={`rounded-2xl border shadow-sm p-5 space-y-3 ${t.dangerBorder(dark)} ${t.card(dark)}`}>
        <h3 className="text-sm font-semibold text-red-500">Danger Zone</h3>
        <p className={`text-xs ${t.muted(dark)}`}>Clears all saved data and reloads original seed history. Export a backup first.</p>
        {!confirming
          ?<button onClick={()=>setConfirming(true)} className="text-sm px-3 py-1.5 rounded-lg border border-red-500/40 text-red-500 hover:bg-red-500/10">Reset to seed data</button>
          :<div className="flex gap-2"><button onClick={()=>{onReset();setConfirming(false);}} className="text-sm px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600">Confirm reset</button><button onClick={()=>setConfirming(false)} className={`text-sm px-3 py-1.5 rounded-lg border ${dark?"border-gray-700 text-gray-300":"border-slate-200 text-slate-600"}`}>Cancel</button></div>}
      </div>
    </div>
  );
}

// ── Milestone celebration toast (lightweight confetti burst) ──────────────────
function MilestoneToast({ toast, onClose }) {
  const dark = useDark();
  if (!toast) return null;
  const colors = ["#3B82F6","#22C55E","#F59E0B","#EF4444","#A855F7","#06B6D4"];
  const particles = Array.from({length:12});
  return (
    <div className="fixed top-6 left-1/2 z-50 pointer-events-none" style={{transform:"translateX(-50%)"}}>
      <style>{`
        @keyframes wtConfettiPop { 0%{transform:translate(0,0) rotate(0deg) scale(0);opacity:1;} 65%{opacity:1;} 100%{transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(1);opacity:0;} }
        @keyframes wtToastIn { 0%{transform:translateY(-14px) scale(0.92);opacity:0;} 100%{transform:translateY(0) scale(1);opacity:1;} }
      `}</style>
      <div className="relative pointer-events-auto">
        {particles.map((_,i) => {
          const angle = (i/particles.length) * 2*Math.PI;
          const dist  = 46 + (i%3)*14;
          const dx = Math.cos(angle)*dist, dy = Math.sin(angle)*dist - 16;
          const rot = (i*47)%360;
          return (
            <span key={i} className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-sm"
              style={{
                backgroundColor:colors[i%colors.length],
                "--dx":`${dx}px`, "--dy":`${dy}px`, "--rot":`${rot}deg`,
                animation:"wtConfettiPop 900ms ease-out forwards", animationDelay:`${i*12}ms`,
              }}/>
          );
        })}
        <div className={`flex items-center gap-3 rounded-2xl border shadow-xl px-4 py-3 ${t.card(dark)}`} style={{animation:"wtToastIn 400ms cubic-bezier(0.34,1.56,0.64,1)"}}>
          <span className="text-2xl animate-bounce">{toast.emoji}</span>
          <div>
            <p className={`text-sm font-bold ${t.value(dark)}`}>{toast.title}</p>
            <p className={`text-xs ${t.muted(dark)}`}>{toast.sub}</p>
          </div>
          <button onClick={onClose} className={`ml-2 text-xs hover:opacity-70 ${t.muted(dark)}`}>✕</button>
        </div>
      </div>
    </div>
  );
}
// Watches totals and fires a one-time toast the first time a round-number milestone is crossed,
// persisted via window.storage (the API that actually works in Claude.ai artifacts — plain
// localStorage/sessionStorage calls are unsupported here and fail silently).

// ── Notification System ───────────────────────────────────────────────────────
// Each notification: { id, type, emoji, title, sub, ts, read }
// Types: milestone | pr | goal | streak | digest

function useNotifications(stats, pr, streaks, goals, workouts) {
  const [notifs, setNotifs] = useState([]);
  const dark = useDark();

  // Load from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.storage) return;
    window.storage.get('wt-notifications', false).then(r => {
      if (r?.value) {
        try { setNotifs(JSON.parse(r.value)); } catch {}
      }
    }).catch(() => {});
  }, []);

  // Persist whenever notifs change
  useEffect(() => {
    if (typeof window === 'undefined' || !window.storage) return;
    window.storage.set('wt-notifications', JSON.stringify(notifs), false).catch(() => {});
  }, [notifs]);

  function addNotif(n) {
    const id = `${n.type}-${n.title}-${Date.now()}`;
    setNotifs(prev => {
      // Deduplicate: don't add if same type+title within 24h
      const recent = prev.find(p => p.type === n.type && p.title === n.title &&
        Date.now() - p.ts < 86400000);
      if (recent) return prev;
      return [{ id, ...n, ts: Date.now(), read: false }, ...prev].slice(0, 50);
    });
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  function clearNotif(id) {
    setNotifs(prev => prev.filter(n => n.id !== id));
  }

  function clearAll() { setNotifs([]); }

  // ── Fire notifications based on data ──────────────────────────────────────

  // Milestones (every 50km, every 25 workouts)
  const prevDistRef = React.useRef(0);
  const prevWosRef  = React.useRef(0);
  useEffect(() => {
    if (!stats?.totalDistance) return;
    const curD = Math.floor(stats.totalDistance / 50) * 50;
    const prevD = Math.floor(prevDistRef.current / 50) * 50;
    if (curD > 0 && curD > prevD) {
      const emoji = curD >= 500 ? '🌍' : curD >= 200 ? '🏆' : curD >= 100 ? '🥇' : '🏅';
      addNotif({ type:'milestone', emoji, title:`${curD} km total!`, sub:`${stats.totalDistance.toFixed(1)} km logged and counting 🔥` });
    }
    prevDistRef.current = stats.totalDistance;
  }, [stats?.totalDistance]);

  useEffect(() => {
    if (!stats?.totalWorkouts) return;
    const curW = Math.floor(stats.totalWorkouts / 25) * 25;
    const prevW = Math.floor(prevWosRef.current / 25) * 25;
    if (curW > 0 && curW > prevW) {
      addNotif({ type:'milestone', emoji:'🎉', title:`${curW} workouts logged!`, sub:`You hit the ${curW}-workout milestone! Keep going 💪` });
    }
    prevWosRef.current = stats.totalWorkouts;
  }, [stats?.totalWorkouts]);

  // PR notifications
  const prevPrRef = React.useRef(null);
  useEffect(() => {
    if (!pr) return;
    const prev = prevPrRef.current;
    if (prev) {
      if (pr.longestRun && (!prev.longestRun || pr.longestRun.distanceKm > prev.longestRun.distanceKm))
        addNotif({ type:'pr', emoji:'🏃', title:'New longest run!', sub:`${pr.longestRun.distanceKm.toFixed(2)} km on ${formatDateDisplay(pr.longestRun.date)}` });
      if (pr.longestWalk && (!prev.longestWalk || pr.longestWalk.distanceKm > prev.longestWalk.distanceKm))
        addNotif({ type:'pr', emoji:'🚶', title:'New longest walk!', sub:`${pr.longestWalk.distanceKm.toFixed(2)} km on ${formatDateDisplay(pr.longestWalk.date)}` });
      if (pr.fastestRun && (!prev.fastestRun || parsePaceToSecondsPerKm(pr.fastestRun.pace) < parsePaceToSecondsPerKm(prev.fastestRun.pace)))
        addNotif({ type:'pr', emoji:'⚡', title:'New fastest pace!', sub:`${pr.fastestRun.pace}/km on ${formatDateDisplay(pr.fastestRun.date)}` });
    }
    prevPrRef.current = pr;
  }, [pr]);

  // Streak at risk — if no workout today & streak > 0 & hour >= 18
  const todayIso = new Date().toISOString().slice(0,10);
  const loggedToday = workouts.some(w => w.date === todayIso);
  const hour = new Date().getHours();
  useEffect(() => {
    if (!loggedToday && streaks?.current > 0 && hour >= 18) {
      addNotif({
        type:'streak',
        emoji:'🔥',
        title:`Your ${streaks.current}-day streak ends at midnight!`,
        sub:'Log a workout today to keep it alive.',
      });
    }
  }, [loggedToday, streaks?.current, hour]);

  // Goal deadline — weekly goals with < 2 days left and < 80% complete
  useEffect(() => {
    if (!goals || !workouts.length) return;
    const wb = getWeekBounds(0);
    const daysLeft = Math.ceil((new Date(wb.end) - new Date()) / 86400000);
    if (daysLeft > 2) return;
    const periodWorkouts = workouts.filter(w => w.date >= wb.start && w.date <= wb.end);
    Object.entries(goals).forEach(([key, target]) => {
      if (!key.startsWith('week_') || !target) return;
      const parts = key.split('_');
      const metric = parts[parts.length - 1];
      const type = parts.slice(1, parts.length - 1).join('_');
      let current = 0;
      const pool = periodWorkouts.filter(w => w.workout === type);
      if (metric === 'distance') current = pool.reduce((s,w) => s+w.distanceKm, 0);
      else if (metric === 'calories') current = pool.reduce((s,w) => s+w.calories, 0);
      else if (metric === 'sessions') current = pool.length;
      const pct = (current / target) * 100;
      if (pct < 80) {
        const remaining = metric === 'distance' ? `${(target-current).toFixed(1)} km` :
          metric === 'calories' ? `${Math.round(target-current)} kcal` : `${Math.round(target-current)} sessions`;
        addNotif({
          type:'goal', emoji:'🎯',
          title:`Weekly ${type} goal at risk`,
          sub:`${daysLeft} day${daysLeft!==1?'s':''} left · ${remaining} to go`,
        });
      }
    });
  }, [goals, workouts]);

  const unreadCount = notifs.filter(n => !n.read).length;
  return { notifs, unreadCount, markAllRead, clearNotif, clearAll, addNotif };
}

// ── Notification Bell + Dropdown ─────────────────────────────────────────────
const NOTIF_TYPE_STYLES = {
  milestone: { bg:'bg-purple-500/10', border:'border-purple-400/30', dot:'#A855F7' },
  pr:        { bg:'bg-blue-500/10',   border:'border-blue-400/30',   dot:'#3B82F6' },
  goal:      { bg:'bg-amber-500/10',  border:'border-amber-400/30',  dot:'#F59E0B' },
  streak:    { bg:'bg-orange-500/10', border:'border-orange-400/30', dot:'#EA580C' },
  digest:    { bg:'bg-slate-500/10',  border:'border-slate-400/30',  dot:'#64748B' },
};

function NotificationCenter({ notifs, unreadCount, onMarkAllRead, onClear, onClearAll }) {
  const dark = useDark();
  const [open, setOpen] = useState(false);
  const panelRef = React.useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function toggle() {
    setOpen(o => !o);
    if (!open && unreadCount > 0) onMarkAllRead();
  }

  const relTime = (ts) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={toggle}
        className={`relative w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus:outline-none ${
          dark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
        }`}
        title="Notifications"
      >
        <span
          style={unreadCount > 1 ? {
            animation: 'wiggle 0.7s ease-in-out infinite',
            display: 'inline-block',
            fontSize: '16px',
          } : { fontSize: '16px' }}
        >🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={`glass-surface absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${t.card(dark)}`}
          style={{ maxHeight: '420px', transformOrigin: 'top right', animation: 'glassIn 220ms cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${t.divider(dark)}`}>
            <p className={`text-sm font-bold ${t.value(dark)}`}>Notifications</p>
            <div className="flex gap-2">
              {notifs.length > 0 && (
                <button onClick={onClearAll} className={`text-xs ${t.muted(dark)} hover:text-red-400 transition-colors`}>
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} className={`${t.muted(dark)} hover:text-current`}>
                <X size={14}/>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-3xl">🔔</span>
                <p className={`text-sm ${t.muted(dark)}`}>No notifications yet</p>
                <p className={`text-xs ${t.muted(dark)}`}>PRs, milestones & goal alerts will appear here</p>
              </div>
            ) : (
              notifs.map(n => {
                const ns = NOTIF_TYPE_STYLES[n.type] || NOTIF_TYPE_STYLES.digest;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 ${t.divider(dark)} ${t.cardHover(dark)}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 border ${ns.bg} ${ns.border}`}>
                      {n.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-tight ${t.value(dark)}`}>{n.title}</p>
                      <p className={`text-xs mt-0.5 leading-snug ${t.muted(dark)}`}>{n.sub}</p>
                      <p className={`text-[10px] mt-1 ${t.muted(dark)}`}>{relTime(n.ts)}</p>
                    </div>
                    <button
                      onClick={() => onClear(n.id)}
                      className={`flex-shrink-0 mt-0.5 ${t.muted(dark)} hover:text-red-400 transition-colors`}
                    >
                      <X size={12}/>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function useMilestoneCelebration(stats) {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!stats || !stats.totalWorkouts) return;
    if (typeof window === "undefined" || !window.storage) return;
    let cancelled = false;
    (async () => {
      try {
        const seenWRes = await window.storage.get("wt-ms-workouts", false).catch(() => null);
        const seenW = parseInt(seenWRes?.value || "0", 10);
        const curW  = Math.floor(stats.totalWorkouts/25)*25;
        if (curW > 0 && curW > seenW) {
          await window.storage.set("wt-ms-workouts", String(curW), false);
          if (!cancelled) setToast({ emoji:"🎉", title:`${curW} workouts logged!`, sub:"Milestone unlocked" });
          return;
        }
        const seenDRes = await window.storage.get("wt-ms-distance", false).catch(() => null);
        const seenD = parseInt(seenDRes?.value || "0", 10);
        const curD  = Math.floor(stats.totalDistance/100)*100;
        if (curD > 0 && curD > seenD) {
          await window.storage.set("wt-ms-distance", String(curD), false);
          if (!cancelled) setToast({ emoji:"🏆", title:`${curD} km lifetime!`, sub:"Milestone unlocked" });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [stats && stats.totalWorkouts, stats && stats.totalDistance]);
  return [toast, setToast];
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function WorkoutTracker() {
  const [workouts,setWorkouts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState("dashboard");
  const [storageError,setStorageError]=useState(false);
  const [opError,setOpError]=useState(null);
  const [modalState,setModalState]=useState({open:false,entry:null,isEdit:false});
  const [dark,setDark]=useState(false);
  const [theme,setTheme]=useState(DEFAULT_THEME_ID);

  // Persist theme preference (separate from dark mode — each theme keeps its own light/dark look)
  useEffect(()=>{
    if(typeof window==="undefined"||!window.storage)return;
    (async()=>{
      try{const r=await window.storage.get("wt-theme",false);if(r?.value)setTheme(r.value);}catch{}
    })();
  },[]);
  useEffect(()=>{
    if(typeof window==="undefined"||!window.storage)return;
    window.storage.set("wt-theme",theme,false).catch(()=>{});
  },[theme]);

  // Persist dark mode preference (via window.storage — localStorage doesn't work in artifacts)
  useEffect(()=>{
    if(typeof window==="undefined"||!window.storage)return;
    (async()=>{
      try{const r=await window.storage.get("wt-dark",false);if(r?.value!==undefined)setDark(r.value==="1");}catch{}
    })();
  },[]);
  useEffect(()=>{
    if(typeof window==="undefined"||!window.storage)return;
    window.storage.set("wt-dark",dark?"1":"0",false).catch(()=>{});
  },[dark]);

  // Load workouts
  useEffect(()=>{
    let mounted=true;
    async function load(){
      if(typeof window==="undefined"||!window.storage){if(mounted){setWorkouts(SEED_WORKOUTS);setLoading(false);}return;}
      try{
        const r=await window.storage.get("workouts",false);
        if(mounted){if(r?.value)setWorkouts(JSON.parse(r.value));else{setWorkouts(SEED_WORKOUTS);window.storage.set("workouts",JSON.stringify(SEED_WORKOUTS),false).catch(()=>{});}}
      }catch{if(mounted){setWorkouts(SEED_WORKOUTS);window.storage.set("workouts",JSON.stringify(SEED_WORKOUTS),false).catch(()=>{});}}
      finally{if(mounted)setLoading(false);}
    }
    load();return()=>{mounted=false;};
  },[]);

  async function persist(updated){
    if(typeof window==="undefined"||!window.storage)return;
    try{const r=await window.storage.set("workouts",JSON.stringify(updated),false);setStorageError(!r);}catch{setStorageError(true);}
  }

  const openAddModal=()=>setModalState({open:true,entry:null,isEdit:false});
  const openEditModal=w=>setModalState({open:true,entry:w,isEdit:true});
  const [copiedSrNo, setCopiedSrNo] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("");
  function handleNavigate(tab, filter="") {
    setHistoryFilter(filter);
    setActiveTab(tab);
  }
  function openCopyModal(w) {
    const text = [
      formatDateDisplay(w.date),
      w.workout,
      `${w.distanceKm.toFixed(2)} km`,
      w.time,
      `${w.pace}/km`,
      w.calories,
    ].join(", ");
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedSrNo(w.srNo);
      setTimeout(() => setCopiedSrNo(null), 2000);
    } catch(e) {
      navigator.clipboard && navigator.clipboard.writeText(text).then(() => {
        setCopiedSrNo(w.srNo);
        setTimeout(() => setCopiedSrNo(null), 2000);
      }).catch(() => {});
    }
  }
  const closeModal=()=>setModalState({open:false,entry:null,isEdit:false});

  async function handleSaveWorkout(entry,isEdit){try{setOpError(null);const u=isEdit?workouts.map(w=>w.srNo===entry.srNo?entry:w):[...workouts,entry];setWorkouts(u);await persist(u);}catch{setOpError("Could not save. Please try again.");}}
  async function handleBulkAdd(entries){try{setOpError(null);const u=[...workouts,...entries];setWorkouts(u);await persist(u);}catch{setOpError("Could not save. Please try again.");}}
  async function handleDeleteWorkout(srNo){try{setOpError(null);const u=workouts.filter(w=>w.srNo!==srNo);setWorkouts(u);await persist(u);}catch{setOpError("Could not delete. Please try again.");}}
  async function handleReset(){setWorkouts(SEED_WORKOUTS);await persist(SEED_WORKOUTS);}
  // ── Goals state (persisted via window.storage — localStorage doesn't work in artifacts) ──
  const [goals, setGoals] = useState({});
  useEffect(()=>{
    if(typeof window==="undefined"||!window.storage)return;
    (async()=>{
      try{const r=await window.storage.get("wt-goals",false);if(r?.value)setGoals(JSON.parse(r.value));}catch{}
    })();
  },[]);
  function handleSetGoal(keyOrBatch, value) {
    // Accept either a single (key, value) call or a batch { key: value, ... } object
    const patch = typeof keyOrBatch === "object" ? keyOrBatch : { [keyOrBatch]: value };
    const updated = { ...goals, ...patch };
    // Remove zero-value keys (used to delete goals)
    Object.keys(updated).forEach(k => { if (updated[k] === 0) delete updated[k]; });
    setGoals(updated);
    if(typeof window!=="undefined"&&window.storage){
      window.storage.set("wt-goals", JSON.stringify(updated), false).catch(()=>{});
    }
  }

  function handleExport(){
    const json = JSON.stringify({schema:["srNo","date","workout","distanceKm","time","pace","calories","pushups"],exportedAt:toLocalIso(new Date()),workouts},null,2);
    const uri = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement("a"); a.href=uri; a.download="workout_database.json"; a.click();
  }

  function handleExportXlsx(){
    const hdr = ["Sr.No","Date","Workout","Distance (km)","Time","Pace (min/km)","Calories","Push-ups"];
    const rows = [...workouts].sort((a,b)=>a.srNo-b.srNo).map(w=>[
      w.srNo, formatDateDisplay(w.date), w.workout,
      w.distanceKm.toFixed(2), w.time, w.pace, w.calories, w.pushups??""
    ]);
    // Build HTML table — Excel opens this natively with proper formatting
    const tableHtml = [
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">',
      '<head><meta charset="utf-8"/></head><body><table>',
      "<thead><tr>" + hdr.map(h=>`<th style="background:#1e3a5f;color:white;font-weight:bold;padding:6px">${h}</th>`).join("") + "</tr></thead>",
      "<tbody>",
      ...rows.map((r,i)=>"<tr>" + r.map(c=>`<td style="padding:4px;background:${i%2===0?"#f8fafc":"#ffffff"}">${c}</td>`).join("") + "</tr>"),
      "</tbody></table></body></html>"
    ].join("");
    const uri = "data:application/vnd.ms-excel;charset=utf-8," + encodeURIComponent(tableHtml);
    const a = document.createElement("a"); a.href=uri; a.download="workout_database.xls"; a.click();
  }

  const stats=useMemo(()=>computeStats(workouts),[workouts]);
  const streaks=useMemo(()=>computeStreaks(workouts),[workouts]);
  const pr=useMemo(()=>computePersonalRecords(workouts),[workouts]);
  const monthly=useMemo(()=>computeMonthlySummary(workouts),[workouts]);
  const [milestoneToast, setMilestoneToast] = useMilestoneCelebration(stats);
  const {
    notifs, unreadCount, markAllRead, clearNotif, clearAll, addNotif
  } = useNotifications(stats, pr, streaks, goals, workouts);

  const tabs=[{id:"dashboard",label:"Dashboard"},{id:"history",label:"Workout History"},{id:"analytics",label:"Analytics"},{id:"records",label:"Personal Records"},{id:"leaderboard",label:"Leaderboard"},{id:"settings",label:"Settings"}];

  if(loading) return(
    <div className={`min-h-screen flex items-center justify-center ${t.page(dark)}`} style={themeVars(theme, dark)}>
      <p className={t.muted(dark)}>Loading your workout data…</p>
    </div>
  );

  const activeTheme = THEMES.find(x=>x.id===theme) || THEMES[0];

  return(
    <DarkContext.Provider value={dark}>
    <ThemeContext.Provider value={theme}>
      <style>{`
        @keyframes wiggle {
          0%,100%{ transform:rotate(0deg); }
          15%{ transform:rotate(-18deg); }
          30%{ transform:rotate(18deg); }
          45%{ transform:rotate(-12deg); }
          60%{ transform:rotate(12deg); }
          75%{ transform:rotate(-6deg); }
          90%{ transform:rotate(6deg); }
        }
        @keyframes glassIn {
          from { opacity:0; transform:scale(0.95); filter:blur(6px); }
          to   { opacity:1; transform:scale(1);    filter:blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *{ animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important; }
        }
        @media (prefers-reduced-transparency: reduce) {
          .glass-surface{ backdrop-filter:none !important; }
        }
        .bg-theme-page{ background-color: var(--page-bg); transition: background-color 300ms ease-out; }
        .bg-accent{ background-color: var(--accent); }
        .bg-accent-hover:hover{ background-color: var(--accent-hover); }
        .text-accent{ color: var(--accent); }
        .text-accent-hover:hover{ color: var(--accent-hover); }
        .border-accent{ border-color: var(--accent); }
        .border-accent-hover:hover{ border-color: var(--accent); }
        .ring-accent:focus{ box-shadow: 0 0 0 2px var(--accent-ring); outline: none; }
        .ring-accent-hover:hover{ box-shadow: 0 0 0 2px var(--accent-ring); }
        .shadow-accent-hover:hover{ box-shadow: 0 4px 14px 0 var(--accent-ring); }
      `}</style>
      <div className={`min-h-screen font-sans transition-colors duration-200 relative ${t.page(dark)}`} style={themeVars(theme, dark)}>

        {/* Ambient glow layer — tinted from the active theme's own palette so the glass surfaces refract that theme, not a fixed color */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full blur-[110px] transition-colors duration-500" style={{background: `radial-gradient(circle, ${activeTheme.swatch[0]}${dark?"29":"33"}, transparent 70%)`}}/>
          <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full blur-[110px] transition-colors duration-500" style={{background: `radial-gradient(circle, ${activeTheme.swatch[3]}${dark?"24":"29"}, transparent 70%)`}}/>
          <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] rounded-full blur-[110px] transition-colors duration-500" style={{background: `radial-gradient(circle, ${activeTheme.swatch[2]}${dark?"1c":"24"}, transparent 70%)`}}/>
        </div>

        <MilestoneToast toast={milestoneToast} onClose={()=>setMilestoneToast(null)}/>

        {/* ── Floating header + nav ───────────────────────────────────────────── */}
        <div className={`glass-surface fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-xl ${t.header(dark)}`}>
          <div className="max-w-6xl mx-auto px-4">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-2">
              <div>
                <h1 className={`text-base font-bold tracking-tight leading-tight ${t.value(dark)}`}>Workout Progress Tracker</h1>
                <p className={`text-xs mt-0.5 ${t.muted(dark)}`}>{stats.totalWorkouts} workouts · {stats.totalDistance.toFixed(2)} km · {stats.totalCalories.toLocaleString()} kcal</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>setDark(d=>!d)} className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${dark?"border-gray-700 text-yellow-400 hover:bg-gray-800":"border-slate-200 text-slate-500 hover:bg-slate-100"}`} title="Toggle dark mode">
                  {dark?<Sun size={15}/>:<Moon size={15}/>}
                </button>
                <NotificationCenter
                  notifs={notifs}
                  unreadCount={unreadCount}
                  onMarkAllRead={markAllRead}
                  onClear={clearNotif}
                  onClearAll={clearAll}
                />
                <button onClick={openAddModal} className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-lg bg-accent text-white bg-accent-hover focus:outline-none ring-accent">
                  <Plus size={15}/> Add Workout
                </button>
              </div>
            </div>
            {/* Nav tabs */}
            <nav className={`flex gap-1 overflow-x-auto`}>
              {tabs.map(tab=>(
                <button key={tab.id} onClick={()=>{setHistoryFilter(""); setActiveTab(tab.id);}} className={`px-3.5 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus:outline-none ${activeTab===tab.id?t.navActive(dark):t.navInactive(dark)}`}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ── Page content — padded to clear the floating header ─────────────── */}
        <div className="max-w-6xl mx-auto px-4 pt-28 pb-8">
          {storageError&&<div className={`mb-4 border text-sm px-4 py-2.5 rounded-lg ${t.warnBox(dark)}`}>Last change couldn't be saved — use Export JSON as a backup.</div>}
          {opError&&<div className={`mb-4 border text-sm px-4 py-2.5 rounded-lg ${t.errBox(dark)}`}>{opError}</div>}

          {activeTab==="dashboard"&&<DashboardPage workouts={workouts} stats={stats} streaks={streaks} goals={goals} onSetGoal={handleSetGoal} onNavigate={handleNavigate} pr={pr} onAddWorkout={openAddModal}/>}
          {activeTab==="history"&&<HistoryPage workouts={workouts} onEdit={openEditModal} onCopy={openCopyModal} onDelete={handleDeleteWorkout} copiedSrNo={copiedSrNo} initialTypeFilter={historyFilter}/>}
          {activeTab==="analytics"&&<AnalyticsPage workouts={workouts}/>}
          {activeTab==="records"&&<RecordsPage workouts={workouts} pr={pr} streaks={streaks}/>}
          {activeTab==="leaderboard"&&<LeaderboardPage stats={stats} streaks={streaks}/>}
          {activeTab==="settings"&&<SettingsPage workouts={workouts} onExport={handleExport} onExportXlsx={handleExportXlsx} onReset={handleReset} dark={dark} setDark={setDark} theme={theme} setTheme={setTheme}/>}
        </div>

        <AddWorkoutModal open={modalState.open} onClose={closeModal} workouts={workouts} entry={modalState.entry} isEdit={modalState.isEdit} onSave={handleSaveWorkout} onBulkAdd={handleBulkAdd}/>
      </div>
    </ThemeContext.Provider>
    </DarkContext.Provider>
  );
}
