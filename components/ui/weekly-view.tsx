'use client';

import { useRouter } from 'next/navigation';

interface Allocation {
  id: string;
  employee_name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
}

interface WeeklyViewProps {
  allocations: Allocation[];
}

export function WeeklyView({ allocations }: WeeklyViewProps) {
  const router = useRouter();

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  const weeks = Array.from({ length: 12 }).map((_, i) => {
    const now = new Date();
    now.setDate(now.getDate() - (i * 7));
    const { start: weekStart, end: weekEnd } = getWeekRange(now);
    
    const weekAllocations = allocations.filter(allocation => {
      const startDate = new Date(allocation.start_date);
      const endDate = new Date(allocation.end_date);
      return (startDate <= weekEnd && endDate >= weekStart);
    });

    return {
      weekStart,
      weekEnd,
      allocations: weekAllocations
    };
  }).reverse();

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <div className="space-y-6">
      {weeks.map(({ weekStart, weekEnd, allocations: weekAllocations }) => (
        <div key={weekStart.toISOString()} className="rounded-lg border p-4">
          <div className="font-semibold mb-3 text-lg">
            {formatDate(weekStart)} - {formatDate(weekEnd)}, {weekEnd.getFullYear()}
          </div>
          {weekAllocations.length > 0 ? (
            <div className="grid gap-2">
              {weekAllocations.map(allocation => (
                <div 
                  key={allocation.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => router.push(`/allocations/edit/${allocation.id}`)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{allocation.employee_name}</div>
                    <div className="text-sm text-muted-foreground">{allocation.project_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{allocation.allocation_percentage}%</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(new Date(allocation.start_date))} - {formatDate(new Date(allocation.end_date))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No allocations this week
            </div>
          )}
        </div>
      ))}
    </div>
  );
}