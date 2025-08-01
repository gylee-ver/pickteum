import Image, { ImageProps } from 'next/image'
import { generateBlurDataURL } from '@/lib/utils'

interface SeoImageProps extends ImageProps {
  sizes?: string
}

export default function SeoImage({ 
  sizes = "(max-width: 768px) 80vw, 160px", 
  src, 
  alt,
  ...props 
}: SeoImageProps) {
  const blurDataURL = generateBlurDataURL(typeof src === 'string' ? src : null)

  return (
    <Image
      src={src}
      alt={alt || ""}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={blurDataURL}
      quality={85}
      {...props}
    />
  )
} 