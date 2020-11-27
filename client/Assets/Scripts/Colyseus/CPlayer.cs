// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.41
// 

using Colyseus.Schema;

public class CPlayer : Schema {
	[Type(0, "string")]
	public string sessionId = "";

	[Type(1, "int16")]
	public short seat = 0;

	[Type(2, "string")]
	public string name = "";

	[Type(3, "string")]
	public string hand = "";

	[Type(4, "int16")]
	public short totalChips = 0;

	[Type(5, "int16")]
	public short curMaxBet = 0;

	[Type(6, "int16")]
	public short currentBet = 0;

	[Type(7, "map", "number")]
	public MapSchema<float> cardFrequency = new MapSchema<float>();

	[Type(8, "map", "number")]
	public MapSchema<float> suitFrequency = new MapSchema<float>();

	[Type(9, "boolean")]
	public bool isDealer = false;
}

