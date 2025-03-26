module.exports = {
  apps : [{
    name : 'server',
    script: './backend/out/server/server.js',
    watch: false
  }, {
    name: "simulator",
    script: './backend/out/simulator/simulationHead.js',
    watch: false
  }],
};
