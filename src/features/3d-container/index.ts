// ==========================================
// 3D Container Feature Exports
// ==========================================

// API
export { containerApi } from './api/containerApi';
export type { 
  Container3DData, 
  ObjectPositionData,
  boxDataToObjectPosition,
  objectPositionToBoxData 
} from './api/containerApi';

// Hooks
export { useContainerManager } from '@/features/3d-container/hooks/useContainerManager';
export { use3DContainer } from './hooks/use3DContainer';
export { useContainerQuery } from './hooks/useContainerQuery';

// Components (3D Scene Elements)
export {
  Lighting,
  GridFloor,
  CameraControls,
  ConveyorBelt,
} from './components';

// Main Components
export { default as ThreeDContainerMain } from './components/3d-container-main';
export { default as ThreeCanvas } from './components/canvas/3d-canvas';
export { default as ContainerInfoPanel } from './components/panels/container-info-panel';
export { default as BoxManagementPanel } from './components/panels/box-management-panel';

// ==========================================
// Legacy Compatibility (DEPRECATED)
// ==========================================
// These exports maintain backward compatibility with the old structure
// Use the new structure: entities/box, features/3d-container, widgets/3d-container

// Re-export from new structure for backward compatibility
export { useBoxStore as useBoxesStore } from '@/entities/box';
export { default as ThreeDContainer } from '@/widgets/3d-container';
