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
      <section className="bg-gradient-to-r from-green-800 to-green-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="@assets/logo-removebg-preview_1755351782642.png" 
              alt="Community High School Logo" 
              className="h-32 w-32 object-contain"
            />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Community Comprehensive High School</h1>
          <h2 className="text-2xl lg:text-3xl font-semibold mb-4">Ikaram-Akoko Old Students Association</h2>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Promoting friendship, understanding, and the general welfare of all members while supporting our alma mater.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About the School and Association */}
        <div className="grid lg:grid-cols-1 gap-12 mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">About Community Comprehensive High School, Ikaram-Akoko</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Community Comprehensive High School, Ikaram-Akoko is located in Ondo State, Nigeria. Our school has been 
                a beacon of educational excellence, nurturing generations of students who have gone on to make significant 
                contributions to society both locally and internationally.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The Old Students Association was established to maintain the strong bonds forged during our school years 
                and to continue supporting both our alma mater and fellow alumni throughout their lives and careers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Objectives */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Aims and Objectives</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Unity & Friendship</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To promote and foster friendship, business and social contacts, and good interpersonal 
                  relationships amongst members of the Association, its branches, and sister associations 
                  irrespective of place of domicile.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-yellow-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Member Welfare</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To promote the general welfare of the members of the Association and encourage 
                  the rights of all bonafide members while maintaining the highest standard of conduct, 
                  etiquette, and discipline.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Alma Mater Support</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To improve, promote and support the alma mater whenever the need arises, subject to 
                  the financial position of the Association, and promote sound learning culture and 
                  environment for students and teachers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-yellow-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Knowledge Exchange</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To promote free exchange of ideas and information among members and between the 
                  Association and its branches/affiliates, fostering continuous learning and development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Organizational Structure */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Organizational Structure</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Executive Council</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• President</li>
                  <li>• Vice President</li>
                  <li>• General Secretary</li>
                  <li>• Assistant General Secretary</li>
                  <li>• Treasurer</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Officers</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Financial Secretary</li>
                  <li>• Publicity Secretary</li>
                  <li>• Social & Welfare Secretary</li>
                  <li>• Chief Whip</li>
                  <li>• Auditor</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Governance</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• General Assembly (Supreme Organ)</li>
                  <li>• Central Representative Committee</li>
                  <li>• Two-year officer terms</li>
                  <li>• Annual General Meetings</li>
                  <li>• Democratic elections</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Membership */}
        <div className="mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Membership</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Who Can Join?</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Membership is open to any person who attended or graduated from Community Comprehensive High School, 
                    Ikaram-Akoko, notwithstanding their place of residence or domicile.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Financial members enjoy full privileges and rights as provided in the constitution, including 
                    the right to contest for elective positions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Support</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">Our funding sources include:</p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Annual dues determined by members</li>
                    <li>• Voluntary donations from members and supporters</li>
                    <li>• Fundraising activities when needed</li>
                    <li>• Special levies as approved</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
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
