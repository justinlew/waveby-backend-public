const mongoose = require('mongoose')
const development = process.env.NODE_ENV !== 'production'

const mongodb = development ? 'mongodb://127.0.0.1:27017/waveby' : 'mongodb+srv://jylew:Q23kmbwwwt@cluster0-zarwm.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(mongodb, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
})