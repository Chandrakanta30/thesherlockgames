using System.Collections;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEngine.UI;
using System.Net.Mail;
using System;

public class Login : MonoBehaviour
{
    public string emailPhone;
    public GameObject emailPhoneInputFiled;
    
    public void OnLogin()
    {
        emailPhone = emailPhoneInputFiled.GetComponent<Text>().text;
        
        bool isValid = ValidatePhoneNumber(emailPhone);

        if (!isValid)
        {
            isValid = ValidateEmail(emailPhone);
        }

        if (isValid)
        {
            Debug.Log("Valid Phone number");
            User.Instance.SetName(emailPhone);
            User.Instance.SetId(emailPhone);
            User.Instance.SetCoins(1500);
            StartCoroutine(SceneManagement.Instance.LoadScene("Dashboard"));
        }
        else
        {
            Debug.LogError("Invalid Email or Phone..");
        }
    }

    private bool ValidatePhoneNumber(string phoneNumber)
    {
        Regex regx = new Regex(@"\d{10}");
        Match match = regx.Match(phoneNumber);
        return match.Success;
    }

    private bool ValidateEmail(string email)
    {
        try
        {
            MailAddress mail = new MailAddress(email);
            return true;
        }
        catch(Exception e)
        {
            Debug.Log("Invalid Email " + e.Message);
            return false;
        }
    }
}
