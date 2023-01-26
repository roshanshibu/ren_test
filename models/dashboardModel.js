const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dashboardSchema = new Schema({
    totalBalance: {
        type: Number,
        required: true
    },
    totalIncome: {
        type: Number,
        required: true
    },
    totalExpense: {
        type: Number,
        required: true
    },
    // top3Categories: [new Schema({
    //     Name: String,
    //     Percent: Number,
    //     Icon : String,
    //     Color : String
    // }, {_id: false})],
    categories: [{
        Name: String,
        Percent: Number,
        Icon : String,
        Color : String
    }]
}, {timestamps: true});

module.exports = mongoose.model('Dashboard', dashboardSchema);