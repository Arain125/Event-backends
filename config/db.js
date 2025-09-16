const { default: mongoose } = require("mongoose")

const ConnectDB = async () => {

    await mongoose.connect(process.env.DBURI)
    .then(()=>{console.log("Connected to DB.....")})
    .catch((err)=>{console.log("Connection Failed....." ,err)})

}


module.exports = ConnectDB
