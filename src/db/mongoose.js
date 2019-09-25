const mongoose = require('mongoose')
const development = process.env.NODE_ENV !== 'production'

const mongodb = development ? 'mongodb://127.0.0.1:27017/waveby' : 'YOU THINK I WOULD BUT I DIDNT :)'
mongoose.connect(mongodb, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
})