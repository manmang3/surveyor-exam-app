import React, { memo } from 'react';

interface PlayerCharacterProps {
  playerPosition: number;
  isDragging: boolean;
  animationFrame: number;
}

// プレイヤーキャラクターのメモ化
const PlayerCharacter = memo<PlayerCharacterProps>(({ playerPosition, isDragging, animationFrame }) => {
  return (
    <div
      id="player-character"
      className="absolute pixel-character transition-all duration-100 z-20"
      style={{
        left: `${playerPosition * 100}%`,
        bottom: '265px',
        transform: 'translate3d(-50%, 0, 0)', // GPU加速
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        willChange: 'transform'
      }}
    >
      <div className={`transform ${
        // ダッシュ時はアニメーションを高速化
        isDragging 
          ? (animationFrame % 20 < 10 ? 'scale-115 rotate-1' : 'scale-105 rotate--1')
          : (animationFrame % 60 < 30 ? 'scale-110' : 'scale-100')
      } transition-transform duration-100 ${
        isDragging ? 'animate-bounce' : ''
      }`}>
        <svg width="48" height="64" viewBox="0 0 16 24" className="pixel-style">
          {/* 頭 */}
          <rect x="6" y="0" width="4" height="4" fill="#FFDBAC" stroke="#000" strokeWidth="0.3"/>
          <rect x="5" y="1" width="6" height="3" fill="#FFDBAC" stroke="#000" strokeWidth="0.3"/>
          
          {/* 髪 */}
          <rect x="5" y="0" width="6" height="2" fill="#8B4513"/>
          
          {/* 目 */}
          <circle cx="6.5" cy="2.5" r="0.5" fill="#000"/>
          <circle cx="9.5" cy="2.5" r="0.5" fill="#000"/>
          
          {/* 胴体 */}
          <rect x="6" y="4" width="4" height="8" fill="#00BFFF" stroke="#000" strokeWidth="0.3"/>
          <rect x="5" y="5" width="6" height="6" fill="#00BFFF"/>
          
          {/* 腕 */}
          <rect x="3" y="6" width="2" height="4" fill="#FFDBAC"/>
          <rect x="11" y="6" width="2" height="4" fill="#FFDBAC"/>
          
          {/* 脚 */}
          <rect x="6" y="12" width="2" height="6" fill="#FFDBAC"/>
          <rect x="8" y="12" width="2" height="6" fill="#FFDBAC"/>
          
          {/* 靴 */}
          <rect x="5" y="17" width="4" height="2" fill="#8B4513"/>
          <rect x="7" y="17" width="4" height="2" fill="#8B4513"/>
          
          {/* パンツ */}
          <rect x="5" y="10" width="6" height="4" fill="#FF6B35"/>
        </svg>
      </div>
    </div>
  );
});

PlayerCharacter.displayName = 'PlayerCharacter';

export default PlayerCharacter;