const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

userSchema.statics.hashPassword = (password) => {
	return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
