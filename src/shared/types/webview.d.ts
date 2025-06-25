// types/webview.d.ts
export {};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

// WebView 메시지 타입도 함께 정의
export interface WebViewMessage {
  type: string;
  data: any;
  [key: string]: any;
}