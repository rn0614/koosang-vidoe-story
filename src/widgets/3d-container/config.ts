/**
 * 3D Container Widget 설정
 */
export const WIDGET_CONFIG = {
  // Canvas 설정
  canvas: {
    camera: {
      position: [20, 15, 20] as [number, number, number],
      fov: 75
    },
    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    style: {
      width: '100vw',
      height: '100dvh',
      touchAction: 'none' as const
    }
  },

  // 컨베이어 벨트 설정
  conveyor: {
    position: [0, 15, 0] as [number, number, number],
    size: {
      width: 20,
      height: 0.5,
      depth: 8
    },
    color: '#666666'
  },

  // 박스 기본 설정
  box: {
    defaultSize: {
      lenX: 2,
      lenY: 2,
      lenZ: 2
    },
    colors: [
      '#4299e1',
      '#48bb78',
      '#ed8936',
      '#9f7aea',
      '#f56565',
      '#38b2ac',
      '#d69e2e',
      '#e53e3e',
      '#805ad5',
      '#667eea',
      '#f093fb',
      '#4facfe',
    ]
  },

  // UI 패널 설정
  ui: {
    panel: {
      position: 'bottom-right' as const,
      width: 320,
      className: 'absolute bottom-4 right-4 w-80 bg-background/80 shadow-xl backdrop-blur-sm'
    },
    scrollArea: {
      mobileHeight: 'h-auto',
      desktopHeight: 'h-80'
    }
  },

  // 물리 시뮬레이션 설정
  physics: {
    minY: 2, // 바닥 레벨
    maxY: 50, // 최대 높이
    animationSpeed: 3, // 애니메이션 속도
    positionTolerance: 0.1 // 위치 허용 오차
  }
} as const;
