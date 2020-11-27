import { Room, Client } from 'colyseus';
import { ArraySchema, MapSchema } from '@colyseus/schema';
import GameState from '../state/GameState';
import CPlayer from '../state/CPlayer';
import { CardUtils } from '../utils/CardUtils';
import { PlayerUtils } from '../utils/PlayerUtils';
import { GameConfig } from '../config/GameConfig';
import WinPlayer from '../state/WinPlayer';
import CCard from '../state/CCard';

export class GameRoom extends Room<GameState> {
    playerCount: number = 0; //Tracks the number of players in the room

    phases: string[] = [`preFlop`, `flop`, `turn`, `river`]; // all phases in the game

    raisesMadePerRound: number = 0; //Track and limit the Raise made in a phase to the config value

    pokerConfig: GameConfig; //Config based on pokerType

    playerUtils: PlayerUtils; //Utilities for Players

    cardUtils: CardUtils; //Utilities for Cards

    gameStarted: boolean = false;

    //Create the Room
    onCreate(options: any) {
        console.log(`Room ${this.roomName} created with roomId ${this.roomId}`);

        //Setup Helper class objects
        this.cardUtils = new CardUtils();
        this.playerUtils = new PlayerUtils();

        //Set state
        this.setState(new GameState());

        //Create config
        this.state.pokerType = options.pokerType;
        if (this.state.pokerType) {
            this.pokerConfig = new GameConfig();
            this.pokerConfig.setupConfig(this.state.pokerType);
            this.maxClients = this.pokerConfig.maxPlayers;
        } else {
            console.log(
                `Invalid PokerType ${JSON.stringify(
                    options
                )} provided in options!!`
            );
            console.log(`Locking the room as this is invalid`);
            this.broadcast(
                `InvalidConfig`,
                `Invalid PokerType ${JSON.stringify(options)} provided in options!!`
            );
            this.lock();
        }

        console.log(`Poker Config ${JSON.stringify(this.pokerConfig)}`);

        //Set message handlers
        this.initializeMessageHandlers();
    }

    //New Player Joins the Room
    onJoin(client: Client, options: any) {
        console.log(`Server: Client joined with id ${client.id} and sessionId ${client.sessionId}`);

        //Create a new player and add to MapSchema
        let newPlayer: CPlayer = this.addPlayer(client.sessionId, options);
        this.state.players[client.sessionId] = newPlayer;
        this.playerCount++;

        //Lock the room when maxPlayers entered
        if (this.playerCount == this.pokerConfig.minPlayers) {
            console.log(`${this.roomId} Room Locked!!`);
            this.lock();
            setTimeout(() => {
                this.startGame();
                this.gameStarted = true;
            }, 2000);
        }
    }

    //Existing Player Leaves the Room
    async onLeave(client: Client, consented: boolean) {
        console.log(`Server: Client left with id ${client.id} and sessionId ${client.sessionId}`);

        try {
            //If consented, remove without wait
            if (consented) {
                this.removePlayer(client);
            }

            //Wait for reconnection on connection lost
            await this.allowReconnection(client, 20);
            console.log(`Client with id ${client.id} successfully reconnected!!`);
        } catch (e) {
            console.log(`Player has not reconnected, removing from Room`);
            this.removePlayer(client);
        }
    }

    //Destroy the Room
    onDispose() {
        console.log(`${this.roomName} Room with id ${this.roomId} Disposed!!`);
    }

    startGame() {

        if(this.gameStarted) {
            console.log("Game has already started");
            return;
        }

        //Lock the room if players are atleast equal to min players and
        //`startGame` message has been recieved
        if (this.playerCount >= this.pokerConfig.minPlayers && !this.locked) {
            console.log(`${this.roomId} Room Locked!!`);
            this.lock();
        }

        if (this.playerCount >= this.pokerConfig.minPlayers && this.locked) {
            //Distribute Cards
            this.distributeCards();

            //Choose 2 blinds
            this.chooseBlinds();

            //Start phase
            if (!this.moveToNextPhase(this.phases[0])) {
                this.state.phase = this.phases[0];

                setTimeout(() => {
                    this.broadcast(this.phases[0], this.getPlayerFromSeat(this.state.activePlayerIndex));
                }, 2000);
            }
        }
    }

