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

const search_movie_by_code = async (code) => {
    try {
        let result =  await Movie.findOne({
            code:code,
            active:true,
        })
        return {
            status:true,
            data:result
        };

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            movies:[]
        };
    }
}




module.exports = {
    store,
    search_movie_by_code

}