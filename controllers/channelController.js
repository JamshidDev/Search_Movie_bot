
const CHANNEL = require("../models/ChannelModel");
const customLogger = require("../config/customLogger");
const {Movie} = require("../models/MovieModel");
const { User } = require("../models/UserModels");


const index_item = async (data)=>{
    try {
        let active = data?.active;
        let ad = data?.ad;
        return  await CHANNEL.find({
            active:active,
            ad:ad,
        })
    }catch (error){
        customLogger.log({
            level: 'error',
            message: error
        });
        return false
    }
}

const all_active_item = async (data)=>{
    try {
        let channels =  await CHANNEL.find({
            active:true,
        })

        return {
            status:true,
            channels,
        }
    }catch (error){
        customLogger.log({
            level: 'error',
            message: error
        });
        return {
            status:false,
            channels:[],
        }
    }
}


const ad_channels = async(channel_id)=>{
    try {
        const existChannel =await CHANNEL.findOne({telegram_id:channel_id, active:true});
        if(existChannel){
            await CHANNEL.findByIdAndUpdate(existChannel._id, {
                ad:!existChannel.ad
            });

        }
        return  true
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return false
    }
}
const store_item = async (data) => {
    try {
        const existChannel =await CHANNEL.findOne({telegram_id:data.telegram_id});
        if(existChannel){
            data.active = true;
            await CHANNEL.findByIdAndUpdate(existChannel._id, data);
        }else{
            await CHANNEL.create(data);
        }
        return true
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return false
    }
}

const remove_item = async (id) => {
    try {
        await CHANNEL.updateOne({telegram_id:id},{
            active:false,
            ad:false
        })
        return true
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return false
    }
}

const general_statistic = async()=>{
    try {
        const active_user_count=await User.find({ active:true}).countDocuments();
        const all_movie_count=await Movie.find({ active:true}).countDocuments();
        return  {
            status:true,
            user_count:active_user_count,
            movie_count:all_movie_count,
        }
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return  {
            status:true,
            user_count:[],
            movie_count:[],
        }
    }
}

const today_statistic = async()=>{
    try {
        let today = new Date().toLocaleDateString("sv-SE");
        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setDate(startDate.getDate() + 1);

        let today_users= await User.find({
            created_at: {
                $gte: startDate,
                $lte: endDate,
            },
            active:true,
        }).countDocuments();
        let today_movies= await Movie.find({
            created_at: {
                $gte: startDate,
                $lte: endDate,
            },
            active:true,
        }).countDocuments();
        return  {
            status:true,
            user_count:today_users,
            movie_count:today_movies,
        }
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return  {
            status:true,
            user_count:[],
            movie_count:[],
        }
    }
}




module.exports = {
    store_item,
    remove_item,
    index_item,
    all_active_item,
    ad_channels,
    general_statistic,
    today_statistic,

}