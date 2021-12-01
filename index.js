const ERC721 = require("./abi.json");
const Web3 = require("web3");

const CONTRACT_ACCOUNT = "0x25ed58c027921E14D86380eA2646E3a1B5C55A8b";
const CONTRACT_START = 13153967;
// Last D4R NFT Claimed
// https://etherscan.io/tx/0xc769bf34b323f78296611b5bf7486c44011998353b56f5a22f50521894fac23c
const CONTRACT_LAST_CLAIM = 13612670;

const INFURA_URL = process.env['INFURA_URL'];
const fs = require("fs");

const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
const erc721 = ERC721;
const contract = new web3.eth.Contract(erc721, CONTRACT_ACCOUNT);

const idToNumber = {};

console.info("Fetching transfers...");
contract
  .getPastEvents("Transfer", { fromBlock: CONTRACT_START, toBlock: CONTRACT_LAST_CLAIM })
  .then((events) => {
    // console.log(events)
    events.forEach((event) => {
      /* if the user does not yet have one token, add one */
      if (!idToNumber[event.returnValues.to]) {
        idToNumber[event.returnValues.to] = 1;
      } else {
        /* if they already have one, add another one */
        idToNumber[event.returnValues.to] =
          idToNumber[event.returnValues.to] + 1;
      }
      if (idToNumber[event.returnValues.from]) {
        /* if the user is sending a token to someone else, remove the token from their count */
        idToNumber[event.returnValues.from] =
          idToNumber[event.returnValues.from] - 1;
      }
    });

    const filteredArr = [];
    // console.log(idToNumber)

    Object.entries(idToNumber).forEach((item) => {
      if (item[1] !== Number(0)) {
        filteredArr.push(item[0]);
      }
    });

    console.log(filteredArr.length)
    console.log(filteredArr[filteredArr.length-1])
    console.log(idToNumber[filteredArr[filteredArr.length-1]])

    fs.writeFileSync("./snapshot.json", JSON.stringify(filteredArr));
  });