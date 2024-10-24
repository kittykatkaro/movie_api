const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

const { check, validationResult } = require('express-validator');

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
// mongoose.connect('mongodb://localhost:27017/myFlix2', {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				let message =
					'The CORS policy for this application doesn’t allow access from origin ' +
					origin;
				return callback(new Error(message), false);
			}
			return callback(null, true);
		},
	})
);

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

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

// GET route for "/users" that returns users in JSON format, FOR TESTING PURPOSES
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
app.get(
	'/movies/:title',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Movies.findOne({ title: req.params.title })
			.then((movie) => {
				res.json(movie);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

// Return data about a genre (description) by name/title
app.get(
	'/genres/:name',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
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
	}
);

// Return director description
app.get(
	'/directors/:name',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
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
	}
);

// Create new User
app.post(
	'/users', // Validation logic here
	[
		check('username', 'Username is required').isLength({ min: 5 }),
		check(
			'username',
			'Username contains non alphanumeric characters - not allowed.'
		).isAlphanumeric(),
		check('password', 'Password is required').not().isEmpty(),
		check('email', 'Email does not appear to be valid').isEmail(),
	],
	async (req, res) => {
		// Check the validation object for errors
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		let hashedPassword = Users.hashPassword(req.body.password);
		await Users.findOne({ username: req.body.username }) // Search to see if a user with the requested username already exists
			.then((user) => {
				if (user) {
					// If the user is found, send a response that it already exists
					return res
						.status(400)
						.send(req.body.username + 'already exists');
				} else {
					Users.create({
						username: req.body.username,
						password: hashedPassword,
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
	}
);

// Update User
app.put(
	'/users/:username',
	// Validation logic here
	[
		check('username', 'Username is required').isLength({ min: 5 }),
		check(
			'username',
			'Username contains non alphanumeric characters - not allowed.'
		).isAlphanumeric(),
		check('password', 'Password is required').not().isEmpty(),
		check('email', 'Email does not appear to be valid').isEmail(),
	],
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		if (req.params.username !== req.body.username) {
			return res.status(400).send('Permission denied');
		}
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
	}
);

// Add movie to user's favorite list
app.put(
	'/users/:username/movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
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
	}
);

// Remove movie from user's favorite list
app.delete(
	'/users/:username/movies/:MovieID',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
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
	}
);

// Delete a user by username
app.delete(
	'/users/:username',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Users.findOneAndDelete({ username: req.params.username })
			.then((user) => {
				if (!user) {
					res.status(400).send(
						req.params.username + ' was not found'
					);
				} else {
					res.status(200).send(req.params.username + ' was deleted.');
				}
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send('Error: ' + err);
			});
	}
);

// Error-handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err.stack);
	res.status(500).send('Something broke!');
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('Listening on Port ' + port);
});
