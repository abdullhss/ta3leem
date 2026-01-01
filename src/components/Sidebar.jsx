import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmModal } from '../global/global-modal/ConfirmModal';
import { logout } from '../store/slices/authSlice';
import { setSideMenuDrawer } from '../store/slices/systemSlice';
import { cn } from '../lib/utils';
import { Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { LogOutIcon } from '../utils/Icons';
import Divider from './Divider';
import { motion, AnimatePresence } from "framer-motion";

// Compass Icon (golden-brown color)
const CompassIcon = () => (
<svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 12.51C14.049 12.51 14.49 12.951 14.49 13.5C14.49 14.049 14.049 14.49 13.5 14.49C12.951 14.49 12.51 14.049 12.51 13.5C12.51 12.951 12.951 12.51 13.5 12.51ZM13.5 4.5C18.468 4.5 22.5 8.532 22.5 13.5C22.5 18.468 18.468 22.5 13.5 22.5C8.532 22.5 4.5 18.468 4.5 13.5C4.5 8.532 8.532 4.5 13.5 4.5ZM11.529 15.471L18.9 18.9L15.471 11.529L8.1 8.1L11.529 15.471Z" fill="#BE8D4A"/>
</svg>

);

const accordionVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: "easeInOut"
    }
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};


// Menu items data
const menuItems = [
  { 
    title: 'المدارس', 
    path: '/schools/new',
    sublinks: [
      { title: 'المدارس الجديدة', path: '/schools/new' },
      { title: 'المدارس القائمة', path: '/schools/old' }
    ]
  },
  { 
    title: 'قائمة الطلبات', 
    path: '/requests',
    sublinks: [
      { title: 'تقديم طلب إنشاء مدرسة', path: '/requests/create-school' },
      { title: 'تقديم طلب نقل مدرسة', path: '/requests/transfer-school' },
      { title: 'طلب تكليف مدير مدرسة جديد', path: '/requests/assign-principal' },
      { title: 'الطلبات الاخرى', path: '/requests/other' },
      { title: 'طلبات التجديد', path: '/requests/renewal' },
      { title: 'طلب زيارة', path: '/requests/visit' }
    ]
  },
  { title: 'رفع المسوغات', path: '/uploads' },
  { title: 'الإشعارات', path: '/notifications' },
  { title: 'المدراء', path: '/managers' },
  { title: 'معلومات حساب المفوض', path: '/account-info' }
];

export default function Sidebar() {
  const { isDrawerOpen } = useSelector(state => state.system);
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState(pathname);
  const [expandedItems, setExpandedItems] = useState({});
  const userData = useSelector((state) => state.auth.userData);
  const matchUpMD = window.innerWidth >= 768;

  const handleClick = (path) => {
    if (!matchUpMD) dispatch(setSideMenuDrawer(false));
    if (path) navigate(path);
  };

  const toggleAccordion = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleMenuItemClick = (item, index) => {
    if (item.sublinks) {
      toggleAccordion(index);
    } else {
      handleClick(item.path);
    }
  };

  const handleSublinkClick = (sublinkPath) => {
    handleClick(sublinkPath);
  };

  const handleLogout = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    setActivePath(pathname);
    
    // Auto-expand accordion if current path matches a sublink
    menuItems.forEach((item, index) => {
      if (item.sublinks) {
        const hasActiveSublink = item.sublinks.some(sublink => pathname.includes(sublink.path));
        if (hasActiveSublink) {
          setExpandedItems(prev => {
            // Only update if not already expanded to avoid unnecessary re-renders
            if (prev[index]) return prev;
            return {
              ...prev,
              [index]: true
            };
          });
        }
      }
    });
  }, [pathname]);

  return (
    <>
      <div className="flex h-full">
        {/* Side Buttons (Always visible, outside sidebar) */}
        <div className="flex flex-col justify-between items-center gap-3 py-4 px-3 bg-white border-l border-[#DEDEDE]">
          <div className='flex flex-col gap-3 items-center'>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <CompassIcon />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <LogOutIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Main Sidebar Content */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex flex-col gap-7 h-full pl-4 cursor-auto transition-all duration-500 ease-in-out overflow-hidden relative bg-white border-l border-[#DEDEDE]",
            isDrawerOpen ? "w-[300px]" : "w-0 p-0 border-none"
          )}
        >
          {/* Top Section - User Profile */}
          <div className="flex flex-col items-center pt-8 pb-6 px-4">
            {/* Small top-left icon */}
            <div className="absolute top-4 left-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="w-1 h-4 bg-gray-700"></div>
              </div>
            </div>

            {/* Main User Avatar */}
            <div className="w-[120px] h-[120px] rounded-full border-2 p-2 border-primary flex items-center justify-center mb-4">
              <div className="w-full h-full bg-[#C2C2C2] rounded-full text-[#303030] flex items-center justify-center text-3xl font-medium">{userData?.LoginName?.charAt(0)}</div>
            </div>

            {/* Greeting Text */}
            <div className="text-center font-bold">
              <h2 className="text-lg font-bold mb-1">مرحبا بك </h2>
              <p className="text-base">{userData?.LoginName}</p>
            </div>
          </div>

          <Divider />

          {/* Menu Items List */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {menuItems.map((item, index) => {
                const isExpanded = expandedItems[index];
                const hasSublinks = item.sublinks && item.sublinks.length > 0;
                const isActive = hasSublinks 
                  ? item.sublinks.some(sublink => activePath.includes(sublink.path))
                  : activePath.includes(item.path);
                
                return (
                  <div key={index} className="flex flex-col">
                    <button
                      onClick={() => handleMenuItemClick(item, index)}
                      className={cn(
                        "text-start font-medium cursor-pointer py-2 px-4 rounded-l-xl transition-colors hover:bg-[#BE8D4A] hover:text-white font-alexandria flex items-center justify-between",
                        isActive ? "bg-[#BE8D4A] text-white" : ""
                      )}
                    >
                      <span>{item.title}</span>
                      {hasSublinks && (
                        <span className="mr-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </button>
                    
                    {/* Sublinks */}
                    <AnimatePresence initial={false}>
                      {hasSublinks && isExpanded && (
                        <motion.div
                          key="accordion"
                          variants={accordionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="flex flex-col gap-1 pr-4 mt-1 overflow-hidden"
                        >
                          {item.sublinks.map((sublink, subIndex) => {
                            const isSublinkActive = activePath.includes(sublink.path);
                            return (
                              <motion.button
                                key={subIndex}
                                onClick={() => handleSublinkClick(sublink.path)}
                                whileHover={{ x: -4 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                  "text-start font-medium cursor-pointer py-2 px-4 rounded-l-xl font-alexandria",
                                  isSublinkActive ? "text-[#BE8D4A]" : "text-[#BE8D4A80]"
                                )}
                              >
                                {sublink.title}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-[20px]">
          <DialogHeader className="flex justify-center">
            <DialogTitle className="text-xl font-bold">تسجيل الخروج</DialogTitle>
          </DialogHeader>
          <ConfirmModal 
            desc="هل أنت متأكد من تسجيل الخروج؟" 
            confirmFunc={() => {
              dispatch(logout());
              navigate('/login');
              setIsOpen(false);
            }} 
            onClose={() => setIsOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
