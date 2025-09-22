import React, { useMemo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { CheckCircle, XCircle, ArrowUp, ArrowDown, Move3D, Edit3, Save, X } from 'lucide-react';
import { useContainerStore } from '@/entities/container';

interface SelectedBoxDetailProps {
  onMoveToConveyor: (boxId: string) => void;
  onDropToBottom: (boxId: string) => void;
  onMoveToOtherPosition: (boxId: string, x: number, z: number) => void;
}

/**
 * 선택된 박스의 상세 정보와 액션 버튼을 표시하는 컴포넌트
 */
const SelectedBoxDetail: React.FC<SelectedBoxDetailProps> = ({
  onMoveToConveyor,
  onDropToBottom,
  onMoveToOtherPosition,
}) => {
  const selectedBoxId = useContainerStore((state) => state.selectedBoxId);
  const [isEditingSize, setIsEditingSize] = useState(false);
  const [isEditingRotation, setIsEditingRotation] = useState(false);
  const [editSize, setEditSize] = useState({ lenX: 2, lenY: 2, lenZ: 2 });
  const [editRotation, setEditRotation] = useState({ rotX: 0, rotY: 0, rotZ: 0 });
  
  // 선택된 박스 데이터 가져오기
  const selectedBox = useMemo(() => {
    if (!selectedBoxId) return null;
    return useContainerStore.getState().boxes.get(selectedBoxId);
  }, [selectedBoxId]);
  
  // 안정성 정보 계산
  const stabilityInfo = useMemo(() => {
    if (!selectedBox) return null;
    
    const { boxes } = useContainerStore.getState();
    const { BoxPhysics } = require('@/entities/box/model/physics');
    return BoxPhysics.checkBoxStability(
      selectedBox.x,
      selectedBox.y,
      selectedBox.z,
      selectedBox.lenX,
      selectedBox.lenY,
      selectedBox.lenZ,
      boxes,
      selectedBox.id
    );
  }, [selectedBox]);
  
  // 액션 핸들러들
  const handleMoveToConveyor = useCallback(() => {
    if (selectedBoxId) {
      onMoveToConveyor(selectedBoxId);
    }
  }, [selectedBoxId, onMoveToConveyor]);
  
  const handleDropToBottom = useCallback(() => {
    if (selectedBoxId) {
      onDropToBottom(selectedBoxId);
    }
  }, [selectedBoxId, onDropToBottom]);
  
  const handleMoveToPosition = useCallback((x: number, z: number) => {
    if (selectedBoxId) {
      onMoveToOtherPosition(selectedBoxId, x, z);
    }
  }, [selectedBoxId, onMoveToOtherPosition]);
  
  // 크기 편집 관련 핸들러들
  const handleStartEditSize = useCallback(() => {
    if (selectedBox) {
      setEditSize({
        lenX: selectedBox.lenX,
        lenY: selectedBox.lenY,
        lenZ: selectedBox.lenZ,
      });
      setIsEditingSize(true);
    }
  }, [selectedBox]);
  
  const handleSaveSize = useCallback(() => {
    if (selectedBoxId && editSize.lenX > 0 && editSize.lenY > 0 && editSize.lenZ > 0) {
      const { updateBoxDimensions } = useContainerStore.getState();
      updateBoxDimensions(selectedBoxId, editSize.lenX, editSize.lenY, editSize.lenZ);
      setIsEditingSize(false);
    }
  }, [selectedBoxId, editSize]);
  
  const handleCancelEditSize = useCallback(() => {
    setIsEditingSize(false);
  }, []);
  
  const handleSizeChange = useCallback((field: 'lenX' | 'lenY' | 'lenZ', value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditSize(prev => ({ ...prev, [field]: numValue }));
  }, []);
  
  // 회전 편집 관련 핸들러들
  const handleStartEditRotation = useCallback(() => {
    if (selectedBox) {
      setEditRotation({
        rotX: selectedBox.rotX || 0,
        rotY: selectedBox.rotY || 0,
        rotZ: selectedBox.rotZ || 0,
      });
      setIsEditingRotation(true);
    }
  }, [selectedBox]);
  
  const handleSaveRotation = useCallback(() => {
    if (selectedBoxId) {
      const { updateBoxRotation } = useContainerStore.getState();
      updateBoxRotation(selectedBoxId, editRotation.rotX, editRotation.rotY, editRotation.rotZ);
      setIsEditingRotation(false);
    }
  }, [selectedBoxId, editRotation]);
  
  const handleCancelEditRotation = useCallback(() => {
    setIsEditingRotation(false);
  }, []);
  
  const handleRotationChange = useCallback((field: 'rotX' | 'rotY' | 'rotZ', value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditRotation(prev => ({ ...prev, [field]: numValue }));
  }, []);
  
  if (!selectedBox) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-center text-gray-500 text-sm">
            박스를 선택하면 상세 정보가 표시됩니다
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
              style={{ backgroundColor: selectedBox.color }}
            />
            <span>{selectedBox.id}</span>
            {stabilityInfo && (
              stabilityInfo.isStable ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> :
                <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Badge variant={stabilityInfo?.isStable ? "default" : "destructive"}>
            {stabilityInfo?.isStable ? "안정" : "불안정"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* 박스 정보 */}
        <div className="space-y-3 text-xs">
          {/* 위치 정보 */}
          <div>
            <span className="text-gray-600">위치:</span>
            <div className="font-mono">({selectedBox.x}, {selectedBox.y}, {selectedBox.z})</div>
          </div>
          
          {/* 크기 정보 - 가로로 배치 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">크기:</span>
              {!isEditingSize && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEditSize}
                  className="h-5 w-5 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </div>
            {isEditingSize ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">X</Label>
                    <Input
                      type="number"
                      value={editSize.lenX}
                      onChange={(e) => handleSizeChange('lenX', e.target.value)}
                      className="h-8 text-sm"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Y</Label>
                    <Input
                      type="number"
                      value={editSize.lenY}
                      onChange={(e) => handleSizeChange('lenY', e.target.value)}
                      className="h-8 text-sm"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Z</Label>
                    <Input
                      type="number"
                      value={editSize.lenZ}
                      onChange={(e) => handleSizeChange('lenZ', e.target.value)}
                      className="h-8 text-sm"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveSize}
                    className="h-7 text-xs flex-1"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEditSize}
                    className="h-7 text-xs flex-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="font-mono">{selectedBox.lenX}×{selectedBox.lenY}×{selectedBox.lenZ}</div>
            )}
          </div>
          
          {/* 회전 정보 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">회전:</span>
              {!isEditingRotation && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEditRotation}
                  className="h-5 w-5 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </div>
            {isEditingRotation ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">X</Label>
                    <Input
                      type="number"
                      value={editRotation.rotX}
                      onChange={(e) => handleRotationChange('rotX', e.target.value)}
                      className="h-8 text-sm"
                      step="1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Y</Label>
                    <Input
                      type="number"
                      value={editRotation.rotY}
                      onChange={(e) => handleRotationChange('rotY', e.target.value)}
                      className="h-8 text-sm"
                      step="1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500">Z</Label>
                    <Input
                      type="number"
                      value={editRotation.rotZ}
                      onChange={(e) => handleRotationChange('rotZ', e.target.value)}
                      className="h-8 text-sm"
                      step="1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveRotation}
                    className="h-7 text-xs flex-1"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEditRotation}
                    className="h-7 text-xs flex-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="font-mono">
                X: {(selectedBox.rotX || 0).toFixed(0)}° | 
                Y: {(selectedBox.rotY || 0).toFixed(0)}° | 
                Z: {(selectedBox.rotZ || 0).toFixed(0)}°
              </div>
            )}
          </div>
          
          {/* 중심점 정보 */}
          {stabilityInfo && (
            <div>
              <span className="text-gray-600">중심점:</span>
              <div className="font-mono">
                ({stabilityInfo.centerX.toFixed(1)}, {stabilityInfo.centerZ.toFixed(1)})
              </div>
              {!stabilityInfo.isStable && stabilityInfo.reason === 'center_unsupported' && (
                <div className="text-red-500 text-xs mt-1">
                  ⚠️ 무게중심이 지지면 밖에 있음
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 액션 버튼들 */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">박스 조작</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMoveToConveyor}
              className="flex items-center gap-1 text-xs"
            >
              <ArrowUp className="h-3 w-3" />
              컨베이어
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDropToBottom}
              className="flex items-center gap-1 text-xs"
            >
              <ArrowDown className="h-3 w-3" />
              바닥으로
            </Button>
          </div>
          
          <div className="text-xs font-medium text-gray-700 mt-3">위치 이동</div>
          <div className="grid grid-cols-3 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMoveToPosition(5, 5)}
              className="text-xs"
            >
              (5,5)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMoveToPosition(10, 10)}
              className="text-xs"
            >
              (10,10)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMoveToPosition(15, 15)}
              className="text-xs"
            >
              (15,15)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(SelectedBoxDetail);
