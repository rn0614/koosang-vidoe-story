import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function convertBlobUrlToFile(blobUrl: string) {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const fileName = Math.random().toString(36).slice(2, 9);
  const minType = blob.type || 'application/octet-stream';
  const file = new File([blob], `${fileName}.${minType.split('/')[1]}`, {
    type: minType,
  });
  return file;
}

// 배열 → 객체(map) 변환 함수
export function arrayToMap<T extends { id: string }, K extends keyof T = 'id'>(
  arr: T[] = [],
  idKey?: K
): Record<string, T> {
  const key = (idKey ?? 'id') as K;
  return Object.fromEntries(arr.map((item) => [String(item[key]), item]));
}