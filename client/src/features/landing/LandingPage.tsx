import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Bookmark,
  Layers,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Globe,
  Heart,
} from 'lucide-react';

export const LandingPage = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Smart Scheme Matching',
      description: 'Get personalized government scheme recommendations based on your eligibility in seconds',
    },
    {
      icon: Bookmark,
      title: 'Save & Track',
      description: 'Bookmark your favorite schemes and track application progress all in one place',
    },
    {
      icon: Shield,
      title: 'Verified Information',
      description: 'Access authentic, up-to-date information about government welfare schemes',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant search and filtering across thousands of schemes',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of Indians discovering financial opportunities',
    },
    {
      icon: Globe,
      title: 'All States Covered',
      description: 'Central and state-level schemes from all across India',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up with your basic information in less than a minute',
    },
    {
      number: '02',
      title: 'Answer Quiz',
      description: 'Complete YojanaMatch eligibility quiz to find suitable schemes',
    },
    {
      number: '03',
      title: 'Discover Schemes',
      description: 'Browse detailed information about schemes you can apply for',
    },
    {
      number: '04',
      title: 'Apply & Track',
      description: 'Track your applications and manage all your schemes in one dashboard',
    },
  ];

  const stats = [
    { number: '500+', label: 'Government Schemes' },
    { number: '28', label: 'States Covered' },
    { number: '₹50L+', label: 'Cumulative Benefits' },
    { number: '10K+', label: 'Active Users' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                YT
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-950 dark:text-white">
                Yojana<span className="text-blue-600 dark:text-blue-400">Track</span>
              </span>
            </Link>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Discover Your Eligibility Today
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight">
                Find Government Schemes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Made for You</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                YojanaTrack helps you discover and track government welfare schemes tailored to your profile. Save money, time, and opportunities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-95 font-semibold text-lg"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold">
                Watch Demo
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stat.number}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="space-y-4">
                <div className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-10"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Powerful Features for You
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to discover and manage government schemes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get started in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-400 to-transparent -ml-4"></div>
              )}

              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
                  <span className="text-3xl font-black text-white">{step.number}</span>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Why Choose YojanaTrack?
              </h2>
              <div className="space-y-4">
                {[
                  'Access 500+ verified government schemes',
                  'Save hours of searching across multiple portals',
                  'Get personalized recommendations',
                  'Track all your applications in one place',
                  'Never miss an opportunity again',
                  ' 100% secure and confidential',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8 text-red-300" />
                  <div>
                    <div className="text-2xl font-black text-white">10,000+</div>
                    <div className="text-white/80">Happy Users</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-300" />
                  <div>
                    <div className="text-2xl font-black text-white">₹50L+</div>
                    <div className="text-white/80">Cumulative Benefits Claimed</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-300" />
                  <div>
                    <div className="text-2xl font-black text-white">28</div>
                    <div className="text-white/80">States & UTs Covered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Ready to Discover Your Schemes?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of Indians who have already found and claimed their government benefits. Start your journey today.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-95 font-semibold text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-gray-600 dark:text-gray-400">
            No credit card required. Takes less than a minute to sign up.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  YT
                </div>
                <span className="font-extrabold text-white">YojanaTrack</span>
              </Link>
              <p className="text-sm">Discover government schemes made for you.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
            <p className="text-sm">&copy; 2026 YojanaTrack. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
              <a href="#" className="hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
