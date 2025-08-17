import { useQuery } from "@tanstack/react-query";
import { EventWithDetails } from "@shared/mongodb-schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<EventWithDetails[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events?limit=2");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No upcoming events scheduled. Check back soon for new opportunities to connect with fellow alumni!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Join us for networking, learning, and celebration. Connect with fellow alumni and expand your professional network.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {events.map((event) => (
            <Card key={event._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                {event.featuredImage && (
                  <div className="md:w-1/3">
                    <img 
                      src={event.featuredImage} 
                      alt={event.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                )}
                <div className={`${event.featuredImage ? 'md:w-2/3' : 'w-full'} p-4 md:p-6`}>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      upcoming
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                    {event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}
                  </p>
                  
                  <div className="space-y-1 md:space-y-2 mb-3 md:mb-4 text-sm md:text-base">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{format(new Date(event.startDate), 'MMM dd, yyyy \'at\' h:mm a')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link href="/events">
                    <Button size="sm" className="w-full sm:w-auto">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/events">
            <Button size="lg">View All Events</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
