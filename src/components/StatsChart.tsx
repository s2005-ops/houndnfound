import React from 'react';
import { LostItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface StatsChartProps {
  items: LostItem[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ items }) => {
  // Generate data for the last 6 months
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5); // 5 months ago + current month = 6 months
  
  const months = eachMonthOfInterval({
    start: startOfMonth(sixMonthsAgo),
    end: endOfMonth(now)
  });

  const chartData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const itemsInMonth = items.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= monthStart && itemDate <= monthEnd;
    });

    return {
      month: format(month, 'MMM yyyy'),
      items: itemsInMonth.length,
      collected: itemsInMonth.filter(item => item.status === 'collected').length,
      available: itemsInMonth.filter(item => item.status === 'available').length,
      archived: itemsInMonth.filter(item => item.status === 'archived').length
    };
  });

  const totalThisMonth = chartData[chartData.length - 1]?.items || 0;
  const totalLastMonth = chartData[chartData.length - 2]?.items || 0;
  const changeFromLastMonth = totalLastMonth === 0 ? 100 : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lost Items Statistics</CardTitle>
        <CardDescription>
          Monthly overview of lost items reported in the last 6 months
        </CardDescription>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Total Items</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Collected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Archived</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{totalThisMonth}</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {changeFromLastMonth > 0 ? '+' : ''}{changeFromLastMonth.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">vs Last Month</div>
          </div>
        </div>
        
        <div className="h-[300px] bg-muted/20 rounded-lg p-4">
          <div className="text-center text-muted-foreground">
            <div className="text-lg font-medium mb-2">Monthly Statistics</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {chartData.map((month, index) => (
                <div key={index} className="bg-background p-3 rounded">
                  <div className="text-sm font-medium">{month.month}</div>
                  <div className="text-2xl font-bold text-primary">{month.items}</div>
                  <div className="text-xs text-muted-foreground">
                    {month.collected} collected
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};