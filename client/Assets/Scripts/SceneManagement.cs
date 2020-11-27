using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneManagement : GenericSingleton<SceneManagement>
{
    private Stack<int> loadedLevels;

    private bool initialized;

    public GameObject loadingScreen;
    private bool isLoading = false;

    private void OnEnable()
    {
        Debug.Log("OnEnable....");
        SceneManager.sceneLoaded += SetIsLoading;
    }

    private void OnDisable()
    {
        Debug.Log("OnDisable....");
        SceneManager.sceneLoaded -= SetIsLoading;
    }

    private void SetIsLoading(Scene scene, LoadSceneMode mode)
    {
        isLoading = false;
        loadingScreen.SetActive(false);
    }

    private void Init()
    {
        loadedLevels = new Stack<int>();
        initialized = true;
    }

    public Scene GetActiveScene()
    {
        return SceneManager.GetActiveScene();
    }

    public IEnumerator LoadScene(string sceneName)
    {
        loadingScreen.SetActive(true);
        yield return new WaitForSeconds(1.5f);
        isLoading = true;

        if (!initialized) Init();
        loadedLevels.Push(GetActiveScene().buildIndex);

        SceneManager.LoadScene(sceneName);

        while (isLoading)
            yield return new WaitForSeconds(0);

        loadingScreen.SetActive(false);
    }

    public IEnumerator LoadPreviousScene()
    {
        loadingScreen.SetActive(true);
        yield return new WaitForSeconds(1.5f);
        isLoading = true;

        if (!initialized)
        {
            isLoading = false;
            Debug.LogError("You haven't used the LoadScene functions of the scriptable object. Use them instead of the LoadScene functions of Unity's SceneManager.");
        }

        if (loadedLevels.Count > 0)
        {
            SceneManager.LoadScene(loadedLevels.Pop());
        }
        else
        {
            isLoading = false;
            Debug.LogError("No previous scene loaded");
        }

        while (isLoading)
            yield return new WaitForSeconds(0);

        loadingScreen.SetActive(false);
    }
}
