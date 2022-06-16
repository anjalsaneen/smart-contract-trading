const path = require("path")
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const tradeShiftPath = path.resolve(__dirname, "contracts", "TradeShift.sol");
const source = fs.readFileSync(tradeShiftPath, "utf8");

let jsonContractSource = JSON.stringify({
  language: 'Solidity',
  sources: {
    'TradeShift.sol': {
        content: source,
     },
  },
  settings: {
      outputSelection: {
          '*': {
              "*": ["*"],
          },
      },
  },
});

const output = JSON.parse(solc.compile(jsonContractSource));

fs.ensureDirSync(buildPath);
fs.outputJsonSync(
  path.resolve(buildPath, "TradeShift.json"),
  output.contracts["TradeShift.sol"]["TradeShift"]
);