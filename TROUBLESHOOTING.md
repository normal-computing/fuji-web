# Troubleshooting Guide for WebWand

This guide aims to help you diagnose and resolve common problems you might encounter. If you're still facing difficulties after following these steps, please reach out to us through our [GitHub Issues](https://github.com/normal-computing/web-wand/issues).


## Common Issues and Solutions

### Extension Not Loading

**Symptom**: The WebWand extension doesn't appear in your browser or won't load.

**Solutions**:
1. Ensure your browser is compatible with WebWand. Currently, WebWand supports Chrome.
2. Verify that `Developer mode` is enabled in `chrome://extensions/`
3. Make sure you've loaded the extension from the `dist` folder after building WebWand.
4. Disable other extensions to identify if there's a conflict causing the issue.

### API Key Problems

**Symptom**: Issues related to the OpenAI API key, such as authentication errors or features not working due to key issues. e.g. 404 The model `gpt-4-vision-preview` does not exist or you do not have access to it.

**Solutions**:
1. Make sure you entered a valid OpenAI API key.
2. Ensure that your OpenAI API key has the necessary permissions.
3. If you suspect your API key might have been compromised or isn't working for an unknown reason, consider regenerating a new key from the [OpenAI API dashboard](https://platform.openai.com/account/api-keys).

### Dom Actions Problems

**Symptom**: WebWand did not perform dom actions properly.

**Solutions**:
1. Currently WebWand does not support running in background. If you open a new tab or navigating away from the website that webwand is working on, some actions may fail. Please stay on the website where you exectute WebWand. 

### Custom Knowledge Base Problems

**Symptom**: After adding a custom knowledge, WebWand crashed or did not perform corresponding to the new knowledge about the active tab.

**Solutions**:
1. Currently Webwand only supports basic entry validation of custom knowledge. Make sure you entered correct host name and correct regular expressions if using custom URL Matching Pattern. 

### Voice mode Problems

**Symptom**: Webwand did not capture the speech.

**Solutions**:
1. Check if Webwand has microphone access to the browser. When you turn on the voice mode in settings, the microphone access dialog should popup on the browser, please select "allow".
2. If the dialog didn't popup, right click the webwand icon in the extensions group and select "View Web Permissions". Then select "Allow" for Microphone.


## Reporting New Issues

If you encounter a problem not covered in this guide, please help us by reporting it. Provide as much detail as possible, including steps to reproduce the issue, browser version, and any error messages you receive. Your reports are invaluable in helping us improve WebWand.