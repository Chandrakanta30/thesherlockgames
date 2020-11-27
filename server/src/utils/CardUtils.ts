import { MapSchema, ArraySchema } from '@colyseus/schema';
import CPlayer from "../state/CPlayer";
import CCard from '../state/CCard';
import { GameConfig } from "../config/GameConfig";

//Utility class for CCards
export class CardUtils {
	totalCCards = 52;
	suits = [
		'Heart', //0
		'Spade', //1
		'Club', //2
		'Diamond' //3
	];

	//These varaibles are just for refrence of how the CCard numbers are used by the back-end server
	//These are never used
	CCards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	VALUE_MAP = {
		2:1,
		3:2,
		4:3,
		5:4,
		6:5,
		7:6,
		8:7,
		9:8,
		10:9,
		J:10,
		Q:11,
		K:12,
		A:13
	};

	randomizePosition = (min: number, max: number) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	getShuffledNums = () => {
		let shuffledNums = new Array<number>(this.totalCCards);
		for (let i = 0; i < this.totalCCards; i++) {
			if (i === 51) {
				// Fill last undefined slot when only 1 CCard left to shuffle
				const lastSlot = shuffledNums.findIndex((val) => val == undefined);
				shuffledNums[lastSlot] = i + 1;
			}
			else {
				let shuffleToPosition = this.randomizePosition(0, this.totalCCards - 1);
				while (shuffledNums[shuffleToPosition]) {
					shuffleToPosition = this.randomizePosition(0, this.totalCCards - 1);
				}
				shuffledNums[shuffleToPosition] = i + 1;
			}
		}
		return shuffledNums;
	}

	popCards = (deck: ArraySchema<CCard>, numToPop: number) => {
		let chosenCards: ArraySchema<CCard> = new ArraySchema<CCard>();
		for(let i = 0; i < numToPop; i++) {
			chosenCards.push(deck.pop());
		}
		return { deck, chosenCards };
	}

	getSuit(CCard: number) : string {
		let res = Math.floor(CCard / 13);
		let mod = CCard % 13;
		if( mod == 0 )
			res--;

		return this.suits[res];
	}

	getDeck() : ArraySchema<CCard> {
		let nums = this.getShuffledNums();
		let deck: ArraySchema<CCard> = new ArraySchema<CCard>();
		nums.forEach((num) => {
			let card: CCard = new CCard();
			card.suit = this.getSuit(num);
			let number = num % 13;
			if(number == 0)
				number = 13;
			card.number = number;
			deck.push(card);
		});
		return deck;
	}

	revealPhaseComunityCards(phase: string, deck: ArraySchema<CCard>) {
		let comCCards: ArraySchema<CCard> = new ArraySchema<CCard>();
		let res;
		if(phase === `flop`) {
			res = this.popCards(deck, 3);
			res.chosenCards.forEach((chosenCard) => {
				comCCards.push(chosenCard);
			});
		}
		else if(phase === `turn` || phase === `river`) {
			res = this.popCards(deck, 1);
			res.chosenCards.forEach((chosenCard) => {
				comCCards.push(chosenCard);
			});
		}
		return {deck: res.deck, communityCards: comCCards };
	}

	computeHands(players: MapSchema<CPlayer>, communityCards: ArraySchema<CCard>, holeCardsToBeUsed: number, cardsInHand: number, rankByHand: string[]) : MapSchema<CPlayer> {
		for(let key in players) {
			let player: CPlayer = players[key];

			console.log(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);
			console.log(`Player hand Compute for ${player.sessionId}`);

			if(holeCardsToBeUsed) {
				player = this.computeHandAsPerGameConfig(player, communityCards, holeCardsToBeUsed, cardsInHand, rankByHand);
			}
			else {
				for(let i = 0; i < player.cards.length; i++) {
					player = this.computeHandAsPerGameConfig(player, communityCards, i + 1, cardsInHand, rankByHand);
				}
			}
		}
		
		return players;
	}

