import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmModal } from '../global/global-modal/ConfirmModal';
import { logout } from '../store/slices/authSlice';
import { setSideMenuDrawer } from '../store/slices/systemSlice';
import { cn } from '../lib/utils';
import { Settings } from 'lucide-react';
import { LogOutIcon } from '../utils/Icons';
import Divider from './Divider';

// Compass Icon (golden-brown color)
const CompassIcon = () => (
<svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 12.51C14.049 12.51 14.49 12.951 14.49 13.5C14.49 14.049 14.049 14.49 13.5 14.49C12.951 14.49 12.51 14.049 12.51 13.5C12.51 12.951 12.951 12.51 13.5 12.51ZM13.5 4.5C18.468 4.5 22.5 8.532 22.5 13.5C22.5 18.468 18.468 22.5 13.5 22.5C8.532 22.5 4.5 18.468 4.5 13.5C4.5 8.532 8.532 4.5 13.5 4.5ZM11.529 15.471L18.9 18.9L15.471 11.529L8.1 8.1L11.529 15.471Z" fill="#BE8D4A"/>
</svg>

);

// Menu items data
const menuItems = [
  { title: 'الأقسام', path: '/administration/home' },
  { title: 'الموظفين', path: '/administration/employees' },
  { title: 'المكاتب', path: '/administration/offices' },
  { title: 'المدارس', path: '/administration/schools' },
  { title: 'الطلبات', path: '/administration/requests' },
  { title: 'الفصول الدراسية و المواد', path: '/administration/semesters' },
  { title: 'حسابات المفوضين', path: '/administration/delegated-accounts' },
  { title: 'مجموعة الصلاحيات', path: '/administration/permissions' },
  { title: 'الإحصائيات', path: '/administration/statistics' },
  { title: 'معلومات الحساب', path: '/administration/account-info' },
];

export default function Sidebar() {
  const { isDrawerOpen } = useSelector(state => state.system);
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState(pathname);
  const userData = useSelector((state) => state.auth.userData);
  const matchUpMD = window.innerWidth >= 768;

  const handleClick = (path) => {
    if (!matchUpMD) dispatch(setSideMenuDrawer(false));
    if (path) navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    setActivePath(pathname);
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
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleClick(item.path)}
                  className={cn(
                    "text-start font-medium cursor-pointer py-2 px-4 rounded-l-xl transition-colors hover:bg-primary hover:text-white font-alexandria",
                    activePath.includes(item.path) ? "bg-primary text-white" : ""
                  )}
                >
                  {item.title}
                </button>
              ))}
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
