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

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
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
                <div className={`${event.featuredImage ? 'md:w-2/3' : 'w-full'} p-4 sm:p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">
                      {event.category}
                    </Badge>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(event.startDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{format(new Date(event.startDate), 'EEEE, MMMM dd, yyyy \'at\' h:mm a')}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>

                  </div>
                  
                  <Link href="/events">
                    <Button className="bg-secondary-600 hover:bg-secondary-700">
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
