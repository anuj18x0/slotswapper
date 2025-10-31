import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Clock, Calendar as CalendarIcon, List, Grid3x3, X, Save, FileText, Edit3, Trash2 } from 'lucide-react';

const toDatetimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().slice(0, 16);
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/calendar/slots', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const slots = response.data.slots || [];
      
      const formattedEvents = slots.map(slot => ({
        id: slot.id,
        title: slot.title,
        start: slot.startTime,
        end: slot.endTime,
        extendedProps: {
          description: slot.description,
          isAvailable: slot.isAvailableForSwap
        },
        backgroundColor: slot.isAvailableForSwap ? '#26814a' : '#6b7280',
        borderColor: slot.isAvailableForSwap ? '#1e6139' : '#4b5563',
        classNames: slot.isAvailableForSwap ? 'event-available' : 'event-unavailable'
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Failed to load calendar events');
      console.error('Error fetching events:', error);
    }
  };

  const handleDateClick = (info) => {
    const clickedDate = new Date(info.dateStr);
    const startTime = new Date(clickedDate.setHours(9, 0, 0, 0));
    const endTime = new Date(clickedDate.setHours(10, 0, 0, 0));
    
    setSelectedDate(info.dateStr);
    setFormData({
      title: '',
      description: '',
      start: startTime.toISOString().slice(0, 16),
      end: endTime.toISOString().slice(0, 16),
      isAvailable: true
    });
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    const event = info.event;
    setFormData({
      id: event.id,
      title: event.title,
      description: event.extendedProps.description || '',
      start: toDatetimeLocal(event.start),
      end: toDatetimeLocal(event.end),
      isAvailable: Boolean(event.extendedProps.isAvailable)
    });
    setShowModal(true);
  };

  const handleDateSelect = (selectInfo) => {
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    
    startDate.setHours(9, 0, 0, 0);
    endDate.setHours(10, 0, 0, 0);
    
    if (selectInfo.end.getTime() - selectInfo.start.getTime() > 86400000) {
      endDate.setDate(endDate.getDate() - 1); // go back one day
      endDate.setHours(17, 0, 0, 0); // set to 5pm
    }
    
    setFormData({
      title: '',
      description: '',
      start: startDate.toISOString().slice(0, 16),
      end: endDate.toISOString().slice(0, 16),
      isAvailable: true
    });
    setShowModal(true);
    
    selectInfo.view.calendar.unselect();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        await axios.put(
          `http://localhost:3001/api/calendar/slots/${formData.id}`,
          {
            title: formData.title,
            description: formData.description,
            startTime: formData.start,
            endTime: formData.end,
            isAvailableForSwap: Boolean(formData.isAvailable)
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        toast.success('Event updated successfully!');
      } else {
        await axios.post(
          'http://localhost:3001/api/calendar/slots',
          {
            title: formData.title,
            description: formData.description,
            startTime: formData.start,
            endTime: formData.end,
            isAvailableForSwap: Boolean(formData.isAvailable)
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        toast.success('Event created successfully!');
      }
      
      setShowModal(false);
      fetchEvents();
      resetForm();
    } catch (error) {
      toast.error(formData.id ? 'Failed to update event' : 'Failed to create event');
      console.error('Error saving event:', error);
    }
  };
  const handleDelete = async () => {
    if (!formData.id) return;
    
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/calendar/slots/${formData.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast.success('Event deleted successfully!');
      setShowModal(false);
      fetchEvents();
      resetForm();
    } catch (error) {
      toast.error('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start: '',
      end: '',
      isAvailable: true
    });
    setSelectedDate(null);
  };

  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const isAvailable = event.extendedProps.isAvailable;
    
    // For list view
    if (eventInfo.view.type === 'listWeek') {
      const duration = calculateDuration(event.start, event.end);
      
      return (
        <div className="list-event-wrapper">
          <div className={`list-event-card ${isAvailable ? 'available' : 'unavailable'}`}>
            <div className="event-header">
              <h4 className="event-title">{event.title}</h4>
              <div className="event-actions">
                <span className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                  {isAvailable ? '✓ Available' : '✕ Unavailable'}
                </span>
                <div className="action-buttons">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({
                        id: event.id,
                        title: event.title,
                        description: event.extendedProps.description || '',
                        start: toDatetimeLocal(event.start),
                        end: toDatetimeLocal(event.end),
                        isAvailable: Boolean(event.extendedProps.isAvailable)
                      });
                      setShowModal(true);
                    }}
                    className="action-btn edit-btn"
                    title="Edit event"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this event?')) {
                        try {
                          await axios.delete(`http://localhost:3001/api/calendar/slots/${event.id}`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          });
                          toast.success('Event deleted successfully!');
                          fetchEvents();
                        } catch (error) {
                          toast.error('Failed to delete event');
                          console.error('Error deleting event:', error);
                        }
                      }
                    }}
                    className="action-btn delete-btn"
                    title="Delete event"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            {event.extendedProps.description && (
              <p className="event-description">{event.extendedProps.description}</p>
            )}
            
            <div className="event-meta">
              <span className="meta-item">
                <Clock size={14} />
                {duration}
              </span>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid-event-content">
        <div className="event-time">{eventInfo.timeText}</div>
        <div className="event-title-grid">{event.title}</div>
      </div>
    );
  };

  const calculateDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="calendar-page px-3 sm:px-6 pt-20 sm:pt-24">
      {/* Header Section */}
      <div className="calendar-header">
        <div className="header-content flex-col sm:flex-row gap-4">
          <div className="header-left">
            <div className="icon-wrapper w-10 h-10 sm:w-12 sm:h-12">
              <CalendarIcon size={24} className="sm:w-8 sm:h-8" strokeWidth={2} />
            </div>
            <div>
              <h1 className="page-title text-2xl sm:text-3xl">My Calendar</h1>
              <p className="page-subtitle text-sm sm:text-base">Manage your time slots and availability</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              const today = new Date();
              setFormData({
                title: '',
                description: '',
                start: new Date(today.setHours(9, 0, 0, 0)).toISOString().slice(0, 16),
                end: new Date(today.setHours(10, 0, 0, 0)).toISOString().slice(0, 16),
                isAvailable: true
              });
              setShowModal(true);
            }}
            className="btn-create w-full sm:w-auto text-sm sm:text-base py-2.5 sm:py-3"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="listWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventContent={renderEventContent}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          nowIndicator={true}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-[95vw] sm:max-w-2xl mx-4 sm:mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header p-4 sm:p-6">
              <h2 className="modal-title text-xl sm:text-2xl">
                {formData.id ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn-close w-8 h-8 sm:w-10 sm:h-10"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">
                  <FileText size={16} />
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FileText size={16} />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Add event description"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="availability-toggle">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="toggle-input"
                  />
                  <div className="toggle-slider"></div>
                  <span className="toggle-label">
                    Mark as available for swapping
                  </span>
                </label>
              </div>

              <div className="modal-actions">
                {formData.id && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn-delete"
                  >
                    Delete Event
                  </button>
                )}
                <div className="actions-right">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    <Save size={18} />
                    {formData.id ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .calendar-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0E1A2B 0%, #1a2942 100%);
          padding: 2rem;
        }

        /* Header Styles */
        .calendar-header {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-wrapper {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3A7BD5 0%, #26814a 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 16px rgba(58, 123, 213, 0.3);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0;
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.7);
          margin: 0.25rem 0 0 0;
        }

        .btn-create {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, #3A7BD5 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(58, 123, 213, 0.3);
        }

        .btn-create:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(58, 123, 213, 0.4);
        }

        .btn-create:active {
          transform: translateY(0);
        }

        /* Calendar Container */
        .calendar-container {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        /* FullCalendar Overrides */
        .fc {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .fc .fc-toolbar-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b !important;
        }

        .fc .fc-button {
          background: linear-gradient(135deg, #3A7BD5 0%, #2563eb 100%);
          border: none;
          padding: 0.625rem 1.25rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.3s ease;
          text-transform: capitalize;
        }

        .fc .fc-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
        }

        .fc .fc-button-active {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%) !important;
        }

        .fc .fc-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .fc-theme-standard .fc-scrollgrid {
          border: none;
        }

        .fc .fc-col-header-cell {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1rem;
          font-weight: 700;
          color: #334155 !important;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          border: none;
        }

        .fc .fc-col-header-cell-cushion {
          color: #334155 !important;
        }

        .fc .fc-daygrid-day {
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .fc .fc-daygrid-day:hover {
          background: #f8fafc;
          cursor: pointer;
        }

        .fc .fc-highlight {
          background: rgba(58, 123, 213, 0.15) !important;
        }

        .fc .fc-daygrid-day.fc-day-selected {
          background: rgba(58, 123, 213, 0.1);
        }

        .fc .fc-daygrid-day-number {
          color: #1e293b !important;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.75rem;
        }

        .fc .fc-daygrid-day-top {
          color: #1e293b !important;
        }

        .fc .fc-day-today {
          background: rgba(58, 123, 213, 0.08) !important;
        }

        .fc .fc-day-today .fc-daygrid-day-number {
          background: linear-gradient(135deg, #3A7BD5 0%, #2563eb 100%);
          color: white;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Grid Event Styles */
        .fc-event {
          border: none !important;
          border-radius: 6px;
          padding: 0.25rem 0.5rem;
          margin: 2px 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .grid-event-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .event-time {
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 1;
          color: rgba(255, 255, 255, 0.95);
        }

        .event-title-grid {
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: white;
        }

        /* List View Styles */
        .fc-list {
          border: none !important;
        }

        .fc-list-day-cushion {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1rem 1.5rem;
          border-radius: 10px;
          margin-bottom: 1rem;
        }

        .fc-list-day-text {
          font-weight: 700;
          color: #1e293b;
          font-size: 1rem;
        }

        .fc-list-day-side-text {
          color: #3A7BD5;
          font-weight: 600;
        }

        .fc-list-event {
          cursor: pointer;
          border: none !important;
        }

        .fc-list-event:hover {
          background: transparent !important;
        }

        .fc-list-event-time {
          width: 180px;
          padding: 0;
          color: #1e293b !important;
          font-weight: 600 !important;
        }

        .fc-list-event-graphic {
          display: none;
        }

        .list-event-wrapper {
          width: 100%;
          padding: 0.5rem 0;
        }

        .list-event-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          border-left: 4px solid transparent;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .list-event-card.available {
          border-left-color: #26814a;
        }

        .list-event-card.unavailable {
          border-left-color: #9ca3af;
        }

        .list-event-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .event-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          flex: 1;
        }

        .event-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          opacity: 1;
          transition: opacity 0.2s ease;
        }

        .list-event-card:hover .action-buttons {
          opacity: 1;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: linear-gradient(135deg, #3A7BD5 0%, #2563eb 100%);
          color: white;
        }

        .edit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
        }

        .delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .availability-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .availability-badge.available {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
        }

        .availability-badge.unavailable {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #374151;
        }

        .event-description {
          color: #334155;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 0.75rem 0;
        }

        .event-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #334155;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .meta-item svg {
          color: #3A7BD5;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(14, 26, 43, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          border-radius: 20px 20px 0 0;
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0E1A2B;
          margin: 0;
        }

        .btn-close {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          background: #e2e8f0;
          color: #0E1A2B;
        }

        .modal-form {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #0E1A2B;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .form-label svg {
          color: #3A7BD5;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          font-family: inherit;
          color: #1e293b;
          background: white;
          box-sizing: border-box;
        }

        .form-input[type="datetime-local"] {
          padding: 0.875rem 1rem;
          cursor: pointer;
          position: relative;
        }

        .form-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          background: linear-gradient(135deg, #3A7BD5 0%, #2563eb 100%);
          border-radius: 6px;
          padding: 2px;
          filter: brightness(1);
          transition: all 0.2s ease;
          margin-left: 0.5rem;
        }

        .form-input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
          box-shadow: 0 2px 8px rgba(58, 123, 213, 0.3);
        }

        /* Style the calendar popup */
        .form-input[type="datetime-local"]::-webkit-datetime-edit {
          padding: 0;
          color: #1e293b;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
        }

        .form-input[type="datetime-local"]::-webkit-datetime-edit-fields-wrapper {
          padding: 0;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .form-input[type="datetime-local"]::-webkit-datetime-edit-text {
          color: #64748b;
          padding: 0 0.35rem;
          font-weight: 500;
        }

        .form-input[type="datetime-local"]::-webkit-datetime-edit-month-field,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-day-field,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-year-field,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-hour-field,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-minute-field,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-ampm-field {
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          color: #1e293b;
          font-weight: 600;
          background: #f8fafc;
          margin: 0 0.15rem;
          min-width: fit-content;
        }

        /* Make time fields more prominent */
        .form-input[type="datetime-local"]::-webkit-datetime-edit-hour-field,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-minute-field,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-ampm-field {
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 700;
        }
        }

        .form-input[type="datetime-local"]::-webkit-datetime-edit-month-field:focus,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-day-field:focus,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-year-field:focus,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-hour-field:focus,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-minute-field:focus,
        .form-input[type="datetime-local"]::-webkit-datetime-edit-ampm-field:focus {
          background: linear-gradient(135deg, rgba(58, 123, 213, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%);
          color: #3A7BD5;
          outline: none;
          transform: scale(1.05);
        }

        /* Add gradient border effect when focused */
        .form-input[type="datetime-local"]:focus {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #3A7BD5 0%, #2563eb 100%) border-box;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3A7BD5;
          box-shadow: 0 0 0 3px rgba(58, 123, 213, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .availability-toggle {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .availability-toggle:hover {
          background: #f1f5f9;
        }

        .toggle-input {
          display: none;
        }

        .toggle-slider {
          width: 48px;
          height: 28px;
          background: #cbd5e1;
          border-radius: 14px;
          position: relative;
          transition: all 0.3s ease;
        }

        .toggle-slider::after {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .toggle-input:checked + .toggle-slider {
          background: linear-gradient(135deg, #3A7BD5 0%, #26814a 100%);
        }

        .toggle-input:checked + .toggle-slider::after {
          left: 23px;
        }

        .toggle-label {
          font-weight: 500;
          color: #0E1A2B;
          font-size: 0.95rem;
        }

        .modal-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid #e2e8f0;
          background: white;
          border-radius: 0 0 20px 20px;
          flex-shrink: 0;
        }

        .actions-right {
          display: flex;
          gap: 0.75rem;
        }

        .btn-delete {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-delete:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
          color: #0E1A2B;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3A7BD5 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .calendar-page {
            padding: 0.75rem;
          }

          .calendar-header {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .header-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-create {
            width: 100%;
            justify-content: center;
          }

          .calendar-container {
            padding: 0.75rem;
          }

          .list-event-card {
            padding: 0.875rem;
          }

          .event-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .event-title {
            font-size: 1rem;
          }

          .event-actions {
            width: 100%;
            justify-content: space-between;
          }

          .action-buttons {
            gap: 0.375rem;
          }

          .action-btn {
            width: 28px;
            height: 28px;
          }

          .availability-badge {
            padding: 0.25rem 0.625rem;
            font-size: 0.75rem;
          }

          .event-description {
            font-size: 0.875rem;
          }

          .meta-item {
            font-size: 0.8125rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column;
          }

          .actions-right {
            width: 100%;
          }

          .btn-delete,
          .btn-cancel,
          .btn-save {
            width: 100%;
          }

          .modal-header {
            padding: 1rem 1rem 0.75rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          /* FullCalendar responsive overrides */
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }

          .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }

          .fc .fc-button {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }

          .fc .fc-toolbar-title {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .event-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .list-event-wrapper {
            padding: 0.25rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
