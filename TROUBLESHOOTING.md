# Troubleshooting Guide for Fuji-Web

This guide aims to help you diagnose and resolve common problems you might encounter. If you're still facing difficulties after following these steps, please reach out to us through our [GitHub Issues](https://github.com/normal-computing/fuji-web/issues).


## Common Issues and Solutions

### Extension Not Loading

**Symptom**: The Fuji-Web extension doesn't appear in your browser or won't load.

**Solutions**:
1. Ensure your browser is compatible with Fuji-Web. Currently, Fuji-Web supports Chrome.
2. Verify that `Developer mode` is enabled in `chrome://extensions/`
3. (Only when you are building it from source) Make sure you've loaded the extension from the `dist` folder.
4. Restart your browser as this can resolve many loading issues.

### API Key Problems

**Symptom**: Issues related to the OpenAI API key, such as authentication errors or features not working due to key issues. e.g., 404 The model `gpt-4-vision-preview` does not exist or you do not have access to it.

**Solutions**:
1. Make sure you entered a valid OpenAI API key. Note that keys can expire, so verify if yours is still active.
2. Ensure that your OpenAI API key has the necessary permissions. Visit https://platform.openai.com/playground/chat to check your permissions. Lack of credits can also restrict access to certain models.

### Dom Actions Problems

**Symptom**: Fuji-Web did not perform dom actions properly.

**Solutions**:
1. Currently, Fuji-Web does not support running in the background. If you open a new tab or navigate away from the website that Fuji-Web is working on, some actions may fail. Please stay on the website where you execute Fuji-Web. 

### Custom Knowledge Base Problems

**Symptom**: After adding custom knowledge, Fuji-Web crashed or did not perform according to the new knowledge about the active tab.

**Solutions**:
1. Currently, Fuji-Web only supports basic entry validation for custom knowledge. Make sure you entered the correct host name and correct regular expressions if using a custom URL Matching Pattern. 

### Voice Mode Problems

**Symptom**: Fuji-Web did not capture speech.

**Solutions**:
1. Check if Fuji-Web has microphone access in the browser. When you turn on the voice mode in settings, the microphone access dialog should pop up in the browser; please select "allow".
2. If the dialog didn't pop up, right-click the Fuji-Web icon in the extensions group and select "View Web Permissions". Then select "Allow" for Microphone.


## Reporting New Issues

If you encounter a problem not covered in this guide, please help us by reporting it. Provide as much detail as possible, including steps to reproduce the issue, browser version, and any error messages you receive. Your reports are invaluable in helping us improve Fuji-Web.