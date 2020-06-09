const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const path = require('path');

const graphQlSchema = require('./graphql/schema/index.js');
const graphQlResolvers = require('./graphql/resolvers/index.js');
const isAuth = require('./middleware/is-auth.js');


const app = express();
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('/ping', (req, res) => res.send("pong"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(isAuth);


app.use('/graphql', graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
})
);


mongoose.connect(`mongodb+srv://admin:admin@rozvozproject-rsdzi.mongodb.net/events-react-dev?retryWrites=true&w=majority`
).then(() => {
    app.listen(process.env.PORT || 8000);
}).catch(err => {
    console.log(err);
});








