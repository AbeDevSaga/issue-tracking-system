import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.png';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F5F8FA] to-white relative overflow-hidden font-sans">
      {/* Watermark Logo */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: 0.06 }}
      >
        <img
          src={Logo}
          alt="Organization Logo"
          className="w-[700px] h-[700px] object-contain"
        />
      </div>

      {/* Navigation */}
      <header className="w-full z-20 bg-white/70 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-semibold text-[#1E516A] tracking-wide">Issue Tracking Platform</h1>
          </div>
          <div className="flex items-center gap-6 text-gray-700 font-medium">
            <Link to="/login" className="hover:text-[#1E516A] transition">Login</Link>
            <Link to="/my_issue" className="hover:text-[#1E516A] transition">My Issues</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex justify-center items-center min-h-screen z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            <span className="block text-[#1E516A] mt-2">Your Issue Management Hub</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-6 leading-relaxed">
            Manage issues seamlessly with a platform designed for clarity, accountability,
            and organizational productivity.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-10 py-4 bg-[#1E516A] text-white font-semibold rounded-xl shadow-md hover:bg-[#2C6B8A] transition-all duration-200 text-lg tracking-wide"
            >
              Get Started
            </Link>

            <Link
              to="/my_issue"
              className="px-10 py-4 bg-white text-[#1E516A] font-semibold rounded-xl border border-[#1E516A] shadow-sm hover:bg-[#1E516A] hover:text-white transition-all duration-200 text-lg tracking-wide"
            >
              Track Your Issues
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-10 border-t border-gray-200 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600">
          <p className="text-sm">© {new Date().getFullYear()} Issue Tracking System — Organization Edition.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
