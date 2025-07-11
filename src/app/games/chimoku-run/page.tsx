'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { chimokuQuestions, advancedQuestions, ChimokuQuestion, getWrongAnswer } from '@/data/games/chimoku-data';
import { ChimokuRunState, Wall } from '@/types/game';
import { GameStorage } from '@/lib/games/gameStorage';
import { AchievementManager } from '@/lib/achievements';
import { useGameSounds } from '@/lib/useGameSounds';
import { useGameState } from '@/hooks/useGameState';
import GameWall from '@/components/GameWall';
import PlayerCharacter from '@/components/PlayerCharacter';

// ファミコン風CSS
const pixelStyles = `
  * {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }
  .pixel-font {
    font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  
  .retro-glow {
    text-shadow: 
      0 0 5px currentColor,
      0 0 10px currentColor,
      0 0 15px currentColor;
    animation: pulse 2s infinite;
  }
  
  .retro-button {
    box-shadow: 
      4px 4px 0px rgba(0,0,0,0.8),
      inset 2px 2px 0px rgba(255,255,255,0.3);
  }
  
  .retro-button:hover {
    transform: translate(2px, 2px);
    box-shadow: 
      2px 2px 0px rgba(0,0,0,0.8),
      inset 2px 2px 0px rgba(255,255,255,0.3);
  }
  
  .pixel-character {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  .pixel-style {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
  
  @keyframes correctPop {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.3) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes sparkle {
    0% {
      opacity: 0;
      transform: scale(0) rotate(0deg);
    }
    20% {
      opacity: 1;
      transform: scale(1) rotate(180deg);
    }
    80% {
      opacity: 1;
      transform: scale(1) rotate(360deg);
    }
    100% {
      opacity: 0;
      transform: scale(0) rotate(540deg);
    }
  }
  
  @keyframes fadeOutSlowly {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

export default function ChimokuRunGame() {
  const gameSounds = useGameSounds();
  const { 
    gameState, 
    updateGameState, 
    updateWalls, 
    updatePlayerPosition, 
    updateDragging, 
    resetGame 
  } = useGameState();

  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  // const [questionSequence, setQuestionSequence] = useState<ChimokuQuestion[]>([]); // 未使用のためコメントアウト
  const gameLoopRef = useRef<number | undefined>(undefined);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // 20問のシーケンスを生成（1-15問：基本、16-20問：応用）
  const generateQuestionSequence = useCallback(() => {
    const shuffledBasicQuestions = [...chimokuQuestions].sort(() => Math.random() - 0.5);
    const shuffledAdvancedQuestions = [...advancedQuestions].sort(() => Math.random() - 0.5);
    
    // 1-15問は基本問題、16-20問は応用問題
    return [...shuffledBasicQuestions, ...shuffledAdvancedQuestions];
  }, []);

  // 問題から壁を生成
  const createWallFromQuestion = useCallback((question: ChimokuQuestion, index: number): Wall => {
    const correctSide: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
    const wrongAnswer = getWrongAnswer(question.correctAnswer, question.wrongAnswers);
    
    const leftChoice = correctSide === 'left' ? question.correctAnswer : wrongAnswer;
    const rightChoice = correctSide === 'right' ? question.correctAnswer : wrongAnswer;

    const wall = {
      id: `wall-${index}`,
      zPosition: -400 - (index * 1000), // 上方から開始、壁の間隔は1000px
      leftChoice,
      rightChoice,
      correctSide,
      question: question.question,
      explanation: question.explanation,
      passed: false,
      difficulty: question.difficulty
    };
    
    // デバッグ用ログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log(`壁作成 ID=${wall.id}:`);
      console.log(`  問題: ${question.question}`);
      console.log(`  正解: ${question.correctAnswer}, 不正解: ${wrongAnswer}`);
      console.log(`  左側: ${leftChoice}, 右側: ${rightChoice}`);
      console.log(`  正解側: ${correctSide}`);
    }
    
    return wall;
  }, []);

  // 壁を生成
  const generateWalls = useCallback(() => {
    const sequence = generateQuestionSequence();
    // setQuestionSequence(sequence); // 未使用のためコメントアウト
    
    const walls: Wall[] = [];
    sequence.forEach((question, index) => {
      const wall = createWallFromQuestion(question, index);
      walls.push(wall);
    });
    
    return walls;
  }, [generateQuestionSequence, createWallFromQuestion]);

  // ゲーム開始
  const startGame = useCallback(() => {
    gameSounds.playButtonSound(); // ボタン音再生
    
    const walls = generateWalls();
    const gameStartTime = performance.now(); // 高精度タイマー使用
    
    // ゲーム状態をリセットしてから更新
    resetGame();
    updateGameState(prev => ({
      ...prev,
      isPlaying: true,
      walls,
      gameStartTime,
      startTime: gameStartTime
    }));
    
    // タイマーリセット
    gameTimeRef.current.lastUpdate = gameStartTime;
    gameTimeRef.current.lastSoundUpdate = gameStartTime;
    
    setShowStartScreen(false);
    setShowResultScreen(false);
    
    // 走る音を開始
    setTimeout(() => {
      gameSounds.startRunningSound();
    }, 100); // 少し遅延させてスムーズに開始
  }, [generateWalls, gameSounds, resetGame, updateGameState]);

  // 主人公の移動（選択肢内に制限）
  const movePlayer = useCallback((direction: 'left' | 'right', amount: number = 0.08) => {
    updateGameState(prev => {
      // 選択肢の範囲内に制限（mx-20 + mr-2/ml-2を考慮）
      const choiceLeftLimit = 0.2;   // 左側選択肢内
      const choiceRightLimit = 0.8;  // 右側選択肢内
      
      const newPosition = direction === 'left' 
        ? Math.max(choiceLeftLimit, prev.playerPosition - amount)
        : Math.min(choiceRightLimit, prev.playerPosition + amount);
      
      return {
        ...prev,
        playerPosition: newPosition
      };
    });
  }, [updateGameState]);

  // 不正解優先の当たり判定：中央付近でも不正解側に倒す
  const checkCollision = useCallback((wall: Wall, playerPos: number): boolean => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`当たり判定チェック: Wall ID=${wall.id}, 正解側=${wall.correctSide}, プレイヤー位置=${playerPos.toFixed(3)}`);
    }
    
    // 中央付近の小さなマージンで、不正解側に倒す
    const centerTolerance = 0.05; // 非常に小さなマージン
    const isPlayerOnLeft = playerPos < 0.5 - centerTolerance;
    const isPlayerOnRight = playerPos > 0.5 + centerTolerance;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`プレイヤー位置判定: 左側=${isPlayerOnLeft}, 右側=${isPlayerOnRight}, 中央=${!isPlayerOnLeft && !isPlayerOnRight}`);
    }
    
    // 中央付近の場合は不正解側に判定
    let collision = false;
    if (wall.correctSide === 'left') {
      // 左が正解の場合、右側または中央にいると衝突
      collision = isPlayerOnRight || (!isPlayerOnLeft && !isPlayerOnRight);
      if (collision && process.env.NODE_ENV === 'development') {
        console.log('衝突！左が正解だがプレイヤーが右側または中央にいる');
      }
    } else {
      // 右が正解の場合、左側または中央にいると衝突
      collision = isPlayerOnLeft || (!isPlayerOnLeft && !isPlayerOnRight);
      if (collision && process.env.NODE_ENV === 'development') {
        console.log('衝突！右が正解だがプレイヤーが左側または中央にいる');
      }
    }
    
    if (!collision && process.env.NODE_ENV === 'development') {
      console.log('衝突なし: プレイヤーが正しい側にいる');
    }
    
    return collision;
  }, []);

  // ゲームオーバー
  const gameOver = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('gameOver関数が呼び出されました');
    }
    
    // 最新の状態を取得するため、updateGameStateのコールバックを使用
    updateGameState(prev => {
      if (process.env.NODE_ENV === 'development') {
        console.log('現在のgameState:', prev);
      }
      
      const playTime = Math.floor((performance.now() - prev.startTime) / 1000);
      const accuracy = prev.totalAnswered > 0 
        ? Math.round((prev.correctAnswers / prev.totalAnswered) * 100) 
        : 0;

      GameStorage.saveGameScore({
        score: prev.score,
        correctAnswers: prev.correctAnswers,
        totalQuestions: prev.totalAnswered,
        accuracy,
        playTime,
        difficulty: 'medium'
      });

      // 全問クリアの場合は実績を保存
      if (prev.totalAnswered === 20 && prev.correctAnswers === 20) {
        const newRecord = AchievementManager.unlockChimokuRunClear(
          prev.elapsedTime,
          prev.correctAnswers,
          prev.totalAnswered
        );
        if (newRecord) {
          if (process.env.NODE_ENV === 'development') {
            console.log('地目ラン実績解除！');
          }
          setIsNewRecord(true);
        }
        // ゲームクリア音を再生
        gameSounds.stopRunningSound();
        gameSounds.playVictorySound();
      } else {
        // ゲームオーバー音を再生
        gameSounds.stopRunningSound();
        gameSounds.playGameOverSound();
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('setGameStateでゲーヤオーバー状態に変更中...');
      }
      return {
        ...prev,
        isPlaying: false,
        isGameOver: true
      };
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('setShowResultScreen(true)を実行中...');
    }
    setShowResultScreen(true);
  }, [gameSounds, updateGameState]);

  // ゲームリスタート
  const restartGame = useCallback(() => {
    gameSounds.playButtonSound(); // ボタン音再生
    setShowResultScreen(false);
    setShowStartScreen(true);
    setIsNewRecord(false);
  }, [gameSounds]);

  // タイマー統一管理
  const gameTimeRef = useRef({
    lastUpdate: 0,
    lastSoundUpdate: 0,
    soundUpdateInterval: 250 // 250ms間隔で音声更新
  });

  // ゲームループ
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = () => {
      updateGameState(prev => {
        // 高精度タイマーで統一
        const currentTime = performance.now();
        const elapsedTime = (currentTime - prev.gameStartTime) / 1000;

        // ターボ時の段階的加速計算
        let speedMultiplier = 1.0;
        if (prev.isDragging) {
          const turboElapsed = (currentTime - prev.turboStartTime) / 1000;
          // 2.5秒かけて最高速度（4.5倍）に到達（従来の2倍の速さで加速）
          const maxSpeed = 4.5;
          speedMultiplier = Math.min(1.0 + (maxSpeed - 1.0) * (turboElapsed / 2.5), maxSpeed);
        }
        
        // 音声更新の間引き処理
        if (currentTime - gameTimeRef.current.lastSoundUpdate > gameTimeRef.current.soundUpdateInterval) {
          gameSounds.setRunningSpeed(speedMultiplier);
          gameTimeRef.current.lastSoundUpdate = currentTime;
        }
        
        const effectiveSpeed = 1.5 * prev.gameSpeed * speedMultiplier;
        
        // ダッシュ速度のログは本番では無効化
        if (prev.isDragging && process.env.NODE_ENV === 'development') {
          console.log(`ダッシュ中: 速度 ${effectiveSpeed.toFixed(1)}px/frame`);
        }
        
        // メモリ最適化: 可視範囲の壁のみ更新
        const newWalls = prev.walls.map(wall => {
          // 画面外の壁は位置更新しない
          if (wall.zPosition > 1200 || wall.zPosition < -500) {
            return wall;
          }
          // 可視範囲内のみ更新
          return {
            ...wall,
            zPosition: wall.zPosition + effectiveSpeed
          };
        });

        // プレイヤーと重なっている壁を検索
        const gameAreaHeight = gameAreaRef.current?.clientHeight || 600;
        const playerY = gameAreaHeight - 265; // プレイヤー265px上の位置
        
        // プレイヤー付近の壁を検索（衝突判定用）
        const currentWall = newWalls.find(wall => {
          const wallY = wall.zPosition;
          const wallBottomY = wall.zPosition + 80;
          // プレイヤーの上下30px範囲でチェック（衝突判定用）
          return (wallBottomY >= playerY - 30 && wallY <= playerY + 30) && !wall.passed;
        });
        
        // デバッグ情報は開発環境のみ
        if (process.env.NODE_ENV === 'development') {
          console.log(`チェック対象の壁: ${currentWall ? `ID=${currentWall.id}, zPos=${currentWall.zPosition.toFixed(1)}` : 'なし'}`);
        }

        if (currentWall) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`壁がプレイヤー付近にあります: Wall ID=${currentWall.id}`);
          }
          // 当たり判定
          if (checkCollision(currentWall, prev.playerPosition)) {
            if (process.env.NODE_ENV === 'development') {
              console.log('衝突検出！ゲームオーバー処理開始');
            }
            // 衝突：ゲームオーバー
            setTimeout(() => {
              console.log('gameOver()関数実行');
              gameOver();
            }, 500);
            return {
              ...prev,
              showFeedback: true,
              feedbackMessage: `不正解！正解は「${currentWall.correctSide === 'left' ? currentWall.leftChoice : currentWall.rightChoice}」でした。`,
              feedbackStartFrame: prev.animationFrame,
              walls: newWalls.map(w => w.id === currentWall.id ? {...w, passed: true} : w),
              isPlaying: false,
              isGameOver: true,
              lastFailedQuestion: currentWall
            };
          } else {
            // 衝突していないが、プレイヤーの近くを通過中なので即座正解判定
            if (process.env.NODE_ENV === 'development') {
              console.log('正解ルートを通過中！即座正解判定');
            }
            gameSounds.playCorrectSound(); // 正解音再生
            const newCorrectAnswers = prev.correctAnswers + 1;
            const newTotalAnswered = prev.totalAnswered + 1;
            
            // 全問クリアチェック
            if (newTotalAnswered >= 20) {
              setTimeout(() => gameOver(), 100);
            }
            
            return {
              ...prev,
              correctAnswers: newCorrectAnswers,
              totalAnswered: newTotalAnswered,
              remainingQuestions: 20 - newTotalAnswered,
              showFeedback: true,
              feedbackMessage: '正解！',
              feedbackStartFrame: prev.animationFrame,
              walls: newWalls.map(w => w.id === currentWall.id ? {...w, passed: true} : w)
            };
          }
        }

        // フォールバック: 通過した壁のチェック（上記で処理されなかった場合のみ）
        const passedWall = newWalls.find(wall => {
          const wallTop = wall.zPosition;
          return wallTop > playerY + 100 && !wall.passed;
        });

        if (passedWall) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`フォールバック: 壁通過成功 ${passedWall.id}`);
          }
          gameSounds.playCorrectSound(); // 正解音再生
          // 通過成功
          const newCorrectAnswers = prev.correctAnswers + 1;
          const newTotalAnswered = prev.totalAnswered + 1;
          
          // 全問クリアチェック
          if (newTotalAnswered >= 20) {
            setTimeout(() => gameOver(), 100);
          }
          
          return {
            ...prev,
            correctAnswers: newCorrectAnswers,
            totalAnswered: newTotalAnswered,
            remainingQuestions: 20 - newTotalAnswered,
            showFeedback: true,
            feedbackMessage: '正解！',
            feedbackStartFrame: prev.animationFrame,
            walls: newWalls.map(w => w.id === passedWall.id ? {...w, passed: true} : w)
          };
        }

        // フィードバック自動消去（正解時は1秒で完全に消去）
        const feedbackDuration = prev.feedbackMessage.includes('正解') ? 60 : 120; // 正解時は1秒、不正解時は2秒
        const feedbackElapsed = prev.animationFrame - prev.feedbackStartFrame;
        const newShowFeedback = prev.showFeedback && feedbackElapsed < feedbackDuration;

        // メモリ最適化: 必要なプロパティのみ更新
        const animationFrame = (prev.animationFrame + 1) % 600;
        const newBackgroundOffset = (prev.backgroundOffset + effectiveSpeed) % 100;
        
        // 変更があったプロパティのみ更新してオブジェクト生成を最小化
        if (prev.walls === newWalls && 
            prev.showFeedback === newShowFeedback &&
            Math.abs(prev.backgroundOffset - newBackgroundOffset) < 0.1 &&
            prev.elapsedTime === elapsedTime) {
          // 変更がない場合は現在の状態を返す
          return {
            ...prev,
            animationFrame,
            currentSpeedMultiplier: speedMultiplier
          };
        }

        return {
          ...prev,
          walls: newWalls,
          backgroundOffset: newBackgroundOffset,
          animationFrame,
          elapsedTime,
          currentSpeedMultiplier: speedMultiplier,
          showFeedback: newShowFeedback
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, checkCollision, gameOver, gameSounds, updateGameState]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        movePlayer('left');
      } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        movePlayer('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, movePlayer]);

  // タッチ・ドラッグ操作
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (!gameState.isPlaying) return;
    
    const touch = event.touches[0];
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = (touch.clientX - rect.left) / rect.width;
    
    console.log('タッチ開始: ダッシュモードON');
    updateDragging(true, performance.now());
    updateGameState(prev => ({
      ...prev,
      dragStartX: startX
    }));
  }, [gameState.isPlaying, updateDragging, updateGameState]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!gameState.isPlaying || !gameState.isDragging) return;
    
    const touch = event.touches[0];
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = (touch.clientX - rect.left) / rect.width;
    // 選択肢内に制限
    const choiceLeftLimit = 0.2;
    const choiceRightLimit = 0.8;
    const newPosition = Math.max(choiceLeftLimit, Math.min(choiceRightLimit, currentX));
    
    updatePlayerPosition(newPosition);
  }, [gameState.isPlaying, gameState.isDragging, updatePlayerPosition]);

  const handleTouchEnd = useCallback(() => {
    console.log('タッチ終了: ダッシュモードOFF');
    updateDragging(false);
  }, [updateDragging]);

  // マウス操作ハンドラー（PC用）
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!gameState.isPlaying) return;
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = (event.clientX - rect.left) / rect.width;
    
    console.log('マウスクリック: ダッシュモードON');
    updateDragging(true, performance.now());
    updateGameState(prev => ({
      ...prev,
      dragStartX: startX
    }));
  }, [gameState.isPlaying, updateDragging, updateGameState]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!gameState.isPlaying || !gameState.isDragging) return;
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = (event.clientX - rect.left) / rect.width;
    // 選択肢内に制限
    const choiceLeftLimit = 0.2;
    const choiceRightLimit = 0.8;
    const newPosition = Math.max(choiceLeftLimit, Math.min(choiceRightLimit, currentX));
    
    updatePlayerPosition(newPosition);
  }, [gameState.isPlaying, gameState.isDragging, updatePlayerPosition]);

  const handleMouseUp = useCallback(() => {
    console.log('マウスリリース: ダッシュモードOFF');
    updateDragging(false);
  }, [updateDragging]);

  // キーボードイベントハンドラー
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      if (event.key === 'ArrowUp' && !gameState.isDragging) {
        if (process.env.NODE_ENV === 'development') {
          console.log('上矢印キー: ダッシュモードON');
        }
        updateDragging(true, performance.now());
      }
      
      // 左右矢印キーでプレイヤー移動
      if (event.key === 'ArrowLeft') {
        movePlayer('left', 0.05);
      }
      if (event.key === 'ArrowRight') {
        movePlayer('right', 0.05);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      if (event.key === 'ArrowUp' && gameState.isDragging) {
        if (process.env.NODE_ENV === 'development') {
          console.log('上矢印キーリリース: ダッシュモードOFF');
        }
        updateDragging(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying, gameState.isDragging, movePlayer, updateDragging]);

  // 現在表示すべき問題を取得（回答が終わるまで表示し続ける）
  const currentQuestion = gameState.walls.find(wall => 
    !wall.passed && (wall.zPosition >= -200 && wall.zPosition <= 500)
  ) || gameState.walls.find(wall => !wall.passed); // 範囲外でも未回答の問題があれば表示

  return (
    <>
      <style>{pixelStyles}</style>
      <div className="h-screen bg-gray-600 flex flex-col overflow-hidden relative select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>

        {/* ヘッダー */}
        <div className="p-4 z-50">
          <Link href="/" className="text-white hover:text-blue-200 mb-4 inline-block text-shadow-lg">
            ← ホームに戻る
          </Link>
        </div>

        {/* スタート画面 */}
        {showStartScreen && (
          <div className="flex-1 flex items-start justify-center p-4 pt-8">
            <div className="bg-white border-8 border-blue-600 rounded-lg shadow-xl p-6 max-w-md w-full text-center pixel-style mt-4"
                 style={{ 
                   background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
                   boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                 }}>
              <h1 className="text-4xl font-bold text-blue-600 mb-3 pixel-font retro-glow">🏃‍♂️ 地目ラン</h1>
              <div className="text-5xl mb-3">🌟</div>
              <p className="text-gray-800 mb-5 pixel-font text-lg font-bold">
                正しい地目を選んで走ろう！
              </p>
              <div className="text-sm text-blue-600 mb-5 space-y-1 pixel-font font-bold">
                <p>• 画面ドラッグで移動</p>
                <p>• 正しい選択肢の道を選んで走ろう</p>
                <p>• 間違った選択肢を選ぶと終了</p>
                <p>• 画面を押し続けると加速</p>
                <p>• 全20問をなるべく速くクリアしよう！</p>
              </div>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-8 py-3 border-4 border-white font-bold hover:from-pink-600 hover:to-yellow-600 transition-all duration-200 text-xl pixel-font retro-button"
                style={{ 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  transform: 'scale(1)',
                  animation: 'pulse 2s infinite'
                }}
              >
                🚀 START 🚀
              </button>
            </div>
          </div>
        )}

        {/* ゲーム画面 */}
        {gameState.isPlaying && (
          <div 
            ref={gameAreaRef}
            className="flex-1 relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              touchAction: 'none', 
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              willChange: 'transform', // GPU加速を有効化
              transform: 'translateZ(0)' // 3D変換でGPU層に移動
            }}
          >
            {/* ゲーム道路（一本道） */}
            <div className="absolute inset-0">
              {/* 道路の背景 */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-600 via-gray-500 to-gray-400">
                {/* 道路の中央線 */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full bg-white opacity-80"
                     style={{
                       backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 20px, transparent 20px, transparent 40px)',
                       transform: `translate3d(-50%, ${gameState.backgroundOffset}px, 0)`, // GPU加速
                       willChange: 'transform'
                     }}
                />
                
                {/* 道路の左端 */}
                <div className="absolute left-20 w-4 h-full bg-white opacity-60"
                     style={{
                       backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 30px, transparent 30px, transparent 50px)'
                     }}
                />
                
                {/* 道路の右端 */}
                <div className="absolute right-20 w-4 h-full bg-white opacity-60"
                     style={{
                       backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 30px, transparent 30px, transparent 50px)'
                     }}
                />
              </div>
            </div>

            {/* バージョン表示 */}
            <div className="absolute bottom-2 right-2 z-30 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
              v3.5 - エフェクト完全消去
            </div>
            
            {/* ダッシュ状態表示（控えめ） */}
            {gameState.isDragging && (
              <div className="absolute bottom-4 left-4 z-30">
                <div className="bg-gray-800 bg-opacity-60 text-white px-2 py-1 rounded text-xs pixel-font">
                  ダッシュ
                </div>
              </div>
            )}
            
            {/* 問題デバッグ情報 */}
            {process.env.NODE_ENV === 'development' && currentQuestion && (
              <div className="absolute top-20 right-4 z-30 bg-purple-600 text-white px-2 py-1 rounded text-xs max-w-xs">
                <div>問題: {currentQuestion.question}</div>
                <div className="text-green-300">左側: {currentQuestion.leftChoice}</div>
                <div className="text-red-300">右側: {currentQuestion.rightChoice}</div>
                <div>正解側: {currentQuestion.correctSide}</div>
              </div>
            )}

            {/* 右上のゲーム情報 */}
            <div className="absolute top-4 right-4 z-20">
              <div className="pixel-font text-white text-sm font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                残り{gameState.remainingQuestions}問
              </div>
              <div className="pixel-font text-white text-sm font-bold mt-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                {gameState.elapsedTime.toFixed(1)}秒
              </div>
            </div>

            {/* 問題文表示 */}
            {currentQuestion && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-lg shadow-lg p-4 border-4 border-orange-500 w-5/6 max-w-lg">
                <p className="font-bold text-orange-800 text-lg text-center pixel-font">
                  {currentQuestion.question}
                </p>
              </div>
            )}

            {/* 選択肢の壁 */}
            {gameState.walls
              .filter(wall => wall.zPosition > -200 && wall.zPosition < 800)
              .map((wall) => (
                <GameWall 
                  key={wall.id}
                  wall={wall}
                  showDebug={process.env.NODE_ENV === 'development'}
                />
              ))}

            {/* 当たり判定の可視化（デバッグ用） */}
            {process.env.NODE_ENV === 'development' && (
              <>
                {/* プレイヤーの当たり判定範囲 */}
                <div
                  className="absolute bottom-20 border-2 border-red-500 opacity-50 z-15"
                  style={{
                    left: `${gameState.playerPosition * 100}%`,
                    transform: 'translateX(-50%)',
                    width: '64px',
                    height: '64px'
                  }}
                />
                
                {/* プレイヤーの中心線 */}
                <div
                  className="absolute bottom-20 bg-blue-500 opacity-70 z-16"
                  style={{
                    left: `${gameState.playerPosition * 100}%`,
                    transform: 'translateX(-50%)',
                    width: '2px',
                    height: '64px'
                  }}
                />
                
                {/* 画面中央の分割線 */}
                <div
                  className="absolute left-1/2 top-0 bg-yellow-400 opacity-30 z-5"
                  style={{
                    transform: 'translateX(-50%)',
                    width: '2px',
                    height: '100%'
                  }}
                />
                
                {/* プレイヤー位置の数値表示 */}
                <div
                  className="absolute bottom-2 text-white pixel-font text-sm bg-black bg-opacity-75 px-2 py-1 rounded z-30"
                  style={{
                    left: `${gameState.playerPosition * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  X: {gameState.playerPosition.toFixed(2)}
                </div>
                
                {/* 画面上にプレイヤーの計算位置を表示 */}
                <div className="absolute top-4 left-4 text-white pixel-font text-sm bg-black bg-opacity-75 px-2 py-1 rounded z-30">
                  <div>プレイヤー中心Y: {((gameAreaRef.current?.clientHeight || 600) - 120 + 32).toFixed(0)}px</div>
                  <div>プレイヤー範囲: {((gameAreaRef.current?.clientHeight || 600) - 120 + 32 - 32).toFixed(0)}px - {((gameAreaRef.current?.clientHeight || 600) - 120 + 32 + 32).toFixed(0)}px</div>
                  <div>画面高さ: {(gameAreaRef.current?.clientHeight || 600)}px</div>
                </div>
              </>
            )}

            {/* 主人公 */}
            <PlayerCharacter 
              playerPosition={gameState.playerPosition}
              isDragging={gameState.isDragging}
              animationFrame={gameState.animationFrame}
            />

            {/* フィードバック表示（強化エフェクト） */}
            {gameState.showFeedback && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                {gameState.feedbackMessage.includes('正解') ? (
                  <div className="text-center relative">
                    {/* 背景の光る円 */}
                    <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping" 
                         style={{ width: '400px', height: '400px', left: '-200px', top: '-200px' }}></div>
                    <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-ping" 
                         style={{ width: '600px', height: '600px', left: '-300px', top: '-300px', animationDelay: '0.3s' }}></div>
                    
                    {/* メインスター */}
                    <div className="text-9xl font-bold text-yellow-400 pixel-font relative z-10" 
                         style={{ 
                           animation: 'correctPop 0.3s ease-out, correctShake 0.2s ease-in-out 0.3s, fadeOutSlowly 1.5s ease-out 0.5s both',
                           textShadow: '0 0 30px #fbbf24, 0 0 60px #fbbf24, 0 0 90px #fbbf24'
                         }}>
                      🌟
                    </div>
                    
                    {/* 正解メッセージ */}
                    <div className="text-5xl font-bold text-green-400 pixel-font mt-4 relative z-10"
                         style={{ 
                           textShadow: '3px 3px 0px rgba(0,0,0,0.8), 0 0 20px rgba(34, 197, 94, 0.8)',
                           animation: 'correctPop 0.3s ease-out 0.1s both, fadeOutSlowly 1.5s ease-out 0.5s both'
                         }}>
                      正解！
                    </div>
                    
                    {/* キラキラエフェクト */}
                    {Array.from({ length: 12 }, (_, i) => (
                      <div
                        key={`sparkle-${i}`}
                        className="absolute text-3xl"
                        style={{
                          left: `${50 + 40 * Math.cos(i * Math.PI / 6)}%`,
                          top: `${50 + 40 * Math.sin(i * Math.PI / 6)}%`,
                          animation: `sparkle 1s ${i * 0.03}s ease-out`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        ✨
                      </div>
                    ))}
                    
                    {/* ハートエフェクト */}
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={`heart-${i}`}
                        className="absolute text-2xl"
                        style={{
                          left: `${50 + 25 * Math.cos(i * Math.PI / 3)}%`,
                          top: `${50 + 25 * Math.sin(i * Math.PI / 3)}%`,
                          animation: `sparkle 0.8s ${i * 0.05 + 0.1}s ease-out`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        ❤️
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black bg-opacity-90 rounded-lg p-6 max-w-md text-center border-4 border-red-500">
                    <div className="text-4xl font-bold text-red-400 pixel-font mb-2">
                      💥
                    </div>
                    <div className="text-white pixel-font text-lg font-bold">
                      {gameState.feedbackMessage}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ゲームオーバー画面 */}
        {showResultScreen && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-white to-blue-50 border-8 border-blue-600 rounded-lg shadow-xl p-12 max-w-lg w-full text-center pixel-style">
              <h2 className="text-5xl font-bold mb-8 pixel-font retro-glow">
                {gameState.totalAnswered === 20 ? (
                  <span className="text-yellow-500">🏆 CLEAR! 🏆</span>
                ) : (
                  <span className="text-red-600">GAME OVER</span>
                )}
              </h2>
              
              {/* ゲームオーバー時の説明 */}
              {gameState.totalAnswered !== 20 && gameState.lastFailedQuestion && (
                <div className="mb-6 text-gray-800 text-lg pixel-font">
                  <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
                    <div className="text-sm">
                      「{gameState.lastFailedQuestion.question}」は、
                      <span className="font-bold text-green-600">
                        {gameState.lastFailedQuestion.correctSide === 'left' 
                          ? gameState.lastFailedQuestion.leftChoice 
                          : gameState.lastFailedQuestion.rightChoice}
                      </span>
                      です。
                    </div>
                  </div>
                </div>
              )}
              
              {gameState.totalAnswered === 20 && (
                <div className="text-2xl font-bold text-orange-500 mb-6 pixel-font">
                  🎉 CONGRATULATIONS! 🎉
                </div>
              )}
              
              {isNewRecord && (
                <div className="text-3xl font-bold text-yellow-500 mb-6 pixel-font animate-pulse">
                  ✨ 最高記録！ ✨
                </div>
              )}
              
              <div className="space-y-3 mb-8 text-gray-800">
                <div className="text-2xl pixel-font font-bold">
                  <span>正解数: </span>
                  <span className="text-green-600">{gameState.correctAnswers} / 20</span>
                </div>
                <div className="text-xl pixel-font font-bold">
                  <span>Time: </span>
                  <span className="text-blue-600">{gameState.elapsedTime.toFixed(2)}秒</span>
                </div>
              </div>
              
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-6 border-4 border-white font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 pixel-font retro-button text-3xl"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
              >
                🔄 RETRY 🔄
              </button>
              
              <div className="mt-6">
                <Link href="/" className="text-blue-600 hover:text-blue-800 pixel-font text-lg font-bold">
                  ← ホームに戻る
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}