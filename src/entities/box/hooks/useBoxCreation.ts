import { useCallback, useState } from 'react';
import { BoxOperations } from '../index';

/**
 * 박스 생성 관련 로직을 관리하는 커스텀 훅
 */
export const useBoxCreation = () => {
  const [nextBoxId, setNextBoxId] = useState<number>(10);
  
  // 랜덤 색상 생성
  const generateRandomColor = useCallback((): string => {
    const colors = [
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
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);
  
  // 새 박스 추가
  const addNewBox = useCallback(() => {
    try {
      const newBox = BoxOperations.addNewBox(nextBoxId, generateRandomColor);
      setNextBoxId((prev) => prev + 1);
      console.log(`✅ 새 박스 추가 완료: ${newBox.id}`);
      return newBox;
    } catch (error) {
      console.error('Failed to add new box:', error);
      throw error;
    }
  }, [nextBoxId, generateRandomColor]);
  
  return {
    addNewBox,
    nextBoxId,
    generateRandomColor
  };
};