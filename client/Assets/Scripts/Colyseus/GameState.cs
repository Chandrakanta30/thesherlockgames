// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.41
// 

using Colyseus.Schema;

public class GameState : Schema {
	[Type(0, "map", typeof(MapSchema<CPlayer>))]
	public MapSchema<CPlayer> players = new MapSchema<CPlayer>();

	[Type(1, "array", typeof(ArraySchema<CCard>))]
	public ArraySchema<CCard> cards = new ArraySchema<CCard>();

	[Type(2, "number")]
	public float activePlayerIndex = 0;

	[Type(3, "string")]
	public string dealerId = "";

	[Type(4, "number")]
	public float smallBlindPlayerIndex = 0;

	[Type(5, "number")]
	public float bigBlindPlayerIndex = 0;

	[Type(6, "number")]
	public float minBet = 0;

	[Type(7, "int16")]
	public short currentBet = 0;

	[Type(8, "array", typeof(ArraySchema<WinPlayer>))]
	public ArraySchema<WinPlayer> winningPlayers = new ArraySchema<WinPlayer>();

	[Type(9, "number")]
	public float pot = 0;

	[Type(10, "array", typeof(ArraySchema<CCard>))]
	public ArraySchema<CCard> communityCards = new ArraySchema<CCard>();

	[Type(11, "string")]
	public string phase = "";

	[Type(12, "array", typeof(ArraySchema<CCard>))]
	public ArraySchema<CCard> deck = new ArraySchema<CCard>();

	[Type(13, "string")]
	public string pokerType = "";
}

