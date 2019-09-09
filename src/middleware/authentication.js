const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '')
		const decoded = jwt.verify(token, 'shhhhhh')
		const user = await User.findOne({_id: decoded.data._id, 'tokens.token': token})
		req.user = user
		req.token = token
		next()
	} catch (e) {
		// console.log(e)
		res.status(401).send('Please authenticate.')
	}
}

module.exports = auth