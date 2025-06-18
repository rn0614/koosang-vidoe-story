'use client';
import { useEffect, useRef, useState } from 'react';
import { detectPlatform } from '@/lib/user-agent';

// 플랫폼 감지 함수 (클라이언트 사이드)

const BOARD_SIZE = 10;
const BASE_CELL_SIZE = 60;
const MIN_CELL_SIZE = 30;
const PLAYER_COLOR = '#007bff';
const BOARD_COLOR = '#f5f5f5';
const GRID_COLOR = '#ccc';
const WALL_COLOR = '#222';
const EXIT_COLOR = '#2ecc40';
const ITEM_COLOR = '#ffd600';
const MONSTER_COLOR = '#e74c3c';
const WALL_PROB = 0.4;

function bfs(
  board: number[][],
  start: [number, number],
  end: [number, number],
) {
  const visited = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(false),
  );
  const queue: Array<{
    row: number;
    col: number;
    dist: number;
    prev?: [number, number];
  }> = [];
  queue.push({ row: start[0], col: start[1], dist: 0 });
  visited[start[0]][start[1]] = true;
  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];
  const parent: (null | [number, number])[][] = Array.from(
    { length: BOARD_SIZE },
    () => Array(BOARD_SIZE).fill(null),
  );
  while (queue.length) {
    const { row, col, dist } = queue.shift()!;
    if (row === end[0] && col === end[1]) {
      const path: [number, number][] = [];
      let cur: [number, number] | null = [row, col];
      while (cur) {
        path.push(cur);
        cur = parent[cur[0]][cur[1]];
      }
      path.reverse();
      return { dist, path };
    }
    for (let d = 0; d < 4; d++) {
      const nr = row + dr[d];
      const nc = col + dc[d];
      if (
        nr >= 0 &&
        nr < BOARD_SIZE &&
        nc >= 0 &&
        nc < BOARD_SIZE &&
        !visited[nr][nc] &&
        board[nr][nc] !== 1
      ) {
        visited[nr][nc] = true;
        parent[nr][nc] = [row, col];
        queue.push({ row: nr, col: nc, dist: dist + 1 });
      }
    }
  }
  return null;
}

function generateBoardWithPathAndItemsAndMonster(stage = 1) {
  let board: number[][];
  let dist: number | null = null;
  do {
    board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      const rowArr: number[] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (
          (row === BOARD_SIZE - 1 && col === 0) ||
          (row === 0 && col === BOARD_SIZE - 1)
        ) {
          rowArr.push(0);
        } else {
          rowArr.push(Math.random() < WALL_PROB ? 1 : 0);
        }
      }
      board.push(rowArr);
    }
    dist = bfs(board, [BOARD_SIZE - 1, 0], [0, BOARD_SIZE - 1])?.dist ?? null;
  } while (dist === null);

  const emptyCells: Array<[number, number]> = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (
        board[row][col] === 0 &&
        !(row === BOARD_SIZE - 1 && col === 0) &&
        !(row === 0 && col === BOARD_SIZE - 1)
      ) {
        emptyCells.push([row, col]);
      }
    }
  }
  
  let itemList: [number, number][] = [];
  let itemCount = Math.min(Math.floor(stage / 2) + 1, emptyCells.length);
  for (let i = 0; i < itemCount && emptyCells.length > 0; i++) {
    const idx = Math.floor(Math.random() * emptyCells.length);
    const [r, c] = emptyCells.splice(idx, 1)[0];
    itemList.push([r, c]);
    board[r][c] = 3;
  }
  
  let monsterList: [number, number][] = [];
  let monsterCount = Math.min(stage, emptyCells.length);
  for (let i = 0; i < monsterCount; i++) {
    const idx = Math.floor(Math.random() * emptyCells.length);
    const [mr, mc] = emptyCells.splice(idx, 1)[0];
    board[mr][mc] = 4;
    monsterList.push([mr, mc]);
  }
  return { board, dist, monsterList, itemList };
}

class Player {
  row: number;
  col: number;
  remainStep: number;

  constructor(row: number, col: number, remainStep: number = 100) {
    this.row = row;
    this.col = col;
    this.remainStep = remainStep;
  }

