'use client';
import { useEffect, useRef, useState } from 'react';

const BOARD_SIZE = 10;
const BASE_CELL_SIZE = 60; // 기본 셀 크기
const MIN_CELL_SIZE = 30; // 최소 셀 크기
const PLAYER_COLOR = '#007bff';
const BOARD_COLOR = '#f5f5f5';
const GRID_COLOR = '#ccc';
const WALL_COLOR = '#222';
const EXIT_COLOR = '#2ecc40';
const ITEM_COLOR = '#ffd600';
const MONSTER_COLOR = '#e74c3c';
const WALL_PROB = 0.4; // 40% 확률로 벽 생성

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
      // 경로 추적용
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
  return null; // 경로 없음
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

  // 빈칸 수집
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
  // 아이템 배치
  let itemList: [number, number][] = [];
  let itemCount = Math.min(Math.floor(stage / 2) + 1, emptyCells.length);
  for (let i = 0; i < itemCount && emptyCells.length > 0; i++) {
    const idx = Math.floor(Math.random() * emptyCells.length);
    const [r, c] = emptyCells.splice(idx, 1)[0];
    itemList.push([r, c]);
    board[r][c] = 3;
  }
  // 몬스터 배치
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

// Player 객체
class Player {
  row: number;
  col: number;
  remainStep: number;

  constructor(row: number, col: number, remainStep: number = 100) {
    this.row = row;
    this.col = col;
    this.remainStep = remainStep;
  }

  // 플레이어 이동 시도
  tryMove(newRow: number, newCol: number, board: number[][]): boolean {
    // 범위 체크
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
      return false;
    }
    // 벽 체크
    if (board[newRow][newCol] === 1) {
      return false;
    }
    return true;
  }

  // 플레이어 이동 실행
  move(newRow: number, newCol: number): void {
    console.log(`Player moving from (${this.row}, ${this.col}) to (${newRow}, ${newCol})`);
    this.row = newRow;
    this.col = newCol;
  }

  // 아이템 획득
  collectItem(): void {
    console.log('Player collected item! +20 steps');
    this.remainStep += 20;
  }

  // 일반 이동 (스텝 소모)
  useStep(): boolean {
    if (this.remainStep > 1) {
      this.remainStep--;
      return true;
    } else if (this.remainStep === 1) {
      this.remainStep = 0;
      return false; // 게임오버
    }
    return false;
  }

  // 몬스터와 충돌 시 체력 감소
  takeDamage(): void {
    console.log('Player took damage! -30 steps');
    this.remainStep = Math.max(this.remainStep - 30, 0);
  }

  // 출구 도달 체크
  isAtExit(): boolean {
    return this.row === 0 && this.col === BOARD_SIZE - 1;
  }

  // 위치 반환
  getPosition(): [number, number] {
    return [this.row, this.col];
  }
}

// Monster 객체
class Monster {
  row: number;
  col: number;
  id: number;

  constructor(row: number, col: number, id: number) {
    this.row = row;
    this.col = col;
    this.id = id;
  }

  // 몬스터의 다음 이동 위치 계산
  calculateNextMove(board: number[][], playerPos: [number, number]): [number, number] | null {
    const bfsResult = bfs(board, [this.row, this.col], playerPos);
    if (!bfsResult || bfsResult.path.length < 2) {
      return null; // 이동할 수 없음
    }
    return bfsResult.path[1]; // 다음 위치
  }

  // 몬스터 이동 실행
  move(newRow: number, newCol: number): void {
    console.log(`Monster ${this.id} moving from (${this.row}, ${this.col}) to (${newRow}, ${newCol})`);
    this.row = newRow;
    this.col = newCol;
  }

  // 플레이어와 충돌 체크
  isCollidingWith(playerPos: [number, number]): boolean {
    return this.row === playerPos[0] && this.col === playerPos[1];
  }

  // 위치 반환
  getPosition(): [number, number] {
    return [this.row, this.col];
  }
}

