// components/ui/chart.tsx
import type React from "react"

interface ChartProps {
  data: any[]
  index: string
  categories?: string[]
  category?: string
  colors: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  showAnimation?: boolean
  showTooltip?: boolean
}

export const BarChart: React.FC<ChartProps> = ({ data, index, categories, colors }) => {
  return <div>BarChart Placeholder</div>
}

export const LineChart: React.FC<ChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  yAxisWidth,
  showLegend,
  showXAxis,
  showYAxis,
  showGridLines,
}) => {
  return <div>LineChart Placeholder</div>
}

export const PieChart: React.FC<ChartProps> = ({
  data,
  index,
  category,
  colors,
  valueFormatter,
  showAnimation,
  showTooltip,
  showLegend,
}) => {
  return <div>PieChart Placeholder</div>
}
