export interface WebViewMessageOptions {
  href: string;
  navigationMode?: 'tab_switch' | 'push';
  isMainMenu?: boolean;
  type?: string;
}

export function sendWebViewMessage({
  href,
  navigationMode = 'push',
  isMainMenu = false,
  type = 'ROUTER_EVENT',
}: WebViewMessageOptions) {
  if (typeof window === 'undefined' || !window.ReactNativeWebView) return;
  const message = {
    type,
    data: href,
    navigationMode,
    isMainMenu,
  };
  window.ReactNativeWebView.postMessage(JSON.stringify(message));
}

export function isWebView() {
  return typeof window !== 'undefined' && !!window.ReactNativeWebView;
}

