import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Edit, Upload, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CallToAction() {
  const { user } = useAuth();

  return (
    <section className="py-16 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300 rounded-full blur-md"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">Ready to Share Your Story?</h2>
          <p className="text-xl text-gray-100 mb-8 leading-relaxed">
            Join thousands of alumni who are connecting, sharing experiences, and building meaningful relationships. Your story matters and can inspire others in their journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {user ? (
              <>
                <Link href="/blogs/create">
                  <Button className="bg-white text-secondary-700 hover:bg-gray-100 px-8 py-4 text-lg transform hover:scale-105 transition-all">
                    <Edit className="mr-2 h-5 w-5" />
                    Write Your Story
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-secondary-700 px-8 py-4 text-lg transition-all">
                    <Upload className="mr-2 h-5 w-5" />
                    Share Media
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button className="bg-white text-secondary-700 hover:bg-gray-100 px-8 py-4 text-lg transform hover:scale-105 transition-all">
                    <Edit className="mr-2 h-5 w-5" />
                    Join to Share Stories
                  </Button>
                </Link>
                <Link href="/blogs">
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-secondary-700 px-8 py-4 text-lg transition-all">
                    Explore Stories
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Edit className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Share Stories</h3>
              <p className="text-gray-100">Write blog posts about your experiences, career insights, and life updates.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <div className="h-8 w-8 flex items-center justify-center text-2xl">👥</div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Connect</h3>
              <p className="text-gray-100">Engage with fellow alumni through comments, events, and networking opportunities.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Access Resources</h3>
              <p className="text-gray-100">Download exclusive content, videos, and materials shared by the community.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
