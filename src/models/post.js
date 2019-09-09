const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
	body: {
		type: String
	},
	comments: [{
		type: String,
		date: Date

	}],
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	created_by: { type: Date, default: Date.now },
	hidden: {
		type: Boolean
	},
	meta: {
		votes: Number,
		favs: Number
	}

})

const Post = mongoose.model('Post', postSchema)

module.exports = Post