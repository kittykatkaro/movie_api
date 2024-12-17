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
let allowedOrigins = [
	'http://localhost:1234',
	'http://testsite.com',
	'https://karoflix.netlify.app/',
];
app.use(
	cors()
	// 	{
	// 	origin: (origin, callback) => {
	// 		if (!origin) return callback(null, true);
	// 		if (allowedOrigins.indexOf(origin) === -1) {
	// 			let message =
	// 				'The CORS policy for this application doesn’t allow access from origin ' +
	// 				origin;
	// 			return callback(new Error(message), false);
	// 		}
	// 		return callback(null, true);
	// 	},
	// }
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
app.get(
	'/movies',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Movies.find()
			.then((movies) => {
				res.status(200).json(movies);
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send('Error: ' + error);
			});
	}
);

// GET route for "/users" that returns users in JSON format, FOR TESTING PURPOSES
/**
 * GET route for "/users" that returns a list of users in JSON format.
 * This endpoint is for testing purposes only.
 *
 * @name GetUsers
 * @route {GET} /users
 * @async
 * @function
 * @returns {void} Sends a JSON response containing an array of users.
 *
 * @example
 * // Example Response
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "username": "john_doe",
 *     "email": "john@example.com",
 *     "createdAt": "2024-06-10T12:34:56Z"
 *   },
 *   {
 *     "username": "jane_doe",
 *     "email": "jane@example.com",
 *     "createdAt": "2024-06-11T09:15:30Z"
 *   }
 * ]
 *
 * @throws {500} Returns a 500 status code if there is a server error.
 */
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
/**
 * GET route for "/movies/:title" that returns a single movie by its title.
 * This endpoint requires JWT authentication.
 *
 * @name GetMovieByTitle
 * @route {GET} /movies/:title
 * @authentication Requires JWT authentication.
 * @async
 * @function
 *
 * @param {string} req.params.title - The title of the movie to retrieve.
 *
 * @returns {void} Sends a JSON response containing the movie object.
 *
 * @example
 * // Example Request
 * GET /movies/Inception
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Response
 * HTTP/1.1 200 OK
 * {
 *   "title": "Inception",
 *   "director": "Christopher Nolan",
 *   "year": 2010,
 *   "genre": "Science Fiction"
 * }
 *
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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

// GET movie by ID
app.get(
	'/movies/:id',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		await Movies.findById(req.params.id)
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
/**
 * GET route for "/genres/:name" that returns genre data (e.g., description) by genre name/title.
 * This endpoint requires JWT authentication.
 *
 * @name GetGenreByName
 * @route {GET} /genres/:name
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.name - The name of the genre to retrieve (case-insensitive).
 *
 * @returns {void} Sends a JSON response containing the genre object or an error message.
 *
 * @example
 * // Example Request
 * GET /genres/Science%20Fiction
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "name": "Science Fiction",
 *   "description": "A genre that uses speculative, futuristic concepts."
 * }
 *
 * // Example 404 Response
 * HTTP/1.1 404 Not Found
 * "Science Fiction was not found."
 *
 * @throws {404} Returns a 404 status code if the genre is not found.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
/**
 * GET route for "/directors/:name" that returns a director's description by their last name.
 * This endpoint requires JWT authentication.
 *
 * @name GetDirectorByName
 * @route {GET} /directors/:name
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.name - The last name of the director to retrieve (case-insensitive).
 *
 * @returns {void} Sends a JSON response containing the director's information or an error message.
 *
 * @example
 * // Example Request
 * GET /directors/Nolan
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "first_name": "Christopher",
 *   "last_name": "Nolan",
 *   "bio": "British-American film director, producer, and screenwriter...",
 *   "birth": "1970-07-30",
 *   "death": null
 * }
 *
 * // Example 404 Response
 * HTTP/1.1 404 Not Found
 * "Nolan was not found."
 *
 * @throws {404} Returns a 404 status code if the director is not found.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
/**
 * POST route for "/users" that creates a new user.
 * Includes input validation for username, password, and email.
 *
 * @name CreateUser
 * @route {POST} /users
 * @function
 *
 * @param {string} req.body.username - The desired username (min 5 characters, alphanumeric).
 * @param {string} req.body.password - The user's password (required).
 * @param {string} req.body.email - The user's email address (must be valid).
 * @param {string} [req.body.birthday] - The user's birthday (optional).
 *
 * @returns {void} Sends a JSON response containing the newly created user object or an error message.
 *
 * @example
 * // Example Request
 * POST /users
 * Content-Type: application/json
 *
 * {
 *   "username": "johnDoe",
 *   "password": "12345",
 *   "email": "johndoe@example.com",
 *   "birthday": "1990-01-01"
 * }
 *
 * // Example Successful Response
 * HTTP/1.1 201 Created
 * {
 *   "username": "johnDoe",
 *   "email": "johndoe@example.com",
 *   "birthday": "1990-01-01",
 *   "_id": "60f6a2d5c8b4b123456789ab"
 * }
 *
 * // Example 400 Response (Username already exists)
 * HTTP/1.1 400 Bad Request
 * "johnDoe already exists"
 *
 * // Example 422 Response (Validation errors)
 * HTTP/1.1 422 Unprocessable Entity
 * {
 *   "errors": [
 *     { "msg": "Username is required", "param": "username" },
 *     { "msg": "Email does not appear to be valid", "param": "email" }
 *   ]
 * }
 *
 * @throws {400} Returns a 400 status code if the username already exists.
 * @throws {422} Returns a 422 status code if input validation fails.
 * @throws {500} Returns a 500 status code if there is a server error.
 */
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
/**
 * PUT route for "/users/:username" that updates a user's information.
 * This endpoint requires JWT authentication.
 *
 * @name UpdateUser
 * @route {PUT} /users/:username
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.username - The username of the user to be updated.
 * @param {string} req.body.username - The updated username (min 5 characters, alphanumeric).
 * @param {string} req.body.password - The updated password (required).
 * @param {string} req.body.email - The updated email address (must be valid).
 * @param {string} [req.body.birthday] - The updated birthday (optional).
 *
 * @returns {void} Sends a JSON response containing the updated user object or an error message.
 *
 * @example
 * // Example Request
 * PUT /users/johnDoe
 * Authorization: Bearer <JWT_TOKEN>
 * Content-Type: application/json
 *
 * {
 *   "username": "johnDoeUpdated",
 *   "password": "newPassword123",
 *   "email": "johndoeupdated@example.com",
 *   "birthday": "1990-01-01"
 * }
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "username": "johnDoeUpdated",
 *   "email": "johndoeupdated@example.com",
 *   "birthday": "1990-01-01",
 *   "_id": "60f6a2d5c8b4b123456789ab"
 * }
 *
 * // Example 400 Response (Permission Denied)
 * HTTP/1.1 400 Bad Request
 * "Permission denied"
 *
 * // Example 500 Response (Server Error)
 * HTTP/1.1 500 Internal Server Error
 * "Error: [Error details here]"
 *
 * @throws {400} Returns a 400 status code if the usernames do not match.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
		let hashedPassword = Users.hashPassword(req.body.password);
		await Users.findOneAndUpdate(
			{ username: req.params.username },
			{
				$set: {
					username: req.body.username,
					password: hashedPassword,
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
/**
 * PUT route for "/users/:username/movies/:MovieID" that adds a movie to a user's favorite list.
 * This endpoint requires JWT authentication.
 *
 * @name AddFavoriteMovie
 * @route {PUT} /users/:username/movies/:MovieID
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.username - The username of the user to update.
 * @param {string} req.params.MovieID - The ID of the movie to add to the favorites list.
 *
 * @returns {void} Sends a JSON response containing the updated user document.
 *
 * @example
 * // Example Request
 * PUT /users/johnDoe/movies/60f6a2d5c8b4b123456789ab
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "username": "johnDoe",
 *   "email": "johndoe@example.com",
 *   "favorites": ["60f6a2d5c8b4b123456789ab", "60f6a2d5c8b4b123456789ac"],
 *   "birthday": "1990-01-01",
 *   "_id": "60f6a2d5c8b4b123456789aa"
 * }
 *
 * // Example 400 Response (Movie not found)
 * HTTP/1.1 400 Bad Request
 * "60f6a2d5c8b4b123456789ab was not found"
 *
 * // Example 500 Response (Server Error)
 * HTTP/1.1 500 Internal Server Error
 * "Error: [Error details here]"
 *
 * @throws {400} Returns a 400 status code if the movie does not exist in the database.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
/**
 * DELETE route for "/users/:username/movies/:MovieID" that removes a movie from a user's favorite list.
 * This endpoint requires JWT authentication.
 *
 * @name RemoveFavoriteMovie
 * @route {DELETE} /users/:username/movies/:MovieID
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.username - The username of the user to update.
 * @param {string} req.params.MovieID - The ID of the movie to remove from the favorites list.
 *
 * @returns {void} Sends a JSON response containing the updated user document.
 *
 * @example
 * // Example Request
 * DELETE /users/johnDoe/movies/60f6a2d5c8b4b123456789ab
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "username": "johnDoe",
 *   "email": "johndoe@example.com",
 *   "favorites": ["60f6a2d5c8b4b123456789ac"],
 *   "birthday": "1990-01-01",
 *   "_id": "60f6a2d5c8b4b123456789aa"
 * }
 *
 * // Example 500 Response (Server Error)
 * HTTP/1.1 500 Internal Server Error
 * "Error: [Error details here]"
 *
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
/**
 * DELETE route for "/users/:username" that deletes a user by their username.
 * This endpoint requires JWT authentication.
 *
 * @name DeleteUser
 * @route {DELETE} /users/:username
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.username - The username of the user to be deleted.
 *
 * @returns {void} Sends a success message if the user is deleted or an error message if not.
 *
 * @example
 * // Example Request
 * DELETE /users/johnDoe
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * "johnDoe was deleted."
 *
 * // Example 400 Response (User Not Found)
 * HTTP/1.1 400 Bad Request
 * "johnDoe was not found"
 *
 * // Example 500 Response (Server Error)
 * HTTP/1.1 500 Internal Server Error
 * "Error: [Error details here]"
 *
 * @throws {400} Returns a 400 status code if the user does not exist.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
