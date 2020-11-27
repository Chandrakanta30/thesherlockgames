import { type, Schema, ArraySchema } from '@colyseus/schema';
import CCard from './CCard';

export default class WinPlayer extends Schema {
    @type(`string`)
    sessionId: string;

    @type(`string`)
    name: string;

    @type(`string`)
    handName: string;

    @type(`int16`)
    currentBet: number;

    @type(`int16`)
    wonChips: number;

    @type([ CCard ])
    bestHand = new ArraySchema<CCard>();
}