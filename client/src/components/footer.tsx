import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">OSA</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Old Student Association</h3>
                <p className="text-gray-400">Alumni Community Platform</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting alumni worldwide through shared stories, meaningful events, and lasting relationships. Join our vibrant community and stay connected with your alma mater.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <div className="w-6 h-6 bg-current"></div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <div className="w-6 h-6 bg-current"></div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <div className="w-6 h-6 bg-current"></div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <div className="w-6 h-6 bg-current"></div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-300 hover:text-white transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/blogs">
                  <a className="text-gray-300 hover:text-white transition-colors">Blog Stories</a>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <a className="text-gray-300 hover:text-white transition-colors">Events</a>
                </Link>
              </li>
              <li>
                <Link href="/staff">
                  <a className="text-gray-300 hover:text-white transition-colors">Our Team</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-300 hover:text-white transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-300 hover:text-white transition-colors">Contact</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Career Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mentorship Program</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Alumni Directory</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Downloads</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Old Student Association. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Powered by</span>
              <span className="text-secondary-400 font-medium">Cloudinary</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400 text-sm">Secure & Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
