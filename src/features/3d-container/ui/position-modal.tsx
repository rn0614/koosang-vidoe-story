import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle, AlertTriangle, Move3D, Expand, Navigation } from 'lucide-react';
import { BoxData, BoxPosition, BoxOperations } from '@/entities/box';

interface PositionModalProps {
  box: BoxData | null;
  isOpen: boolean;
  onClose: () => void;
  onMove: (boxId: string, x: number, y: number, z: number, lenX: number, lenY: number, lenZ: number) => void;
  mode?: 'default' | 'move';
  onMoveToOtherPosition?: (boxId: string, x: number, z: number) => void;
}

interface ValidationResult {
  isValid: boolean;
  snappedPosition: BoxPosition;
  suggestedPosition?: BoxPosition;
  error: string;
}

/**
 * 개선된 위치 모달 컴포넌트
 * 비즈니스 로직을 BoxOperations로 위임
 */
const PositionModal: React.FC<PositionModalProps> = ({ 
  box, 
  isOpen, 
  onClose, 
  onMove, 
  mode = 'default', 
  onMoveToOtherPosition 
}) => {
  const [position, setPosition] = useState<BoxPosition>({ x: 0, y: 0, z: 0 });
  const [dimensions, setDimensions] = useState<{ lenX: number; lenY: number; lenZ: number }>({ lenX: 2, lenY: 2, lenZ: 2 });
  const [validationError, setValidationError] = useState<string>('');
  const [currentBox, setCurrentBox] = useState<BoxData | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ x: number; z: number }>({ x: 0, z: 0 });

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (box && isOpen) {
      setCurrentBox(box);
      setPosition({ x: box.x, y: box.y, z: box.z });
      setDimensions({ lenX: box.lenX, lenY: box.lenY, lenZ: box.lenZ });
      setValidationError('');
      setMoveTarget({ x: box.x, z: box.z });
    }
  }, [box?.id, isOpen]);

  // 위치 검증
  const validatePosition = useCallback((
    x: number, 
    y: number, 
    z: number, 
    lenX: number, 
    lenY: number, 
    lenZ: number
  ): ValidationResult => {
    const snapX = Math.round(x);
    const snapY = Math.round(y);
    const snapZ = Math.round(z);
    const minY = Math.max(2, lenY);
    
    if (snapY < minY) {
      return {
        isValid: false,
        snappedPosition: { x: snapX, y: snapY, z: snapZ },
        suggestedPosition: { x: snapX, y: minY, z: snapZ },
        error: `Y 좌표가 너무 낮습니다. 최소값: ${minY} (박스 하단이 바닥 레벨 2 이상이어야 함)`
      };
    }

    const validation = BoxOperations.validateBoxPosition(
      snapX, snapY, snapZ, lenX, lenY, lenZ, currentBox?.id
    );

    if (!validation.isValid) {
      return {
        isValid: false,
        snappedPosition: { x: snapX, y: snapY, z: snapZ },
        error: validation.message || '위치가 유효하지 않습니다.'
      };
    }

    return {
      isValid: true,
      snappedPosition: { x: snapX, y: snapY, z: snapZ },
      error: ''
    };
  }, [currentBox?.id]);

  // 이동 입력 변경 핸들러
  const handleMoveInputChange = useCallback((axis: 'x' | 'z', value: string): void => {
    setMoveTarget((prev) => ({ ...prev, [axis]: parseInt(value) || 0 }));
  }, []);

  // 시퀀셜 이동 제출
  const handleMoveSubmit = useCallback((): void => {
    if (!currentBox) return;
    
    const snapX = Math.round(moveTarget.x);
    const snapZ = Math.round(moveTarget.z);
    
    try {
      if (onMoveToOtherPosition) {
        onMoveToOtherPosition(currentBox.id, snapX, snapZ);
      } else {
        BoxOperations.moveBoxToPosition(currentBox.id, snapX, snapZ);
      }
      onClose();
    } catch (error) {
      console.error('Move failed:', error);
      setValidationError('이동에 실패했습니다.');
    }
  }, [currentBox, moveTarget, onMoveToOtherPosition, onClose]);

  // 기본 모달 제출
  const handleSubmit = useCallback((): void => {
    if (!currentBox) return;
    
    // mode==='move'일 때는 y를 무시하고 x, z만 사용
    if (mode === 'move') {
      const snapX = Math.round(position.x);
      const snapZ = Math.round(position.z);
      
      try {
        BoxOperations.moveBoxToPosition(currentBox.id, snapX, snapZ);
        onClose();
      } catch (error) {
        console.error('Move failed:', error);
        setValidationError('이동에 실패했습니다.');
      }
      return;
    }
    
    // 기존 위치/크기 이동
    const validation = validatePosition(
      position.x, position.y, position.z, 
      dimensions.lenX, dimensions.lenY, dimensions.lenZ
    );
    
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }
    
    const { x, y, z } = validation.snappedPosition;
    onMove(currentBox.id, x, y, z, dimensions.lenX, dimensions.lenY, dimensions.lenZ);
    onClose();
  }, [currentBox, mode, position, dimensions, validatePosition, onMove, onClose]);

  // 제안된 위치 사용
  const handleUseSuggested = useCallback((): void => {
    const validation = validatePosition(
      position.x, position.y, position.z, 
      dimensions.lenX, dimensions.lenY, dimensions.lenZ
    );
    
    if (!validation.isValid && validation.suggestedPosition) {
      setPosition(validation.suggestedPosition);
      setValidationError('');
    }
  }, [position, dimensions, validatePosition]);

  // 위치 변경 핸들러
  const handlePositionChange = useCallback((axis: keyof BoxPosition, value: string): void => {
    const newPos = { ...position, [axis]: parseFloat(value) || 0 };
    setPosition(newPos);
    
    const validation = validatePosition(
      newPos.x, newPos.y, newPos.z, 
      dimensions.lenX, dimensions.lenY, dimensions.lenZ
    );
    setValidationError(validation.error);
  }, [position, dimensions, validatePosition]);

  // 크기 변경 핸들러
  const handleDimensionChange = useCallback((axis: 'lenX' | 'lenY' | 'lenZ', value: string): void => {
    const newDim = { ...dimensions, [axis]: Math.max(1, parseFloat(value) || 1) };
    setDimensions(newDim);
    
    const validation = validatePosition(
      position.x, position.y, position.z, 
      newDim.lenX, newDim.lenY, newDim.lenZ
    );
    setValidationError(validation.error);
  }, [position, dimensions, validatePosition]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move3D className="h-5 w-5" />
            박스 위치 이동 - {currentBox?.id || 'Unknown'}
          </DialogTitle>
        </DialogHeader>
        
        {mode === 'move' ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">시퀀셜 이동 (컨베이어 → 목표 위치 → 드롭)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="move-x" className="text-xs">목표 X</Label>
                <Input
                  id="move-x"
                  type="number"
                  value={moveTarget.x}
                  onChange={(e) => handleMoveInputChange('x', e.target.value)}
                  step="1"
                />
              </div>
              <div>
                <Label htmlFor="move-z" className="text-xs">목표 Z</Label>
                <Input
                  id="move-z"
                  type="number"
                  value={moveTarget.z}
                  onChange={(e) => handleMoveInputChange('z', e.target.value)}
                  step="1"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleMoveSubmit} 
                className="flex-1"
              >
                <Navigation className="mr-2 h-4 w-4" />
                이동하기
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                우측 상단 꼭지점 기준으로 위치를 설정합니다. 박스는 해당 지점에서 (-lenX, -lenY, -lenZ) 방향으로 확장됩니다.<br />
                <strong>제약 조건:</strong> Y ≥ {Math.max(2, dimensions.lenY)} (바닥 레벨), X와 Z는 음수 가능
              </AlertDescription>
            </Alert>
            
            {validationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationError}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 ml-2"
                    onClick={handleUseSuggested}
                  >
                    제안된 위치 사용
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">위치 좌표 (우측 상단 꼭지점)</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="x-pos" className="text-xs">X</Label>
                    <Input
                      id="x-pos"
                      type="number"
                      value={position.x}
                      onChange={(e) => handlePositionChange('x', e.target.value)}
                      step="1"
                    />
                  </div>
                  {mode === 'default' && (
                    <div className="space-y-1">
                      <Label htmlFor="y-pos" className="text-xs">Y</Label>
                      <Input
                        id="y-pos"
                        type="number"
                        value={position.y}
                        onChange={(e) => handlePositionChange('y', e.target.value)}
                        step="1"
                        min={Math.max(2, dimensions.lenY)}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label htmlFor="z-pos" className="text-xs">Z</Label>
                    <Input
                      id="z-pos"
                      type="number"
                      value={position.z}
                      onChange={(e) => handlePositionChange('z', e.target.value)}
                      step="1"
                    />
                  </div>
                </div>
              </div>
              
              {mode === 'default' && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Expand className="h-4 w-4" />
                    박스 크기
                  </Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="space-y-1">
                      <Label htmlFor="len-x" className="text-xs">길이 X</Label>
                      <Input
                        id="len-x"
                        type="number"
                        value={dimensions.lenX}
                        onChange={(e) => handleDimensionChange('lenX', e.target.value)}
                        step="1"
                        min="1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="len-y" className="text-xs">높이 Y</Label>
                      <Input
                        id="len-y"
                        type="number"
                        value={dimensions.lenY}
                        onChange={(e) => handleDimensionChange('lenY', e.target.value)}
                        step="1"
                        min="1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="len-z" className="text-xs">깊이 Z</Label>
                      <Input
                        id="len-z"
                        type="number"
                        value={dimensions.lenZ}
                        onChange={(e) => handleDimensionChange('lenZ', e.target.value)}
                        step="1"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={!!validationError}
              >
                <Move3D className="mr-2 h-4 w-4" />
                이동하기
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                취소
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PositionModal;
