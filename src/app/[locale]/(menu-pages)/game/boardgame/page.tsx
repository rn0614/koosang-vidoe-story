"use client"
import { useState, useEffect } from 'react';

// 몬스터 시작 위치 상수
const MONSTER_START = { row: 0, col: 5 };

export default function Home() {
  // ## 1.보드 데이터
  // 1: 벽, 8: 출발, 9: 도착, 0: 빈 칸
  const boardData = [
    [1, 0, 0, 0, 0, 0, 9],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [8, 0, 0, 0, 0, 1, 0],
  ];

  // ## 2.플레이어와 막대 초기 상태
  // - 플레이어는 board[6][0]에 위치
  // - 막대는 길이 2이며, 초기엔 플레이어 위쪽에 위치하므로 offsets는 [{row: -1, col: 0}, {row: -2, col: 0}]
  const [player, setPlayer] = useState({ row: 6, col: 0 });
  const [stick, setStick] = useState({
    length: 2,
    offsets: [{ row: -1, col: 0 }, { row: -2, col: 0 }],
  });
  // 몬스터 추가 - 오른쪽 상단에서 시작
  const [monster, setMonster] = useState(MONSTER_START);

  // ## 3.유틸리티 함수
  // 3) 셀 유효성 검사: (row, col)이 보드 범위 내이고 벽(1)이 아니면 true
  const isValidCell = (row: number, col: number) => {
    return (
      row >= 0 &&
      row < boardData.length &&
      col >= 0 &&
      col < boardData[0].length &&
      boardData[row][col] !== 1
    );
  };

  // 4) 플레이어 기준 막대의 절대 위치 계산
  const getStickPositions = (playerPos: {row: number, col: number}, offsets: Array<{row: number, col: number}>) => {
    return offsets.map(off => ({
      row: playerPos.row + off.row,
      col: playerPos.col + off.col,
    }));
  };

  // ## 4.플레이어 이동 및 막대 회전 처리
  // 이동 시, 우선 현재 stick.offsets로 이동한 후 막대가 유효하지 않으면
  // "플레이어 이동방향의 반대쪽"으로 막대를 재배치함.
  // 예를 들어, 플레이어가 왼쪽으로 이동(dCol < 0)이면 stick이 오른쪽(즉, {row:0, col:1}부터)으로 배치됨.
  const movePlayer = (dRow: number, dCol: number) => {
    // 4-1) 새 플레이어 위치 계산
    const newPlayer = { row: player.row + dRow, col: player.col + dCol };

    // 플레이어는 벽을 통과할 수 없음
    if (!isValidCell(newPlayer.row, newPlayer.col)) {
      alert("플레이어 이동 불가: 벽이 있음");
      return;
    }

    // 4-2) 기존 offset 적용한 막대 위치 계산
    const intendedPositions = getStickPositions(newPlayer, stick.offsets);
    if (intendedPositions.every(pos => isValidCell(pos.row, pos.col))) {
      setPlayer(newPlayer);
      // 플레이어 이동 후 몬스터 이동
      moveMonster();
      return;
    }

    // 4-3) 플레이어 이동방향의 반대쪽으로 stick 재배치
    // - 만약 dRow가 있으면 (상/하 이동), 이동방향의 반대는 아래(플레이어가 위로 이동하면 stick 아래)
    // - 만약 dCol가 있으면 (좌/우 이동), 이동방향의 반대는 오른쪽(플레이어가 왼쪽으로 이동하면 stick 오른쪽)
    let newOffsets: Array<{row: number, col: number}> = [];
    if (dRow !== 0) {
      newOffsets = dRow < 0
        ? [{ row: 1, col: 0 }, { row: 2, col: 0 }]   // 플레이어가 위로 이동하면 stick은 아래에
        : [{ row: -1, col: 0 }, { row: -2, col: 0 }]; // 플레이어가 아래로 이동하면 stick은 위에
    } else if (dCol !== 0) {
      newOffsets = dCol < 0
        ? [{ row: 0, col: 1 }, { row: 0, col: 2 }]   // 플레이어가 왼쪽으로 이동하면 stick은 오른쪽에
        : [{ row: 0, col: -1 }, { row: 0, col: -2 }]; // 플레이어가 오른쪽으로 이동하면 stick은 왼쪽에
    }

    // 4-4) 새 offset 적용 후 stick 위치 계산 및 유효성 검사
    const newStickPositions = getStickPositions(newPlayer, newOffsets);
    if (newStickPositions.every(pos => isValidCell(pos.row, pos.col))) {
      setPlayer(newPlayer);
      setStick(prev => ({ ...prev, offsets: newOffsets }));
      // 플레이어 이동 후 몬스터 이동
      moveMonster();
      return;
    }

    alert("이동 불가: 플레이어나 막대가 벽과 충돌");
  };

  // 몬스터가 플레이어를 향해 한 칸씩 이동하는 함수
  const moveMonster = () => {
    const { row: monsterRow, col: monsterCol } = monster;
    const { row: playerRow, col: playerCol } = player;
    
    // 몬스터와 플레이어의 상대적 위치 계산
    const rowDiff = playerRow - monsterRow;
    const colDiff = playerCol - monsterCol;
    
    // 현재 막대 위치 계산
    const stickPositions = getStickPositions(player, stick.offsets);
    
    // 몬스터가 막대에 닿았는지 확인
    const touchingStick = stickPositions.some(
      pos => pos.row === monsterRow && pos.col === monsterCol
    );
    
    // 몬스터가 막대에 닿으면 몬스터를 없애고 다시 시작 위치로 이동
    if (touchingStick) {
      setMonster(MONSTER_START);
      return;
    }
    
    // 수평/수직 중 플레이어와 더 멀리 떨어진 방향으로 이동
    let newRow = monsterRow;
    let newCol = monsterCol;
    
    if (touchingStick) {
      // 막대에 닿았을 경우, 플레이어로부터 1칸 멀어짐
      if (Math.abs(rowDiff) > Math.abs(colDiff)) {
        // 수직 방향으로 이동 (반대 방향)
        newRow += rowDiff > 0 ? -1 : (rowDiff < 0 ? 1 : 0);
      } else {
        // 수평 방향으로 이동 (반대 방향)
        newCol += colDiff > 0 ? -1 : (colDiff < 0 ? 1 : 0);
      }
    } else {
      // 일반적인 경우, 플레이어를 향해 이동
      if (Math.abs(rowDiff) > Math.abs(colDiff)) {
        // 수직 방향으로 이동
        newRow += rowDiff > 0 ? 1 : (rowDiff < 0 ? -1 : 0);
      } else {
        // 수평 방향으로 이동
        newCol += colDiff > 0 ? 1 : (colDiff < 0 ? -1 : 0);
      }
    }
    
    // 벽이 아니면 이동
    if (isValidCell(newRow, newCol)) {
      setMonster({ row: newRow, col: newCol });
    } else {
      // 벽이면 다른 방향으로 시도
      if (touchingStick) {
        // 막대에 닿았을 경우 (반대 방향 이동 시도)
        if (Math.abs(rowDiff) > Math.abs(colDiff)) {
          // 수평 이동 시도 (반대 방향)
          newRow = monsterRow;
          newCol = monsterCol + (colDiff > 0 ? -1 : (colDiff < 0 ? 1 : 0));
        } else {
          // 수직 이동 시도 (반대 방향)
          newRow = monsterRow + (rowDiff > 0 ? -1 : (rowDiff < 0 ? 1 : 0));
          newCol = monsterCol;
        }
      } else {
        // 일반적인 경우
        if (Math.abs(rowDiff) > Math.abs(colDiff)) {
          // 수평 이동 시도
          newRow = monsterRow;
          newCol = monsterCol + (colDiff > 0 ? 1 : (colDiff < 0 ? -1 : 0));
        } else {
          // 수직 이동 시도
          newRow = monsterRow + (rowDiff > 0 ? 1 : (rowDiff < 0 ? -1 : 0));
          newCol = monsterCol;
        }
      }
      
      if (isValidCell(newRow, newCol)) {
        setMonster({ row: newRow, col: newCol });
      }
    }

    // 몬스터와 플레이어가 충돌했는지 확인
    if (newRow === playerRow && newCol === playerCol) {
      alert("몬스터에게 잡혔습니다!");
      // 게임 재시작 또는 다른 처리를 추가할 수 있음
    }
  };

  // ## 5.현재 상태를 보드에 오버레이하여 계산
  const computeDisplayBoard = () => {
    // 숫자와 문자열이 모두 포함될 수 있는 타입 정의
    type CellType = number | string;
    const display: CellType[][] = boardData.map(row => [...row]);
    
    // 플레이어 오버레이 ('P')
    display[player.row][player.col] = 'P';
    
    // 몬스터 오버레이 ('M')
    display[monster.row][monster.col] = 'M';
    
    // stick 오버레이 ('S')
    const stickPositions = getStickPositions(player, stick.offsets);
    stickPositions.forEach(pos => {
      display[pos.row][pos.col] = 'S';
    });
    
    return display;
  };

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          movePlayer(-1, 0);
          break;
        case 'ArrowDown':
          movePlayer(1, 0);
          break;
        case 'ArrowLeft':
          movePlayer(0, -1);
          break;
        case 'ArrowRight':
          movePlayer(0, 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // 클린업 함수
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [player, stick]); // player와 stick이 변경될 때마다 이벤트 리스너 갱신

  const displayBoard = computeDisplayBoard();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* ## 1. 게임 보드 */}
      <h2>1. 게임 보드</h2>
      <div style={{ marginBottom: '20px' }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {displayBoard.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      width: '40px',
                      height: '40px',
                      textAlign: 'center',
                      border: '1px solid #333',
                      backgroundColor:
                        boardData[rowIndex][colIndex] === 1 ? '#ccc' : '#fff',
                    }}
                  >
                    {cell === 1
                      ? '🧱'
                      : cell === 8
                      ? '출발'
                      : cell === 9
                      ? '도착'
                      : cell === 'P'
                      ? '😀'
                      : cell === 'M'
                      ? '👹'
                      : cell === 'S'
                      ? '🟩'
                      : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ## 2. 플레이어 이동 */}
      <h2>2. 플레이어 이동</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button onClick={() => movePlayer(-1, 0)}>위</button>
        <button onClick={() => movePlayer(1, 0)}>아래</button>
        <button onClick={() => movePlayer(0, -1)}>왼쪽</button>
        <button onClick={() => movePlayer(0, 1)}>오른쪽</button>
      </div>
      <p>플레이어는 😀, 막대는 🟩, 벽은 🧱로 표시됩니다.</p>
      <p>방향키를 눌러서 플레이어를 움직일 수 있습니다.</p>
      <p>몬스터(👹)가 플레이어를 향해 다가옵니다!</p>
    </div>
  );
}