  tryMove(newRow: number, newCol: number, board: number[][]): boolean {
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
      return false;
    }
    if (board[newRow][newCol] === 1) {
      return false;
    }
    return true;
  }

  move(newRow: number, newCol: number): void {
    this.row = newRow;
    this.col = newCol;
  }

  collectItem(): void {
    this.remainStep += 20;
  }

  useStep(): boolean {
    if (this.remainStep > 1) {
      this.remainStep--;
      return true;
    } else if (this.remainStep === 1) {
      this.remainStep = 0;
      return false;
    }
    return false;
  }

  takeDamage(): void {
    this.remainStep = Math.max(this.remainStep - 30, 0);
  }

  isAtExit(): boolean {
    return this.row === 0 && this.col === BOARD_SIZE - 1;
  }

  getPosition(): [number, number] {
    return [this.row, this.col];
  }
}

class Monster {
  row: number;
  col: number;
  id: number;

  constructor(row: number, col: number, id: number) {
    this.row = row;
    this.col = col;
    this.id = id;
  }

  calculateNextMove(board: number[][], playerPos: [number, number]): [number, number] | null {
    const bfsResult = bfs(board, [this.row, this.col], playerPos);
    if (!bfsResult || bfsResult.path.length < 2) {
      return null;
    }
    return bfsResult.path[1];
  }

  move(newRow: number, newCol: number): void {
    this.row = newRow;
    this.col = newCol;
  }

  isCollidingWith(playerPos: [number, number]): boolean {
    return this.row === playerPos[0] && this.col === playerPos[1];
  }

  getPosition(): [number, number] {
    return [this.row, this.col];
  }
}

class GameManager {
  player: Player;
  monsters: Monster[];
  board: number[][];
  itemList: [number, number][];

  constructor(boardState: any) {
    this.player = new Player(BOARD_SIZE - 1, 0, 100);
    this.monsters = boardState.monsterList.map((pos: [number, number], index: number) => 
      new Monster(pos[0], pos[1], index)
    );
    this.board = boardState.board;
    this.itemList = boardState.itemList;
  }

  handlePlayerMove(direction: string): { success: boolean; gameOver: boolean; stageCleared: boolean } {
    const { row, col } = this.player;
    let newRow = row, newCol = col;

    switch (direction) {
      case 'ArrowUp': if (row > 0) newRow--; break;
      case 'ArrowDown': if (row < BOARD_SIZE - 1) newRow++; break;
      case 'ArrowLeft': if (col > 0) newCol--; break;
      case 'ArrowRight': if (col < BOARD_SIZE - 1) newCol++; break;
      default: return { success: false, gameOver: false, stageCleared: false };
    }

    if (!this.player.tryMove(newRow, newCol, this.board)) {
      return { success: false, gameOver: false, stageCleared: false };
    }

    this.player.move(newRow, newCol);

    const itemIndex = this.itemList.findIndex(([ir, ic]) => ir === newRow && ic === newCol);
    if (itemIndex !== -1) {
      this.player.collectItem();
      this.itemList.splice(itemIndex, 1);
      this.board[newRow][newCol] = 0;
    } else {
      if (!this.player.useStep()) {
        return { success: true, gameOver: true, stageCleared: false };
      }
    }

    if (this.player.isAtExit()) {
      return { success: true, gameOver: false, stageCleared: true };
    }

    return { success: true, gameOver: false, stageCleared: false };
  }

  handleMonsterMovement(): void {
    const playerPos = this.player.getPosition();
    const newMonsters: Monster[] = [];

    for (const monster of this.monsters) {
      this.board[monster.row][monster.col] = 0;
      const nextPos = monster.calculateNextMove(this.board, playerPos);
      
      if (nextPos) {
        monster.move(nextPos[0], nextPos[1]);
        this.board[nextPos[0]][nextPos[1]] = 4;
        newMonsters.push(monster);
      } else {
        this.board[monster.row][monster.col] = 4;
        newMonsters.push(monster);
      }
    }

    this.monsters = newMonsters;
  }

