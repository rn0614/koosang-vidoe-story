'use client';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

export default function Test2PageClient() {
  return (
    <div>
      <h1>Test2Page</h1>
      <div style={{ maxWidth: 640 }}>
        <ReactPlayer
          url="https://www.youtube.com/watch?v=507NGw_EVXk"
          controls
          width="100%"
        />
      </div>
      <button onClick={() => {
        fetch('/api/crawl-tech-news', {
          method: 'POST',
        })
      }}>
        crawl
      </button>
    </div>
  );
}
