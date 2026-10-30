import React, { useState } from 'react';
import { formatCurrency } from '../../engine/calculations';

interface DonutSlice {
  label: string;
  value: number;
  sharePercent: number;
  color: string;
}

interface DonutChartProps {
  data: { label: string; value: number; sharePercent: number }[];
  currency?: string;
  lang?: 'ar' | 'en';
  size?: number;
}

const PALETTE = [
  '#0f766e', // teal-700
  '#0284c7', // sky-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#e11d48', // rose-600
  '#059669', // emerald-600
  '#64748b', // slate-500
];

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  currency = 'EGP',
  lang = 'ar',
  size = 200,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total <= 0 || data.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        {lang === 'ar' ? 'لا توجد بيانات كافية للرسم البياني' : 'No chart data available'}
      </div>
    );
  }

  const slices: DonutSlice[] = data.map((d, i) => ({
    ...d,
    color: PALETTE[i % PALETTE.length],
  }));

  const center = size / 2;
  const radius = size * 0.38;
  const strokeWidth = size * 0.16;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* SVG Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
          {slices.map((slice, i) => {
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(slice.sharePercent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += slice.sharePercent;

            const isHovered = hoveredIdx === i;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {hoveredIdx !== null && slices[hoveredIdx] ? (
            <>
              <span className="text-[11px] font-semibold text-slate-500 max-w-[90px] truncate">
                {slices[hoveredIdx].label}
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {slices[hoveredIdx].sharePercent}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-slate-400">
                {lang === 'ar' ? 'الإجمالي' : 'Total'}
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
                  notation: 'compact',
                }).format(total)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-[160px] text-xs">
        {slices.map((slice, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
              hoveredIdx === i ? 'bg-slate-100' : ''
            }`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="font-semibold text-slate-700 truncate max-w-[110px]" title={slice.label}>
                {slice.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span>{slice.sharePercent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
