import React, { useState, useRef, useContext, useEffect } from 'react';

import Modal from '../components/Modal/Modal.js';
import Backdrop from '../components/Backdrop/Backdrop.js';
import AuthContext from '../context/auth-context.js';
import EventList from '../components/Events/EventList/EventList.js';
import Spinner from '../components/Spinner/Spinner.js';
import './Events.css';

const Events = () => {

    const [ creating, setCreating ] = useState(false);
    const [ events, setEvents ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ selectedEvent, setSelectedEvent ] = useState(null);
    
    let isActive = true;
    useEffect(() => {
        fetchEvents();

        return function cleanup() {
            isActive = false;
        }
    },[]);
    
    const contextType = useContext(AuthContext);
    const token = contextType.token;
    
    const titleElRef = useRef();
    const priceElRef = useRef();
    const dateElRef = useRef();
    const descriptionElRef = useRef();

    const startCreatingEventHandler = () => {
        setCreating(true);
    }

    const modalConfirmHandler = () => {
        setCreating(false);

        const title = titleElRef.current.value;
        const price = +priceElRef.current.value; // the + converts it to number
        const date = dateElRef.current.value;
        const description = descriptionElRef.current.value;

        if (
            title.trim().length === 0 ||
            price <= 0 ||
            date.trim().length === 0 ||
            description.trim().length === 0
        ) {
            return;
        }

        // you can ommit { title: title }, if you want the name the property the same
        const event = { title, price, date, description }

        const requestBody = {
            query: `
                mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!) {
                    createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
                        _id
                        title
                        description
                        date
                        price
                    }
                }
            `,
            variables: {
                title: title,
                description: description,
                price: price,
                date: date
            }
        };

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            setEvents(prevState => {
                const updatedEvents = [...prevState];
                updatedEvents.push({
                    _id: resData.data.createEvent._id,
                    title: resData.data.createEvent.title,
                    description: resData.data.createEvent.description,
                    date: resData.data.createEvent.date,
                    price: resData.data.createEvent.price,
                    creator: {
                        _id: contextType.userId
                    }
                });
                return updatedEvents;
            });
        }).catch(err => {
            console.log(err);
        });
    }

    const modalCancelHandler = () => {
        setCreating(false);
        setSelectedEvent(null);
    };
    const fetchEvents = () => {
        setIsLoading(true);
        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };


        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            const events = resData.data.events;
            if (isActive) {
                setEvents(events);
                setIsLoading(false);
            }
        }).catch(err => {
            console.log(err);
            if (isActive) {
                setIsLoading(false);
            }
        });
    };

    const showDetailHandler = eventId => {
        setSelectedEvent(prevState => {
            const selectedEvent = events.find(e => e._id === eventId)
            return selectedEvent;
        })
    };

    const bookEventHandler = () => {
        if (!token) {
            setSelectedEvent(null);
            return;
        };
        const requestBody = {
            query: `
                mutation BookEvent($id: ID!) {
                    bookEvent(eventId: $id) {
                        _id
                        createdAt
                        updatedAt
                    }
                }
            `,
            variables: {
                id: selectedEvent._id
            }
        };

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            console.log(resData);
            setSelectedEvent(null);
        }).catch(err => {
            console.log(err);
        });
    };

    return (
        <React.Fragment>
            {(creating || selectedEvent) && <Backdrop />}
            {creating && (
                <Modal 
                    title="Add Event"
                    canCancel
                    canConfirm
                    onCancel={modalCancelHandler}
                    onConfirm={modalConfirmHandler}
                    confirmText="Confirm"
                >
                    <form>
                        <div className="form-control">
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" ref={titleElRef} />
                        </div>
                        <div className="form-control">
                            <label htmlFor="price">Price</label>
                            <input type="number" id="price" ref={priceElRef} />
                        </div>
                        <div className="form-control">
                            <label htmlFor="date">Date</label>
                            <input type="datetime-local" id="date" ref={dateElRef} />
                        </div>
                        <div className="form-control">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" rows="4" ref={descriptionElRef} />
                        </div>
                    </form>
                </Modal>)
            }
            {selectedEvent && (
                <Modal 
                    title={selectedEvent.title}
                    canCancel
                    canConfirm
                    onCancel={modalCancelHandler}
                    onConfirm={bookEventHandler}
                    confirmText={contextType.token ? 'Book' : 'Confirm'}
                >
                    <h1>{selectedEvent.title}</h1>
                    <h2>
                        ${selectedEvent.price} - {new Date(selectedEvent.date).toLocaleDateString('cz-CZ')}
                    </h2>
                    <p>
                        {selectedEvent.description}
                    </p>
                </Modal>
            )
            }
            {contextType.token &&
                <div className="events-control">
                    <p>Share your own Events!</p>
                    <button className="btn" onClick={startCreatingEventHandler}>
                        Create Event
                </button>
                </div>
            }
            {
                isLoading ? 
                <Spinner /> : 
                <EventList 
                    events={events} 
                    authUserId={contextType.userId} 
                    onViewDetail={showDetailHandler}    
                />
            }
        </React.Fragment>
    );
}

export default Events;