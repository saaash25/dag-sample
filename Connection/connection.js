const { default: mongoose } = require('mongoose')
const mogoose = require('mongoose')
exports.DBConnect =async()=>{
    try {
       const con = await mongoose.connect('mongodb://localhost:27017/dag-flow') 
       if(!con){
        console.log('not connected to db')
        return false
       }
       console.log('connected to db')
       return true
    } catch (error) {
        throw error
    }
}