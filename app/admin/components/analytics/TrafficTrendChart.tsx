'use client';

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Sparkles, 
  ShoppingBag, 
  BarChart2, 
  Activity,
  Layers
} from 'lucide-react';
import { TimeSeriesPoint } from '@/types/analytics';

interface TrafficTrendChartProps {
  points: TimeSeriesPoint[];
  interval?: 'hour' | 'day';
  rangeLabel?: string;
  isLoading?: boolean;
}

type MetricKey = 'page_views' | 'unique_visitors' | 'product_views' | 'orders';

export default function TrafficTrendChart({
  points = [],
  interval = 'day',
  rangeLabel = 'Andamento Temporale',
  isLoading = false,
}: TrafficTrendChartProps) {
  const [metric, setMetric] = useState<MetricKey>('page_views');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute metric values array
  const dataValues = useMemo(() => {
    return points.map((p) => {
      if (metric === 'page_views') return p.page_views || 0;
      if (metric === 'unique_visitors') return p.unique_visitors || 0;
      if (metric === 'product_views') return p.product_views || 0;
      if (metric === 'orders') return p.orders || 0;
      return 0;
    });
  }, [points, metric]);

  const maxVal = useMemo(() => {
    const m = Math.max(...dataValues, 10);
    // Round up to nice number for scale
    return Math.ceil(m * 1.15);
  }, [dataValues]);

  const totalForCurrentMetric = useMemo(() => {
    return dataValues.reduce((a, b) => a + b, 0);
  }, [dataValues]);

  // Color config based on metric
  const colorTheme = useMemo(() => {
    switch (metric) {
      case 'page_views':
        return {
          primary: '#C0A09A',
          gradientStart: 'rgba(192, 160, 154, 0.45)',
          gradientEnd: 'rgba(192, 160, 154, 0.01)',
          label: 'Visualizzazioni Totali',
          unit: 'visite',
          bgActive: 'bg-[#C0A09A] text-white',
        };
      case 'unique_visitors':
        return {
          primary: '#2563EB',
          gradientStart: 'rgba(37, 99, 235, 0.35)',
          gradientEnd: 'rgba(37, 99, 235, 0.01)',
          label: 'Visitatori Unici',
          unit: 'utenti',
          bgActive: 'bg-blue-600 text-white',
        };
      case 'product_views':
        return {
          primary: '#059669',
          gradientStart: 'rgba(5, 150, 105, 0.35)',
          gradientEnd: 'rgba(5, 150, 105, 0.01)',
          label: 'Views Schede Gioiello',
          unit: 'schede viste',
          bgActive: 'bg-emerald-600 text-white',
        };
      case 'orders':
        return {
          primary: '#D97706',
          gradientStart: 'rgba(217, 119, 6, 0.35)',
          gradientEnd: 'rgba(217, 119, 6, 0.01)',
          label: 'Ordini Conclusi',
          unit: 'ordini',
          bgActive: 'bg-amber-600 text-white',
        };
    }
  }, [metric]);

  // SVG Coordinates calculation
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 35;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  const pointsCoordinates = useMemo(() => {
    if (points.length === 0) return [];
    if (points.length === 1) {
      const y = paddingTop + graphHeight - (dataValues[0] / maxVal) * graphHeight;
      return [{ x: paddingX + graphWidth / 2, y, val: dataValues[0], point: points[0], index: 0 }];
    }

    const step = graphWidth / (points.length - 1);
    return points.map((p, idx) => {
      const val = dataValues[idx];
      const x = paddingX + idx * step;
      const y = paddingTop + graphHeight - (val / maxVal) * graphHeight;
      return { x, y, val, point: p, index: idx };
    });
  }, [points, dataValues, maxVal, graphWidth, graphHeight, paddingX, paddingTop]);

  // Generate smooth cubic Bézier SVG path
  const svgPathData = useMemo(() => {
    if (pointsCoordinates.length <= 1) {
      if (pointsCoordinates.length === 1) {
        const pt = pointsCoordinates[0];
        return {
          linePath: `M ${pt.x - 20} ${pt.y} L ${pt.x + 20} ${pt.y}`,
          areaPath: `M ${pt.x - 20} ${pt.y} L ${pt.x + 20} ${pt.y} L ${pt.x + 20} ${paddingTop + graphHeight} L ${pt.x - 20} ${paddingTop + graphHeight} Z`,
        };
      }
      return { linePath: '', areaPath: '' };
    }

    // Bézier control points
    let d = `M ${pointsCoordinates[0].x} ${pointsCoordinates[0].y}`;
    for (let i = 0; i < pointsCoordinates.length - 1; i++) {
      const p0 = pointsCoordinates[Math.max(i - 1, 0)];
      const p1 = pointsCoordinates[i];
      const p2 = pointsCoordinates[i + 1];
      const p3 = pointsCoordinates[Math.min(i + 2, pointsCoordinates.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const first = pointsCoordinates[0];
    const last = pointsCoordinates[pointsCoordinates.length - 1];
    const bottomY = paddingTop + graphHeight;
    const area = `${d} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;

    return { linePath: d, areaPath: area };
  }, [pointsCoordinates, paddingTop, graphHeight]);

  // Selected or hovered point
  const activePoint = hoveredIndex !== null && pointsCoordinates[hoveredIndex] ? pointsCoordinates[hoveredIndex] : null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#C0A09A]" />
            <h3 className="font-serif text-xl text-gray-900 tracking-wide">
              {rangeLabel}
            </h3>
            <span className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {interval === 'hour' ? 'Distribuzione 24h' : `${points.length} Giorni`}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-light mt-0.5">
            Totale periodo: <span className="font-mono font-semibold text-gray-800">{totalForCurrentMetric.toLocaleString('it-IT')}</span> {colorTheme.unit}
          </p>
        </div>

        {/* Metric Selector Tabs & Chart Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setMetric('page_views')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                metric === 'page_views' ? colorTheme.bgActive : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={13} />
              <span>Visite</span>
            </button>
            <button
              type="button"
              onClick={() => setMetric('unique_visitors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                metric === 'unique_visitors' ? colorTheme.bgActive : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={13} />
              <span>Utenti</span>
            </button>
            <button
              type="button"
              onClick={() => setMetric('product_views')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                metric === 'product_views' ? colorTheme.bgActive : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles size={13} />
              <span>Gioielli</span>
            </button>
            <button
              type="button"
              onClick={() => setMetric('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                metric === 'orders' ? colorTheme.bgActive : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag size={13} />
              <span>Ordini</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                chartType === 'area' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grafico ad Area (Curva Continua)"
            >
              <Activity size={14} />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                chartType === 'bar' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grafico a Barre"
            >
              <BarChart2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs flex items-center justify-center z-20">
            <div className="text-xs font-serif text-[#8C6558] animate-pulse">Caricamento andamento...</div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorTheme.primary} stopOpacity="0.4" />
              <stop offset="70%" stopColor={colorTheme.primary} stopOpacity="0.08" />
              <stop offset="100%" stopColor={colorTheme.primary} stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={colorTheme.primary} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Horizontal Grid lines & scale labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + graphHeight - ratio * graphHeight;
            const valLabel = Math.round(ratio * maxVal);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9CA3AF"
                  fontFamily="monospace"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* AREA CHART MODE */}
          {chartType === 'area' && svgPathData.areaPath && (
            <>
              {/* Gradient Filled Area */}
              <path
                d={svgPathData.areaPath}
                fill={`url(#gradient-${metric})`}
                className="transition-all duration-500 ease-out"
              />

              {/* Stroke Curve Line */}
              <path
                d={svgPathData.linePath}
                fill="none"
                stroke={colorTheme.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-out"
              />

              {/* Points circles */}
              {pointsCoordinates.map((pt) => (
                <circle
                  key={pt.index}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === pt.index ? '5' : '3'}
                  fill="#FFFFFF"
                  stroke={colorTheme.primary}
                  strokeWidth="2"
                  className="transition-all duration-150 cursor-pointer"
                  filter={hoveredIndex === pt.index ? 'url(#glow)' : 'none'}
                />
              ))}
            </>
          )}

          {/* BAR CHART MODE */}
          {chartType === 'bar' &&
            pointsCoordinates.map((pt) => {
              const barWidth = Math.max(4, Math.min(24, (graphWidth / points.length) * 0.6));
              const barHeight = Math.max(2, (pt.val / maxVal) * graphHeight);
              const barY = paddingTop + graphHeight - barHeight;

              return (
                <g key={pt.index}>
                  <rect
                    x={pt.x - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill={hoveredIndex === pt.index ? colorTheme.primary : `${colorTheme.primary}CC`}
                    className="transition-all duration-200 cursor-pointer hover:opacity-100"
                  />
                </g>
              );
            })}

          {/* Interactive Hover Guides & Crosshairs */}
          {activePoint && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + graphHeight}
                stroke={colorTheme.primary}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.7"
              />

              {/* Highlight active point circle */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill={colorTheme.primary}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
            </g>
          )}

          {/* X Axis Time Labels */}
          {pointsCoordinates.map((pt, idx) => {
            // Show label based on intervals to avoid overlap
            const total = pointsCoordinates.length;
            const shouldShow =
              total <= 12 ||
              idx === 0 ||
              idx === total - 1 ||
              (total <= 24 && idx % 3 === 0) ||
              (total > 24 && idx % Math.ceil(total / 8) === 0);

            if (!shouldShow) return null;

            return (
              <text
                key={idx}
                x={pt.x}
                y={svgHeight - 10}
                textAnchor="middle"
                fontSize="9"
                fill={hoveredIndex === idx ? '#111827' : '#9CA3AF'}
                fontWeight={hoveredIndex === idx ? '600' : '400'}
                fontFamily="monospace"
              >
                {pt.point.date_label}
              </text>
            );
          })}

          {/* Invisible interactive overlay rectangles for smooth hover detection */}
          {pointsCoordinates.map((pt) => {
            const step = points.length > 1 ? graphWidth / (points.length - 1) : graphWidth;
            return (
              <rect
                key={pt.index}
                x={pt.x - step / 2}
                y={paddingTop}
                width={step}
                height={graphHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(pt.index)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {activePoint && (
          <div
            className="absolute top-2 z-30 bg-[#1A1A1A] text-white p-3 rounded-xl shadow-xl text-xs pointer-events-none transition-all duration-75 font-sans border border-gray-700"
            style={{
              left: `${Math.min(
                Math.max(activePoint.x - 70, 10),
                svgWidth - 170
              )}px`,
            }}
          >
            <div className="text-[10px] text-gray-400 font-mono mb-1 border-b border-gray-800 pb-1">
              📅 {activePoint.point.date_label} ({activePoint.point.timestamp})
            </div>
            <div className="flex items-center justify-between gap-3 my-0.5">
              <span className="text-gray-300">{colorTheme.label}:</span>
              <span className="font-mono font-bold text-white text-sm">
                {activePoint.val.toLocaleString('it-IT')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[10px] text-gray-400 mt-1">
              <span>Sessioni: {activePoint.point.sessions || 0}</span>
              <span>Utenti: {activePoint.point.unique_visitors || 0}</span>
            </div>
            {activePoint.point.revenue > 0 && (
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                Fatturato: €{activePoint.point.revenue.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
