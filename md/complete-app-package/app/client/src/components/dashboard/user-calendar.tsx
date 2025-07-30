import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { format, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/lib/auth";

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: 'reminder' | 'deadline' | 'meeting' | 'task';
  description?: string;
  tenderId?: number;
  tenderTitle?: string;
  tenderReferenceNo?: string;
  bidExpiryDate?: Date;
}

export function UserCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { user } = useUser();

  // Fetch reminders and events for the current month
  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events", format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const response = await fetch(`/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch activity dates for the current month (dates with reminders)
  const { data: activityDates = [] } = useQuery<string[]>({
    queryKey: ["/api/dashboard/activity-dates", user?.id, currentMonth.getTime()],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const params = new URLSearchParams({
        userId: user.id.toString(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      const response = await fetch(`/api/dashboard/activity-dates?${params}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id
  });

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-blue-500';
      case 'deadline': return 'bg-red-500';
      case 'meeting': return 'bg-green-500';
      case 'task': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'meeting': return 'bg-green-100 text-green-800';
      case 'task': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const dayHasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const dayHasActivities = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return activityDates.includes(dateStr);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-purple-600" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar - Takes up 2/3 of the space */}
          <div className="lg:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-lg border w-full bg-white"
              classNames={{
                day: "h-10 w-10 p-0 font-normal text-gray-900 hover:bg-blue-50 transition-colors",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                day_today: "bg-blue-100 text-blue-900 font-semibold border-2 border-blue-300",
                day_outside: "text-gray-400",
                head_cell: "text-gray-600 font-medium text-sm p-2",
                caption_label: "text-lg font-semibold text-gray-900",
                nav_button: "h-9 w-9 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
              }}
              modifiers={{
                hasEvents: (date) => dayHasEvents(date),
                hasActivities: (date) => dayHasActivities(date)
              }}
              modifiersClassNames={{
                hasEvents: "relative ring-2 ring-blue-200",
                hasActivities: "relative"
              }}
              components={{
                Day: ({ date, ...props }) => {
                  const dayEvents = getEventsForDate(date);
                  const hasReminderActivities = dayHasActivities(date);
                  return (
                    <div className="relative">
                      <div {...props} />
                      
                      {/* Activity reminder dot - purple dot for days with reminders */}
                      {hasReminderActivities && (
                        <div className="absolute top-0.5 right-0.5">
                          <div className="w-2 h-2 rounded-full bg-purple-500 border border-white shadow-sm" />
                        </div>
                      )}
                      
                      {/* Event dots at bottom */}
                      {dayEvents.length > 0 && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {dayEvents.slice(0, 2).map((event, index) => (
                            <div
                              key={index}
                              className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(event.type)}`}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          )}
                        </div>
                      )}
                      
                      {/* Purple dash underline for activity highlighting */}
                      {hasReminderActivities && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-purple-600" />
                      )}
                    </div>
                  );
                }
              }}
            />
          </div>

          {/* Events List - Takes up 1/3 of the space */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg border p-4 h-full">
              <h4 className="font-medium text-sm text-gray-700 mb-3">
                {selectedDate ? format(selectedDate, "MMM d") : "Select Date"}
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border-l-4 border-blue-500 shadow-sm"
                    >
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      {event.description && (
                        <div className="text-xs text-gray-600 mt-1">{event.description}</div>
                      )}
                      {event.tenderReferenceNo && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">{event.tenderReferenceNo}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 text-sm py-8">
                    {selectedDate ? "No events" : "Select a date"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Simple Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Reminders</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Deadlines</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Meetings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}