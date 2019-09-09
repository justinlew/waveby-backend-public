const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Friend = require('./friend')

const Schema = mongoose.Schema

const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: [true, 'An email is required'],
		validate: {
			validator: function(v) {
				return validator.isEmail(v)
			},
			message: props => `${props.value} is not a valid email`
		}
	},
	name: {
		type: String,
		required: [true, 'A name is required'],
		validate: {
			validator: function(v) {
				return v !== null && v !== ''
			},
			message: props => "Name should be non-empty"
		}
	},
	displayName: {
		type: String
	},
	avatar: {
		type: Buffer
	},
	password: {
		type: String,
		minlength: [8, 'Password must be at least 8 characters long'],
		required: [true, 'A password is required']
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}]
}, {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
})

userSchema.statics.findByCredentials = async function(email, password) {
	console.log("Attempting to login with credentials")
	const user = await User.findOne({email})
	if (!user) {
		throw new Error('Unable to login')
	}
	let isCorrectPassword = await bcrypt.compare(password, user.password)
	if (!isCorrectPassword) {
		throw new Error('Incorrect email or password')
	}
	return user
}

userSchema.methods.generateAcceptedFriendsList = async function() {
	console.log('Generating a list of friends for the user', this._id)
	const user = this
	let friends = await Friend.find({
		$or: [{user: user._id}, {friend: user._id}],
		status: 'accepted'
	})
	.populate('user', '_id name displayName avatar')
	.populate('friend', '_id name displayName avatar')
	.exec()
	let friendsUserIds = []
	for (let i = 0; i < friends.length; i++) {
		if (user._id.equals(friends[i].user._id)) {
			friendsUserIds.push({
				user: friends[i].friend,
				_id: friends[i]._id,
				conversation: friends[i].conversation
			})
		} else {
			friendsUserIds.push({
				user: friends[i].user,
				_id: friends[i]._id,
				conversation: friends[i].conversation
			})
		}
	}
	return friendsUserIds
}

userSchema.methods.generateAuthToken = async function() {
	console.log('Generating authentication token...')
	const user = this
	const token = jwt.sign({
		data: {
			_id: user._id.toString()
		}
	}, 'shhhhhh')
	console.log('Token: ', token)
	user.tokens = user.tokens.concat({token})
	await user.save()
	return token
}

userSchema.methods.toJSON = function() {
	const user = this.toObject()
	delete user.password
	delete user.tokens
	return user
}

userSchema.pre('save', async function(next) {
	const user = this
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
})

userSchema.post('save', function(error, doc, next) {
	if (error.name === 'MongoError' && error.code === 11000) {
		error.errmsg = 'An account with this email already exists'
		next()
	} else {
		next(error)
	}
})

const User = mongoose.model('User', userSchema)

module.exports = User