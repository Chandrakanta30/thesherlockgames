// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.41
// 

using Colyseus.Schema;

public class CCard : Schema {
	[Type(0, "int16")]
	public short number = 0;

	[Type(1, "string")]
	public string suit = "";

	[Type(2, "boolean")]
	public bool isHole = false;

	[Type(3, "string")]
	public string playerSessionId = "";
}

