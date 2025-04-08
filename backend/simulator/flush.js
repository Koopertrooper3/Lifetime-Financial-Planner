import { Queue } from 'bullmq';

const queue = new Queue('simulatorQueue');

async function main(){
    await queue.drain();
}

// eslint-disable-next-line no-undef
main().then(() => {process.exit()})
