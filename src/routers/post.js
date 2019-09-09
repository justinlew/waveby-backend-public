const express = require('express')
const Post = require('../models/post')
const User = require('../models/user')
const Friend = require('../models/friend')
const auth = require('../middleware/authentication')
const router = new express.Router()


router.post('/posts', auth, async (req, res) => {
	const post = new Post({
		...req.body,
		author: req.user._id
	})
	try {
		await post.save()

		const createdPost = await Post.findById(post._id).populate('author').exec()
		res.status(201).send(createdPost)
	} catch (e) {
		res.status(400).send(e)
	}
})

router.get('/posts', auth, async (req, res) => {
	console.log("Retrieving posts created by the author and friends " + req.user._id)
	try {
		const posts = await Post.find({
			author: req.user._id
		}).populate('author').exec()
		if (!posts) {
			return res.status(404).send()
		}
		res.status(200).send(posts);
	} catch (e) {
		res.status(500).send()
	}
})

// GET /timeline?sort=desc
router.get('/timeline', auth, async (req, res) => {
	console.log("Retrieving posts created by the author and friends", req.user)
	let sortBy = 'desc'
	try {
		if (req.query.sort) {
			sortBy = req.query.sort === 'asc' ? 'asc' : 'desc'
		}
		const friends = await req.user.generateAcceptedFriendsList()
		const friendIds = friends.map(friend => friend.user._id)
		friendIds.push(req.user._id)
		const posts = await Post.find({
			author: {
				"$in": friendIds
			}
		}).sort({
			'created_by': sortBy
		}).populate('author', '_id name displayName avatar').exec()
		console.log(posts)
		res.status(200).send(posts)
	} catch(e) {
		console.log(e)
	}
})

router.delete('/posts/:id', auth, async (req, res) => {
	try {
		console.log(req.params)
		const post = await Post.findOneAndDelete({
			_id: req.params.id,
			author: req.user._id
		})
		console.log(post)
		if (!post) {
			return res.status(404).send()
		}
		res.status(200).send(post)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router

