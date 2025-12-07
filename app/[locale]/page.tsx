import { redirect } from 'next/navigation';

export default function LocaleIndex({ params }: { params: { locale: string } }) {
  const { locale } = params;
  // Redirect canonical locale root to first paginated page (page 1)
  return redirect(`/${locale}/page/1`);
}
