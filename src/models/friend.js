const mongoose = require('mongoose')

const Schema = mongoose.Schema

const friendshipSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    friend: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "requested"
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    }
})

friendshipSchema.index({
    user: 1,
    friend: 1
}, {
    unique: true
})

const Friend = mongoose.model('Friend', friendshipSchema)

module.exports = Friend