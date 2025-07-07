'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface LearningChartProps {
  data: DataPoint[];
  title: string;
  type: 'line' | 'bar';
  color?: string;
  yAxisLabel?: string;
  height?: number;
}

export default function LearningChart({
  data,
  title,
  type,
  color = '#3B82F6',
  yAxisLabel,
  height = 300
}: LearningChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas サイズ設定
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 描画エリアの設定
    const padding = 60;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = height - padding * 2;

    // クリア
    ctx.clearRect(0, 0, rect.width, height);

    // データの準備
    const maxValue = Math.max(...data.map(d => d.value), 100); // 最低でも100まで表示
    const minValue = Math.min(...data.map(d => d.value), 0);
    const valueRange = maxValue - minValue;

    // 軸を描画
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;

    // Y軸
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // X軸
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(rect.width - padding, height - padding);
    ctx.stroke();

    // Y軸のラベル
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const value = minValue + (valueRange * i / ySteps);
      const y = height - padding - (chartHeight * i / ySteps);
      
      // グリッドライン
      if (i > 0) {
        ctx.strokeStyle = '#F3F4F6';
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(rect.width - padding, y);
        ctx.stroke();
      }

      // ラベル
      ctx.fillText(Math.round(value).toString(), padding - 10, y);
    }

    // X軸のラベル
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    if (data.length > 0) {
      const stepSize = Math.max(1, Math.floor(data.length / 7)); // 最大7つのラベル
      for (let i = 0; i < data.length; i += stepSize) {
        const x = padding + (chartWidth * i / (data.length - 1));
        const date = new Date(data[i].date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, height - padding + 10);
      }
    }

    // データを描画
    if (type === 'line') {
      // 線グラフ
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + (chartWidth * index / (data.length - 1));
        const y = height - padding - ((point.value - minValue) / valueRange * chartHeight);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // ポイント
      ctx.fillStyle = color;
      data.forEach((point, index) => {
        const x = padding + (chartWidth * index / (data.length - 1));
        const y = height - padding - ((point.value - minValue) / valueRange * chartHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

    } else {
      // 棒グラフ
      ctx.fillStyle = color;
      const barWidth = chartWidth / data.length * 0.8;
      
      data.forEach((point, index) => {
        const x = padding + (chartWidth * index / data.length) + (chartWidth / data.length - barWidth) / 2;
        const barHeight = ((point.value - minValue) / valueRange) * chartHeight;
        const y = height - padding - barHeight;
        
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    }

    // Y軸ラベル
    if (yAxisLabel) {
      ctx.save();
      ctx.translate(20, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#374151';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
    }

  }, [data, type, color, height, yAxisLabel]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">データがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height }}
        />
      </div>
    </div>
  );
}