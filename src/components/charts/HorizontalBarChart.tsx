import React from 'react';
import { formatCurrency } from '../../engine/calculations';

interface BarItem {
  id: string;
  label: string;
  subLabel?: string;
  value: number;
  percentage?: number;
}

interface HorizontalBarChartProps {
  items: BarItem[];
  currency?: string;
  lang?: 'ar' | 'en';
  maxItems?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  currency = 'EGP',
  lang = 'ar',
  maxItems = 6,
}) => {
  const displayItems = items.slice(0, maxItems);
  const maxValue = Math.max(...displayItems.map((i) => i.value), 1);

  if (displayItems.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        {lang === 'ar' ? 'لا توجد بيانات للعرض' : 'No ranking data'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {displayItems.map((item, index) => {
        const barWidth = Math.max(4, Math.round((item.value / maxValue) * 100));
        return (
          <div key={item.id || index} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-600 font-bold text-[11px] flex-shrink-0">
                  {index + 1}
                </span>
                <span
                  className="font-bold text-slate-800 truncate"
                  title={item.label}
                >
                  {item.label}
                </span>
                {item.subLabel && (
                  <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                    ({item.subLabel})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(item.value, currency, lang)}
                </span>
                {item.percentage !== undefined && (
                  <span className="text-slate-400 text-[11px] font-semibold w-10 text-end">
                    {item.percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-700 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
