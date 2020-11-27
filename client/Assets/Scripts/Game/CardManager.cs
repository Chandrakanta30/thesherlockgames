using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CardManager : GenericSingleton<CardManager>
{
    public List<Sprite> clubCards;
    public List<Sprite> heartCards;
    public List<Sprite> diamondCards;
    public List<Sprite> spadeCards;

    public Sprite cardBack;
    public Transform gameTransform;
    public GameObject cardPrefab;
    public GameObject curBetPrefab;

    public Sprite GetCardSprite(int cardNum, string suit)
    {
        switch(suit)
        {
            case "Club":
                return clubCards[cardNum];
            case "Heart":
                return heartCards[cardNum];
            case "Diamond":
                return diamondCards[cardNum];
            case "Spade":
                return spadeCards[cardNum];
            default:
                Debug.Log("Invalid Card Suit = " + suit);
                break;
        }
        return null;
    }

    public IEnumerator ShowChipAnimation(Transform parent, Transform playerTransform, int curBet)
    {
        yield return new WaitForSeconds(1.0f);

        Vector3 pos;
        GameObject g = Instantiate(curBetPrefab, new Vector3(0, 0, 0), Quaternion.identity);
        g.transform.SetParent(playerTransform, false);
        g.GetComponent<Text>().text = curBet + "";
        g.SetActive(true);

        pos = parent.position;
        SoundManagement.Instance.Play(1);
        yield return StartCoroutine(TranslateDealerCardTo(g.transform, pos, 0.08f));
        Destroy(g);
    }

    public IEnumerator ShowAnimation(Transform parent, Transform dealerTransform, int num)
    {
        for(int i = 0; i < num; i++)
        {
            Vector3 pos;
            GameObject g = Instantiate(cardPrefab, new Vector3(0, 0, 0), Quaternion.identity);
            g.transform.SetParent(dealerTransform, false);
            g.GetComponent<GameCard>().card.sprite = cardBack;
            g.SetActive(true);

            pos = parent.position;
            SoundManagement.Instance.Play(0);
            yield return StartCoroutine(TranslateDealerCardTo(g.transform, pos, 0.08f));
            Destroy(g);
        }
    }

    public IEnumerator TranslateDealerCardTo(Transform thisTransform, Vector3 endPos, float value)
    {
        float rate = 1.0f / Vector3.Distance(thisTransform.position, endPos) * value + 1.0f;
        float t = 0.0f;
        while (t < 1.0)
        {
            t += Time.deltaTime * rate;
            thisTransform.position = Vector3.Lerp(thisTransform.position, endPos, Mathf.SmoothStep(0.0f, 2.0f, t));
            yield return new WaitForEndOfFrame();
        }
    }
}