  handleCollisions(): boolean {
    const playerPos = this.player.getPosition();
    const collidingMonsters: Monster[] = [];

    for (const monster of this.monsters) {
      if (monster.isCollidingWith(playerPos)) {
        collidingMonsters.push(monster);
      }
    }

    if (collidingMonsters.length > 0) {
      this.player.takeDamage();
      this.monsters = this.monsters.filter(monster => 
        !collidingMonsters.includes(monster)
      );

      for (const monster of collidingMonsters) {
        this.board[monster.row][monster.col] = 0;
      }

      return true;
    }

    return false;
  }

  processTurn(direction: string): { 
    success: boolean; 
    gameOver: boolean; 
    stageCleared: boolean; 
    collision: boolean;
  } {
    const playerResult = this.handlePlayerMove(direction);
    if (!playerResult.success || playerResult.gameOver || playerResult.stageCleared) {
      return { ...playerResult, collision: false };
    }

    this.handleMonsterMovement();
    const collision = this.handleCollisions();

    return { 
      success: true, 
      gameOver: this.player.remainStep <= 0, 
      stageCleared: false,
      collision 
    };
  }

  handleAttack(): boolean {
    if (this.player.remainStep < 5) return false;

    const playerPos = this.player.getPosition();
    const targets: [number, number][] = [
      [playerPos[0] - 1, playerPos[1]],
      [playerPos[0] - 1, playerPos[1] + 1],
      [playerPos[0], playerPos[1] + 1],
    ];

    let killedCount = 0;
    this.monsters = this.monsters.filter(monster => {
      const monsterPos = monster.getPosition();
      const isTarget = targets.some(([tr, tc]) => tr === monsterPos[0] && tc === monsterPos[1]);
      if (isTarget) {
        this.board[monsterPos[0]][monsterPos[1]] = 0;
        killedCount++;
      }
      return !isTarget;
    });

    this.player.remainStep -= 5;
    return killedCount > 0;
  }

  getGameState() {
    return {
      player: this.player.getPosition(),
      remainStep: this.player.remainStep,
      monsters: this.monsters.map(m => m.getPosition()),
      board: this.board,
      itemList: this.itemList
    };
  }
}

// 방향 버튼 컴포넌트
interface DirectionButtonProps {
  direction: 'up' | 'down' | 'left' | 'right';
  onPress: (direction: string) => void;
  size?: number;
  disabled?: boolean;
}

function DirectionButton({ direction, onPress, size = 50, disabled = false }: DirectionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const directionMap = {
    up: { arrow: '↑', key: 'ArrowUp' },
    down: { arrow: '↓', key: 'ArrowDown' },
    left: { arrow: '←', key: 'ArrowLeft' },
    right: { arrow: '→', key: 'ArrowRight' }
  };

  const handlePress = () => {
    if (!disabled && !hasTriggered) {
      setIsPressed(true);
      setHasTriggered(true);
      onPress(directionMap[direction].key);
      
      setTimeout(() => {
        setIsPressed(false);
        setHasTriggered(false);
      }, 200); // 200ms 쿨다운
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handlePress();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 터치 디바이스에서는 클릭 이벤트 무시
    if (!('ontouchstart' in window)) {
      handlePress();
    }
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      disabled={disabled}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        backgroundColor: disabled ? '#ccc' : (isPressed ? '#0056b3' : '#007bff'),
        border: '2px solid',
        borderColor: disabled ? '#999' : (isPressed ? '#003d82' : '#0056b3'),
        color: disabled ? '#666' : 'white',
        fontSize: `${size * 0.4}px`,
        fontWeight: 'bold',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : (isPressed ? 
          '0 2px 4px rgba(0, 0, 0, 0.2)' : 
          '0 4px 8px rgba(0, 0, 0, 0.3)'
        ),
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.1s ease',
        userSelect: 'none',
        touchAction: 'manipulation',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {directionMap[direction].arrow}
    </button>
  );
}

// 플로팅 방향 패드 컴포넌트
interface FloatingDPadProps {
  onDirectionPress: (direction: string) => void;
  size?: number;
  disabled?: boolean;
}

function FloatingDPad({ onDirectionPress, size = 50, disabled = false }: FloatingDPadProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(0, 0, 0, 0.1)'
    }}>
      {/* 첫 번째 행 */}
      <div></div>
      <DirectionButton 
        direction="up" 
        onPress={onDirectionPress} 
        size={size}
        disabled={disabled}
      />
      <div></div>
      
      {/* 두 번째 행 */}
      <DirectionButton 
        direction="left" 
        onPress={onDirectionPress} 
        size={size}
        disabled={disabled}
      />
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#666',
        fontWeight: 'bold'
      }}>
        🎮
      </div>
      <DirectionButton 
        direction="right" 
        onPress={onDirectionPress} 
        size={size}
        disabled={disabled}
      />
      
      {/* 세 번째 행 */}
      <div></div>
      <DirectionButton 
        direction="down" 
        onPress={onDirectionPress} 
        size={size}
        disabled={disabled}
      />
      <div></div>
    </div>
  );
}

