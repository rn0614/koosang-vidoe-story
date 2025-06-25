import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"

export function CarouselDemo({images}: {images: {src: string, title: string, description: string}[]}) {
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
          {images.map((image, index) => (
            <CarouselItem key={index} className="px-1 basis-[47%] lg:basis-[33%]">
              <Card>
                <CardContent className="flex aspect-[9/16] items-center justify-center p-0 overflow-hidden relative">
                  <Image
                    src={image.src}
                    alt={`Slide ${index + 1}`}
                    fill
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
