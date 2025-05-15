import { redirect } from '@/i18n/navigation';
export default async function Home({ params }: { params: { locale: string } }) {
  redirect({ href: '/dashboard', locale: params.locale });
}
