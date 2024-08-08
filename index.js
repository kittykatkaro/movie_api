const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Top 10 movies data
const topMovies = [
    { title: 'The Godfather', director: 'Francis Ford Coppola' },
    { title: 'Star Wars', director: 'George Lucas' },
    { title: 'Jurassic Park', director: 'Steven Spielberg' },
    { title: 'The Matrix', director: 'The Wachowski Brothers' },
    { title: 'Iron Man', director: 'Jon Favreau' },
    { title: 'Gladiator', director: 'Ridley Scott' },
    { title: 'Indiana Jones and the Last Crusade', director: 'Steven Spielberg' },
    { title: 'Avengers: Endgame', director: 'Anthony and Joe Russo' },
    { title: 'Armageddon', director: 'Michael Bay' },
    { title: 'Assassins Creed' , director: 'Justin Kurzel'}
];

// Morgan middleware to log all requests to the terminal
app.use(morgan('combined'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// GET route for "/movies" that returns top 10 movies in JSON format
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// GET route for "/" that returns a default textual response
app.get('/', (req, res) => {
    res.send('Welcome to my site! Go to /documentation.html to view the documentation.');
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
