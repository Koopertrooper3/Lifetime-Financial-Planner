import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    ownedSenarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Senario',
        required: true
    }],
    sharedSenarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Senario',
        required: true
    }]
});

const User = mongoose.model('User', userSchema);

export default User;