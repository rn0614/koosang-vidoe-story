import React from 'react';

/**
 * YouTube 영상 임베드용 React 컴포넌트
 * @param {string} idOrUrl - YouTube 영상 ID 또는 전체 URL
 * @param {object} props - iframe에 전달할 추가 props(optional)
 * @returns JSX.Element
 */
export function renderYouTubeEmbed(idOrUrl: string, props?: React.IframeHTMLAttributes<HTMLIFrameElement>) {
  let videoId = idOrUrl;
  // URL이면 ID만 추출
  if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
    const match = videoId.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) videoId = match[1];
  }
  return (
    <iframe
      width={props?.width || 560}
      height={props?.height || 315}
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      {...props}
    />
  );
} 