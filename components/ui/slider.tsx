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

  // Follow the controlled value when the parent changes it (e.g. filters reset), adjusting state during render instead of in an effect
  const [syncedValue, setSyncedValue] = React.useState<number[]>(value)
  if (value[0] !== syncedValue[0] || value[1] !== syncedValue[1]) {
    setSyncedValue(value)
    setValues(value)
  }

  return (
    <div className={cn('w-full', className)}>
      {label && <div className="flex items-baseline justify-between mb-3">
        <span className="text-[13px] font-medium text-encre">{label}</span>
        <span className="text-[13px] text-pierre tabular">{format(values[0])} – {format(values[1])}</span>
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
        <SliderPrimitive.Track className="bg-trait relative grow h-px">
          <SliderPrimitive.Range className="absolute h-[2px] -top-[0.5px] bg-encre" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb aria-label={label ? `${label}, minimum` : 'Minimum'} className="block size-4 bg-papier border-2 border-encre rounded-full focus-visible:outline-2 focus-visible:outline-grenat focus-visible:outline-offset-2 disabled:opacity-50" />
        <SliderPrimitive.Thumb aria-label={label ? `${label}, maximum` : 'Maximum'} className="block size-4 bg-papier border-2 border-encre rounded-full focus-visible:outline-2 focus-visible:outline-grenat focus-visible:outline-offset-2 disabled:opacity-50" />
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
