import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Clock, User, RefreshCw, Search } from 'lucide-react';

const AvailableSlots = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedTargetSlot, setSelectedTargetSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState('');
  const [swapMessage, setSwapMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [availableResponse, mySlotsResponse] = await Promise.all([
        axios.get('/calendar/available-slots'),
        axios.get('/calendar/slots')
      ]);
      
      setAvailableSlots(availableResponse.data.slots);
      setMySlots(mySlotsResponse.data.slots.filter(slot => slot.isAvailableForSwap));
    } catch (error) {
      toast.error('Failed to fetch available slots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSwap = (targetSlot) => {
    setSelectedTargetSlot(targetSlot);
    setShowSwapModal(true);
  };

  const submitSwapRequest = async () => {
    if (!selectedMySlot) {
      toast.error('Please select one of your slots to swap');
      return;
    }

    try {
      await axios.post('/swaps/requests', {
        requesterSlotId: parseInt(selectedMySlot),
        targetSlotId: selectedTargetSlot.id,
        message: swapMessage
      });
      
      toast.success('Swap request sent successfully!');
      closeModal();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send swap request';
      toast.error(message);
    }
  };

  const closeModal = () => {
    setShowSwapModal(false);
    setSelectedTargetSlot(null);
    setSelectedMySlot('');
    setSwapMessage('');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner w-10 h-10"></div>
          <p className="text-neutral-600 font-medium">Loading available slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-luxury mt-6 mb-2">
            Available Slots
          </h1>
          <p className="text-neutral-600 text-lg">
            Browse and request swaps with other users' time slots
          </p>
        </div>

        {availableSlots.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-neutral-100 rounded-2xl">
                <Clock size={64} className="text-neutral-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">No slots available</h3>
            <p className="text-neutral-500">There are currently no time slots available for swapping</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSlots.map((slot) => (
              <div key={slot.id} className="card-luxury p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-navy">{slot.title}</h3>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <User size={16} />
                    <span className="text-sm">{slot.owner.firstName} {slot.owner.lastName}</span>
                  </div>
                </div>
                
                {slot.description && (
                  <p className="text-neutral-700 mb-4 text-sm">{slot.description}</p>
                )}
                
                <div className="flex items-center gap-2 text-neutral-600 mb-6">
                  <Clock size={16} />
                  <div className="text-sm">
                    <div className="font-medium">
                      {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                    </div>
                  </div>
                </div>
                
                <button 
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => handleRequestSwap(slot)}
                  disabled={mySlots.length === 0}
                >
                  <RefreshCw size={16} />
                  Request Swap
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Swap Request Modal */}
        {showSwapModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-navy">Request Slot Swap</h2>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold text-navy mb-3">Requesting:</h4>
                  <div className="card p-4 space-y-2">
                    <div className="font-bold text-lg text-navy">{selectedTargetSlot?.title}</div>
                    <div className="text-neutral-600">
                      {formatDateTime(selectedTargetSlot?.startTime)} - {formatDateTime(selectedTargetSlot?.endTime)}
                    </div>
                    <div className="text-neutral-500 text-sm">
                      Owner: {selectedTargetSlot?.owner.firstName} {selectedTargetSlot?.owner.lastName}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="mySlot" className="block text-sm font-medium text-navy mb-2">
                    Your slot to offer:
                  </label>
                  <select
                    id="mySlot"
                    className="input-field"
                    value={selectedMySlot}
                    onChange={(e) => setSelectedMySlot(e.target.value)}
                    required
                  >
                    <option value="">Select one of your slots</option>
                    {mySlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.title} - {formatDateTime(slot.startTime)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-navy mb-2">
                    Message (optional):
                  </label>
                  <textarea
                    id="message"
                    className="textarea-field"
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    placeholder="Add a message to your swap request..."
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-neutral-200 flex gap-3">
                <button className="btn-secondary flex-1" onClick={closeModal}>
                  Cancel
                </button>
                <button 
                  className="btn-primary flex-1" 
                  onClick={submitSwapRequest}
                  disabled={!selectedMySlot}
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {mySlots.length === 0 && (
          <div className="card-luxury p-6 mt-8 text-center">
            <p className="text-neutral-600">
              You need to have available time slots to request swaps. 
              <a href="/calendar" className="text-royal-blue hover:underline ml-1">
                Create some time slots
              </a> 
              first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableSlots;