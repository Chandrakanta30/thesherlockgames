using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class GamePlayer : MonoBehaviour
{
    private string sessionId;
    private int coins;
    private int curBet;

    public Image avatarRing;
    public Image avatar;
    public TMP_Text nameText;
    public TMP_Text coinsText;
    public Text currentBet;
    public List<GameCard> cards;

    public string SessionId
    {
        get { return sessionId; }
    }

    public void SetSessionId(string sessionId)
    {
        this.sessionId = sessionId;
    }

    public int Coins
    {
        get { return coins; }
    }

    public void SetCoins(int coins)
    {
        this.coins = coins;
        coinsText.text = this.coins + "";
    }

    public int CurrentBet
    {
        get { return curBet; }
    }

    public void SetCurrentBet(Transform playerTransform, int curBet)
    {
        StartCoroutine(CardManager.Instance.ShowChipAnimation(currentBet.transform, playerTransform, curBet));
        StartCoroutine(UpdateCurrentBet(curBet));
    }

    private IEnumerator UpdateCurrentBet(int curBet)
    {
        yield return new WaitForSeconds(2.0f);

        this.curBet = curBet;
        currentBet.text = this.curBet + "";
        currentBet.gameObject.SetActive(true);
    }

    public void HideCurrentBet()
    {
        this.curBet = 0;
        currentBet.text = 0 + "";
        currentBet.gameObject.SetActive(false);
    }
}
