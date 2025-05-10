import { CarouselDemo } from '@/components/mobile-carousel';
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <div>
      <CarouselDemo></CarouselDemo>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    </div>
  );
}
