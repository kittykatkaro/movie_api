const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Top 10 movies data
const topMovies = [
	{
		title: 'The Godfather',
		description:
			'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg',
		director: {
			name: 'Francis Ford Coppola',
			description:
				'Francis Ford Coppola is an American film director, producer, and screenwriter. He was a central figure in the New Hollywood filmmaking movement of the 1960s and 1970s.',
		},
		genre: {
			name: 'Crime',
			description:
				'Crime movies are movies that focus on criminal activities.',
		},
	},
	{
		title: 'Star Wars',
		description:
			'A young farm boy joins a rebellion to save the galaxy from an evil empire.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/8/87/StarWarsMoviePoster1977.jpg',
		director: {
			name: 'George Lucas',
			description:
				'George Lucas is an American film director, producer, screenwriter, and entrepreneur. Lucas is best known for creating the Star Wars and Indiana Jones franchises and founding Lucasfilm, LucasArts, and Industrial Light & Magic.',
		},
		genre: {
			name: 'Science Fiction',
			description:
				'Science Fiction movies are movies that focus on science and technology.',
		},
	},
	{
		title: 'Jurassic Park',
		description:
			'A theme park showcasing genetically-engineered dinosaurs turns deadly when the creatures escape.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg',
		director: {
			name: 'Steven Spielberg',
			description:
				'Steven Spielberg is an American film director, producer, and screenwriter. He is considered one of the founding pioneers of the New Hollywood era and one of the most popular directors and producers in film history.',
		},
		genre: {
			name: 'Science Fiction',
			description:
				'Science Fiction movies are movies that focus on science and technology.',
		},
	},
	{
		title: 'The Matrix',
		description:
			'A computer hacker discovers the world is a simulated reality and joins a rebellion to free humanity.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg',
		director: {
			name: 'The Wachowski Brothers',
			description:
				'The Wachowski Brothers are American film directors, writers, and producers.',
		},
		genre: {
			name: 'Science Fiction',
			description:
				'Science Fiction movies are movies that focus on science and technology.',
		},
	},
	{
		title: 'Iron Man',
		description:
			'A wealthy inventor creates a high-tech suit of armor to fight crime as Iron Man.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/7/70/Ironmanposter.JPG',
		director: {
			name: 'Jon Favreau',
			description:
				'Jon Favreau is an American film director, producer, and screenwriter.',
		},
		genre: {
			name: 'Action',
			description:
				'Action movies are movies that focus on physical action.',
		},
	},
	{
		title: 'Gladiator',
		description:
			'A betrayed Roman general fights for vengeance as a gladiator.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/8/8d/Gladiator_ver1.jpg',
		director: {
			name: 'Ridley Scott',
			description:
				'Ridley Scott is an English film director and producer.',
		},
		genre: {
			name: 'Action',
			description:
				'Action movies are movies that focus on physical action.',
		},
	},
	{
		title: 'Indiana Jones and the Last Crusade',
		description:
			'An archaeologist embarks on a quest to find the Holy Grail while battling Nazis.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/f/fc/Indiana_Jones_and_the_Last_Crusade_A.jpg',
		director: {
			name: 'Steven Spielberg',
			description:
				'Steven Spielberg is an American film director, producer, and screenwriter. He is considered one of the founding pioneers of the New Hollywood era and one of the most popular directors and producers in film history.',
		},
		genre: {
			name: 'Action',
			description:
				'Action movies are movies that focus on physical action.',
		},
	},
	{
		title: 'Avengers: Endgame',
		description:
			'The Avengers assemble once more to reverse the damage caused by Thanos and save the universe.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',
		director: {
			name: 'Anthony and Joe Russo',
			description:
				'Anthony and Joe Russo are American film and television directors.',
		},
		genre: {
			name: 'Action',
			description:
				'Action movies are movies that focus on physical action.',
		},
	},
	{
		title: 'Armageddon',
		description:
			'A team of drillers is sent into space to prevent a giant asteroid from colliding with Earth.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/f/fc/Armageddon-poster06.jpg',
		director: {
			name: 'Michael Bay',
			description:
				'Michael Bay is an American film director and producer.',
		},
		genre: {
			name: 'Action',
			description:
				'Action movies are movies that focus on physical action.',
		},
	},
	{
		title: 'Assassins Creed',
		description:
			'A man relives the memories of his ancestor, an Assassin, to uncover ancient secrets.',
		imageURL:
			'https://upload.wikimedia.org/wikipedia/en/a/a3/Assassin%27s_Creed_film_poster.jpg',
		director: {
			name: 'Justin Kurzel',
			description: 'Justin Kurzel is an Australian film director.',
		},
		genre: {
			name: 'Action',
			description:
				'Action movies are movies that focus on physical action.',
		},
	},
];

// Morgan middleware to log all requests to the terminal
app.use(morgan('combined'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// GET route for "/movies" that returns top 10 movies in JSON format
app.get('/movies', (req, res) => {
	res.json(topMovies);
});

// GET movies by title
app.get('/movies/:title', (req, res) => {
	// Get the title from the request parameters
	const movieTitle = req.params.title;

	// Loop through the array and find the movie with the matching title
	const foundMovie = topMovies.find((m) => m.title === movieTitle);

	if (!foundMovie) {
		res.status(404).send('Movie not found.');
	}

	res.json(foundMovie);
});

// Return Genre description
app.get('/genres/:name', (req, res) => {
	// Get the title from the request parameters
	const genreName = req.params.name;

	console.log(genreName);

	// Loop through the array and find the movie with the matching title
	const genreMovie = topMovies.find((m) => m.genre?.name === genreName);

	if (!genreMovie) {
		res.status(404).send('Genre not found.');
	}

	res.json(genreMovie.genre.description);
});

// Return director description
app.get('/directors/:name', (req, res) => {
	// Get the title from the request parameters
	const directorName = req.params.name;

	console.log(directorName);

	// Loop through the array and find the movie with the matching title
	const directorMovie = topMovies.find(
		(m) => m.director?.name === directorName
	);

	if (!directorMovie) {
		res.status(404).send('Director not found.');
	}

	res.json(directorMovie.director.description);
});

// Create new User
app.post('/users', (req, res) => {
	res.send('User created successfully.');
});

// Update User
app.put('/users/:username', (req, res) => {
	res.send('User updated successfully.');
});

// Add movie to user's favorite list
app.put('/users/:username/movies/:title', (req, res) => {
	const username = req.params.username;
	const movieTitle = req.params.title;

	res.send(`Movie ${movieTitle} added to ${username}'s favorite list.`);
});

// Remove movie from user's favorite list
app.delete('/users/:username/movies/:title', (req, res) => {
	const username = req.params.username;
	const movieTitle = req.params.title;

	res.send(`Movie ${movieTitle} removed from ${username}'s favorite list.`);
});

// Deregister user
app.delete('/users/:username', (req, res) => {
	const username = req.params.username;

	res.send(`User ${username} deregistered successfully.`);
});

// GET route for "/" that returns a default textual response
app.get('/', (req, res) => {
	res.send(
		'Welcome to my site! Go to /documentation.html to view the documentation.'
	);
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
