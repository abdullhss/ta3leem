import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { setSideMenuDrawer } from '../store/slices/systemSlice';
import { checkAuth } from '../store/slices/authSlice';

export default function Layout() {
  const { isDrawerOpen } = useSelector((state) => state.system);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  // Check auth on mount and whenever route changes
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch, location.pathname]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="h-full flex-shrink-0 relative z-50">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F7F7F7]">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => dispatch(setSideMenuDrawer(false))}
        />
      )}
    </div>
  );
}

