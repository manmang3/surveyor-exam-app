import React, { memo } from 'react';
import { Wall } from '@/types/game';

interface GameWallProps {
  wall: Wall;
  showDebug?: boolean;
}

// 壁コンポーネントのメモ化
const GameWall = memo<GameWallProps>(({ wall, showDebug = false }) => {
  return (
    <div
      key={wall.id}
      id={`wall-${wall.id}`}
      className="absolute w-full flex"
      style={{
        transform: `translate3d(0, ${wall.zPosition}px, 0)`, // GPU加速
        willChange: 'transform',
        zIndex: 10
      }}
    >
      {/* デバッグ: 壁の当たり判定枠 */}
      {showDebug && (
        <>
          {/* 壁全体の当たり判定枠 */}
          <div
            className="absolute inset-0 border-2 border-purple-500 opacity-70 pointer-events-none"
            style={{
              height: '80px', // 壁の高さ
              zIndex: 25
            }}
          />
          
          {/* 壁のIDとzPosition表示 */}
          <div
            className="absolute top-0 left-2 text-purple-300 text-xs pixel-font bg-black bg-opacity-75 px-1 pointer-events-none"
            style={{ zIndex: 26 }}
          >
            {wall.id}: {wall.zPosition.toFixed(1)}px
          </div>
          
          {/* 正解側の強調表示 */}
          <div
            className={`absolute top-0 ${wall.correctSide === 'left' ? 'left-20' : 'right-20'} border-4 border-yellow-300 opacity-60 pointer-events-none`}
            style={{
              width: 'calc(50% - 90px)', // mx-20とmr-2/ml-2を考慮
              height: '80px',
              zIndex: 24
            }}
          />
        </>
      )}

      {/* 左側の選択肢 */}
      <div 
        className={`flex-1 mx-20 mr-2 h-20 border-4 border-gray-800 flex items-center justify-center pixel-font font-bold text-white text-lg ${
          wall.correctSide === 'left' ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-red-400 to-red-600'
        }`}
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          // 正解時の即座非表示
          opacity: wall.passed ? 0 : 1,
          transition: 'opacity 0.1s ease-out'
        }}
      >
        {wall.leftChoice}
      </div>

      {/* 右側の選択肢 */}
      <div 
        className={`flex-1 mx-20 ml-2 h-20 border-4 border-gray-800 flex items-center justify-center pixel-font font-bold text-white text-lg ${
          wall.correctSide === 'right' ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-red-400 to-red-600'
        }`}
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          // 正解時の即座非表示
          opacity: wall.passed ? 0 : 1,
          transition: 'opacity 0.1s ease-out'
        }}
      >
        {wall.rightChoice}
      </div>
    </div>
  );
});

GameWall.displayName = 'GameWall';

export default GameWall;