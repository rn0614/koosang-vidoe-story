'use client';
import { useEffect, useRef, useState } from 'react';

const BOARD_SIZE = 10;
const CELL_SIZE = 60; // px
const PLAYER_COLOR = '#007bff';
const BOARD_COLOR = '#f5f5f5';
const GRID_COLOR = '#ccc';
const WALL_COLOR = '#222';
const EXIT_COLOR = '#2ecc40';
const ITEM_COLOR = '#ffd600';
const MONSTER_COLOR = '#e74c3c';
const WALL_PROB = 0.4; // 50% 확률로 벽 생성

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

export default function BoardGame() {
  const [boardState, setBoardState] = useState<{
    board: number[][];
    dist: number | null;
    monsterList: [number, number][];
    itemList: [number, number][];
  } | null>(null);
  const [player, setPlayer] = useState({ row: BOARD_SIZE - 1, col: 0 });
  const [remainStep, setRemainStep] = useState(100);
  const [stage, setStage] = useState(1);
  const [swinging, setSwinging] = useState(false); // 막대기 휘두르기 애니메이션 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setBoardState(generateBoardWithPathAndItemsAndMonster());
  }, []);

  // 플레이어 이동 및 몬스터 이동
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (remainStep <= 0 || !boardState) return;
      let { row, col } = player;
      let newRow = row,
        newCol = col;
      if (e.key === 'ArrowUp' && row > 0) newRow--;
      if (e.key === 'ArrowDown' && row < BOARD_SIZE - 1) newRow++;
      if (e.key === 'ArrowLeft' && col > 0) newCol--;
      if (e.key === 'ArrowRight' && col < BOARD_SIZE - 1) newCol++;
      const cellValue = boardState.board[newRow][newCol];
      // 벽이 아니면 이동
      if (cellValue !== 1 && (newRow !== row || newCol !== col)) {
        setPlayer({ row: newRow, col: newCol });
        // 아이템 먹기
        const isItem = boardState.itemList.some(([ir, ic]) => ir === newRow && ic === newCol);
        if (isItem) {
          setRemainStep((prev) => prev + 20);
          setBoardState(
            (prev) =>
              prev && {
                ...prev,
                itemList: prev.itemList.filter(([ir, ic]) => !(ir === newRow && ic === newCol)),
                board: prev.board.map((r, ri) =>
                  r.map((v, ci) => (ri === newRow && ci === newCol ? 0 : v)),
                ),
              },
          );
        } else {
          setRemainStep((prev) => {
            if (prev > 1) return prev - 1;
            if (prev === 1) {
              setTimeout(
                () => alert('게임오버: 이동 횟수를 모두 소진했습니다!'),
                10,
              );
              return 0;
            }
            return prev;
          });
        }
        // 몬스터 이동
        setBoardState((prev) => {
          if (!prev || !prev.monsterList) return prev;
          let newMonsterList: [number, number][] = [];
          let playerAttacked = false;
          let newBoard = prev.board.map((r) => [...r]);
          for (const [mr, mc] of prev.monsterList) {
            if (newBoard[mr][mc] !== 4) continue;
            if (mr === newRow && mc === newCol) {
              newMonsterList.push([mr, mc]);
              continue;
            }
            const bfsResult = bfs(newBoard, [mr, mc], [newRow, newCol]);
            if (!bfsResult || bfsResult.path.length < 2) {
              newMonsterList.push([mr, mc]);
              continue;
            }
            const [nextMr, nextMc] = bfsResult.path[1];
            newBoard[mr][mc] = 0;
            if (nextMr === newRow && nextMc === newCol) {
              playerAttacked = true;
              // 몬스터는 사라짐(추가 안함)
            } else {
              newBoard[nextMr][nextMc] = 4;
              newMonsterList.push([nextMr, nextMc]);
            }
          }
          if (playerAttacked) {
            setRemainStep((prevStep) => Math.max(prevStep - 30, 0));
          }
          return {
            ...prev,
            board: newBoard,
            monsterList: newMonsterList,
          };
        });
        // 출구 도달 체크
        if (newRow === 0 && newCol === BOARD_SIZE - 1) {
          setStage((prev) => prev + 1);
          setPlayer({ row: BOARD_SIZE - 1, col: 0 });
          setBoardState(generateBoardWithPathAndItemsAndMonster(stage + 1));
          setTimeout(() => alert('클리어! 출구에 도착했습니다.'), 10);
          return;
        }
      }
      if ((e.key === 'z' || e.key === 'Z') && !swinging) {
        if (remainStep < 5) return;
        const targets: [number, number][] = [
          [player.row - 1, player.col],     // 상단
          [player.row - 1, player.col + 1], // 상단우측
          [player.row, player.col + 1],     // 우측
        ];
        setBoardState((prev) => {
          if (!prev) return prev;
          let changed = false;
          const newBoard = prev.board.map((r, ri) =>
            r.map((v, ci) => {
              for (const [tr, tc] of targets) {
                if (ri === tr && ci === tc && v === 4) {
                  changed = true;
                  return 0;
                }
              }
              return v;
            }),
          );
          const newMonsterList = prev.monsterList.filter(
            ([mr, mc]) => !targets.some(([tr, tc]) => mr === tr && mc === tc),
          );
          return changed
            ? { ...prev, board: newBoard, monsterList: newMonsterList }
            : prev;
        });
        setRemainStep((prev) => prev - 5);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, boardState, remainStep, swinging]);

  // 몬스터와 플레이어가 겹쳤을 때 체력 감소 및 몬스터 제거
  useEffect(() => {
    if (!boardState || !boardState.monsterList?.length) return;
    let attacked = false;
    const newMonsterList = boardState.monsterList.filter(([mr, mc]) => {
      if (player.row === mr && player.col === mc) {
        attacked = true;
        return false; // 충돌한 몬스터는 제거
      }
      return true;
    });
    if (attacked) {
      setRemainStep((prev) => Math.max(prev - 30, 0));
      setBoardState(
        (prev) =>
          prev && {
            ...prev,
            board: prev.board.map((r, ri) =>
              r.map((v, ci) =>
                newMonsterList.some(([mr, mc]) => mr === ri && mc === ci)
                  ? 4
                  : v === 4
                  ? 0
                  : v,
              ),
            ),
            monsterList: newMonsterList,
          },
      );
    }
  }, [player, boardState]);

  // 캔버스에 보드, 벽, 플레이어, 출구, 아이템, 몬스터 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !boardState) return;
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, CELL_SIZE * BOARD_SIZE, CELL_SIZE * BOARD_SIZE);
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (boardState.board[row][col] === 1) {
          ctx.fillStyle = WALL_COLOR;
          ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (boardState.board[row][col] === 3) {
          ctx.fillStyle = ITEM_COLOR;
          ctx.beginPath();
          ctx.arc(
            col * CELL_SIZE + CELL_SIZE / 2,
            row * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 3,
            0,
            2 * Math.PI,
          );
          ctx.fill();
        } else if (boardState.board[row][col] === 4) {
          ctx.fillStyle = MONSTER_COLOR;
          ctx.beginPath();
          ctx.arc(
            col * CELL_SIZE + CELL_SIZE / 2,
            row * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2.5,
            0,
            2 * Math.PI,
          );
          ctx.fill();
        }
      }
    }
    ctx.fillStyle = EXIT_COLOR;
    ctx.fillRect((BOARD_SIZE - 1) * CELL_SIZE, 0, CELL_SIZE, CELL_SIZE);
    ctx.strokeStyle = GRID_COLOR;
    for (let i = 0; i <= BOARD_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CELL_SIZE * BOARD_SIZE, i * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CELL_SIZE * BOARD_SIZE);
      ctx.stroke();
    }
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(
      player.col * CELL_SIZE + CELL_SIZE / 2,
      player.row * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2.5,
      0,
      2 * Math.PI,
    );
    ctx.fill();

    // 막대기 이펙트 (플레이어~위칸)
    if (swinging) {
      ctx.save();
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = 8;
      ctx.beginPath();
      const sx = player.col * CELL_SIZE + CELL_SIZE / 2;
      const sy = player.row * CELL_SIZE + CELL_SIZE / 2;
      const ex = sx;
      const ey = sy - CELL_SIZE;
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    }

    // 몬스터 그리기
    ctx.fillStyle = MONSTER_COLOR;
    for (const [mr, mc] of boardState.monsterList) {
      ctx.beginPath();
      ctx.arc(
        mc * CELL_SIZE + CELL_SIZE / 2,
        mr * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2.5,
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
        ic * CELL_SIZE + CELL_SIZE / 2,
        ir * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3,
        0,
        2 * Math.PI,
      );
      ctx.fill();
    }
  }, [player, boardState, swinging]);

  // remainStep이 0이 되면 게임오버 알림
  useEffect(() => {
    if (remainStep === 0) {
      alert('게임오버: 이동 횟수를 모두 소진했습니다!');
    }
  }, [remainStep]);

  if (!boardState) {
    return <div>로딩중...</div>;
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Canvas Board Game</h1>
      <div>REMAIN_STEP: {remainStep}</div>
      <div>STAGE: {stage}</div>
      <canvas
        ref={canvasRef}
        width={CELL_SIZE * BOARD_SIZE}
        height={CELL_SIZE * BOARD_SIZE}
        style={{ border: '2px solid #333', background: BOARD_COLOR }}
      />
      <p>
        방향키로 파란 원(플레이어)을 이동하세요. 검은색은 벽, 노란색은 아이템,
        빨간색은 몬스터, 초록색은 출구입니다.
      </p>
      <p>
        z키로 막대기를 휘두르면 상단, 우측상단, 우측을 공격할 수 있습니다.
      </p>
    </main>
  );
}
