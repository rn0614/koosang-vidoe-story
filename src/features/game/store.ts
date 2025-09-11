import { create } from 'zustand'

interface PlayerState {
  position: {
    x: number
    y: number
    z: number
  }
  rotation: {
    x: number
    y: number
    z: number
  }
  velocity: {
    x: number
    y: number
    z: number
  }
  isJumping: boolean
  setPosition: (position: { x: number; y: number; z: number }) => void
  setRotation: (rotation: { x: number; y: number; z: number }) => void
  setVelocity: (velocity: { x: number; y: number; z: number }) => void
  setIsJumping: (isJumping: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  position: {
    x: 0,
    y: 10,
    z: 0,
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
  velocity: {
    x: 0,
    y: 0,
    z: 0,
  },
  isJumping: false,
  setPosition: (position) => set({ position }),
  setRotation: (rotation) => set({ rotation }),
  setVelocity: (velocity) => set({ velocity }),
  setIsJumping: (isJumping) => set({ isJumping }),
})) 