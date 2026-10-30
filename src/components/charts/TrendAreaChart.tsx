import React, { useState } from 'react';
import { TimeSeriesPoint } from '../../types/data';
import { formatCurrency } from '../../engine/calculations';

interface TrendAreaChartProps {
  data: TimeSeriesPoint[];
  currency?: string;
  lang?: 'ar' | 'en';
  height?: number;
}

export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({
  data,
  currency = 'EGP',
  lang = 'ar',
  height = 280,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm"
        style={{ height }}
      >
        {lang === 'ar' ? 'لا توجد بيانات زمنية كافية للعرض' : 'No time-series data available'}
      </div>
    );
  }

  const width = 800;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.netRevenue || d.revenue || 0), 1000) * 1.15;
  const minVal = 0;

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // Build SVG Path points
  const points = data.map((d, i) => `${getX(i)},${getY(d.netRevenue)}`).join(' ');
  const areaPath = `${points} L ${getX(data.length - 1)},${padding.top + chartHeight} L ${getX(
    0
  )},${padding.top + chartHeight} Z`;

  // Y-axis ticks (4 ticks)
  const ticks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {ticks.map((tickVal, i) => {
          const y = getY(tickVal);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={lang === 'ar' ? width - 5 : padding.left - 10}
                y={y + 4}
                textAnchor={lang === 'ar' ? 'start' : 'end'}
                fill="#94a3b8"
                fontSize="11"
                fontWeight="500"
              >
                {new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(Math.round(tickVal))}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon points={areaPath} fill="url(#areaGradient)" />

        {/* Trend Line */}
        <polyline
          fill="none"
          stroke="#0f766e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data points & interaction hit areas */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.netRevenue);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i} className="cursor-pointer">
              {/* Vertical guideline on hover */}
              {isHovered && (
                <line
                  x1={cx}
                  y1={padding.top}
                  x2={cx}
                  y2={padding.top + chartHeight}
                  stroke="#0f766e"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Point circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke="#0f766e"
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150"
              />

              {/* Invisible larger hover area */}
              <rect
                x={cx - 15}
                y={padding.top}
                width={30}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* X-axis label (show selected dates to prevent overcrowding) */}
              {(i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) && (
                <text
                  x={cx}
                  y={height - 12}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="11"
                  fontWeight="600"
                >
                  {d.date.length > 5 ? d.date.slice(5) : d.date}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-lg transform -translate-x-1/2 -translate-y-full border border-slate-700"
          style={{
            left: `${(getX(hoveredIndex) / width) * 100}%`,
            top: `${(getY(data[hoveredIndex].netRevenue) / height) * 100 - 4}%`,
          }}
        >
          <div className="font-bold text-slate-300 mb-1">{data[hoveredIndex].date}</div>
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
            <span>{formatCurrency(data[hoveredIndex].netRevenue, currency, lang)}</span>
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">
            {lang === 'ar' ? 'الطلبات:' : 'Orders:'} {data[hoveredIndex].orderCount}
          </div>
        </div>
      )}
    </div>
  );
};
