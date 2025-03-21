import mongoose from 'mongoose'

const distributionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: function(){
            return this.type === 'fixed';
        },
    },
    mean: {
        type: Number,
        required: function(){
            return this.type === 'normal';
        },
    },
    stdev: {
        type: Number,
        required: function(){
            return this.type === 'normal';
        },
    },
    lower: {
        type: Number,
        required: function(){
            return this.type === 'uniform';
        },
    },
    upper: {
        type: Number,
        required: function(){
            return this.type === 'uniform';
        },
    }
});

const Distribution = mongoose.model('Distribution', distributionSchema);

export default Distribution;