using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class User : GenericSingleton<User>
{
    private string playerName;
    private string playerId;
    private int playerCoins;

    public string Name 
    {
        get { return playerName; }
    }

    public void SetName(string name)
    {
        this.playerName = name;
    }

    public int Coins
    {
        get { return playerCoins; }
    }

    public void SetCoins(int coins)
    {
        this.playerCoins = coins;
    }

    public string Id
    {
        get { return playerId; }
        set { playerId = value; }
    }

    public void SetId(string id)
    {
        this.playerId = id;
    }
}
