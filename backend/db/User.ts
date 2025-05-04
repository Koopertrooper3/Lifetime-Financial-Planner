import mongoose from 'mongoose'
import { stateTaxSchema, StateTax } from './taxes';

export interface IUser {
    googleId: string;
    email: string;
    name: string;
    ownedScenarios: mongoose.Types.ObjectId[];
    sharedScenarios: SharedScenario[];
    stateTaxes: StateTax,
};
export interface SharedScenario{
    permission : "read-only" | "read-write"
    scenarioID: mongoose.Types.ObjectId
}

const SharedScenarioSchema = new mongoose.Schema<SharedScenario>({
    permission: {
        type: String,
        enum: ["read-only", "write-only"]
    },
    scenarioID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario'
    }
})

const userSchema = new mongoose.Schema<IUser>({
    googleId: { type: String, required: true },
    email: { type: String, required: true},
    name: { type: String, required: true },
    ownedScenarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true
    }],
    sharedScenarios: [{
        type: SharedScenarioSchema
    }],
    stateTaxes: stateTaxSchema
});

export const User = mongoose.model('User', userSchema);