    //Initialize all the message handler to be handled from Client
    initializeMessageHandlers() {
        //Message from client when makes a CALL
        this.onMessage(`call`, (client, betCoins) => {
            console.log(`Player with id ${client.sessionId} Made a Call`);
            console.log(`Betcoins = ${betCoins}`);
            let player: CPlayer = this.state.players[client.sessionId];
            player.currentBet += betCoins;
            player.totalChips -= betCoins;
            this.state.pot += betCoins;
            this.state.currentBet = player.currentBet;
            player.curMaxBet = this.state.currentBet;

            this.broadcast(`callMade`, player);

            this.state.activePlayerIndex = (this.state.activePlayerIndex + 1) % this.playerCount;

            //Move to next step or Next Player
            if (!this.moveToNextPhase(this.state.phase)) {
                setTimeout(() => {
                    this.broadcast(`nextPlayerMove`, this.getPlayerFromSeat(this.state.activePlayerIndex));
                }, 2000);
            }
        });

        //Message from client when makes a RAISE
        this.onMessage(`raise`, (client, betCoins) => {
            console.log(`Player with id ${client.sessionId} Made a Raise`);
            // if (this.raisesMadePerRound === this.pokerConfig.maxRaisePerRound) {
            //     console.log(`${this.pokerConfig.maxRaisePerRound} raises have been made in the current round ${this.state.phase}, please call`);
            //     client.send(`message`,
            //         `${this.pokerConfig.maxRaisePerRound} raises have been made in the current round ${this.state.phase}, please call`
            //     );
            // }
            // else {
                this.raisesMadePerRound++;
                let player: CPlayer = this.state.players[client.sessionId];
                player.currentBet += betCoins;
                this.state.pot += betCoins;
                player.totalChips -= betCoins;
                this.state.currentBet = player.currentBet;
                player.curMaxBet = this.state.currentBet;

                this.broadcast(`raiseMade`, player);

                this.state.activePlayerIndex = (this.state.activePlayerIndex + 1) % this.playerCount;

                //Move to next step or Next Player
                if (!this.moveToNextPhase(this.state.phase)) {
                    setTimeout(() => {
                        this.broadcast(`nextPlayerMove`, this.getPlayerFromSeat(this.state.activePlayerIndex));
                    }, 2000);
                }
            //}
        });

        //Message from client when makes a FOLD
        this.onMessage(`fold`, (client, message) => {
            console.log(`Player with id ${client.sessionId} Made a fold`);

            this.broadcast(`foldMade`, this.state.players[client.sessionId]);

            //TODO: Need to remove this players betAmount from his collection
            delete this.state.players[client.sessionId];
            this.playerCount--;

            let i = 0;
            for(let id in this.state.players) {
                if( i < this.playerCount) {
                    let player: CPlayer = this.state.players[id];
                    player.seat = i;
                    i++;
                }
            }

            if(this.playerCount <= 1) {
                if(this.playerCount == 0) {
                    return;
                }

                this.broadcast(`GameOver`, this.state.pot);
                this.gameStarted = false;
                return;
            }

            this.state.activePlayerIndex = (this.state.activePlayerIndex + 1) % this.playerCount;

            //Move to next step or Next Player
            if (!this.moveToNextPhase(this.state.phase)) {
                setTimeout(() => {
                    this.broadcast(`nextPlayerMove`, this.getPlayerFromSeat(this.state.activePlayerIndex));
                }, 2000);
            }
        });

        //Message from client when makes a CHECK
        this.onMessage(`check`, (client, message) => {
            console.log(`Player with id ${message.player.id} Made a Check`);

            this.state.activePlayerIndex = (message.activePlayerIndex + 1) % this.playerCount;

            //Move to next step or Next Player
            if (!this.moveToNextPhase(this.state.phase))
                this.broadcast(`nextPlayerMove`, this.state);
        });

        this.onMessage(`restart`, (client, message) => {
            console.log(`Game has restarted`);
            if(!this.gameStarted) {
                this.resetGame();
                this.startGame();
                this.gameStarted = true;
            }
        });
    }

