import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white py-12 md:py-20 lg:py-24 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop" 
          alt="Alumni graduation background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-gray-50/85 to-white/90"></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-secondary-400/20 rounded-full blur-lg"></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-md"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-gray-900 drop-shadow-lg">
                Connect. Share. <span className="text-primary-600">Grow Together.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-800 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md">
                Join our vibrant alumni community where stories are shared, connections are made, and opportunities flourish. Share your journey, inspire others, and stay connected with your alma mater.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth">
                <Button size="lg" className="bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg transform hover:scale-105 transition-all w-full sm:w-auto">
                  Join Our Community
                </Button>
              </Link>
              <Link href="/blogs">
                <Button variant="outline" size="lg" className="border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:border-gray-800 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg transition-all w-full sm:w-auto">
                  Explore Stories
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 drop-shadow-md">2,847</div>
                <div className="text-gray-700 text-xs sm:text-sm drop-shadow-sm">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 drop-shadow-md">1,293</div>
                <div className="text-gray-700 text-xs sm:text-sm drop-shadow-sm">Stories Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 drop-shadow-md">156</div>
                <div className="text-gray-700 text-xs sm:text-sm drop-shadow-sm">Events Hosted</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {/* Main hero image with multiple layers for depth */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop" 
                alt="Alumni graduation ceremony with students celebrating" 
                className="w-full h-auto object-cover"
              />
              
              {/* Gradient overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              
              {/* Success stats overlay on image */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="text-green-500 text-xl">📈</div>
                  <div>
                    <div className="font-bold">95%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Achievement Cards */}
            <div className="absolute -top-4 -left-4 bg-white text-gray-800 p-3 rounded-xl shadow-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <div className="text-yellow-500 text-lg">🏆</div>
                <div>
                  <div className="font-semibold text-sm">Excellence Award</div>
                  <div className="text-xs text-gray-600">2024 Winner</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-secondary-600 text-white p-3 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="text-lg">🌍</div>
                <div>
                  <div className="font-semibold text-sm">Global Network</div>
                  <div className="text-xs opacity-90">50+ Countries</div>
                </div>
              </div>
            </div>
            
            {/* Additional floating element - Latest Achievement */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-8 bg-green-500 text-white p-2 rounded-lg shadow-lg rotate-3">
              <div className="text-center">
                <div className="text-xs font-medium">Latest</div>
                <div className="text-xs opacity-90">Milestone</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
