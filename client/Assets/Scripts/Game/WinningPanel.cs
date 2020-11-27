using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class WinningPanel : MonoBehaviour
{
    public TMP_Text winningChips;

    public void SetWinningChips(int chips)
    {
        winningChips.text = chips + "";
    }
}
