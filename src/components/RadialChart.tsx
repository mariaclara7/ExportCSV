import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadialChart, RadialChartContent, RadialChartLabel, RadialChartSector } from '@/components/ui/radial-chart';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RadialChartProps {
  title: string;
  description: string;
  value: number;
  total: number;
  color?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function RadialChartComponent({ 
  title, 
  description, 
  value, 
  total, 
  color = "hsl(var(--primary))",
  trend,
  className 
}: RadialChartProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const endAngle = (percentage / 100) * 360;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{value.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">/ {total.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {percentage.toFixed(1)}% completo
              </span>
              {trend && (
                <Badge 
                  variant={trend.value >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {trend.value >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {trend.label}
                </Badge>
              )}
            </div>
          </div>
          <div className="relative">
            <RadialChart className="h-24 w-24">
              <RadialChartContent>
                <RadialChartSector
                  startAngle={0}
                  endAngle={endAngle}
                  color={color}
                />
                <RadialChartLabel className="text-xs font-medium">
                  {percentage.toFixed(0)}%
                </RadialChartLabel>
              </RadialChartContent>
            </RadialChart>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
