import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"

export function CarouselDemo() {
  return (
    <div className="w-full mx-auto px-4">
      <Carousel
        opts={{
          align: "start",
          loop: false,
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-mx-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem key={index} className="px-1 basis-[43%]">
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-0 overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=300&width=500&text=Image ${index + 1}`}
                    alt={`Slide ${index + 1}`}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center gap-2 mt-4">
          <CarouselPrevious className="relative static transform-none" />
          <CarouselNext className="relative static transform-none" />
        </div>
      </Carousel>
    </div>
  )
}
