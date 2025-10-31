import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  BarChart3, 
  RefreshCw, 
  Clock, 
  User, 
  LogOut,
  Bell,
  Wifi,
  WifiOff,
  CheckCheck,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isConnected, notifications } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleClearAll = async () => {
    try {
      await axios.put('/swaps/notifications/read-all');
      toast.success('All notifications marked as read');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showNotifications || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showMobileMenu]);

  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <BarChart3 size={20} /> 
    },
    { 
      path: '/calendar', 
      label: 'My Calendar', 
      icon: <Calendar size={20} /> 
    },
    { 
      path: '/available-slots', 
      label: 'Available Slots', 
      icon: <Clock size={20} /> 
    },
    { 
      path: '/swap-requests', 
      label: 'Swap Requests', 
      icon: <RefreshCw size={20} /> 
    },
    { 
      path: '/profile', 
      label: 'Profile', 
      icon: <User size={20} /> 
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-navy/95 backdrop-blur-xl shadow-2xl border-b border-royal-blue/20 sm:top-2.5 sm:left-2.5 sm:right-2.5 sm:rounded-2xl sm:border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 text-platinum hover:text-white transition-colors">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-royal-blue to-navy rounded-xl shadow-glow">
                <RefreshCw size={18} className="sm:w-[22px] sm:h-[22px] text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gradient-luxury">SlotSwapper</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'nav-link-active' : 'nav-link'}
              >
                {item.icon}
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - Notifications & Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications Button */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 sm:p-2.5 bg-navy/50 hover:bg-navy/80 text-platinum rounded-xl transition-all duration-300 border border-royal-blue/20 hover:border-royal-blue/40"
              >
                <Bell size={18} className="sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[90vw] sm:w-80 max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[90]">
                  <div className="bg-gradient-to-r from-royal-blue to-navy p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-sm sm:text-base">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-white/80 text-xs sm:text-sm">{unreadCount} unread</p>
                    )}
                  </div>
                  <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            if (notification.relatedSwapId) {
                              navigate('/swap-requests');
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-xs sm:text-sm text-navy flex-1">{notification.title}</h4>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 sm:p-8 text-center text-gray-500">
                        <Bell size={28} className="sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications && notifications.length > 0 && (
                    <div className="p-2 bg-gray-50 border-t border-gray-200 flex flex-col gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="flex items-center justify-center gap-2 text-xs sm:text-sm text-royal-blue hover:text-navy font-medium py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <CheckCheck size={14} className="sm:w-4 sm:h-4" />
                          Mark all as read
                        </button>
                      )}
                      <Link
                        to="/swap-requests"
                        className="block text-center text-xs sm:text-sm text-royal-blue hover:text-navy font-medium py-2"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button - Desktop */}
            <button 
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-700/80 to-gray-600/80 hover:from-gray-600 hover:to-gray-500 text-platinum rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-600/50 shadow-lg hover:shadow-xl hover:scale-105"
              onClick={handleLogout}
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-semibold">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 bg-navy/50 hover:bg-navy/80 text-platinum rounded-xl transition-all duration-300 border border-royal-blue/20"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden fixed top-[60px] left-0 right-0 mx-3 bg-[#0E1A2B] backdrop-blur-xl rounded-xl border border-royal-blue/30 shadow-2xl overflow-hidden z-[90]"
        >
          <div className="py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-all ${
                  location.pathname === item.path
                    ? 'bg-royal-blue/30 text-white border-l-4 border-royal-blue'
                    : 'text-platinum hover:bg-royal-blue/20 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-royal-blue/30 mt-2 pt-2 px-4">
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-3 w-full px-0 py-3 text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;