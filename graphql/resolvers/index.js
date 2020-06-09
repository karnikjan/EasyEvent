const authResolver = require('./auth.js');
const eventsResolver = require('./events.js');
const bookingResolver = require('./booking.js');

const rootResolver = {
    ...authResolver,
    ...eventsResolver,
    ...bookingResolver
};

module.exports = rootResolver;