// 플로팅 공격 버튼 컴포넌트
interface FloatingAttackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

function FloatingAttackButton({ onClick, disabled = false, size = 80 }: FloatingAttackButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleStart = () => {
    if (!disabled) {
      setIsPressed(true);
      onClick();
    }
  };

  const handleEnd = () => {
    setIsPressed(false);
  };

  return (
    <button
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => { e.preventDefault(); handleStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); handleEnd(); }}
      disabled={disabled}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: disabled ? '#ccc' : (isPressed ? '#ff6b35' : '#ff4444'),
        border: '3px solid',
        borderColor: disabled ? '#999' : (isPressed ? '#d63031' : '#e74c3c'),
        color: disabled ? '#666' : 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : (isPressed ? 
          '0 2px 8px rgba(0, 0, 0, 0.3)' : 
          '0 4px 12px rgba(0, 0, 0, 0.4)'
        ),
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.1s ease',
        userSelect: 'none',
        touchAction: 'manipulation',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      ⚔️
    </button>
  );
}

export default function FloatingButtonBoardGame() {
  const [boardState, setBoardState] = useState<{
    board: number[][];
    dist: number | null;
    monsterList: [number, number][];
    itemList: [number, number][];
  } | null>(null);
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [player, setPlayer] = useState({ row: BOARD_SIZE - 1, col: 0 });
  const [remainStep, setRemainStep] = useState(100);
  const [stage, setStage] = useState(1);
  const [swinging, setSwinging] = useState(false);
  const [swingAngle, setSwingAngle] = useState(0);
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [platform, setPlatform] = useState<'mobile' | 'webview' | 'web'>('web');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculateCellSize = () => {
    const screenWidth = window.innerWidth;
    const padding = 40;
    const maxBoardWidth = screenWidth - padding;
    const calculatedCellSize = Math.floor(maxBoardWidth / BOARD_SIZE);
    const newCellSize = Math.max(MIN_CELL_SIZE, Math.min(BASE_CELL_SIZE, calculatedCellSize));
    setCellSize(newCellSize);
  };

  // 햅틱 피드백
  const triggerVibration = (pattern: number | number[] = 50) => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    calculateCellSize();
    // 비동기 함수로 감싸서 await 사용
    (async () => {
      const platform = await detectPlatform();
      setPlatform(platform as 'mobile' | 'webview' | 'web');
    })();
    const handleResize = () => calculateCellSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initialBoardState = generateBoardWithPathAndItemsAndMonster();
    setBoardState(initialBoardState);
    setGameManager(new GameManager(initialBoardState));
  }, []);

  // 키보드 이벤트 처리 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (!gameManager || remainStep <= 0) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        handleMove(e.key);
      }

      if ((e.key === 'z' || e.key === 'Z') && !swinging) {
        handleAttack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameManager, remainStep, swinging]);

  // 이동 처리 함수 (단일 이동만)
  const handleMove = (direction: string) => {
    if (!gameManager || remainStep <= 0) return;

    triggerVibration(30); // 이동 시 진동

    const result = gameManager.processTurn(direction);
    
    if (result.success) {
      const gameState = gameManager.getGameState();
      setPlayer({ row: gameState.player[0], col: gameState.player[1] });
      setRemainStep(gameState.remainStep);
      setBoardState(prev => prev ? {
        ...prev,
        board: gameState.board,
        monsterList: gameState.monsters,
        itemList: gameState.itemList
      } : null);

      if (result.gameOver) {
        triggerVibration([200, 100, 200]);
        setTimeout(() => alert('게임오버: 이동 횟수를 모두 소진했습니다!'), 10);
      } else if (result.stageCleared) {
        triggerVibration([100, 50, 100, 50, 100]);
        setStage(prev => prev + 1);
        const newBoardState = generateBoardWithPathAndItemsAndMonster(stage + 1);
        setBoardState(newBoardState);
        setGameManager(new GameManager(newBoardState));
        setPlayer({ row: BOARD_SIZE - 1, col: 0 });
        setRemainStep(100);
        setTimeout(() => alert('클리어! 출구에 도착했습니다.'), 10);
      } else if (result.collision) {
        triggerVibration([150, 50, 150]);
      }
    } else {
      triggerVibration(25);
    }
  };

  // 공격 처리 함수
  const handleAttack = () => {
    if (!gameManager || remainStep < 5 || swinging) return;
    
    setSwinging(true);
    setSwingAngle(0);
    triggerVibration([80, 20, 80]);
    
    let angle = 0;
    const animationInterval = setInterval(() => {
      angle += 15;
      setSwingAngle(angle);
      
      if (angle >= 90) {
        clearInterval(animationInterval);
        setTimeout(() => {
          setSwinging(false);
          setSwingAngle(0);
        }, 100);
      }
    }, 50);
    
    const attacked = gameManager.handleAttack();
    const gameState = gameManager.getGameState();
    setRemainStep(gameState.remainStep);
    setBoardState(prev => prev ? {
      ...prev,
      board: gameState.board,
      monsterList: gameState.monsters
    } : null);
    
    if (attacked) {
      triggerVibration([120, 30, 120]);
    }
  };

  // 조이스틱 방향 버튼 처리 (단일 클릭만)
  const handleDirectionPress = (direction: string) => {
    handleMove(direction);
  };

  // 컴포넌트 언마운트 시 정리 (인터벌 관련 제거)
  useEffect(() => {
    return () => {
      // cleanup if needed
    };
  }, []);

  // 캔버스 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boardState) return;
    
    const boardWidth = cellSize * BOARD_SIZE;
    const boardHeight = cellSize * BOARD_SIZE;
    canvas.width = boardWidth;
    canvas.height = boardHeight;
    
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (boardState.board[row][col] === 1) {
          ctx.fillStyle = WALL_COLOR;
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        } else if (boardState.board[row][col] === 3) {
          ctx.fillStyle = ITEM_COLOR;
          ctx.beginPath();
          ctx.arc(
            col * cellSize + cellSize / 2,
            row * cellSize + cellSize / 2,
            cellSize / 3,
            0,
            2 * Math.PI,
          );
          ctx.fill();
        } else if (boardState.board[row][col] === 4) {
          ctx.fillStyle = MONSTER_COLOR;
          ctx.beginPath();
          ctx.arc(
            col * cellSize + cellSize / 2,
            row * cellSize + cellSize / 2,
            cellSize / 2.5,
            0,
            2 * Math.PI,
          );
          ctx.fill();
        }
      }
    }
    
    ctx.fillStyle = EXIT_COLOR;
    ctx.fillRect((BOARD_SIZE - 1) * cellSize, 0, cellSize, cellSize);
    
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i <= BOARD_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(boardWidth, i * cellSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, boardHeight);
      ctx.stroke();
    }
    
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(
      player.col * cellSize + cellSize / 2,
      player.row * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      2 * Math.PI,
    );
    ctx.fill();

    if (swinging) {
      ctx.save();
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = Math.max(6, cellSize / 6);
      ctx.lineCap = 'round';
      
      const centerX = player.col * cellSize + cellSize / 2;
      const centerY = player.row * cellSize + cellSize / 2;
      const stickLength = cellSize * 0.8;
      
      const angleRad = (swingAngle - 90) * Math.PI / 180;
      
      const endX = centerX + Math.cos(angleRad) * stickLength;
      const endY = centerY + Math.sin(angleRad) * stickLength;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      ctx.fillStyle = '#ffed4e';
      ctx.beginPath();
      ctx.arc(endX, endY, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.restore();
    }

    ctx.fillStyle = MONSTER_COLOR;
    for (const [mr, mc] of boardState.monsterList) {
      ctx.beginPath();
      ctx.arc(
        mc * cellSize + cellSize / 2,
        mr * cellSize + cellSize / 2,
        cellSize / 2.5,
        0,
        2 * Math.PI,
      );
      ctx.fill();
    }

    ctx.fillStyle = ITEM_COLOR;
    for (const [ir, ic] of boardState.itemList) {
      ctx.beginPath();
      ctx.arc(
        ic * cellSize + cellSize / 2,
        ir * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        2 * Math.PI,
      );
      ctx.fill();
    }
  }, [player, boardState, swinging, swingAngle, cellSize]);

  useEffect(() => {
    if (remainStep === 0) {
      alert('게임오버: 이동 횟수를 모두 소진했습니다!');
    }
  }, [remainStep]);

  if (!boardState) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>로딩중...</div>;
  }

  return (
    <main style={{ 
      padding: '10px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      maxWidth: '100vw',
      minHeight: '100vh',
      boxSizing: 'border-box',
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h1 style={{ 
        fontSize: cellSize < 40 ? '1.5rem' : '2rem',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        Floating Button Board Game
      </h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '15px',
        fontSize: cellSize < 40 ? '0.9rem' : '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div>STEPS: {remainStep}</div>
        <div>STAGE: {stage}</div>
      </div>
      
      <canvas
        ref={canvasRef}
        style={{ 
          border: '2px solid #333', 
          background: BOARD_COLOR,
          maxWidth: '100%',
          height: 'auto',
          touchAction: 'none',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      />

      {/* 조건부 렌더링: 웹이 아닌 경우에만 플로팅 버튼들 표시 */}
      {platform !== 'web' && (
        <>
          {/* 방향 패드 - 왼쪽 하단 */}
          <div style={{
            position: 'fixed',
            bottom: '30px',
            left: '30px',
            zIndex: 1000
          }}>
            <FloatingDPad 
              onDirectionPress={handleDirectionPress}
              size={cellSize < 40 ? 40 : 50}
              disabled={remainStep <= 0}
            />
          </div>

          {/* 공격 버튼 - 오른쪽 하단 */}
          <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000
          }}>
            <FloatingAttackButton
              onClick={handleAttack}
              disabled={remainStep < 5 || swinging}
              size={cellSize < 40 ? 60 : 80}
            />
          </div>
        </>
      )}

      {/* 설정 패널 */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        maxWidth: cellSize * BOARD_SIZE,
        width: '100%',
        marginBottom: platform !== 'web' ? '100px' : '20px' // 플로팅 버튼이 있을 때만 여백 추가
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '14px',
          cursor: 'pointer' 
        }}>
          <input
            type="checkbox"
            checked={vibrationEnabled}
            onChange={(e) => setVibrationEnabled(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          햅틱 피드백 활성화
        </label>
      </div>
      
      <div style={{ 
        maxWidth: cellSize * BOARD_SIZE,
        fontSize: cellSize < 40 ? '0.8rem' : '0.9rem',
        lineHeight: '1.4',
        textAlign: 'center',
        marginBottom: platform !== 'web' ? '100px' : '20px' // 플로팅 버튼이 있을 때만 여백 추가
      }}>
        <p>
          <strong>조작법:</strong>
        </p>
        {platform !== 'web' ? (
          <>
            <p>
              • 왼쪽 하단 방향 패드로 이동 (한 번 클릭 = 한 번 이동)
            </p>
            <p>
              • 오른쪽 하단 ⚔️ 버튼으로 공격 (5스텝 소모)
            </p>
            <p>
              • 각 방향 버튼을 개별적으로 터치하여 정확한 이동
            </p>
          </>
        ) : (
          <>
            <p>
              • 키보드 방향키 (↑↓←→)로 이동
            </p>
            <p>
              • Z키로 공격 (5스텝 소모)
            </p>
            <p>
              • 상단/우측상단/우측을 공격할 수 있습니다
            </p>
          </>
        )}
        <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '10px' }}>
          현재 플랫폼: {platform === 'webview' ? 'WebView' : platform === 'mobile' ? 'Mobile' : 'Web'}
        </p>
      </div>
    </main>
  );
}