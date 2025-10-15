import * as React from "react"

import { cn } from "@/lib/utils"

const RadialChart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex aspect-square items-center justify-center",
      className
    )}
    {...props}
  />
))
RadialChart.displayName = "RadialChart"

const RadialChartContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex aspect-square items-center justify-center",
      className
    )}
    {...props}
  />
))
RadialChartContent.displayName = "RadialChartContent"

const RadialChartLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute inset-0 flex items-center justify-center text-center",
      className
    )}
    {...props}
  />
))
RadialChartLabel.displayName = "RadialChartLabel"

const RadialChartSector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    startAngle: number
    endAngle: number
    color?: string
  }
>(({ className, startAngle, endAngle, color = "hsl(var(--primary))", ...props }, ref) => {
  const size = 120
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (endAngle - startAngle) / 360 * circumference

  return (
    <div
      ref={ref}
      className={cn("absolute inset-0", className)}
      {...props}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ width: size, height: size }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
    </div>
  )
})
RadialChartSector.displayName = "RadialChartSector"

export { RadialChart, RadialChartContent, RadialChartLabel, RadialChartSector }
