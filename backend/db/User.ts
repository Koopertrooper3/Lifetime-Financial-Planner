import mongoose from 'mongoose'

interface IUser {
    googleId: string;
    name: string;
    ownedSenarios: mongoose.Types.ObjectId[];
    sharedSenarios: mongoose.Types.ObjectId[];
};

const userSchema = new mongoose.Schema<IUser>({
    googleId: { type: String, required: true },
    name: { type: String, required: true },
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