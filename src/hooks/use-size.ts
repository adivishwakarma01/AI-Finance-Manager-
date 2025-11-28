import { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import '@/components/ui/image.css'

type Size = {
  width: number
  height: number
}

export const useSize = (ref: React.RefObject<HTMLElement>, threshold: number = 50): Size | null => {

  const [size, setSize] = useState<Size | null>(null)

  const updateSize = useCallback((newSize: Size): void => {
    if (!size) {
      setSize(newSize)
      return
    }

    const widthDiff = Math.abs(newSize.width - size.width)
    const heightDiff = Math.abs(newSize.height - size.height)

    if (widthDiff > threshold || heightDiff > threshold) {
      setSize(newSize)
    }
  }, [size, threshold])

  useLayoutEffect(() => {
      const el = ref.current
      if (el) {
          const { width, height } = el.getBoundingClientRect()
          updateSize({ width, height })
      }
  }, [ref, updateSize])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        updateSize({ width, height })
      }
    })

    resizeObserver.observe(el)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref, updateSize])

  return size
}
