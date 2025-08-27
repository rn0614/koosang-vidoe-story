import { ResponsiveAppLogo } from './responsive-app-logo';
import { detectPlatform } from '@/shared/lib/user-agent';

export async function AppLogo() {
  const platform = await detectPlatform();

  // 서버에서 모바일이면 아예 렌더하지 않음
  if (platform === 'mobile') return null;

  return <ResponsiveAppLogo />;
}
