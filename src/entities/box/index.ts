// 3D Box entity exports

// Types
export type { 
  BoxDimensions, 
  BoxBounds, 
  BoxData, 
  BoxMethods, 
  SupportingBox, 
  StabilityInfo, 
  BoxPosition 
} from './types';

// Model & Store
export { useBoxStore, boxActions } from './model/store';
export { BoxPhysics } from './model/physics';

// API Operations
export { BoxOperations } from './api/box-operations';

// Hooks
export { useBoxSelection, useBoxMovement, useBoxCreation } from './hooks';
