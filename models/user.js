const mongoose = require('mongoose');

const Schema=mongoose.Schema;

const user_schema=new Schema({

    email:{
        type:Schema.Types.String,
        required:true,
        unique:true,
    },
    forms:[
        {
            link:{
                type:Schema.Types.String,
                required:true,
            },
            title:{
                type:Schema.Types.String,
                required:true,
            },
            createdAt:{
                type:Schema.Types.Date,
                required:true,
            }

        }
    ]
});

module.exports=mongoose.model('User',user_schema);