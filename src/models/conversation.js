const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageSchema = new Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    message: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const conversationSchema = new Schema({
    participants: [mongoose.Schema.Types.ObjectId],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Conversation = mongoose.model('Conversation', conversationSchema)

const Message = mongoose.model('Message', messageSchema)

module.exports = {
    Conversation,
    Message
}