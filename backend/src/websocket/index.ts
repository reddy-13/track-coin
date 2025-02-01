import { connectToMexc } from './mexc';
import { connectToBybit } from './bybit';
import { connectToKuCoin } from './kucoin';

export const startWebSocketConnections = (symbol: string) => {
    connectToMexc(symbol);
    connectToBybit(symbol);
    connectToKuCoin(symbol);
};