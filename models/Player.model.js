const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the player model to whatever makes sense in this case
const playerSchema = new Schema({
    first_name: String,
    last_name: String,
    position: String,
    apiId: Number,
    team: {
        conference: String,
        full_name: String
    }
},
    {
        timestamps: true
    });

// const Player = model("Player", playerSchema);

module.exports = model("Player", playerSchema);