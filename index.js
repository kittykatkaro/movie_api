const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myFlix2', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Morgan middleware to log all requests to the terminal
app.use(morgan('combined'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// GET route for "/" that returns a default textual response
app.get('/', (req, res) => {
	res.send(
		'Welcome to my site! Go to /documentation.html to view the documentation.'
	);
});

// GET route for "/movies" that returns movies in JSON format
app.get('/movies', async (req, res) => {
	await Movies.find()
		.then((movies) => {
			res.status(200).json(movies);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// GET route for "/users" that returns users in JSON format
app.get('/users', async (req, res) => {
	await Users.find()
		.then((users) => {
			res.status(200).json(users);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// GET movies by title
app.get('/movies/:title', async (req, res) => {
	await Movies.findOne({ title: req.params.title })
		.then((movie) => {
			res.json(movie);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Return data about a genre (description) by name/title
app.get('/genres/:name', (req, res) => {
	Movies.findOne({
		'genre.name': { $regex: new RegExp(req.params.name, 'i') },
	})
		.then((movie) => {
			if (!movie) {
				return res
					.status(404)
					.send(req.params.name + ' was not found.');
			}
			res.json(movie.genre);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Return director description
app.get('/directors/:name', (req, res) => {
	Movies.findOne({
		'director.last_name': { $regex: new RegExp(req.params.name, 'i') },
	})
		.then((movie) => {
			if (!movie) {
				return res
					.status(404)
					.send(req.params.name + ' was not found.');
			}
			res.json(movie.director);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Create new User
app.post('/users', async (req, res) => {
	await Users.findOne({ username: req.body.username })
		.then((user) => {
			if (user) {
				return res
					.status(400)
					.send(req.body.username + 'already exists');
			} else {
				Users.create({
					username: req.body.username,
					password: req.body.password,
					email: req.body.email,
					birthday: req.body.birthday,
				})
					.then((user) => {
						res.status(201).json(user);
					})
					.catch((error) => {
						console.error(error);
						res.status(500).send('Error: ' + error);
					});
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Update User
app.put('/users/:username', async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$set: {
				username: req.body.username,
				password: req.body.password,
				email: req.body.email,
				birthday: req.body.birthday,
			},
		},
		{ new: true }
	) // updated document is returned
		.then((updatedUser) => {
			res.json(updatedUser);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error:' + err);
		});
});

// Add movie to user's favorite list
app.put('/users/:username/movies/:MovieID', async (req, res) => {
	const movie = await Movies.findOne({ _id: req.params.MovieID });
	if (!movie) {
		return res.status(400).send(req.params.MovieID + ' was not found');
	}

	await Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$addToSet: { favorites: req.params.MovieID },
		},
		{ new: true }
	)
		.then((user) => {
			res.json(user);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Remove movie from user's favorite list
app.delete('/users/:username/movies/:MovieID', async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$pull: { favorites: req.params.MovieID },
		},
		{ new: true }
	)
		.then((user) => {
			res.json(user);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

// Delete a user by username
app.delete('/users/:username', async (req, res) => {
	await Users.findOneAndDelete({ username: req.params.username })
		.then((user) => {
			if (!user) {
				res.status(400).send(req.params.username + ' was not found');
			} else {
				res.status(200).send(req.params.uername + ' was deleted.');
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
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
