const mongoose = require("mongoose");

exports.connectMongoose = () => {
    mongoose.connect("mongodb+srv://Aarsh:Aarsh@hivemind.8sxijcm.mongodb.net/logindetails").then(e => console.log(`Connected to MongoDB:${e.connection.host}`)).catch(e => console.log(e));
}

const userSchema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    img : {
        type: Buffer
    },
    joinDate: Date
});

const pdfSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    filename: String,
    path: String,
    filedesc : String,
    uploadDate: Date,
    pdfUrl : String
  });

const HourSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    Subject : String,
    hoursConsumed: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0.00,
        get: v => parseFloat(v.toString()), // Convert Decimal128 to number
        set: v => NumberDecimal.fromString(v.toFixed(2)) // Convert number to Decimal128 with 2 decimal places
      }
})

exports.User = mongoose.model("User", userSchema);
exports.pdfSchema = mongoose.model("PDF",pdfSchema);
exports.Hours = mongoose.model("Hours", HourSchema);