    //adds a new player to the Room
    addPlayer(sessionId: string, options: any): CPlayer {
        let newPlayer: CPlayer = new CPlayer();
        newPlayer.sessionId = sessionId;
        newPlayer.name = options.name;
        newPlayer.totalChips = options.coins;
        newPlayer.currentBet = 0;
        newPlayer.seat = this.playerCount;
        console.log(`New Player ${JSON.stringify(newPlayer)} added Successfully!!`);
        return newPlayer;
    }

    //removes a player from the Room
    removePlayer(client: Client) {
        delete this.state.players[client.sessionId];
        this.playerCount--;
        console.log(`${client.sessionId} Player removed!!`);
    }

    //distributes Cards to all players
    distributeCards() {
        this.state.deck = this.cardUtils.getDeck();
        for (let i = 0; i < this.pokerConfig.holeCards; i++) {
            for (let playerId in this.state.players) {
                let player: CPlayer = this.state.players[playerId];
                let res = this.cardUtils.popCards(this.state.deck, 1);
                this.state.deck = res.deck;
                res.chosenCards[0].isHole = true;
                res.chosenCards[0].playerSessionId = player.sessionId;
                player.cards.push(res.chosenCards[0]);
                this.state.cards.push(res.chosenCards[0]);
                console.log('Player, Card', player.sessionId, JSON.stringify(res.chosenCards[0]));
            }
        }

        setTimeout(() => {
            this.broadcast(`distributeCards`);
        }, 2000);
    }

    //Choose Small & Big Blinds
    chooseBlinds() {
        const randomIndex = this.playerUtils.getRandomIndex(this.playerCount);
        const dealer: CPlayer = this.getPlayerFromSeat(randomIndex);
        this.state.dealerId = dealer.sessionId;
        this.state.players[this.state.dealerId].isDealer = true;
        this.state.minBet = this.pokerConfig.minBet;
        this.state.currentBet = this.pokerConfig.minBet * 2;

        this.state.smallBlindPlayerIndex = (dealer.seat + 1) % this.playerCount;
        this.state.bigBlindPlayerIndex = (dealer.seat + 2) % this.playerCount;
        
        let smallBlindPlayer: CPlayer = this.getPlayerFromSeat(this.state.smallBlindPlayerIndex);
        smallBlindPlayer.currentBet = this.state.minBet;
        smallBlindPlayer.totalChips -= this.state.minBet
        smallBlindPlayer.curMaxBet = this.state.currentBet;
        this.state.pot += this.state.minBet;

        let bigBlindPlayer: CPlayer = this.getPlayerFromSeat(this.state.bigBlindPlayerIndex);
        bigBlindPlayer.currentBet = this.state.minBet * 2;
        bigBlindPlayer.totalChips -= this.state.minBet * 2
        bigBlindPlayer.curMaxBet = this.state.currentBet;
        this.state.pot += this.state.minBet * 2;


        this.state.activePlayerIndex = (this.state.bigBlindPlayerIndex + 1) % this.playerCount;

        console.log(`SmallIndex ${this.state.smallBlindPlayerIndex} and BigIndex ${this.state.bigBlindPlayerIndex}`);

        setTimeout(() => {
            this.broadcast(`smallBlind`, smallBlindPlayer);
            this.broadcast(`bigBlind`, bigBlindPlayer);
        }, 2000);
    }