	computeHandAsPerGameConfig(player: CPlayer, communityCards: ArraySchema<CCard>, holeCardsToBeUsed: number, cardsInHand: number, rankByHand: string[]) : CPlayer {
		let startPlayerCardIndex: number = 0;
		let nextPlayerCardIndex: number = 0;
		let playerCardUsed: number = 0;
		let startComCardIndex: number = 0;
		let nextComCardIndex: number = 0;
		let comCardUsed: number = 0;
		let counter: number = 0;

		do {
			console.log(`In Player Cards Do holeCardsToBeUsed: ${holeCardsToBeUsed}`);
			let playerCardsToBeUsed: ArraySchema<CCard> = new ArraySchema<CCard>();

			while(counter < holeCardsToBeUsed && playerCardUsed < player.cards.length) {
				playerCardsToBeUsed.push(player.cards[playerCardUsed]);
				playerCardUsed = (playerCardUsed + 1) % player.cards.length;
				counter++;
			}
			nextPlayerCardIndex = (nextPlayerCardIndex + 1) % player.cards.length;
			playerCardUsed = nextPlayerCardIndex;
			counter = 0;
			console.log(`Next Player Card Start Index: ${nextPlayerCardIndex}`);

			do {
				let comCardsToBeUsed: ArraySchema<CCard> = new ArraySchema<CCard>();

				console.log(`In Comm Cards Do Cards in Hand: ${cardsInHand}`);

				while(counter < (cardsInHand - holeCardsToBeUsed) && comCardUsed < communityCards.length) {
					comCardsToBeUsed.push(communityCards[comCardUsed]);
					comCardUsed = (comCardUsed + 1) % communityCards.length;
					counter++;
				}
				nextComCardIndex = (nextComCardIndex + 1) % communityCards.length;
				comCardUsed = nextComCardIndex;
				counter = 0;
				console.log(`Next Comm Card Start Index: ${nextComCardIndex}`);

				let cardsToBeUsed: ArraySchema<CCard> = new ArraySchema<CCard>();
				playerCardsToBeUsed.forEach((card) => {
					cardsToBeUsed.push(card);
				});
				comCardsToBeUsed.forEach((card) => {
					cardsToBeUsed.push(card);
				});

				cardsToBeUsed.sort((a,b) => b.number - a.number);

				let cardFrequency: MapSchema<number> = new MapSchema<number>();
				let suitFrequency: MapSchema<number> = new MapSchema<number>();
				cardsToBeUsed.forEach((card) => {
					if(!cardFrequency[card.number])
						cardFrequency[card.number] = 0;
					cardFrequency[card.number] = cardFrequency[card.number] + 1;
		
					if(!suitFrequency[card.suit])
						suitFrequency[card.suit] = 0;
					suitFrequency[card.suit] = suitFrequency[card.suit] + 1;
				});

				console.log(`==================================================`);
				console.log(`CCard Frequency ${JSON.stringify(cardFrequency)}`);
				console.log(`Suit Frequency ${JSON.stringify(suitFrequency)}`);
				console.log(`CCards Used ${JSON.stringify(cardsToBeUsed)}`);
						
				let handRes = this.computeCPlayerHand(suitFrequency, cardFrequency, cardsToBeUsed);

				let changeRes: boolean = false;
				if(player.hand === undefined) {
					changeRes = true;
				}
				else {
					if(rankByHand.indexOf(player.hand) > rankByHand.indexOf(handRes.hand))
						changeRes = true;
					}

				if(changeRes) {
					player.hand = handRes.hand;
					player.bestHand.splice(0, player.bestHand.length);
					handRes.bestHand.forEach((card) => {
						player.bestHand.push(card);
					});
				}
			}
			while(nextComCardIndex != startComCardIndex);
		}
		while(nextPlayerCardIndex != startPlayerCardIndex);

		console.log(`CPlayer Best Hand Name ${player.hand}`);
		console.log(`CPlayer Best Hand -- ${JSON.stringify(player.bestHand)}`);
		console.log(`==================================================`);

		return player;
	}

