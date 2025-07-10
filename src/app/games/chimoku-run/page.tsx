'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { chimokuQuestions, advancedQuestions, ChimokuQuestion, getWrongAnswer } from '@/data/games/chimoku-data';
import { ChimokuRunState, Wall } from '@/types/game';
import { GameStorage } from '@/lib/games/gameStorage';
import { AchievementManager } from '@/lib/achievements';

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
  const [gameState, setGameState] = useState<ChimokuRunState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    lives: 1,
    currentQuestionIndex: 0,
    correctAnswers: 0,
    totalAnswered: 0,
    startTime: 0,
    gameSpeed: 1,
    playerPosition: 0.5, // 0=左端、0.5=中央、1=右端
    walls: [],
    showFeedback: false,
    feedbackMessage: '',
    feedbackStartFrame: 0,
    remainingQuestions: 20,
    currentPhase: 'chimoku',
    backgroundOffset: 0,
    animationFrame: 0,
    dragStartX: 0,
    isDragging: false,
    lastFailedQuestion: null,
    gameStartTime: 0,
    elapsedTime: 0,
    turboStartTime: 0,
    currentSpeedMultiplier: 1
  });

  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showResultScreen, setShowResultScreen] = useState(false);
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
    
    // デバッグ用ログ
    console.log(`壁作成 ID=${wall.id}:`);
    console.log(`  問題: ${question.question}`);
    console.log(`  正解: ${question.correctAnswer}, 不正解: ${wrongAnswer}`);
    console.log(`  左側: ${leftChoice}, 右側: ${rightChoice}`);
    console.log(`  正解側: ${correctSide}`);
    
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
    const walls = generateWalls();
    
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      score: 0,
      lives: 1,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      totalAnswered: 0,
      startTime: Date.now(),
      gameSpeed: 1,
      playerPosition: 0.5,
      walls,
      showFeedback: false,
      feedbackMessage: '',
      feedbackStartFrame: 0,
      remainingQuestions: 20,
      currentPhase: 'chimoku',
      backgroundOffset: 0,
      animationFrame: 0,
      dragStartX: 0,
      isDragging: false,
      lastFailedQuestion: null,
      gameStartTime: Date.now(),
      elapsedTime: 0,
      turboStartTime: 0,
      currentSpeedMultiplier: 1
    });
    
    setShowStartScreen(false);
    setShowResultScreen(false);
  }, [generateWalls]);

  // 主人公の移動（選択肢内に制限）
  const movePlayer = useCallback((direction: 'left' | 'right', amount: number = 0.08) => {
    setGameState(prev => {
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
  }, []);

  // 不正解優先の当たり判定：中央付近でも不正解側に倒す
  const checkCollision = useCallback((wall: Wall, playerPos: number): boolean => {
    console.log(`当たり判定チェック: Wall ID=${wall.id}, 正解側=${wall.correctSide}, プレイヤー位置=${playerPos.toFixed(3)}`);
    
    // 中央付近の小さなマージンで、不正解側に倒す
    const centerTolerance = 0.05; // 非常に小さなマージン
    const isPlayerOnLeft = playerPos < 0.5 - centerTolerance;
    const isPlayerOnRight = playerPos > 0.5 + centerTolerance;
    
    console.log(`プレイヤー位置判定: 左側=${isPlayerOnLeft}, 右側=${isPlayerOnRight}, 中央=${!isPlayerOnLeft && !isPlayerOnRight}`);
    
    // 中央付近の場合は不正解側に判定
    let collision = false;
    if (wall.correctSide === 'left') {
      // 左が正解の場合、右側または中央にいると衝突
      collision = isPlayerOnRight || (!isPlayerOnLeft && !isPlayerOnRight);
      if (collision) {
        console.log('衝突！左が正解だがプレイヤーが右側または中央にいる');
      }
    } else {
      // 右が正解の場合、左側または中央にいると衝突
      collision = isPlayerOnLeft || (!isPlayerOnLeft && !isPlayerOnRight);
      if (collision) {
        console.log('衝突！右が正解だがプレイヤーが左側または中央にいる');
      }
    }
    
    if (!collision) {
      console.log('衝突なし: プレイヤーが正しい側にいる');
    }
    
    return collision;
  }, []);

  // ゲームオーバー
  const gameOver = useCallback(() => {
    console.log('gameOver関数が呼び出されました');
    console.log('現在のgameState:', gameState);
    
    const playTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const accuracy = gameState.totalAnswered > 0 
      ? Math.round((gameState.correctAnswers / gameState.totalAnswered) * 100) 
      : 0;

    GameStorage.saveGameScore({
      score: gameState.score,
      correctAnswers: gameState.correctAnswers,
      totalQuestions: gameState.totalAnswered,
      accuracy,
      playTime,
      difficulty: 'medium'
    });

    // 全問クリアの場合は実績を保存
    if (gameState.totalAnswered === 20 && gameState.correctAnswers === 20) {
      const isNewRecord = AchievementManager.unlockChimokuRunClear(
        gameState.elapsedTime,
        gameState.correctAnswers,
        gameState.totalAnswered
      );
      if (isNewRecord) {
        console.log('地目ラン実績解除！');
      }
    }

    console.log('setGameStateでゲーヤオーバー状態に変更中...');
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true
    }));
    
    console.log('setShowResultScreen(true)を実行中...');
    setShowResultScreen(true);
  }, [gameState]);

  // ゲームリスタート
  const restartGame = useCallback(() => {
    setShowResultScreen(false);
    setShowStartScreen(true);
  }, []);

  // ゲームループ
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = () => {
      setGameState(prev => {
        // 経過時間を計算
        const currentTime = Date.now();
        const elapsedTime = (currentTime - prev.gameStartTime) / 1000;

        // ターボ時の段階的加速計算
        let speedMultiplier = 1.0;
        if (prev.isDragging) {
          const turboElapsed = (currentTime - prev.turboStartTime) / 1000;
          // 5秒かけて最高速度（3倍）に到達
          const maxSpeed = 3.0;
          speedMultiplier = Math.min(1.0 + (maxSpeed - 1.0) * (turboElapsed / 5.0), maxSpeed);
        }
        
        const effectiveSpeed = 1.5 * prev.gameSpeed * speedMultiplier;
        
        if (prev.isDragging) {
          console.log(`ダッシュ中: 速度 ${effectiveSpeed.toFixed(1)}px/frame`);
        }
        
        const newWalls = prev.walls.map(wall => ({
          ...wall,
          zPosition: wall.zPosition + effectiveSpeed
        }));

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
        
        console.log(`チェック対象の壁: ${currentWall ? `ID=${currentWall.id}, zPos=${currentWall.zPosition.toFixed(1)}` : 'なし'}`);

        if (currentWall) {
          console.log(`壁がプレイヤー付近にあります: Wall ID=${currentWall.id}`);
          // 当たり判定
          if (checkCollision(currentWall, prev.playerPosition)) {
            console.log('衝突検出！ゲームオーバー処理開始');
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
            console.log('正解ルートを通過中！即座正解判定');
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
          console.log(`フォールバック: 壁通過成功 ${passedWall.id}`);
          // 通過成功
          const newCorrectAnswers = prev.correctAnswers + 1;
          const newTotalAnswered = prev.totalAnswered + 1;
          
          // 全問クリアチェック
          if (newTotalAnswered >= 28) {
            setTimeout(() => gameOver(), 100);
          }
          
          return {
            ...prev,
            correctAnswers: newCorrectAnswers,
            totalAnswered: newTotalAnswered,
            remainingQuestions: 28 - newTotalAnswered,
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

        return {
          ...prev,
          walls: newWalls,
          backgroundOffset: (prev.backgroundOffset + effectiveSpeed) % 100,
          animationFrame: (prev.animationFrame + 1) % 600,
          showFeedback: newShowFeedback,
          elapsedTime,
          currentSpeedMultiplier: speedMultiplier
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
  }, [gameState.isPlaying, checkCollision, gameOver]);

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
    setGameState(prev => ({
      ...prev,
      dragStartX: startX,
      isDragging: true, // ダッシュモード開始
      turboStartTime: Date.now()
    }));
  }, [gameState.isPlaying]);

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
    
    setGameState(prev => ({
      ...prev,
      playerPosition: newPosition
    }));
  }, [gameState.isPlaying, gameState.isDragging]);

  const handleTouchEnd = useCallback(() => {
    console.log('タッチ終了: ダッシュモードOFF');
    setGameState(prev => ({
      ...prev,
      isDragging: false // ダッシュモード終了
    }));
  }, []);

  // マウス操作ハンドラー（PC用）
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!gameState.isPlaying) return;
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = (event.clientX - rect.left) / rect.width;
    
    console.log('マウスクリック: ダッシュモードON');
    setGameState(prev => ({
      ...prev,
      dragStartX: startX,
      isDragging: true, // ダッシュモード開始
      turboStartTime: Date.now()
    }));
  }, [gameState.isPlaying]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!gameState.isPlaying || !gameState.isDragging) return;
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = (event.clientX - rect.left) / rect.width;
    // 選択肢内に制限
    const choiceLeftLimit = 0.2;
    const choiceRightLimit = 0.8;
    const newPosition = Math.max(choiceLeftLimit, Math.min(choiceRightLimit, currentX));
    
    setGameState(prev => ({
      ...prev,
      playerPosition: newPosition
    }));
  }, [gameState.isPlaying, gameState.isDragging]);

  const handleMouseUp = useCallback(() => {
    console.log('マウスリリース: ダッシュモードOFF');
    setGameState(prev => ({
      ...prev,
      isDragging: false // ダッシュモード終了
    }));
  }, []);

  // キーボードイベントハンドラー
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      if (event.key === 'ArrowUp' && !gameState.isDragging) {
        console.log('上矢印キー: ダッシュモードON');
        setGameState(prev => ({
          ...prev,
          isDragging: true,
          turboStartTime: Date.now()
        }));
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
        console.log('上矢印キーリリース: ダッシュモードOFF');
        setGameState(prev => ({
          ...prev,
          isDragging: false
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying, gameState.isDragging, movePlayer]);

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
                上から降ってくる選択肢を<br/>
                正しく避けてゴールを目指そう！
              </p>
              <div className="text-sm text-blue-600 mb-5 space-y-1 pixel-font font-bold">
                <p>• 矢印キーまたは画面ドラッグで移動</p>
                <p>• 正しい選択肢の側を通り抜けよう</p>
                <p>• 画面タップまたは↑キーでダッシュ</p>
                <p>• 間違った選択肢に当たるとゲームオーバー</p>
                <p>• 全20問をクリアしよう！</p>
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
              WebkitUserSelect: 'none'
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
                       transform: `translateY(${gameState.backgroundOffset}px)`
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
              <div className="absolute top-4 left-4 right-20 z-20 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-lg shadow-lg p-4 border-4 border-orange-500">
                <p className="font-bold text-orange-800 text-lg text-center pixel-font">
                  {currentQuestion.question}
                </p>
              </div>
            )}

            {/* 選択肢の壁 */}
            {gameState.walls
              .filter(wall => wall.zPosition > -200 && wall.zPosition < 800)
              .map((wall) => (
                <div
                  key={wall.id}
                  id={`wall-${wall.id}`}
                  className="absolute w-full flex"
                  style={{
                    top: `${wall.zPosition}px`,
                    zIndex: 10
                  }}
                >
                  {/* デバッグ: 壁の当たり判定枠 */}
                  {process.env.NODE_ENV === 'development' && (
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
                      opacity: wall.passed && gameState.feedbackMessage.includes('正解') ? 0 : 1,
                      transition: 'opacity 0.1s ease-out'
                    }}
                  >
                    {wall.leftChoice}
                  </div>
                  
                  {/* 右側の選択肢 */}
                  <div 
                    className={`flex-1 ml-2 mx-20 h-20 border-4 border-gray-800 flex items-center justify-center pixel-font font-bold text-white text-lg ${
                      wall.correctSide === 'right' ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-red-400 to-red-600'
                    }`}
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      // 正解時の即座非表示
                      opacity: wall.passed && gameState.feedbackMessage.includes('正解') ? 0 : 1,
                      transition: 'opacity 0.1s ease-out'
                    }}
                  >
                    {wall.rightChoice}
                  </div>
                </div>
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
            <div
              id="player-character"
              className="absolute pixel-character transition-all duration-100 z-20"
              style={{
                left: `${gameState.playerPosition * 100}%`,
                bottom: '265px',
                transform: 'translateX(-50%)',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }}
            >
              <div className={`transform ${
                // ダッシュ時はアニメーションを高速化
                gameState.isDragging 
                  ? (gameState.animationFrame % 20 < 10 ? 'scale-115 rotate-1' : 'scale-105 rotate--1')
                  : (gameState.animationFrame % 60 < 30 ? 'scale-110' : 'scale-100')
              } transition-transform duration-100 ${
                gameState.isDragging ? 'animate-bounce' : ''
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