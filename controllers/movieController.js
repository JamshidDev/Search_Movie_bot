const { Movie } = require("../models/MovieModel");
const customLogger = require("../config/customLogger");



const store = async (data) => {
    try {
        await Movie.create(data);
        return true
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}


module.exports = {
    store,

}