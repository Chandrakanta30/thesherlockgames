// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.41
// 

using Colyseus.Schema;

public class WinPlayer : Schema {
	[Type(0, "string")]
	public string sessionId = "";

	[Type(1, "string")]
	public string name = "";

	[Type(2, "string")]
	public string handName = "";

	[Type(3, "int16")]
	public short currentBet = 0;

	[Type(4, "int16")]
	public short wonChips = 0;

	[Type(5, "array", typeof(ArraySchema<CCard>))]
	public ArraySchema<CCard> bestHand = new ArraySchema<CCard>();
}

