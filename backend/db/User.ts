import mongoose from 'mongoose'
import { stateTaxSchema, StateTax } from './taxes';

interface IUser {
    googleId: string;
    name: string;
    ownedScenarios: mongoose.Types.ObjectId[];
    sharedScenarios: mongoose.Types.ObjectId[];
    stateTaxes: StateTax,
};

const userSchema = new mongoose.Schema<IUser>({
    googleId: { type: String, required: true },
    name: { type: String, required: true },
    ownedScenarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true
    }],
    sharedScenarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true
    }],
    stateTaxes: stateTaxSchema
});

const User = mongoose.model('User', userSchema);

export default User;