// src/CalendarComponent.js
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styles.css'; 

const localizer = momentLocalizer(moment);

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://localhost:3000/reservations/');
        const data = await response.json();

        // Fetch the tour details for each reservation
        const reservationEvents = await Promise.all(
          data.map(async (reservation) => {
            const tourResponse = await fetch(`http://localhost:3000/tours/${reservation.tourId}`);
            const tourData = await tourResponse.json();

            return {
              ...reservation,
              start: new Date(reservation.date),
              end: new Date(reservation.date),
              title: tourData.name, // Use the tour name as the title
            };
          })
        );

        setEvents(reservationEvents);
      } catch (error) {
        console.error('Error fetching tours:', error);
      }
    };

    fetchReservations();
  }, []);

  const handleSelectEvent = async (event) => {
    try {
           
      const response = await fetch(`http://localhost:3000/reservations/${event._id}/details`);
      const data = await response.json();

      setSelectedEvent({
        ...event,
        reservationDetails: data,
      });

    } catch (error) {
      console.error('Error fetching reservation details:', error);
    }
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        titleAccessor="title"
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
      />

      {selectedEvent && (
        <div className="popup">
           <div className="column-container">
            <div className="column">
              <h3>Reservation Details:</h3>
              <p>Start Date: {moment(selectedEvent.start).format('MMMM Do YYYY')}</p>
              <p>Reservation number: {selectedEvent._id}</p>
            </div>
            <div className="column">
              <h3>Customer Details:</h3>
              <p>User: {selectedEvent.reservationDetails.user.name}</p>
              <p>Email: {selectedEvent.reservationDetails.user.email}</p>
            </div>
          </div>

          {selectedEvent.reservationDetails && (
            <div className="column-container">
              <div className="column">
                <h3>Tour Details:</h3>
                <p>Tour Name: {selectedEvent.reservationDetails.tour.name}</p>
                <p>Pax: {selectedEvent.pax}</p>
                <p>Total Price: {selectedEvent.reservationDetails.tour.price}</p>
              </div>
            </div>
          )}

          <button onClick={() => setSelectedEvent(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
