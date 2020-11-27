using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SoundManagement : GenericSingleton<SoundManagement>
{
    private AudioSource audioSource;

    public AudioClip[] soundFiles;

    void Start()
    {
        audioSource = GetComponent<AudioSource>();
    }

    public void Play(int index)
    {
        audioSource.PlayOneShot(soundFiles[index], 1f);
    }
}
