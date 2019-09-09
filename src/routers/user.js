const fs = require('fs')
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/authentication')

const avatar = multer({
	dest: 'images/'
})

router.post('/users/me/avatar', auth, avatar.single('file'), async (req, res) => {
	const image = fs.readFileSync(req.file.path)
	const base64EncodedImage = image.toString('base64')
	console.log(req.file)
	try {
		const imageBuffer = new Buffer(image)
		req.user.avatar = await sharp(imageBuffer).resize(250, 250).jpeg().toBuffer()
		await req.user.save()
		res.send(req.user)
	} catch (e) {
		res.status(400).send({error: e})
	}
	
}, (error, req, res, next) => {
	res.status(400).send({error: error.message}) 
})

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		if (!user || !user.avatar) {
			throw new Error()
		}
		res.set('Content-Type', 'image/jpg')
		res.send(user.avatar)
	} catch (e) {
		res.status(400)
	}

}, (error, req, res, next) => {
	res.status(400).send({error: error.message})
})

router.get('/', (req, res) => {
	res.send('Hello World!')
})

router.get('/users/profile', auth, async (req, res) => {
	req.user.generateAcceptedFriendsList()
	res.status(200).send(req.user)
})

router.post('/users', async (req, res) => {
	const user = new User(req.body)
	try {
		await user.save()
		const token = await user.generateAuthToken()
		res.status(201).send({user, token})
	} catch (e) {
		console.log("POST: /users", e)
		res.status(400).send(e)
	}
})

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.status(200).send({user, token})
	} catch (e) {
		console.log(e.message)
		res.status(401).send({
			name: e.name,
			message: e.message
		})
	}
})

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token !== req.token
		})
		await req.user.save()
		res.status(200).send('Logged out of current session')
	} catch (e) {
		res.status(500).send(e)
	}
})

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()
		res.status(200).send('Logged out of all sessions')
	} catch (e) {
		res.status(500).send(e)
	}
})

router.patch('/users/me', auth, async (req, res) => {
	console.log("Editting user: ", JSON.stringify(req.user))
	let updates = Object.keys(req.body)
	let validOperation = ['email', 'displayName', 'name', 'password']
	let isValidOperation = updates.every(update => validOperation.includes(update))

	if (!isValidOperation) {
		res.status(500).send('Invalid operation')
	}

	try {
		updates.forEach((update) => {
			req.user[update] = req.body[update]
		})
		await req.user.save()
		res.status(200).send(req.user)
	} catch (e) {
		console.log(e)
		res.status(404).send(e)
	}
})

router.get('/users/query/:name', async (req, res) => {
	try {
		const users = await User.find({name: { $regex: new RegExp("^" + req.params.name.toLowerCase(), "i") }})
		res.status(200).send(users)
	} catch (e) {
		res.status(400).send(e)
	}
})

module.exports = router