// GameManager 객체
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

  // 플레이어 이동 처리
  handlePlayerMove(direction: string): { success: boolean; gameOver: boolean; stageCleared: boolean } {
    const { row, col } = this.player;
    let newRow = row, newCol = col;

    // 방향에 따른 새 위치 계산
    switch (direction) {
      case 'ArrowUp': if (row > 0) newRow--; break;
      case 'ArrowDown': if (row < BOARD_SIZE - 1) newRow++; break;
      case 'ArrowLeft': if (col > 0) newCol--; break;
      case 'ArrowRight': if (col < BOARD_SIZE - 1) newCol++; break;
      default: return { success: false, gameOver: false, stageCleared: false };
    }

    // 이동 가능 체크
    if (!this.player.tryMove(newRow, newCol, this.board)) {
      return { success: false, gameOver: false, stageCleared: false };
    }

    // 플레이어 이동 실행
    this.player.move(newRow, newCol);

    // 아이템 체크
    const itemIndex = this.itemList.findIndex(([ir, ic]) => ir === newRow && ic === newCol);
    if (itemIndex !== -1) {
      this.player.collectItem();
      this.itemList.splice(itemIndex, 1); // 아이템 제거
      this.board[newRow][newCol] = 0; // 보드에서 아이템 제거
    } else {
      // 일반 이동 시 스텝 소모
      if (!this.player.useStep()) {
        return { success: true, gameOver: true, stageCleared: false };
      }
    }

    // 출구 도달 체크
    if (this.player.isAtExit()) {
      return { success: true, gameOver: false, stageCleared: true };
    }

    return { success: true, gameOver: false, stageCleared: false };
  }

  // 몬스터 이동 처리
  handleMonsterMovement(): void {
    const playerPos = this.player.getPosition();
    const newMonsters: Monster[] = [];

    for (const monster of this.monsters) {
      // 보드에서 현재 몬스터 위치 제거
      this.board[monster.row][monster.col] = 0;

      // 다음 이동 위치 계산
      const nextPos = monster.calculateNextMove(this.board, playerPos);
      
      if (nextPos) {
        monster.move(nextPos[0], nextPos[1]);
        this.board[nextPos[0]][nextPos[1]] = 4; // 새 위치에 몬스터 배치
        newMonsters.push(monster);
      } else {
        // 이동할 수 없으면 제자리
        this.board[monster.row][monster.col] = 4;
        newMonsters.push(monster);
      }
    }

    this.monsters = newMonsters;
  }

  // 충돌 체크 및 처리
  handleCollisions(): boolean {
    const playerPos = this.player.getPosition();
    const collidingMonsters: Monster[] = [];

    // 충돌한 몬스터들 찾기
    for (const monster of this.monsters) {
      if (monster.isCollidingWith(playerPos)) {
        collidingMonsters.push(monster);
      }
    }

    if (collidingMonsters.length > 0) {
      console.log(`Collision detected with ${collidingMonsters.length} monster(s)`);
      
      // 플레이어 데미지
      this.player.takeDamage();

      // 충돌한 몬스터들 제거
      this.monsters = this.monsters.filter(monster => 
        !collidingMonsters.includes(monster)
      );

      // 보드에서 충돌한 몬스터들 제거
      for (const monster of collidingMonsters) {
        this.board[monster.row][monster.col] = 0;
      }

      return true; // 충돌 발생
    }

    return false; // 충돌 없음
  }

  // 전체 턴 처리
  processTurn(direction: string): { 
    success: boolean; 
    gameOver: boolean; 
    stageCleared: boolean; 
    collision: boolean;
  } {
    // 1. 플레이어 이동
    const playerResult = this.handlePlayerMove(direction);
    if (!playerResult.success || playerResult.gameOver || playerResult.stageCleared) {
      return { ...playerResult, collision: false };
    }

    // 2. 몬스터 이동
    this.handleMonsterMovement();

    // 3. 충돌 체크
    const collision = this.handleCollisions();

    return { 
      success: true, 
      gameOver: this.player.remainStep <= 0, 
      stageCleared: false,
      collision 
    };
  }

  // 공격 처리
  handleAttack(): boolean {
    if (this.player.remainStep < 5) return false;

    const playerPos = this.player.getPosition();
    const targets: [number, number][] = [
      [playerPos[0] - 1, playerPos[1]],     // 상단
      [playerPos[0] - 1, playerPos[1] + 1], // 상단우측
      [playerPos[0], playerPos[1] + 1],     // 우측
    ];

    let killedCount = 0;
    this.monsters = this.monsters.filter(monster => {
      const monsterPos = monster.getPosition();
      const isTarget = targets.some(([tr, tc]) => tr === monsterPos[0] && tc === monsterPos[1]);
      if (isTarget) {
        this.board[monsterPos[0]][monsterPos[1]] = 0; // 보드에서 제거
        killedCount++;
      }
      return !isTarget;
    });

    this.player.remainStep -= 5; // 공격 비용
    console.log(`Attack killed ${killedCount} monster(s)`);
    return killedCount > 0;
  }

  // 게임 상태 반환
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

