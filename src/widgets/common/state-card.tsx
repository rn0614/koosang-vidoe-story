import { ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { ArrowUpRight } from "lucide-react"


interface StatCardProps {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    trend: "up" | "down";
}

export function StatCard({ title, value, description, icon, trend }: StatCardProps) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend === "up" ? (
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            )}
            {description}
          </p>
        </CardContent>
      </Card>
    )
  }
  