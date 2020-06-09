import React, { useEffect, useState, useContext } from 'react';

import BookingList from '../components/Bookings/BookingList/BookingList.js';
import AuthContext from '../context/auth-context.js';
import Spinner from '../components/Spinner/Spinner.js';

const Bookings = () => {

    const [ isLoading, setIsLoading ] = useState(false);
    const [ bookings, setBookings ] = useState([]);

    const contextType = useContext(AuthContext);

    useEffect(() => {
        fetchBookings();
    },[])

    const fetchBookings = () => {
        setIsLoading(true);
        const requestBody = {
            query: `
                query {
                    bookings {
                        _id
                        createdAt
                        event {
                            _id
                            title
                            date
                        }
                    }
                }
            `
        };


        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + contextType.token
            }
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        })
        .then(resData => {
            const fetchedBookings = resData.data.bookings;
            setBookings(fetchedBookings);
            setIsLoading(false);
        })
        .catch(err => {
            console.log(err);
            setIsLoading(false);
        });
    }

    const deleteBookingHandler = bookingId => {
        setIsLoading(true);
        const requestBody = {
            query: `
                mutation CancelBooking($id: ID!) {
                    cancelBooking(bookingId: $id) {
                        _id
                        title
                    }
                }
            `,
            variables: {
                id: bookingId
            }
        };


        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + contextType.token
            }
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        })
        .then(resData => {
            setBookings(prevState => {
                const updatedBookings = prevState.filter(booking => {
                    return booking._id !== bookingId;
                });
                return updatedBookings;
            });
            setIsLoading(false);
        })
        .catch(err => {
            console.log(err);
            setIsLoading(false);
        });
    }

    return (
        <React.Fragment>
            {
                isLoading ? 
                <Spinner /> :
                <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
            }
        </React.Fragment>
    );
}

export default Bookings;