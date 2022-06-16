import web3 from "./web3";
import TradeShift from "./build/TradeShift.json";
import Address from "../address.json";

const tradeShift = () => {
  return new web3.eth.Contract(TradeShift.abi, Address.address);
};
export default tradeShift;
