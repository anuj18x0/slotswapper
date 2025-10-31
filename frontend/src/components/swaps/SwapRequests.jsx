import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';

const SwapRequests = () => {
  const [swapRequests, setSwapRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  const fetchSwapRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/swaps/requests');
      setSwapRequests(response.data.swapRequests);
    } catch (error) {
      toast.error('Failed to fetch swap requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`/swaps/requests/${requestId}`, { status: 'approved' });
      // Don't show toast here - WebSocket notification will handle it
      await fetchSwapRequests();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve request';
      toast.error(message);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(`/swaps/requests/${requestId}`, { status: 'rejected' });
      // Don't show toast here - WebSocket notification will handle it
      await fetchSwapRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this swap request?')) {
      return;
    }

    try {
      await axios.put(`/swaps/requests/${requestId}`, { status: 'cancelled' });
      // Don't show toast here - WebSocket notification will handle it
      await fetchSwapRequests();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = swapRequests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'incoming') return !request.isOutgoing;
    if (filter === 'outgoing') return request.isOutgoing;
    return request.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge-warning flex items-center gap-1.5"><AlertCircle size={14} /> Pending</span>;
      case 'approved':
        return <span className="badge-success flex items-center gap-1.5"><CheckCircle size={14} /> Approved</span>;
      case 'rejected':
        return <span className="badge-error flex items-center gap-1.5"><XCircle size={14} /> Rejected</span>;
      case 'cancelled':
        return <span className="badge-info flex items-center gap-1.5"><XCircle size={14} /> Cancelled</span>;
      default:
        return <span className="badge-info">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner w-10 h-10"></div>
          <p className="text-neutral-600 font-medium">Loading swap requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-luxury mb-2 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-royal-blue to-navy rounded-xl shadow-glow">
                <RefreshCw size={32} className="text-white" />
              </div>
              Swap Requests
            </h1>
            <p className="text-neutral-600 text-lg">Manage your incoming and outgoing swap requests</p>
          </div>
        </div>

        <div className="card-luxury p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-royal-blue to-navy text-white shadow-lg'
                  : 'bg-white/60 text-navy hover:bg-white/80'
              }`}
            >
              All Requests ({swapRequests.length})
            </button>
            <button
              onClick={() => setFilter('incoming')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                filter === 'incoming'
                  ? 'bg-gradient-to-r from-royal-blue to-navy text-white shadow-lg'
                  : 'bg-white/60 text-navy hover:bg-white/80'
              }`}
            >
              Incoming ({swapRequests.filter(r => !r.isOutgoing).length})
            </button>
            <button
              onClick={() => setFilter('outgoing')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                filter === 'outgoing'
                  ? 'bg-gradient-to-r from-royal-blue to-navy text-white shadow-lg'
                  : 'bg-white/60 text-navy hover:bg-white/80'
              }`}
            >
              Outgoing ({swapRequests.filter(r => r.isOutgoing).length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                  : 'bg-white/60 text-navy hover:bg-white/80'
              }`}
            >
              Pending ({swapRequests.filter(r => r.status === 'pending').length})
            </button>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="card-luxury p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-gradient-to-br from-royal-blue/20 to-navy/20 rounded-3xl">
                <RefreshCw size={64} className="text-royal-blue" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy mb-3">No swap requests found</h3>
            <p className="text-neutral-600">
              {filter === 'all' 
                ? 'You have no swap requests yet. Browse available slots to request swaps.'
                : `No ${filter} swap requests at this time.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="card-luxury p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          request.isOutgoing 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-br from-green-500 to-green-600'
                        }`}>
                          {request.isOutgoing ? (
                            <User size={20} className="text-white" />
                          ) : (
                            <User size={20} className="text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-navy text-lg">
                            {request.isOutgoing ? 'Outgoing Request' : 'Incoming Request'}
                          </div>
                          <div className="text-neutral-600 text-sm">
                            {request.isOutgoing 
                              ? `To: ${request.targetUser.firstName} ${request.targetUser.lastName}`
                              : `From: ${request.requester.firstName} ${request.requester.lastName}`
                            }
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <Calendar size={16} />
                          <span className="font-semibold text-sm">Your Slot</span>
                        </div>
                        <div className="font-bold text-navy mb-1">{request.requesterSlot.title}</div>
                        {request.requesterSlot.description && (
                          <div className="text-neutral-600 text-sm mb-2">{request.requesterSlot.description}</div>
                        )}
                        <div className="flex items-center gap-2 text-neutral-600 text-sm">
                          <Clock size={14} />
                          <span>{formatDateTime(request.requesterSlot.startTime)}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <Calendar size={16} />
                          <span className="font-semibold text-sm">Their Slot</span>
                        </div>
                        <div className="font-bold text-navy mb-1">{request.targetSlot.title}</div>
                        {request.targetSlot.description && (
                          <div className="text-neutral-600 text-sm mb-2">{request.targetSlot.description}</div>
                        )}
                        <div className="flex items-center gap-2 text-neutral-600 text-sm">
                          <Clock size={14} />
                          <span>{formatDateTime(request.targetSlot.startTime)}</span>
                        </div>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                        <div className="font-semibold text-navy mb-2">Message:</div>
                        <div className="text-neutral-700">{request.message}</div>
                      </div>
                    )}

                    <div className="text-neutral-500 text-sm">
                      Requested on {formatDateTime(request.createdAt)}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex lg:flex-col gap-3 justify-end">
                      {!request.isOutgoing ? (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                          >
                            <CheckCircle size={18} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                          >
                            <XCircle size={18} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                          <XCircle size={18} />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapRequests;
