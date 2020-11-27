using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Dashboard : MonoBehaviour
{
    public GameObject playerName;
    public GameObject playerId;

    private void Start()
    {
        playerName.GetComponent<Text>().text = User.Instance.Name;
        playerId.GetComponent<Text>().text = User.Instance.Id;
    }

    public void OnPlay()
    {
        StartCoroutine(SceneManagement.Instance.LoadScene("Game"));
    }
}
