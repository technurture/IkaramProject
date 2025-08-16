import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">About Our Association</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Building bridges between past, present, and future generations of students through meaningful connections and shared experiences.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To foster lifelong connections among alumni, support their personal and professional growth, 
                and strengthen the bond between graduates and their alma mater through engaging programs, 
                networking opportunities, and community service initiatives.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-secondary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To create a global network of empowered alumni who contribute to society's advancement 
                while maintaining strong ties to their educational foundation, inspiring current students 
                and future generations through their achievements and service.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
                <p className="text-gray-600">Building strong, supportive relationships among alumni worldwide.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-secondary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
                <p className="text-gray-600">Striving for the highest standards in all our programs and initiatives.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 flex items-center justify-center text-2xl">🤝</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Integrity</h3>
                <p className="text-gray-600">Maintaining the highest ethical standards in all our interactions.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <div className="h-8 w-8 flex items-center justify-center text-2xl">🚀</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600">Embracing new ideas and technologies to better serve our community.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our History</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Founded in 1985, the Old Student Association began as a small group of graduates who wanted to maintain 
                their connections and give back to their alma mater. What started as informal gatherings has evolved 
                into a comprehensive network serving thousands of alumni worldwide.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Over the decades, we have witnessed remarkable growth and transformation. Our association has played 
                a pivotal role in supporting current students through scholarships, mentorship programs, and career 
                guidance. We have also facilitated countless professional connections that have launched careers and 
                built lasting partnerships.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, we continue to honor our founding principles while embracing modern technology and innovative 
                approaches to alumni engagement. Our digital platform represents the next chapter in our evolution, 
                making it easier than ever for alumni to connect, share, and support one another.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Achievements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">2,847</div>
                <div className="text-gray-600">Active Members</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-secondary-600 mb-2">$2.5M+</div>
                <div className="text-gray-600">Scholarships Awarded</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">156</div>
                <div className="text-gray-600">Events Hosted</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
                <div className="text-gray-600">Countries Represented</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Programs */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Programs</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Development</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">•</Badge>
                    Career mentorship programs
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">•</Badge>
                    Industry networking events
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">•</Badge>
                    Professional development workshops
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">•</Badge>
                    Leadership training sessions
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Engagement</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">•</Badge>
                    Alumni-student mentoring
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">•</Badge>
                    Scholarship programs
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">•</Badge>
                    Community service initiatives
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">•</Badge>
                    Cultural and social events
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
