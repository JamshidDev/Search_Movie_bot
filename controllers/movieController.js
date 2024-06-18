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


const pagination_movie_list = async (page) => {
    try {
        let currentPage = page || 1;
        let perPage = 10;
        let total_count =await Movie.find({active:true}).countDocuments({});
        let max_page = Math.ceil(total_count/perPage);
        let result = await Movie.find({active:true}).skip((currentPage - 1)*perPage).limit(perPage)
        await Movie.find({active:true}).limit(20);
        return {
            status:true,
            max_page,
            data: result,
            total_count:total_count,
        }
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            max_page: 0,
            data: null,
        }
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


const delete_movie_by_code = async (code) => {
    try {
        let status =  await Movie.findOneAndUpdate({
            code,
            active:true
        }, {
            active: false,
        });
        return !!status;
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
    pagination_movie_list,
    delete_movie_by_code,

}