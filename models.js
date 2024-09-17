const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	year: Number,
	genre: {
		name: String,
		description: String,
	},
	director: {
		first_name: String,
		last_name: String,
		bio: String,
	},
	imagePath: String,
	featured: { type: Boolean, default: false },
});

let userSchema = mongoose.Schema({
	username: { type: String, required: true },
	password: { type: String, required: true },
	email: { type: String, required: true },
	birthday: Date,
	favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
