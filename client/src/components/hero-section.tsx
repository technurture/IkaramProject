import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Connect. Share. <span className="text-secondary-400">Grow Together.</span>
              </h1>
              <p className="text-xl text-primary-100 leading-relaxed">
                Join our vibrant alumni community where stories are shared, connections are made, and opportunities flourish. Share your journey, inspire others, and stay connected with your alma mater.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-4 text-lg transform hover:scale-105 transition-all">
                  Join Our Community
                </Button>
              </Link>
              <Link href="/blogs">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary-800 px-8 py-4 text-lg transition-all">
                  Explore Stories
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold">2,847</div>
                <div className="text-primary-200 text-sm">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">1,293</div>
                <div className="text-primary-200 text-sm">Stories Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">156</div>
                <div className="text-primary-200 text-sm">Events Hosted</div>
              </div>
            </div>
          </div>

          <div className="relative">
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
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm text-gray-800 p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-green-500 text-2xl">📈</div>
                  <div>
                    <div className="font-bold text-lg">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Achievement Cards */}
            <div className="absolute -top-4 -left-4 bg-white text-gray-800 p-4 rounded-xl shadow-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="text-yellow-500 text-xl">🏆</div>
                <div>
                  <div className="font-semibold">Excellence Award</div>
                  <div className="text-sm text-gray-600">2024 Winner</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-secondary-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="text-xl">🌍</div>
                <div>
                  <div className="font-semibold">Global Network</div>
                  <div className="text-sm opacity-90">50+ Countries</div>
                </div>
              </div>
            </div>
            
            {/* Additional floating element - Latest Achievement */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-8 bg-green-500 text-white p-3 rounded-lg shadow-lg rotate-3">
              <div className="text-center">
                <div className="text-sm font-medium">Latest</div>
                <div className="text-xs opacity-90">Milestone</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
