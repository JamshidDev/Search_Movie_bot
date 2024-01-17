const { Movie } = require("../models/MovieModel");
const customLogger = require("../config/customLogger");
const {User} = require("../models/UserModels");



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

const movie_list = async (data) => {
    try {
        return  await Movie.find({active:true}).limit(20);
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return []
    }
}

const remove_movie = async (id) => {
    try {
        await Movie.findByIdAndUpdate(id, {
            active: false,
        });

        return true

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return false
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
    search_movie_by_code,
    movie_list,
    remove_movie,

}