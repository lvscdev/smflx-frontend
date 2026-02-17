'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { listActiveEvents, type Event as ApiEvent } from '@/lib/api';
import { toast } from 'sonner';

type Event = ApiEvent & {
  description?: string;
  location?: string;
  attendeeTypes?: string[];
  maxCapacity?: number;
  currentCapacity?: number;
  registrationOpen?: boolean;
};

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'teenagers' | 'adults' | 'children'>('all');

  useEffect(() => {
    void loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await listActiveEvents();

      setEvents((data ?? []) as Event[]);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (items: Event[]) => {
    if (filter === 'all') return items;

    const ageRangeMap: Record<typeof filter, string[]> = {
      teenagers: ['13-19'],
      adults: ['20-29', '30-39', '40+', '20-22'],
      children: ['0-12'],
    };

    const targetRanges = ageRangeMap[filter] || [];

    return items.filter((event) =>
      (event.ageRanges ?? []).some((range) => targetRanges.includes(range))
    );
  };

  const filteredEvents = filterEvents(events);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upcoming Events</h1>
          <p className="text-gray-600">Browse and register for upcoming SMFLX events</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            All Events
          </Button>
          <Button
            variant={filter === 'teenagers' ? 'default' : 'outline'}
            onClick={() => setFilter('teenagers')}
          >
            Teenagers (13-19)
          </Button>
          <Button variant={filter === 'adults' ? 'default' : 'outline'} onClick={() => setFilter('adults')}>
            Adults (20+)
          </Button>
          <Button
            variant={filter === 'children' ? 'default' : 'outline'}
            onClick={() => setFilter('children')}
          >
            Children (0-12)
          </Button>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' ? 'There are no events available at the moment.' : `No events available for ${filter}.`}
              </p>
              {filter !== 'all' && (
                <Button variant="outline" onClick={() => setFilter('all')}>
                  View All Events
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const start = event.startDate ? new Date(event.startDate) : null;
              const end = event.endDate ? new Date(event.endDate) : null;

              const registrationOpen =
                typeof event.registrationOpen === 'boolean'
                  ? event.registrationOpen
                  : (event.eventStatus ?? 'ACTIVE').toUpperCase() === 'ACTIVE';

              return (
                <Card key={event.eventId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{event.eventName}</CardTitle>
                      <Badge variant={registrationOpen ? 'default' : 'secondary'}>
                        {registrationOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    {event.description ? <CardDescription>{event.description}</CardDescription> : null}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(start || end) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {start ? start.toLocaleDateString() : '—'} - {end ? end.toLocaleDateString() : '—'}
                          </span>
                        </div>
                      )}

                      {event.location ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      ) : null}

                      {typeof event.currentCapacity === 'number' && typeof event.maxCapacity === 'number' ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.currentCapacity} / {event.maxCapacity} registered
                          </span>
                        </div>
                      ) : null}

                      {(event.ageRanges ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(event.ageRanges ?? []).map((range) => (
                            <Badge key={range} variant="outline" className="text-xs">
                              {range}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <Button
                      className="w-full mt-4"
                      disabled={!registrationOpen}
                      onClick={() => router.push(`/register?eventId=${event.eventId}`)}
                    >
                      {registrationOpen ? 'Register Now' : 'Registration Closed'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