    //Move to next phase if all players bets are equal else return false to move to next player
    moveToNextPhase(phase: string): boolean {
        const activerPlayer: CPlayer = this.getPlayerFromSeat(this.state.activePlayerIndex);
        if (activerPlayer.currentBet === this.state.currentBet && phase !== `river`) {
            if (this.state.phase === this.pokerConfig.betDoubleInRound) {
                this.state.minBet = this.state.minBet * 2;
            }

            this.state.currentBet = this.state.minBet;
            const nexPhaseIndex = this.phases.indexOf(phase) + 1;
            console.log(`The previous Phase ${phase} has pot ${this.state.pot}`);
            console.log(`The phase index ${nexPhaseIndex} and Phase ${this.phases[nexPhaseIndex]}`);
            this.state.phase = this.phases[nexPhaseIndex];

            let res = this.cardUtils.revealPhaseComunityCards(this.state.phase, this.state.deck);
            this.state.deck = res.deck;
            console.log(`Community Cards for Phase ${this.state.phase}`);
            res.communityCards.forEach((comCard) => {
                console.log(JSON.stringify(comCard));
                
                this.broadcast(`communityCard`, comCard);
                this.state.communityCards.push(comCard);
            });

            setTimeout(() => {
                this.broadcast(this.phases[nexPhaseIndex], this.getPlayerFromSeat(this.state.activePlayerIndex));
            }, 2000);

            return true;
        }

        //When river then compute Hands because its SHOWDOWN time
        if (activerPlayer.currentBet === this.state.currentBet && phase === `river`) {
            this.computeHands();

            return true;
        }

        return false;
    }

    computeHands() {
        console.log(`SHOW DOWN TIME, COMPUTE THE HANDS`);
            this.state.players = this.cardUtils.computeHands(
                this.state.players,
                this.state.communityCards,
                this.pokerConfig.holeCardsToBeUsed,
                this.pokerConfig.cardsInHand,
                this.playerUtils.rankByHand
            );

            let winners: ArraySchema<CPlayer> = this.playerUtils.determineWinners(
                this.state.players
            );
            let wonChips = this.state.pot / winners.length;
            winners.forEach((player) => {
                let winPlayer: WinPlayer = new WinPlayer();
                winPlayer.name = player.name;
                winPlayer.sessionId = player.sessionId;
                winPlayer.handName = player.hand;
                winPlayer.bestHand = player.bestHand;
                winPlayer.currentBet = player.currentBet;
                winPlayer.wonChips = wonChips;
                this.state.winningPlayers.push(winPlayer);

                setTimeout(() => {
                    console.log(JSON.stringify(winPlayer.bestHand));
                    winPlayer.bestHand.forEach(card => {
                        card.playerSessionId = winPlayer.sessionId;
                        this.broadcast(`bestHandCard`, card);
                    });
                }, 1000);
            });

            

            setTimeout(() => {
                this.broadcast(`GameOver`, 0);
                this.gameStarted = false;
            }, 2000);
    }

    getPlayerFromSeat(seat: number) : CPlayer {
        for(let id in this.state.players) {
            if(this.state.players[id].seat === seat) {
                return this.state.players[id];
            }
        }

        return null;
    }

    resetGame() {
        this.state.cards = new ArraySchema<CCard>();
        this.state.winningPlayers = new ArraySchema<WinPlayer>();
        this.state.communityCards = new ArraySchema<CCard>();
        this.state.deck = new ArraySchema<CCard>();
        this.state.pot = 0;

        for(let id in this.state.players) {
            let player: CPlayer = this.state.players[id];
            player.cards = new ArraySchema<CCard>();
            player.bestHand = new ArraySchema<CCard>();
            player.hand = undefined;
            player.curMaxBet = 0;
            player.currentBet = 0;
            player.cardFrequency = new MapSchema<number>();
            player.suitFrequency = new MapSchema<number>();
        }
    }
}