	computeCPlayerHand(suitFrequency: MapSchema<number>, cardFrequency: MapSchema<number>, cardsToBeUsed: ArraySchema<CCard> ) {
		const flushRes = this.isFlush(suitFrequency);
		const flushCCards = (flushRes.isFlush) && this.getSuitCards(cardsToBeUsed, flushRes.flushSuit);
		const royalFlushRes = (flushRes.isFlush) && this.isRoyalFlush(flushCCards);
		const straightFlushRes = this.isStraightFlush(flushCCards);
		const straightRes = this.isStraight(cardsToBeUsed);
		const straightLowRes = this.isLowStraight(cardsToBeUsed);
		const frequencyRes = this.computeFrequency(cardsToBeUsed, cardFrequency);

		// console.log(`==================================================`);
		// console.log(`CPlayer hand Compute for ${CPlayer.id}`);
		// console.log(`CPlayer CCards == ${JSON.stringify(CPlayer.CCards)}`)
		console.log(`isRoyalFLush: ${royalFlushRes}`);
		console.log(`isStraightFLush: ${straightFlushRes.isStraightFlush} --- isStraightLowFlush: ${straightFlushRes.isLowStraightFlush}`);
		console.log(`isFourOfAKind: ${frequencyRes.isFourOfAKind}`);
		console.log(`isFullHouse: ${frequencyRes.isFullHouse}`);
		console.log(`isFlush: ${flushRes.isFlush}`);
		console.log(`isStraight: ${straightRes.isStraight} --- isStraightLow: ${straightLowRes.isLowStraight}`);
		console.log(`isThreeOfAKind: ${frequencyRes.isThreeOfAKind}`);
		console.log(`isTwoPairs: ${frequencyRes.isTwoPair}`);
		console.log(`isOnePair: ${frequencyRes.isPair}`);
		// console.log(`==================================================`);

		let bestHand: ArraySchema<CCard> = new ArraySchema<CCard>();
		let hand: string = undefined;
		if(royalFlushRes) {
			flushCCards.slice(0, 5).forEach((card) => {
				bestHand.push(card);
			});
			hand = `RoyalFLush`;
		}
		else if(straightFlushRes.isStraightFlush || straightFlushRes.isLowStraightFlush) {
			if(straightFlushRes.isStraightFlush) {
				for(let i = 0; i < 5; i++) {
					bestHand.push(straightFlushRes.concurrentCCards[i]);
				}
				hand = `StraightFlush`;
			}
			else {
				straightFlushRes.concurrentCCardsLow[0].number = 13;
				for(let i = 0; i < 5; i++) {
					bestHand.push(straightFlushRes.concurrentCCardsLow[i]);
				}
				hand = `LowStraightFlush`;
			}
		}
		else if(frequencyRes.isFourOfAKind) {
			let CCardsCopy: ArraySchema<CCard> = this.copyCards(cardsToBeUsed);
			for(let i = 0; i < 4; i++) {
				let indexOfQuad = CCardsCopy.findIndex(CCard => CCard.number === frequencyRes.quads[0]);
				bestHand.push(CCardsCopy[indexOfQuad]);
				CCardsCopy = this.filterIndexCard(CCardsCopy, indexOfQuad);
			}
			bestHand.push(CCardsCopy[0]);
			hand = `FourOfAKind`;
		}
		else if(frequencyRes.isFullHouse) {
			let CCardsCopy: ArraySchema<CCard> = this.copyCards(cardsToBeUsed);
			for (let i = 0; i < 3; i++) {
				const indexOfTripple = CCardsCopy.findIndex(CCard => CCard.number === frequencyRes.tripples[0]);
				bestHand.push(CCardsCopy[indexOfTripple]);
				CCardsCopy = this.filterIndexCard(CCardsCopy, indexOfTripple);
			}

			if (frequencyRes.tripples.length > 1) {
				for (let i = 0; i < 2; i++) {
					const indexOfPair = CCardsCopy.findIndex(CCard => CCard.number === frequencyRes.tripples[1]);
					bestHand.push(CCardsCopy[indexOfPair]);
					CCardsCopy = this.filterIndexCard(CCardsCopy, indexOfPair);
				}
			}
			else {
				for (let i = 0; i < 2; i++) {
					const indexOfPair = CCardsCopy.findIndex(CCard => CCard.number === frequencyRes.pairs[0]);
					bestHand.push(CCardsCopy[indexOfPair]);
					CCardsCopy = this.filterIndexCard(CCardsCopy, indexOfPair);
				}
			}
			hand = `FullHouse`;
		}
		else if(flushRes.isFlush) {
			flushCCards.slice(0, 5).forEach((CCard) => {
				bestHand.push(CCard);
			});
			hand = `Flush`;
		}
		else if(straightRes.isStraight || straightLowRes.isLowStraight) {
			if(straightRes.isStraight) {
				for(let i = 0; i < 5; i++) {
					bestHand.push(straightRes.concurrentCCards[i]);
				}
				hand = `Straight`;
			}
			else {
				straightLowRes.concurrentCCardsLow[0].number = 13;
				for(let i = 0; i < 5; i++) {
					bestHand.push(straightLowRes.concurrentCCardsLow[i]);
				}
				hand = `LowStraight`;
			}
		}
		else if(frequencyRes.isThreeOfAKind) {
			let CCardsCopy: ArraySchema<CCard> = this.copyCards(cardsToBeUsed);
			for (let i = 0; i < 3; i++) {
				const indexOfTripple = CCardsCopy.findIndex(CCard => CCard.number === frequencyRes.tripples[0]);
				bestHand.push(CCardsCopy[indexOfTripple]);
				CCardsCopy = this.filterIndexCard(CCardsCopy, indexOfTripple);
			}
			bestHand.push(CCardsCopy[0]);
			bestHand.push(CCardsCopy[1]);
			hand = `ThreeOfAKind`;
		}
		else if(frequencyRes.isTwoPair) {
			let CCardsCopy: ArraySchema<CCard> = this.copyCards(cardsToBeUsed);
			for (let i = 0; i < 2; i++) {
				const indexOfPair = CCardsCopy.findIndex(CCard => CCard.number === frequencyRes.pairs[0]);
				bestHand.push(CCardsCopy[indexOfPair]);
				CCardsCopy = this.filterIndexCard(CCardsCopy, indexOfPair);
			}

			for (let i = 0; i < 2; i++) {
				const indexOfPair = CCardsCopy.findIndex(CCard => CCard.number === frequencyRes.pairs[1]);
				bestHand.push(CCardsCopy[indexOfPair]);
				CCardsCopy = this.filterIndexCard(CCardsCopy, indexOfPair);
			}
			bestHand.push(CCardsCopy[0]);
			hand = `TwoPair`;
		}
		else if(frequencyRes.isPair) {
			let CCardsCopy: ArraySchema<CCard> = this.copyCards(cardsToBeUsed);
			for (let i = 0; i < 2; i++) {
				const indexOfPair = CCardsCopy.findIndex(CCard => CCard.number === frequencyRes.pairs[0]);
				bestHand.push(CCardsCopy[indexOfPair]);
				CCardsCopy = this.filterIndexCard(CCardsCopy, indexOfPair);
			}

			bestHand.push(CCardsCopy[0]);
			bestHand.push(CCardsCopy[1]);
			bestHand.push(CCardsCopy[2]);
			hand = `Pair`;
		}
		else {
			cardsToBeUsed.slice(0, 5).forEach((card) => {
				bestHand.push(card);
			});
			hand = `HighCard`;
		}

		return { bestHand: bestHand, hand: hand };
	}