export default function BoardGame() {
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
  const [swingAngle, setSwingAngle] = useState(0); // 0: 상단, 90: 우측
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 화면 크기에 따른 셀 크기 계산
  const calculateCellSize = () => {
    const screenWidth = window.innerWidth;
    const padding = 40; // 좌우 패딩
    const maxBoardWidth = screenWidth - padding;
    const calculatedCellSize = Math.floor(maxBoardWidth / BOARD_SIZE);
    
    // 최소/최대 크기 제한
    const newCellSize = Math.max(MIN_CELL_SIZE, Math.min(BASE_CELL_SIZE, calculatedCellSize));
    setCellSize(newCellSize);
  };

  // 초기 렌더링 및 화면 크기 변경 감지
  useEffect(() => {
    calculateCellSize();
    
    const handleResize = () => {
      calculateCellSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initialBoardState = generateBoardWithPathAndItemsAndMonster();
    setBoardState(initialBoardState);
    setGameManager(new GameManager(initialBoardState));
  }, []);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (!gameManager || remainStep <= 0) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const result = gameManager.processTurn(e.key);
        
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
            setTimeout(() => alert('게임오버: 이동 횟수를 모두 소진했습니다!'), 10);
          } else if (result.stageCleared) {
            setStage(prev => prev + 1);
            const newBoardState = generateBoardWithPathAndItemsAndMonster(stage + 1);
            setBoardState(newBoardState);
            setGameManager(new GameManager(newBoardState));
            setPlayer({ row: BOARD_SIZE - 1, col: 0 });
            setRemainStep(100);
            setTimeout(() => alert('클리어! 출구에 도착했습니다.'), 10);
          }
        }
      }

      if ((e.key === 'z' || e.key === 'Z') && !swinging) {
        // 스텝이 부족하면 공격 불가
        if (remainStep < 5) return;
        
        // UI 애니메이션 시작 (몬스터 유무와 관계없이)
        setSwinging(true);
        setSwingAngle(0);
        
        // 애니메이션 실행
        let angle = 0;
        const animationInterval = setInterval(() => {
          angle += 15; // 15도씩 증가
          setSwingAngle(angle);
          
          if (angle >= 90) { // 90도까지 회전
            clearInterval(animationInterval);
            setTimeout(() => {
              setSwinging(false);
              setSwingAngle(0);
            }, 100); // 잠깐 멈춘 후 애니메이션 종료
          }
        }, 50); // 50ms마다 업데이트
        
        // 게임 로직 처리 (몬스터 제거 및 스텝 소모)
        const attacked = gameManager.handleAttack();
        const gameState = gameManager.getGameState();
        setRemainStep(gameState.remainStep);
        setBoardState(prev => prev ? {
          ...prev,
          board: gameState.board,
          monsterList: gameState.monsters
        } : null);
        
        if (attacked) {
          console.log('Attack hit monster(s)!');
        } else {
          console.log('Attack missed - no monsters in range');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameManager, remainStep, swinging, stage]);

  // 캔버스에 보드, 벽, 플레이어, 출구, 아이템, 몬스터 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boardState) return;
    
    // 캔버스 크기 업데이트
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

    // 막대기 공격 애니메이션
    if (swinging) {
      ctx.save();
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = Math.max(6, cellSize / 6);
      ctx.lineCap = 'round';
      
      const centerX = player.col * cellSize + cellSize / 2;
      const centerY = player.row * cellSize + cellSize / 2;
      const stickLength = cellSize * 0.8;
      
      // 각도를 라디안으로 변환 (0도는 위쪽, 시계방향)
      const angleRad = (swingAngle - 90) * Math.PI / 180; // -90도 오프셋으로 위쪽이 0도가 되도록
      
      const endX = centerX + Math.cos(angleRad) * stickLength;
      const endY = centerY + Math.sin(angleRad) * stickLength;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // 막대기 끝에 작은 원 추가 (검의 끝 효과)
      ctx.fillStyle = '#ffed4e';
      ctx.beginPath();
      ctx.arc(endX, endY, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.restore();
    }

    // 몬스터 그리기
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

    // 아이템 그리기
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

  // remainStep이 0이 되면 게임오버 알림
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
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      maxWidth: '100vw',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ 
        fontSize: cellSize < 40 ? '1.5rem' : '2rem',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        Canvas Board Game
      </h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '15px',
        fontSize: cellSize < 40 ? '0.9rem' : '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div>REMAIN_STEP: {remainStep}</div>
        <div>STAGE: {stage}</div>
      </div>
      
      <canvas
        ref={canvasRef}
        style={{ 
          border: '2px solid #333', 
          background: BOARD_COLOR,
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      <div style={{ 
        marginTop: '15px', 
        maxWidth: cellSize * BOARD_SIZE,
        fontSize: cellSize < 40 ? '0.8rem' : '0.9rem',
        lineHeight: '1.4'
      }}>
        <p>
          방향키로 파란 원(플레이어)을 이동하세요. 검은색은 벽, 노란색은 아이템,
          빨간색은 몬스터, 초록색은 출구입니다.
        </p>
        <p>
          z키로 막대기를 휘두르면 상단, 우측상단, 우측을 공격할 수 있습니다.
        </p>
      </div>
    </main>
  );
}