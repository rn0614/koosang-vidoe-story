import { redirect } from '@/shared/lib/i18n/navigation';
export default async function Home({ params }: { params: { locale: string } }) {
  redirect({ href: '/dashboard', locale: params.locale });
}
