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

})

const Movie = mongoose.model("MovieSchema", MovieSchema)

module.exports = {Movie}