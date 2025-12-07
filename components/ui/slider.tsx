"use client"
import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

export interface RangeSliderProps extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'onValueChange' | 'value' | 'defaultValue'> {
  label?: string
  format?: (value:number) => string
  withInputs?: boolean
  minStepsBetweenThumbs?: number
  value: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value:number[]) => void
  onValueCommit?: (value:number[]) => void
}

export function RangeSlider({ className, label, format = v => v.toString(), withInputs=false, minStepsBetweenThumbs=0, value, min=0, max=100, step=1, onValueChange, onValueCommit, ...props }: RangeSliderProps) {
  const [values, setValues] = React.useState<number[]>(value || [min, max])

  React.useEffect(() => { setValues(value) }, [value])

  return (
    <div className={cn('w-full', className)}>
      {label && <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[10px] text-muted-foreground">{format(values[0])} – {format(values[1])}</span>
      </div>}
      <SliderPrimitive.Root
        {...props}
        min={min}
        max={max}
        step={step}
        className={cn('relative flex items-center select-none touch-none w-full h-5', props.disabled && 'opacity-50')}
        value={values}
        onValueChange={(v:number[]) => { setValues(v); onValueChange?.(v) }}
        onValueCommit={(v:number[]) => { onValueCommit?.(v) }}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
      >
        <SliderPrimitive.Track className="bg-secondary relative grow rounded-full h-1">
          <SliderPrimitive.Range className="absolute h-full bg-primary rounded-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block w-4 h-4 bg-background border border-primary rounded-full shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block w-4 h-4 bg-background border border-primary rounded-full shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50" />
      </SliderPrimitive.Root>
      {withInputs && (
        <div className="flex gap-2 mt-2">
          <input type="number" className="w-full h-8 rounded border bg-background px-2 text-xs" value={values[0]} onChange={e => {
            const v = Number(e.target.value)
            if (!Number.isNaN(v)) {
              const next = [Math.min(v, values[1]), values[1]]
              setValues(next)
              onValueChange?.(next)
            }
          }} />
          <input type="number" className="w-full h-8 rounded border bg-background px-2 text-xs" value={values[1]} onChange={e => {
            const v = Number(e.target.value)
            if (!Number.isNaN(v)) {
              const next = [values[0], Math.max(v, values[0])]
              setValues(next)
              onValueChange?.(next)
            }
          }} />
        </div>
      )}
    </div>
  )
}

export default RangeSlider
