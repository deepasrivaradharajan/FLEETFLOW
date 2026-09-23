import React, { useState } from 'react';

// ----------------------------------------------------
// FUEL CONSUMPTION TREND LINE CHART
// ----------------------------------------------------
interface FuelTrendPoint {
  date: string;
  level: number; // 0-100%
  consumptionLiters?: number;
  costUSD?: number;
}

interface FuelLineChartProps {
  data: FuelTrendPoint[];
  height?: number;
  title?: string;
  unit?: string;
  valueKey?: 'level' | 'consumptionLiters' | 'costUSD';
  color?: string;
}

export const FuelLineChart: React.FC<FuelLineChartProps> = ({
  data,
  height = 200,
  unit = '%',
  valueKey = 'level',
  color = '#2563EB'
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<FuelTrendPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-xs text-slate-400">
        No fuel log telemetry data available
      </div>
    );
  }

  const padding = { top: 20, right: 25, bottom: 30, left: 35 };
  const width = 500; // coordinate space
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => (d[valueKey] !== undefined ? d[valueKey]! : 0));
  const minVal = Math.max(0, Math.min(...values) - 5);
  const maxVal = Math.max(...values, 100);
  const valRange = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const val = d[valueKey] !== undefined ? d[valueKey]! : 0;
    const x = padding.left + (i / Math.max(1, data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((val - minVal) / valRange) * chartHeight;
    return { x, y, data: d, val };
  });

  const pathD = points.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const valLabel = Math.round(minVal + ratio * valRange);
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {valLabel}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />

        {/* Solid Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels & interactive points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill={color}
              className="stroke-white dark:stroke-slate-900 stroke-2 hover:r-6 transition-all cursor-pointer"
              onMouseEnter={() => {
                setHoveredPoint(p.data);
                setHoverPos({ x: p.x, y: p.y });
              }}
              onMouseLeave={() => {
                setHoveredPoint(null);
                setHoverPos(null);
              }}
            />
            {/* Show every other label on small screens */}
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="text-[10px] fill-slate-500 font-medium"
            >
              {p.data.date.split('-').slice(1).join('/')}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && hoverPos && (
        <div
          className="absolute pointer-events-none z-20 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-700 font-mono -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: `${(hoverPos.x / width) * 100}%`, top: `${(hoverPos.y / height) * 100}%` }}
        >
          <div className="font-semibold text-slate-200">{hoveredPoint.date}</div>
          <div className="text-blue-400 font-bold">
            {hoveredPoint[valueKey]} {unit}
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// BAR CHART (FLEET UTILIZATION / HUB THROUGHPUT / COSTS)
// ----------------------------------------------------
interface BarChartData {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  unit?: string;
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  unit = '',
  barColor = '#1E3A8A'
}) => {
  const [hovered, setHovered] = useState<BarChartData | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const width = 500;
  const padding = { top: 20, right: 15, bottom: 35, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = Math.min(36, (chartWidth / data.length) * 0.55);
  const step = chartWidth / data.length;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + chartHeight * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 6}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {Math.round(ratio * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * chartHeight;
          const x = padding.left + i * step + (step - barWidth) / 2;
          const y = padding.top + chartHeight - barH;
          const currentBarColor = d.color || barColor;

          return (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="4"
                fill={currentBarColor}
                className="transition-all duration-200 hover:opacity-85"
              />
              <text
                x={x + barWidth / 2}
                y={height - 12}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-medium truncate"
              >
                {d.label.length > 10 ? d.label.substring(0, 9) + '…' : d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div className="absolute top-2 right-4 bg-slate-900 text-white text-xs px-3 py-1 rounded-lg border border-slate-700 shadow-md">
          <span className="text-slate-300 font-medium">{hovered.label}: </span>
          <span className="font-bold text-amber-400">
            {hovered.value.toLocaleString()} {unit}
          </span>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// DONUT CHART (FLEET STATUS BREAKDOWN)
// ----------------------------------------------------
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 160,
  centerLabel = 'Total',
  centerValue
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const percent = seg.value / total;
          const strokeDashoffset = circumference - percent * circumference;
          const rotation = cumulativePercent * 360;
          cumulativePercent += percent;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transformOrigin: '50% 50%',
                transform: `rotate(${rotation}deg)`
              }}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-xl font-black text-slate-800 dark:text-white leading-tight">
          {centerValue !== undefined ? centerValue : total}
        </span>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {centerLabel}
        </span>
      </div>
    </div>
  );
};
