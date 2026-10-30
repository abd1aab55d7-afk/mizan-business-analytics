import React, { useState } from 'react';
import { MetricCardValue } from '../../types/data';
import { TrendingUp, TrendingDown, Minus, HelpCircle, AlertCircle } from 'lucide-react';

interface KpiCardProps {
  metric: MetricCardValue;
  icon?: React.ReactNode;
  lang?: 'ar' | 'en';
}

export const KpiCard: React.FC<KpiCardProps> = ({ metric, icon, lang = 'ar' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isPositive = (metric.changePercent || 0) > 0;
  const isNegative = (metric.changePercent || 0) < 0;

  return (
    <div className="kpi-card relative">
      <div className="kpi-header">
        <div className="flex items-center gap-1.5">
          <span className="kpi-title">{metric.title}</span>
          <div className="relative inline-block">
            <button
              type="button"
              className="tooltip-trigger"
              aria-label={metric.title}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <HelpCircle size={15} />
            </button>
            {showTooltip && (
              <div
                className="absolute z-30 w-56 p-2 text-xs text-white bg-slate-900 rounded-lg shadow-xl -top-2 transform -translate-y-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 border border-slate-700 pointer-events-none"
              >
                {metric.tooltip}
              </div>
            )}
          </div>
        </div>
        {icon && <div className="kpi-icon-wrapper">{icon}</div>}
      </div>

      <div className="kpi-body">
        {metric.isSufficientData ? (
          <div className="kpi-value">{metric.formattedValue}</div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-200">
            <AlertCircle size={16} />
            <span>{metric.formattedValue}</span>
          </div>
        )}
        {metric.statusText && (
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{metric.statusText}</p>
        )}
      </div>

      <div className="kpi-footer">
        {metric.changePercent !== null && metric.changePercent !== undefined ? (
          <div
            className={`delta-badge ${
              isPositive
                ? metric.isPositiveChangeGood !== false
                  ? 'positive'
                  : 'negative'
                : isNegative
                ? metric.isPositiveChangeGood !== false
                  ? 'negative'
                  : 'positive'
                : 'neutral'
            }`}
          >
            {isPositive ? (
              <TrendingUp size={13} />
            ) : isNegative ? (
              <TrendingDown size={13} />
            ) : (
              <Minus size={13} />
            )}
            <span>{Math.abs(metric.changePercent)}%</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            {lang === 'ar' ? 'لا توجد فترة سابقة' : 'No prior comparison'}
          </span>
        )}

        <span className="delta-label">
          {lang === 'ar' ? 'مقارنة بالفترة السابقة' : 'vs prior period'}
        </span>
      </div>
    </div>
  );
};
