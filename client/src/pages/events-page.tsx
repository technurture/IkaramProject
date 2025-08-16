import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EventWithDetails } from "@shared/schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Plus } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<EventWithDetails[]>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events?limit=50");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("POST", `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Successfully registered for the event!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  const handleRegister = (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(eventId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Alumni Events</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us for networking, learning, and celebration. Connect with fellow alumni and expand your professional network.
          </p>
        </div>

        {/* Create Event Button for Admins */}
        {user?.role === 'admin' && (
          <div className="mb-8">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="md:flex">
                  <div className="md:w-1/3 h-48 bg-gray-200"></div>
                  <div className="md:w-2/3 p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No events scheduled</h2>
            <p className="text-gray-600 mb-6">
              Check back soon for new opportunities to connect with fellow alumni!
            </p>
            {user?.role === 'admin' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create the First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                  <div className={`${event.featuredImage ? 'md:w-2/3' : 'w-full'} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">
                        {event.category}
                      </Badge>
                      <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(event.startDate), 'EEEE, MMMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(event.startDate), 'h:mm a')}
                          {event.endDate && ` - ${format(new Date(event.endDate), 'h:mm a')}`}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {event._count.registrations} attending
                          {event.maxAttendees && ` / ${event.maxAttendees} max`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {event.status === 'upcoming' && (
                        <Button
                          className="bg-secondary-600 hover:bg-secondary-700"
                          onClick={() => handleRegister(event.id)}
                          disabled={registerMutation.isPending}
                        >
                          {event.isVirtual ? 'Join Virtual Event' : 'Register Now'}
                        </Button>
                      )}
                      {user?.role === 'admin' && (
                        <Button variant="outline" size="sm">
                          Edit Event
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