	isFlush(suitFrequency: MapSchema<number>) {
		for(let suit in suitFrequency) {
			if(suitFrequency[suit] >= 5) {
				return {isFlush: true, flushSuit: suit};
			}
		}
		return {isFlush: false, flushSuit: null};
	}

	isRoyalFlush(CCards: ArraySchema<CCard>) {
		if ((CCards[0].number === 13) && (CCards[1].number === 12) && 
			(CCards[2].number === 11) && (CCards[3].number === 10) &&
			(CCards[4].number === 10)) { 
				return true;
		}
		else {
			return false;
		} 
	}

	isStraightFlush(CCards: ArraySchema<CCard>) {
		if(!CCards) {
			return { isStraightFlush: false, isLowStraightFlush: false };
		}
		const straightRes = this.isStraight(CCards);
		const lowStraightRes = this.isLowStraight(CCards);
		return { isStraightFlush: straightRes.isStraight, isLowStraightFlush: lowStraightRes.isLowStraight, 
				concurrentCCards: straightRes.concurrentCCards, concurrentCCardsLow: lowStraightRes.concurrentCCardsLow};
	}

	isStraight(CCards: ArraySchema<CCard>) {
		return this.checkStraight(CCards, false);
	}

	isLowStraight(CCards: ArraySchema<CCard>) {
		if(CCards[0].number === 13) {
			let CCardsCopy: ArraySchema<CCard> = this.copyCards(CCards);
			CCardsCopy[0].number = 0;
			CCardsCopy.sort((a,b) => b.number - a.number);
			return this.checkStraight(CCardsCopy, true);
		}
		return {isLowStraight: false };
	}

