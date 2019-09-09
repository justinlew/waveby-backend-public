const express = require('express')
const cors = require('cors')
const http = require('http')
const jwt = require('jsonwebtoken')
const socketio = require('socket.io')
const bodyParser = require('body-parser')
require('./db/mongoose')
const userRouter = require('./routers/user')
const postRouter = require('./routers/post')
const friendRouter = require('./routers/friend')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

const { Conversation, Message } = require('./models/conversation')

io.use(function(socket, next) {
	if (socket.handshake.query && socket.handshake.query.token) {
		jwt.verify(socket.handshake.query.token, 'shhhhhh', async function(err, decoded) {
			if (err) return next(new Error('Authentication error'))
			socket.decoded = decoded.data
			console.log(socket.decoded)
			const conversation = await Conversation.findById(socket.handshake['query']['conversation'])
			if (!conversation.participants.includes(socket.decoded._id)) {
				return next(new Error('Authentication error'))
			}
			next()
		})
	} else {
		next(new Error('Authentication error'))
	}
})
.on('connection', async (socket) => {
	console.log('New websocket connection')
	const room = socket.handshake['query']['conversation']
	const token = socket.handshake['query']['token']
	console.log("Joining room ", room)
	socket.join(room)

	const messages = await Message.find({conversation: room}).populate('author').exec()

	socket.emit('reload messages', messages)

	socket.on('disconnect', () => {
		socket.leave(room)
		console.log("Websocket disconnected")
	})

	socket.on('chat message',async function(msg) {
		console.log(`Room: ${room} --- Message: ${msg}`)
		
		let message = new Message({
			message: msg,
			author: socket.decoded._id,
			conversation: room
		})
		await message.save()

		message = await Message.findById(message._id).populate('author').exec()
		
		io.to(room).emit('chat message', message)
	})
})

app.use(cors())
app.use(bodyParser.json({
	limit: '50mb',
	extended: true
}))
app.use(express.json())
app.use(userRouter)
app.use(postRouter)
app.use(friendRouter)

server.listen(port, () => {
	console.log('Server is up and running on port', port)
})