'use client';
import { Excalidraw } from '@excalidraw/excalidraw';
export default function ExcalidrawPage() {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Excalidraw Example</h1>
        <div style={{ height: '500px' }} className="custom-styles">
          <Excalidraw />
        </div>
    </div>
  );
}
