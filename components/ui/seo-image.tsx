import Image, { ImageProps } from 'next/image'

interface SeoImageProps extends ImageProps {
  sizes?: string
}

export default function SeoImage({ sizes = "(max-width: 768px) 80vw, 160px", ...props }: SeoImageProps) {
  return (
    <Image
      sizes={sizes}
      placeholder="empty"
      {...props}
    />
  )
} 