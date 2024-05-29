const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL,{ 
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            maxPoolSize: 100,
        })
    } catch (error) {
        console.log(error)
    }
}
module.exports = {connectDB};