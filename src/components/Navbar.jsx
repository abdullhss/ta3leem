import { useDispatch } from "react-redux";
import { toggleSideMenuDrawer } from "../store/slices/systemSlice";
import { Menu, Search, Bell, Maximize, Languages } from "lucide-react";
import logo from "../assets/logo.webp";
import { Input } from "../ui/input";


export default function NavbarComponent() {
  const dispatch = useDispatch();

  const handleMenuToggle = () => {
    dispatch(toggleSideMenuDrawer());
  };

  return (
    <div className="min-h-16 h-auto bg-white flex items-center justify-between px-2 sm:px-3 md:px-6 py-2 sm:py-3 sticky top-0 z-50 border-b border-gray-200">
      {/* Right side (RTL) - Logo, Title, and Menu */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {/* Hamburger Menu Button */}
        <button
          onClick={handleMenuToggle}
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 p-2 sm:p-2 md:p-3 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-3">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-primary object-contain flex-shrink-0"
          />

          {/* Title Text - Hidden on mobile, shown on md and up */}
          <div className="hidden md:flex flex-col">
            <span className="text-[#C18C46] font-bold text-sm md:text-base leading-tight">
              وزارة التربية والتعليم
            </span>
            <span className="text-[#C18C46] font-bold text-sm md:text-base leading-tight">
              إدارة التعليم الخاص
            </span>
          </div>
        </div>
      </div>

      {/* Left side (RTL) - Icons and Search */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-10 flex-shrink-0">
        {/* Search Bar - Hidden on very small screens, shown from sm */}
        <div className="hidden sm:flex relative items-center">
          <div className="flex items-center bg-gray-100 rounded-lg px-2 sm:px-3 md:px-3 py-1.5 sm:py-2 w-32 sm:w-40 md:w-48 lg:w-64">
            <Search className="ml-2 shrink-0 w-4 h-4 md:w-5 md:h-5" />
            
            <Input
              type="text"
              placeholder="ابحث هنا..."
              className="bg-transparent border-none outline-none h-fit focus:ring-0! focus:border-none! focus:outline-none! text-xs sm:text-sm w-full placeholder:text-gray-500"
              dir="rtl"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* Fullscreen Icon Button - Hidden on mobile, shown from sm */}
          <button
            className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Fullscreen"
          >
            <Maximize className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Notification Bell Icon Button */}
          <button
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors relative flex-shrink-0"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          {/* Language/Text Icon Button */}
          <button
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Language"
          >
            <Languages className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
