const mongoose = require('mongoose')


const MovieSchema = mongoose.Schema({
    code: {
        type: Number,
        required: true,
    },
    movies: {
        type: [Object],
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    }

}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    }
})

const Movie = mongoose.model("MovieSchema", MovieSchema)

module.exports = {Movie}