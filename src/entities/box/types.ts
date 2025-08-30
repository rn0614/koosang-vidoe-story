import { RefObject } from 'react';

// 타입 정의
export type BoxDimensions = {
  x: number;
  y: number;
  z: number;
  lenX: number;
  lenY: number;
  lenZ: number;
};

export type BoxBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};

export type BoxData = BoxDimensions & {
  id: string;
  color: string;
  ref: RefObject<BoxMethods>;
};

export type BoxMethods = {
  moveToPosition: (x: number, y: number, z: number) => void;
  moveToConveyor: () => void;
  dropToBottom: () => void;
  moveToOtherPosition: (x: number, z: number) => Promise<void>;
};

export type SupportingBox = {
  id: string;
  centerSupported: boolean;
  overlapArea?: number;
  overlapPercentage?: number;
};

export type StabilityInfo = {
  isStable: boolean;
  reason: 'ground' | 'center_supported' | 'center_unsupported';
  supportingBoxes: SupportingBox[];
  centerX?: number;
  centerZ?: number;
  centerSupported?: boolean;
  supportPercentage?: number;
  totalSupportArea?: number;
  boxBottomArea?: number;
};

export type BoxPosition = {
  x: number;
  y: number;
  z: number;
}; 