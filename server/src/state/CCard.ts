import { type, Schema } from '@colyseus/schema';

export default class CCard extends Schema {
    @type(`int16`)
    number: number;

    @type(`string`)
    suit: string;

    @type(`boolean`)
    isHole: boolean = false;

    @type(`string`)
    playerSessionId: string;
}