using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class GameCard : MonoBehaviour
{
    public Image card;
    private int cardNum;
    private string suit;

    public int CardNum
    {
        get { return cardNum; }
    }

    public void SetCardNum(int cardNum)
    {
        this.cardNum = cardNum;
    }

    public string Suit
    {
        get { return suit; }
    }

    public void SetSuit(string suit)
    {
        this.suit = suit;
    }
}
