import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  RefreshCw, 
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    mySlots: 0,
    availableSlots: 0,
    pendingRequests: 0,
    completedSwaps: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const slotsResponse = await axios.get('/calendar/slots');
      const mySlots = slotsResponse.data.slots;
      
      const availableResponse = await axios.get('/calendar/available-slots');
      const availableSlots = availableResponse.data.slots;
      
      const swapResponse = await axios.get('/swaps/requests');
      const swapRequests = swapResponse.data.swapRequests;
      
      const pendingRequests = swapRequests.filter(req => req.status === 'pending').length;
      const completedSwaps = swapRequests.filter(req => req.status === 'approved').length;
      
      setStats({
        mySlots: mySlots.length,
        availableSlots: availableSlots.length,
        pendingRequests,
        completedSwaps
      });
      
      setRecentActivity(swapRequests.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-success-500" size={16} />;
      case 'rejected':
        return <XCircle className="text-error-500" size={16} />;
      case 'cancelled':
        return <XCircle className="text-neutral-500" size={16} />;
      default:
        return <AlertCircle className="text-warning-500" size={16} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner w-10 h-10"></div>
          <p className="text-neutral-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-luxury mt-2 sm:mt-6 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base lg:text-lg">
            Here's an overview of your slot swapping activity
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="card-luxury p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-royal-blue to-navy rounded-xl shadow-glow">
                <Calendar size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center sm:text-right">
                <h3 className="text-2xl sm:text-3xl font-bold text-navy">{stats.mySlots}</h3>
                <p className="text-neutral-700 font-medium text-xs sm:text-sm">My Time Slots</p>
              </div>
            </div>
          </div>

          <div className="card-luxury p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-glow">
                <Clock size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center sm:text-right">
                <h3 className="text-2xl sm:text-3xl font-bold text-navy">{stats.availableSlots}</h3>
                <p className="text-neutral-700 font-medium text-xs sm:text-sm">Available for Swap</p>
              </div>
            </div>
          </div>

          <div className="card-luxury p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-glow">
                <RefreshCw size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center sm:text-right">
                <h3 className="text-2xl sm:text-3xl font-bold text-orange-700">{stats.pendingRequests}</h3>
                <p className="text-neutral-700 font-medium text-xs sm:text-sm">Pending Requests</p>
              </div>
            </div>
          </div>

          <div className="card-luxury p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-glow">
                <TrendingUp size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center sm:text-right">
                <h3 className="text-2xl sm:text-3xl font-bold text-green-700">{stats.completedSwaps}</h3>
                <p className="text-neutral-700 font-medium text-xs sm:text-sm">Completed Swaps</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="card-luxury p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-4 sm:mb-6">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 sm:p-4 bg-neutral-100 rounded-2xl">
                      <RefreshCw size={36} className="sm:w-12 sm:h-12 text-neutral-400" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-neutral-700 mb-2">No activity yet</h3>
                  <p className="text-sm sm:text-base text-neutral-500">Start by creating time slots or requesting swaps</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-white/50 to-neutral-50/50 rounded-xl border border-neutral-200">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-800 mb-1 text-sm sm:text-base">
                          {activity.isOutgoing ? 'Outgoing' : 'Incoming'} Swap Request
                        </div>
                        <div className="text-neutral-600 text-xs sm:text-sm mb-2 break-words">
                          {activity.isOutgoing 
                            ? `You requested to swap "${activity.requesterSlot.title}" with "${activity.targetSlot.title}"`
                            : `${activity.requester.firstName} wants to swap "${activity.requesterSlot.title}" with your "${activity.targetSlot.title}"`
                          }
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className={`badge-${activity.status === 'approved' ? 'success' : activity.status === 'rejected' || activity.status === 'cancelled' ? 'error' : 'warning'}`}>
                            {activity.status}
                          </span>
                          <span className="text-neutral-500 text-xs sm:text-sm">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-luxury p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-4 sm:mb-6">Quick Actions</h2>
              <div className="space-y-3 sm:space-y-4">
                <a href="/calendar" className="btn-primary w-full flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base py-2.5 sm:py-3">
                  <Calendar size={18} className="sm:w-5 sm:h-5" />
                  <span>Manage Calendar</span>
                </a>
                <a href="/available-slots" className="btn-secondary w-full flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base py-2.5 sm:py-3">
                  <Clock size={18} className="sm:w-5 sm:h-5" />
                  <span>Browse Slots</span>
                </a>
                <a href="/swap-requests" className="btn-ghost w-full flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base py-2.5 sm:py-3">
                  <RefreshCw size={18} className="sm:w-5 sm:h-5" />
                  <span>View Requests</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;