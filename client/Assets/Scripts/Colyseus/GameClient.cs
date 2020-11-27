using System.Collections.Generic;
using UnityEngine;

using Colyseus;
using System;

public class GameClient : GenericSingleton<GameClient>
{
    protected Client client;
    protected Room<GameState> room;
    private int curMaxBet;

    public bool Connected { get; private set; } = false;

    public bool Joined
    {
        get { return room != null; }
    }

    async void OnDestroy()
    {
        if (room != null)
            await room.Leave();
    }

    public int CurMaxBet
    {
        get { return curMaxBet; }
    }

    private void SetCurMaxBet(int bet)
    {
        if(curMaxBet < bet)
        {
            curMaxBet = bet;
        }
    }

    public void Connect()
    {
        // Change the endpoint to the Server URL where the Server code is deployed
        string endpoint = "ws://localhost:2567";
        client = new Client(endpoint);
        Connected = true;
    }

    public async void Join(string playerName, int playerCoins, string pokerType)
    {
        try
        {
            Dictionary<string, object> options = new Dictionary<string, object> {
                { "name", playerName },
                { "coins", playerCoins },
                { "pokerType", pokerType }
            };

            room = await client.JoinOrCreate<GameState>("game", options);

            InitializeRoomHandlers();

            Game.Instance.SetCurrentPlayerInfo(room.SessionId);
            Game.Instance.ShowMsgs();
        }
        catch (Exception e)
        {
            Game.Instance.ShowConnectionError();
            Debug.Log(e.Message);
        }
    }

    public async void Leave()
    {
        if (room != null)
            await room.Leave();
        room = null;
    }

    public void InitializeRoomHandlers()
    {
        room.State.players.OnAdd += OnPlayerAdd;
        room.State.winningPlayers.OnAdd += OnWinningPlayerAdd;

        room.OnMessage<object>("distributeCards", (message) =>
        {
            Debug.Log("Distribute Cards");
            Game.Instance.HideMsgs();
            DistributeCards();
        });

        room.OnMessage<CPlayer>("smallBlind", (player) =>
        {
            Debug.Log("Small Blind have arrived");
            SetCurMaxBet(player.curMaxBet);
            Game.Instance.PlaceABlind(player);
        });

        room.OnMessage<CPlayer>("bigBlind", (player) =>
        {
            Debug.Log("Big Blind have arrived");
            SetCurMaxBet(player.curMaxBet);
            Game.Instance.PlaceABlind(player);
        });

        room.OnMessage<CPlayer>("callMade", (player) =>
        {
            Debug.Log("Call Made by Oponent Player");
            SetCurMaxBet(player.curMaxBet);
            Game.Instance.UpdateOponentChips(player);
        });

        room.OnMessage<CPlayer>("raiseMade", (player) =>
        {
            Debug.Log("Raise Made by Oponent Player");
            SetCurMaxBet(player.curMaxBet);
            Game.Instance.UpdateOponentChips(player);
        });

        room.OnMessage<CPlayer>("foldMade", (player) =>
        {
            Debug.Log("Fold Made by Oponent Player");
            Game.Instance.RemoveOponent(player);
        });

        room.OnMessage<CPlayer>("nextPlayerMove", (curPlayer) =>
        {
            Debug.Log("Next Player Move");
            Game.Instance.MakeYourMove(curPlayer.sessionId, false);
        });

        room.OnMessage<CPlayer>("preFlop", (curPlayer) =>
        {
            Debug.Log("Enter PreFlop round");
            Game.Instance.MakeYourMove(curPlayer.sessionId, false);
        });

        room.OnMessage<CPlayer>("flop", (curPlayer) =>
        {
            Debug.Log("Enter Flop round");
            Game.Instance.MakeYourMove(curPlayer.sessionId, true);
        });

        room.OnMessage<CPlayer>("turn", (curPlayer) =>
        {
            Debug.Log("Enter Turn round");
            Game.Instance.MakeYourMove(curPlayer.sessionId, true);
        });

        room.OnMessage<CPlayer>("river", (curPlayer) =>
        {
            Debug.Log("Enter River round");
            Game.Instance.MakeYourMove(curPlayer.sessionId, true);
        });

        room.OnMessage<CCard>("communityCard", (card) =>
        {
            Debug.Log("Single Community Card");
            Game.Instance.RevealCommunityCards(card);
        });

        room.OnMessage<string>("message", (message) =>
        {
            //TODO: Show a popup to current player
            Debug.Log(message);
        });

        room.OnMessage<CCard>("bestHandCard", (card) =>
        {
            // Not using this right now, keeping it if we ever need to show the winning hand in future
            Debug.Log("Single Best Hand Card");
            //Game.Instance.AddWinningPlayerCard(card);
        });

        room.OnMessage<int>("GameOver", (pot) =>
        {
            Debug.Log("GameOver");
            Game.Instance.GameOver(pot);
        });

    }

    public void OnPlayerAdd(CPlayer newPlayer, string key)
    {
        if(!newPlayer.sessionId.Equals(room.SessionId))
        {
            Debug.Log("New Oponent Added");
            Game.Instance.AddPlayer(newPlayer);
        }
    }

    public void OnWinningPlayerAdd(WinPlayer player, int key)
    {
        Debug.Log("Winning Player");
        Game.Instance.AddWinningPlayer(player);
    }

    private void DistributeCards()
    {
        List<CCard> curPlayerCards = new List<CCard>();
        foreach (var item in room.State.cards.Items.Keys)
        {
            CCard card = room.State.cards.Items[item];
            if (Game.Instance.IsCurrentPlayer(card.playerSessionId))
            {
                curPlayerCards.Add(card);
            }
        }

        Game.Instance.DistributeCards(curPlayerCards);
    }

    public async void SendCall(int betCoins)
    {
        try
        {
            await room.Send("call", betCoins);
        }
        catch (Exception e)
        {
            Debug.Log("Send Error");
            Debug.Log(e.Message);
            Game.Instance.ShowErrorMsg("Call");
        }
    }

    public async void SendRaise(int betCoins)
    {
        try
        {
            await room.Send("raise", betCoins);
        }
        catch (Exception e)
        {
            Debug.Log("Send Error");
            Debug.Log(e.Message);
            Game.Instance.ShowErrorMsg("Raise");
        }
    }

    public async void SendFold()
    {
        try
        {
            await room.Send("fold");
        }
        catch (Exception e)
        {
            Debug.Log("Send Error");
            Debug.Log(e.Message);
            Game.Instance.ShowErrorMsg("Fold");
        }
    }

    public async void SendRestart()
    {
        try
        {
            await room.Send("restart");
        }
        catch (Exception e)
        {
            Debug.Log("Restart Error");
            Debug.Log(e.Message);
            Game.Instance.ShowErrorMsg("Restart");
        }
    }
}