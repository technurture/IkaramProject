import { useQuery } from "@tanstack/react-query";
import { StaffWithUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Mail, Linkedin } from "lucide-react";

export default function StaffHighlights() {
  const { data: staff, isLoading } = useQuery<StaffWithUser[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await fetch("/api/staff");
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!staff || staff.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team information will be available soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const featuredStaff = staff.slice(0, 4);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Dedicated professionals working to strengthen our alumni community and support your continued success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredStaff.map((member) => (
            <div key={member._id || member.userId} className="text-center group">
              <div className="relative mb-6">
                <Avatar className="w-32 h-32 mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300 border-4 border-white">
                  <AvatarImage 
                    src={member.profileImage || member.user?.profileImage || `https://images.unsplash.com/photo-${member.id?.slice(0,8) === '933da78a' ? '1507003211169-0a1dd7228f2d' : member.id?.slice(0,8) === 'a2b3c4d5' ? '1519345182560-3ba82c6f5414' : '1494790108755-74ae6b6fb36e'}?w=200&h=200&fit=crop&crop=face`} 
                    alt={`${member.user?.firstName} ${member.user?.lastName}`}
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                    {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-primary-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {member.user?.firstName} {member.user?.lastName}
              </h3>
              <p className="text-primary-600 font-medium mb-3">
                {member.position}
              </p>
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
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
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/staff">
            <Button size="lg">Meet the Full Team</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
