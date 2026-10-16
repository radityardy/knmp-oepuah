'use client';

import React from 'react';

// Helper generator titik angka grafik tren secara 100% otomatis dari Nilai Utama
export function getAutoChartPoints(
  valueStr: string,
  pattern: 'up' | 'stable' | 'wave' = 'up',
  manualPoints?: number[]
): number[] {
  if (manualPoints && manualPoints.length >= 2) return manualPoints;
  const cleanStr = (valueStr || '').replace(',', '.');
  const match = cleanStr.match(/-?\d+(\.\d+)?/);
  const baseNum = match ? parseFloat(match[0]) : 100;
  const absNum = Math.abs(baseNum) || 100;
  const isNegative = baseNum < 0;

  if (pattern === 'stable') {
    const factors = [0.98, 1.01, 0.99, 1.02, 0.99, 1.01, 1.0];
    return factors.map((f) => (isNegative ? -Math.abs(absNum * f) : Number((absNum * f).toFixed(1))));
  }
  if (pattern === 'wave') {
    const factors = [0.78, 1.12, 0.85, 1.18, 0.92, 1.08, 1.0];
    return factors.map((f) => (isNegative ? -Math.abs(absNum * f) : Number((absNum * f).toFixed(1))));
  }
  // 'up'
  const factors = [0.68, 0.75, 0.82, 0.88, 0.91, 0.96, 1.0];
  return factors.map((f) => (isNegative ? -Math.abs(absNum * f) : Number((absNum * f).toFixed(1))));
}

// Helper component untuk merender Sparkline SVG dinamis otomatis
export function MetricSparkline({
  value,
  pattern = 'up',
  points,
  color = '#0071E3',
  id,
}: {
  value: string;
  pattern?: 'up' | 'stable' | 'wave';
  points?: number[];
  color?: string;
  id: string;
}) {
  const data = getAutoChartPoints(value, pattern, points);
  const width = 160;
  const height = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const coords = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${coords.join(' L ')}`;
  const gradId = `sparkGrad-${id}`;

  return (
    <div className="w-full h-10 mt-3 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={`M ${coords.join(' L ')} L ${width},${height} L 0,${height} Z`} fill={`url(#${gradId})`} />
        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dot on the latest point */}
        {coords.length > 0 && (
          <circle
            cx={coords[coords.length - 1].split(',')[0]}
            cy={coords[coords.length - 1].split(',')[1]}
            r="3"
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}

