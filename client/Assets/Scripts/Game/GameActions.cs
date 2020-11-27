using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class GameActions : MonoBehaviour
{
    public GameObject hamburgerMenu;
    private bool isHamburgerMenuOpen;

    public GameObject raiseMenu;
    private bool isRaiseMenuOpen;

    public Button foldBtn;
    public Button callBtn;
    public Button raiseBtn;

    public Button raiseBy1000Btn;
    public Button raiseBy500Btn;
    public Button raiseBy250Btn;
    public Button raiseBy100Btn;
    public Button raiseBy50Btn;

    public Button exitBtn;

    public void DisbaleBtns()
    {
        foldBtn.interactable = false;
        callBtn.interactable = false;
        raiseBtn.interactable = false;
    }

    public void EnableBtns()
    {
        foldBtn.interactable = true;
        callBtn.interactable = Game.Instance.EnableCallBtn();
        raiseBtn.interactable = Game.Instance.EnableRaiseBtn();
    }

    private void EnableRaiseBtns()
    {
        GamePlayer player = Game.Instance.GetCurPlayer();
        int curMaxBet = Game.Instance.GetCurMaxBet();

        if(curMaxBet - player.CurrentBet + 50 <= player.Coins)
        {
            raiseBy50Btn.interactable = true;
        }

        if(curMaxBet - player.CurrentBet + 100 <= player.Coins)
        {
            raiseBy100Btn.interactable = true;
        }

        if (curMaxBet - player.CurrentBet + 250 <= player.Coins)
        {
            raiseBy250Btn.interactable = true;
        }

        if (curMaxBet - player.CurrentBet + 500 <= player.Coins)
        {
            raiseBy500Btn.interactable = true;
        }

        if (curMaxBet - player.CurrentBet + 1000 <= player.Coins)
        {
            raiseBy1000Btn.interactable = true;
        }
    }

    public void OnFoldBtnClick()
    {
        Game.Instance.SendFoldEvent();
    }

    public void OnCallBtnClick()
    {
        Game.Instance.SendCallEvent();
    }

    public void OnClickRaiseBy1000Btn()
    {
        Game.Instance.SendRasieEvent(1000);
        isRaiseMenuOpen = false;
        raiseMenu.SetActive(isRaiseMenuOpen);
    }

    public void OnClickRaiseBy500Btn()
    {
        Game.Instance.SendRasieEvent(500);
        isRaiseMenuOpen = false;
        raiseMenu.SetActive(isRaiseMenuOpen);
    }

    public void OnClickRaiseBy250Btn()
    {
        Game.Instance.SendRasieEvent(250);
        isRaiseMenuOpen = false;
        raiseMenu.SetActive(isRaiseMenuOpen);
    }

    public void OnClickRaiseBy100Btn()
    {
        Game.Instance.SendRasieEvent(100);
        isRaiseMenuOpen = false;
        raiseMenu.SetActive(isRaiseMenuOpen);
    }

    public void OnClickRaiseBy50Btn()
    {
        Game.Instance.SendRasieEvent(50);
        isRaiseMenuOpen = false;
        raiseMenu.SetActive(isRaiseMenuOpen);
    }

    public void OnClickRaiseMenu()
    {
        isRaiseMenuOpen = !isRaiseMenuOpen;
        raiseMenu.SetActive(isRaiseMenuOpen);
        EnableRaiseBtns();
    }

    public void OnClickHamburgerMenu()
    {
        isHamburgerMenuOpen = !isHamburgerMenuOpen;
        hamburgerMenu.SetActive(isHamburgerMenuOpen);
    }

    public void OnClickExit()
    {
        Game.Instance.OnExit();
    }
}
