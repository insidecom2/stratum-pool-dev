const stratum = require("stratum-pool");

const pool = stratum.createPool({
  name: "MyStratumServer",
  coin: {
    name: "Bitcoin",
    symbol: "BTC",
    algorithm: "scrypt",
    blockInterval: 600,
    peerMagic: "f9beb4d9",
    peerMagicTestnet: "0b110907",
    maxOutbound: 2,
    difficultyResetInterval: 3600,
    addressPrefix: "00",
  },
  address: "mzTzco6tWEtv8YXCJuH2oh5EbHYFaAvxa3", //Address to where block rewards are given
  rewardRecipients: {
    n37vuNFkXfk15uFnGoVyHZ6PYQxppD3QqK: 1.5, //1.5% goes to pool op
    mirj3LtZxbSTharhtXvotqtJXUY7ki5qfx: 0.5, //0.5% goes to a pool co-owner

    "22851477d63a085dbc2398c8430af1c09e7343f6": 0.1,
  },
  blockRefreshInterval: 1000, //How often to poll RPC daemons for new blocks, in milliseconds
  jobRebroadcastTimeout: 55,
  connectionTimeout: 600, //Remove workers that haven't been in contact for this many seconds
  emitInvalidBlockHashes: false,
  tcpProxyProtocol: false,
  banning: {
    enabled: true,
    time: 600, //How many seconds to ban worker for
    invalidPercent: 50, //What percent of invalid shares triggers ban
    checkThreshold: 500, //Check invalid percent when this many shares have been submitted
    purgeInterval: 300, //Every this many seconds clear out the list of old bans
  },
  ports: {
    3333: {
      diff: 32,
      varDiff: {
        minDiff: 8,
        maxDiff: 512,
        targetTime: 15,
        retargetTime: 90,
        variancePercent: 30,
      },
    },
  },
  daemons: [
    {
      //Main daemon instance
      host: "127.0.0.1",
      port: 18443,
      user: "default",
      password: "fQqS1IVutP1cC_j6c78SiyDn9G8VGuX9L6YTFzZ8oeY",
    },
  ],
  users: [
    {
      username: "miner1",
      password: "1234",
    },
    {
      username: "miner2",
      password: "1234",
    },
    // Add more users as needed
  ],
  function(ip, port, workerName, password, callback) {
    //stratum authorization function
    console.log(
      "Authorize " + workerName + ":" + password + "@" + ip + " " + port
    );
    callback({
      error: null,
      authorized: true,
      disconnect: false,
    });
  },
});

pool.on("share", function (isValidShare, isValidBlock, data) {
  if (isValidBlock) console.log("Block found");
  else if (isValidShare) console.log("Valid share submitted");
  else if (data.blockHash)
    console.log(
      "We thought a block was found but it was rejected by the daemon"
    );
  else console.log("Invalid share submitted");

  console.log("share data: " + JSON.stringify(data));
});

pool.on("log", function (severity, logKey, logText) {
  console.log("Logs >> " + severity + ": " + "[" + logKey + "] " + logText);
});
pool.start();
