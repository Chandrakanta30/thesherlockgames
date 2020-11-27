using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class WinningPlayer : MonoBehaviour
{
    private string sessionId;
    public Image avatar;
    public TMP_Text nameText;
    public List<Image> cards;
    private int cardIndex = 0;

    public string SessionId
    {
        get { return sessionId; }
    }

    public void SetSessionId(string sessionId)
    {
        this.sessionId = sessionId;
    }

    public void AddCard(Sprite card)
    {
        cards[cardIndex].sprite = card;
        cardIndex++;
    }
}
