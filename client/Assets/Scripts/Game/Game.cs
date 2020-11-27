using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Game : MonoBehaviour
{
    #region Singleton
    private static Game _instance;
    public static Game Instance;
    private void MakeSingleton()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }
        else
        {
            _instance = this;
        }

        Instance = _instance;
    }
    #endregion

    public GameActions gameActions;

    public GameObject connectionMsg;
    public GameObject joinMsg;

    public GamePlayer currentPlayer;
    private bool hasWon = false;

    public List<GamePlayer> players;
    private int playersAdded = 0;

    public List<Sprite> avatars;
    public Sprite emptyAvatar;
    public List<Image> communityCards;
    private int communityCardAdded = 0;

    private bool isPhaseChanged;

    public WinningPanel winningPanel;

    private GameClient client;

    public Transform dealerTransform;

    public void Awake()
    {
        MakeSingleton();

        client = GameClient.Instance;
        if (!client.Connected)
        {
            client.Connect();
        }

        OnJoin();
    }

    public void OnJoin()
    {
        if (!client.Joined)
        {
            client.Join(User.Instance.Name, User.Instance.Coins, "TexasHoldem");
        }
    }

    public void OnLeave()
    {
        if (client.Joined)
        {
            client.Leave();
        }
    }

    public void AddPlayer(CPlayer player)
    {
        players[playersAdded].SetSessionId(player.sessionId);

        players[playersAdded].nameText.gameObject.SetActive(true);
        players[playersAdded].nameText.text = player.name;

        players[playersAdded].coinsText.gameObject.SetActive(true);
        players[playersAdded].coinsText.text = player.totalChips + "";
        players[playersAdded].SetCoins(player.totalChips);

        players[playersAdded].avatar.sprite = avatars[playersAdded];
        playersAdded++;
    }

    public void UpdateOponentChips(CPlayer player)
    {
        foreach (var oponent in players)
        {
            if (oponent.SessionId != null && oponent.SessionId.Equals(player.sessionId))
            {
                oponent.SetCurrentBet(oponent.transform, player.currentBet);
                oponent.SetCoins(player.totalChips);
                break;
            }
        }
    }

    public void RemoveOponent(CPlayer player)
    {
        foreach (var oponent in players)
        {
            if (oponent.SessionId != null && oponent.SessionId.Equals(player.sessionId))
            {
                oponent.SetSessionId(null);
                oponent.nameText.gameObject.SetActive(false);
                oponent.coinsText.gameObject.SetActive(false);
                oponent.avatar.sprite = emptyAvatar;
                break;
            }
        }
    }

    public void SetCurrentPlayerInfo(string sessionId)
    {
        currentPlayer.SetSessionId(sessionId);
        currentPlayer.nameText.text = User.Instance.Name;
        currentPlayer.coinsText.text = User.Instance.Coins + "";
        currentPlayer.SetCoins(User.Instance.Coins);
    }

    public bool IsCurrentPlayer(string sessionId)
    {
        return currentPlayer.SessionId.Equals(sessionId);
    }

    public bool EnableCallBtn()
    {
        if (client.CurMaxBet > currentPlayer.CurrentBet || this.isPhaseChanged)
        {
            return client.CurMaxBet - currentPlayer.CurrentBet <= currentPlayer.Coins;
        }

        return false;
    }

    public bool EnableRaiseBtn()
    {
        if (client.CurMaxBet > currentPlayer.CurrentBet || this.isPhaseChanged)
        {
            return client.CurMaxBet - currentPlayer.CurrentBet + 50 <= currentPlayer.Coins;
        }

        return false;
    }

    public GamePlayer GetCurPlayer()
    {
        return currentPlayer;
    }

    public int GetCurMaxBet()
    {
        return client.CurMaxBet;
    }

    public void DistributeCards(List<CCard> curPlayerCards)
    {
        int i = 0;
        foreach (var card in curPlayerCards)
        {
            StartCoroutine(SetPlayerCard(i, card));
            i++;
        }

        StartCoroutine(ShowCardAnimation(i));
    }

    private IEnumerator SetPlayerCard(int i, CCard card)
    {
        yield return new WaitForSeconds(2.0f);

        currentPlayer.cards[i].SetCardNum(card.number);
        currentPlayer.cards[i].SetSuit(card.suit);
        currentPlayer.cards[i].card.sprite = CardManager.Instance.GetCardSprite(card.number - 1, card.suit);
        //currentPlayer.cards[i].card.sprite = CardManager.Instance.cardBack;
        SoundManagement.Instance.Play(2);
        currentPlayer.cards[i].gameObject.SetActive(true);

        // Card flip logic, will use later, Card is rotating and shown mirror
       /* yield return new WaitForSeconds(2.0f);

        int timer = 0;
        for(int m = 0; m < 2; m++)
        {
            for (int j = 0; j < 180; j++)
            {
                yield return new WaitForSeconds(0.01f);
                currentPlayer.cards[i].transform.Rotate(new Vector3(0, 1, 0));
                timer++;

                if (timer == 90 || timer == -90)
                {
                    currentPlayer.cards[i].card.sprite = CardManager.Instance.GetCardSprite(card.number - 1, card.suit);
                }
            }
            timer = 0;
        }*/
    }

    private IEnumerator ShowCardAnimation(int i)
    {
        yield return StartCoroutine(CardManager.Instance.ShowAnimation(currentPlayer.cards[0].transform, dealerTransform, i));

        for (int j = 0; j < playersAdded; j++)
        {
            yield return StartCoroutine(CardManager.Instance.ShowAnimation(players[j].transform, dealerTransform, i));
        }
    }

    public void PlaceABlind(CPlayer player)
    {
        if (IsCurrentPlayer(player.sessionId))
        {
            currentPlayer.SetCurrentBet(currentPlayer.transform, player.currentBet);
            currentPlayer.SetCoins(currentPlayer.Coins - player.currentBet);
        }
        else
        {
            foreach (var oponent in players)
            {
                if (oponent.SessionId != null && oponent.SessionId.Equals(player.sessionId))
                {
                    oponent.SetCurrentBet(oponent.transform, player.currentBet);
                    oponent.SetCoins(oponent.Coins - player.currentBet);
                    break;
                }
            }
        }
    }

    public void MakeYourMove(string sessionId, bool isPhaseChanged)
    {
        this.isPhaseChanged = isPhaseChanged;

        if (IsCurrentPlayer(sessionId))
        {
            gameActions.EnableBtns();
        }
        else
        {
            gameActions.DisbaleBtns();
        }
    }

    public void RevealCommunityCards(CCard card)
    {
        StartCoroutine(SetCommunityCard(card, communityCardAdded));
        communityCardAdded++;
    }

    private IEnumerator SetCommunityCard(CCard card, int i)
    {
        yield return new WaitForSeconds(2.0f);

        yield return StartCoroutine(CardManager.Instance.ShowAnimation(communityCards[i].transform, dealerTransform, 1));

        communityCards[i].sprite = CardManager.Instance.GetCardSprite(card.number - 1, card.suit);
        communityCards[i].gameObject.SetActive(true);
    }

    public void SendFoldEvent()
    {
        client.SendFold();
        this.isPhaseChanged = false;
        OnExit();
    }

    public void SendCallEvent()
    {
        Debug.Log("Call CurMaxBet = " + client.CurMaxBet);
        int newBet = isPhaseChanged ? client.CurMaxBet : client.CurMaxBet - currentPlayer.CurrentBet;
        Debug.Log("Call new Bet = " + newBet);
        currentPlayer.SetCurrentBet(currentPlayer.transform, currentPlayer.CurrentBet + newBet);
        currentPlayer.SetCoins(currentPlayer.Coins - newBet);
        client.SendCall(newBet);
        this.isPhaseChanged = false;
    }

    public void SendRasieEvent(int rasieBy)
    {
        Debug.Log("Raise CurMaxBet = " + client.CurMaxBet);
        int newBet = client.CurMaxBet - currentPlayer.CurrentBet + rasieBy;
        Debug.Log("Raise new Bet = " + newBet);
        currentPlayer.SetCurrentBet(currentPlayer.transform, currentPlayer.CurrentBet + newBet);
        currentPlayer.SetCoins(currentPlayer.Coins - newBet);
        client.SendRaise(newBet);
        this.isPhaseChanged = false;
    }

    public void ShowConnectionError()
    {
        connectionMsg.GetComponent<Text>().text = "Server not connected..";
        joinMsg.GetComponent<Text>().text = "";
    }

    public void ShowErrorMsg(string message)
    {
        connectionMsg.GetComponent<Text>().text = "Server error occured while sending event = " + message;
    }

    public void ShowMsgs()
    {
        connectionMsg.GetComponent<Text>().text = "Connected to Server";
        joinMsg.GetComponent<Text>().text = "Waiting for other players...";
    }

    public void HideMsgs()
    {
        connectionMsg.GetComponent<Text>().text = "";
        joinMsg.GetComponent<Text>().text = "";
    }

    public void AddWinningPlayer(WinPlayer player)
    {
        if (IsCurrentPlayer(player.sessionId))
        {
            this.hasWon = true;
            winningPanel.SetWinningChips(player.wonChips);
        }
    }

    /*public void AddWinningPlayerCard(CCard card)
    {
        winningPanel.AddPlayerCard(card);
    }*/

    public void GameOver(int pot)
    {
        if (pot > 0)
        {
            winningPanel.SetWinningChips(pot);

            StartCoroutine(LoadWinningScreen());
        }
        else
        {
            if (this.hasWon)
            {
                StartCoroutine(LoadWinningScreen());
            }
            else
            {
                winningPanel.gameObject.SetActive(false);
            }
        }

        CurrentTableResetGame();
    }

    public IEnumerator LoadWinningScreen()
    {
        winningPanel.gameObject.SetActive(true);
        
        yield return new WaitForSeconds(3.0f);

        winningPanel.gameObject.SetActive(false);
    }

    public void OnExit()
    {
        client.Leave();
        HardResetGame();
        StartCoroutine(SceneManagement.Instance.LoadPreviousScene());
    }

    private void CurrentTableResetGame()
    {
        // Hide Community Cards
        for(int i = 0; i < communityCardAdded; i++)
        {
            communityCards[i].gameObject.SetActive(false);
        }
        communityCardAdded = 0;

        // Hide Current Player Cards and Chips
        currentPlayer.HideCurrentBet();
        User.Instance.SetCoins(currentPlayer.Coins);
        foreach (var card in currentPlayer.cards)
        {
            card.gameObject.SetActive(false);
        }

        // Hide Oponents Chips
        foreach (var oponent in players)
        {
            oponent.HideCurrentBet();
        }

        isPhaseChanged = false;

        StartCoroutine(SendRestartGame());
    }

    private IEnumerator SendRestartGame()
    {
        yield return new WaitForSeconds(3.0f);
        client.SendRestart();
    }

    private void HardResetGame()
    {
        playersAdded = 0;
        communityCardAdded = 0;
        isPhaseChanged = false;
        currentPlayer.HideCurrentBet();
        User.Instance.SetCoins(currentPlayer.Coins);
    }
}
