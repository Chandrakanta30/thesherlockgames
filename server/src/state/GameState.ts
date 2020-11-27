import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import CCard from './CCard';
import CPlayer from './CPlayer';
import WinPlayer from './WinPlayer';
  
export default class GameState extends Schema {
    @type({ map: CPlayer })
    players = new MapSchema<CPlayer>();

    @type([ CCard ])
    cards = new ArraySchema<CCard>();

    @type(`number`)
    activePlayerIndex: number;

    @type(`string`)
    dealerId: string;

    @type(`number`)
    smallBlindPlayerIndex: number;

    @type(`number`)
    bigBlindPlayerIndex: number;

    @type(`number`)
    minBet: number;

    @type(`int16`)
    currentBet: number;

    @type([ WinPlayer ])
    winningPlayers: ArraySchema<WinPlayer> = new ArraySchema<WinPlayer>()
    
    @type(`number`)
    pot: number = 0;
    
    @type([ CCard ])
    communityCards: ArraySchema<CCard> = new ArraySchema<CCard>();
  
    @type(`string`)
    phase: string;

    @type([ CCard ])
    deck: ArraySchema<CCard> = new ArraySchema<CCard>();

    @type(`string`)
    pokerType: string;
}