	checkStraight(CCards: ArraySchema<CCard>, forLow: boolean) {
		if (CCards.length < 5) {
			if(forLow)
				return {isLowStraight: false };
			else
				return {isStraight: false };
		}
	
		let checkValue = forLow ? 1 : -1
		let numConcurrentCCards = 0;
		let concurrentCCards: ArraySchema<CCard> = new ArraySchema<CCard>();
		for (let i = 1; i < CCards.length; i++) {
			if (numConcurrentCCards === 5) {
				if(forLow)
					return { isLowStraight: true, concurrentCCardsLow: concurrentCCards };
				else
					return { isStraight: true, concurrentCCards: concurrentCCards };
			}
		
			if ((CCards[i].number - CCards[i - 1].number) === checkValue) {
				if(numConcurrentCCards === 0) {
					numConcurrentCCards = 2;
					concurrentCCards.push(CCards[i - 1]);
					concurrentCCards.push(CCards[i]);
				}
				else {
					numConcurrentCCards++;
					concurrentCCards.push(CCards[i]);
				}
			}
			else {
				numConcurrentCCards = 0;
					concurrentCCards = new ArraySchema<CCard>(); 
			}
		}
		
		if (numConcurrentCCards >= 5) {
			if(forLow)
				return { isLowStraight: true, concurrentCCardsLow: concurrentCCards };
			else
				return { isStraight: true, concurrentCCards: concurrentCCards };
		}
		else {
			if(forLow)
				return { isLowStraight: false, concurrentCCardsLow: concurrentCCards };
			else
				return { isStraight: false, concurrentCCards: concurrentCCards };
		}
	}

	computeFrequency(CCards: ArraySchema<CCard>, CCardFrequency: MapSchema<number>) {
		let isFourOfAKind = false;
		let isFullHouse = false
		let isThreeOfAKind = false;
		let isTwoPair = false;
		let isPair = false;
		let pairs: Array<number> = new Array<number>();
		let tripples: Array<number> = new Array<number>();
		let quads: Array<number> = new Array<number>();

		for (let key in CCardFrequency) {
			if (CCardFrequency[key] === 4) {
				isFourOfAKind = true;
				quads.push(Number(key));
			}

			if (CCardFrequency[key] === 3) {
				isThreeOfAKind = true;
				tripples.push(Number(key));
			}

			if (CCardFrequency[key] === 2) {
				isPair = true;
				pairs.push(Number(key));
			}
		}

		// Ensure histogram arrays are sorted in descending order to build best hand top down
		pairs = pairs.sort((a,b) => b - a);
		tripples = tripples.sort((a,b) => b - a);
		quads = quads.sort((a,b) => b - a);
		
		// check fullHouse & twoPairs
		if((tripples.length >= 2) || (pairs.length >= 1 && tripples.length >=1)) {
			isFullHouse = true
		}

		if(pairs.length >= 2) {
			isTwoPair = true
		}

		return { isFourOfAKind, isFullHouse, isThreeOfAKind, isTwoPair, isPair, pairs, tripples, quads };
	}

	copyCards(cards: ArraySchema<CCard>) : ArraySchema<CCard> {
		let copyCCards: ArraySchema<CCard> = new ArraySchema<CCard>();
		cards.forEach((card) => {
			let newCard: CCard = new CCard();
			newCard.number = card.number;
			newCard.suit = card.suit;
			newCard.isHole = card.isHole;
			copyCCards.push(newCard);
		});
		return copyCCards;
	}

	filterIndexCard(cards: ArraySchema<CCard>, skipIndex: number) : ArraySchema<CCard> {
		let copyCCards: ArraySchema<CCard> = new ArraySchema<CCard>();
		for(let i = 0; i < cards.length; i++) {
			if(i !== skipIndex) {
				let newCard: CCard = new CCard();
				newCard.number = cards[i].number;
				newCard.suit = cards[i].suit;
				newCard.isHole = cards[i].isHole;
				copyCCards.push(newCard);
			}
		}
		return copyCCards;
	}

	getSuitCards(cards: ArraySchema<CCard>, suit: string) : ArraySchema<CCard> {
		let copyCCards: ArraySchema<CCard> = new ArraySchema<CCard>();
		cards.forEach((card) => {
			if(card.suit === suit) {
				let newCard: CCard = new CCard();
				newCard.number = card.number;
				newCard.suit = card.suit;
				newCard.isHole = card.isHole;
				copyCCards.push(newCard);
			}
		});
		return copyCCards;
	}
}