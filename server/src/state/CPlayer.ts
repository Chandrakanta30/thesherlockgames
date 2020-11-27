import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import CCard from './CCard';

export default class CPlayer extends Schema {
    @type(`string`)
    sessionId: string;

    @type(`int16`)
    seat: number;

    @type(`string`)
    name: string;
  
    cards: ArraySchema<CCard> = new ArraySchema<CCard>();

    bestHand: ArraySchema<CCard> = new ArraySchema<CCard>();

    @type(`string`)
    hand: string = undefined;
  
    @type(`int16`)
    totalChips: number;

    @type(`int16`)
    curMaxBet: number;
  
    @type(`int16`)
    currentBet: number;

    @type({map: `number`})
    cardFrequency: MapSchema<number> = new MapSchema<number>();

    @type({map: `number`})
    suitFrequency: MapSchema<number> = new MapSchema<number>();

    @type(`boolean`)
    isDealer: boolean = false;
}