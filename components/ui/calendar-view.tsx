'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths } from 'date-fns';
import { cn } from '@/utils/cn';

interface AllocationData {
  id: string;
  employee_id: string;
  employee_name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
}

interface CalendarViewProps {
  allocations: AllocationData[];
}

interface EmployeeAllocation {
  employee_id: string;
  employee_name: string;
  total_percentage: number;
  allocations: AllocationData[];
}

export function CalendarView({ allocations }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getAllocationsForDate = (date: Date) => {
    // Get all allocations for this date
    const dayAllocations = allocations.filter(allocation => {
      const startDate = new Date(allocation.start_date);
      const endDate = new Date(allocation.end_date);
      return date >= startDate && date <= endDate;
    });

    // Group allocations by employee
    const employeeAllocations = dayAllocations.reduce((acc, allocation) => {
      const existing = acc.find(ea => ea.employee_id === allocation.employee_id);
      if (existing) {
        existing.total_percentage += allocation.allocation_percentage;
        existing.allocations.push(allocation);
      } else {
        acc.push({
          employee_id: allocation.employee_id,
          employee_name: allocation.employee_name,
          total_percentage: allocation.allocation_percentage,
          allocations: [allocation]
        });
      }
      return acc;
    }, [] as EmployeeAllocation[]);

    return employeeAllocations;
  };

  const getAllocationColor = (percentage: number) => {
    if (percentage > 100) return "bg-red-100 dark:bg-red-900/20";
    if (percentage === 100) return "bg-green-100 dark:bg-green-900/20";
    return "bg-yellow-100 dark:bg-yellow-900/20";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold bg-muted">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((day) => {
          const employeeAllocations = getAllocationsForDate(day);

          return (
            <div
              key={day.toISOString()}
              className="min-h-[120px] p-2 border dark:border-gray-700 bg-card"
            >
              <div className="font-medium">{format(day, 'd')}</div>
              <div className="space-y-1 mt-1">
                {employeeAllocations.map((empAllocation) => (
                  <div
                    key={empAllocation.employee_id}
                    className={cn(
                      "text-xs p-1 rounded border dark:border-gray-700 shadow-sm",
                      getAllocationColor(empAllocation.total_percentage)
                    )}
                    title={`${empAllocation.employee_name} - Total: ${empAllocation.total_percentage}%`}
                  >
                    <div className="font-medium">{empAllocation.employee_name}</div>
                    <div className="text-muted-foreground">
                      {empAllocation.allocations.map(a => (
                        <div key={a.id} className="truncate">
                          {a.project_name} ({a.allocation_percentage}%)
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 border dark:border-gray-700"></div>
          <span>100% Allocated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/20 border dark:border-gray-700"></div>
          <span>Partially Allocated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/20 border dark:border-gray-700"></div>
          <span>Over Allocated</span>
        </div>
      </div>
    </div>
  );
} 