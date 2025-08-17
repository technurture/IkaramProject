import { useQuery } from "@tanstack/react-query";
import { StaffWithUser } from "@shared/mongodb-schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Linkedin, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function StaffPage() {
  const { user } = useAuth();

  const { data: staff, isLoading } = useQuery<StaffWithUser[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await fetch("/api/staff");
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the dedicated professionals working to strengthen our alumni community and support your continued success.
          </p>
        </div>

        {/* Add Staff Button for Admins */}
        {user?.role === 'admin' && (
          <div className="mb-8">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        )}

        {/* Staff Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !staff || staff.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No staff members yet</h2>
            <p className="text-gray-600 mb-6">
              Staff information will be available soon.
            </p>
            {user?.role === 'admin' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Staff Member
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {staff.map((member) => (
              <Card key={member._id} className="hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <Avatar className="w-32 h-32 mx-auto shadow-lg">
                      <AvatarImage 
                        src={member.profileImage || member.user.profileImage || undefined} 
                        alt={`${member.user.firstName} ${member.user.lastName}`}
                      />
                      <AvatarFallback className="text-2xl">
                        {member.user.firstName[0]}{member.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.user.firstName} {member.user.lastName}
                  </h3>
                  <p className="text-primary-600 font-medium mb-2">
                    {member.position}
                  </p>
                  {member.department && (
                    <p className="text-gray-500 text-sm mb-4">
                      {member.department}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-4">
                    {member.bio}
                  </p>
                  
                  <div className="flex justify-center space-x-3">
                    {member.socialLinks?.linkedin && (
                      <a 
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {member.socialLinks?.email && (
                      <a 
                        href={`mailto:${member.socialLinks.email}`}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                      </a>
                    )}
                  </div>


                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
