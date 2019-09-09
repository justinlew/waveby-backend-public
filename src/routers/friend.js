const express = require('express')
const Friend = require('../models/friend')
const User = require('../models/user')
const { Conversation } = require('../models/conversation')
const auth = require('../middleware/authentication')
const router = new express.Router()

router.put('/friends/:id', auth, async (req, res) => {
    try {
        let user = await User.findById(req.user._id)
        delete req.body._id
        let friend = await Friend.findByIdAndUpdate(req.params.id, {
            ...req.body
        })

        friend = await Friend.findById(friend._id)
        res.status(200).send(friend)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/friends', auth, async (req, res) => {
    try {
        let sourceUser = await User.findById(req.user._id)
        let destinationUser = await User.findById(req.body.id)
        
        let conversation = new Conversation({
            participants: [
                sourceUser._id,
                destinationUser._id
            ]
        })
        await conversation.save()
        
        let friend = new Friend({
            user: sourceUser._id,
            friend: destinationUser._id,
            conversation: conversation._id
        })
        await friend.save()
        friend = await Friend.findById(friend._id).populate('user').populate('friend').exec()

        res.status(201).send({friend})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/friends', auth, async (req, res) => {
    try {
        let sourceUser = await User.findById(req.user._id)
        let friends = await Friend.find({
            $or: [{user: sourceUser._id}, {friend: sourceUser._id}]
        }).
        populate('user').
        populate('friend').
        exec();
        res.status(200).send(friends)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/friends', auth, async (req, res) => {
    try {
        let sourceUser = await User.findById(req.user_id)
        let destinationUser = await User.findById(req.body.id)
        let deleteFriend = await friend.findOneDelete({
            $or: [{
                user: sourceUser._id,
                friend: destinationUser._id
            }, {
                user: destinationUser._id,
                friend: sourceUser._id
            }]
        })
        res.status(200).send({deleteFriend})
    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router