import { forwardRef, type ImgHTMLAttributes } from 'react'
import './image.css'

export type ImageProps = ImgHTMLAttributes<HTMLImageElement>

export const Image = forwardRef<HTMLImageElement, ImageProps>(({ src, alt, ...props }, ref) => {
  if (!src) {
    return <div data-empty-image ref={ref} {...props} />
  }

  return <img ref={ref} src={src} alt={alt} {...props} />
})
Image.displayName = 'Image'
