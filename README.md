<img src="public/icon-128.png" alt="Fuji-web Logo" width="100"/>

# Fuji-Web: AI based Full Browser Automation 🗻

Fuji-Web is an intelligent AI partner that understands the user’s intent, navigates websites autonomously, and executes tasks on the user’s behalf while explaining each action step.

Watch it autonomously look up flight prices:

https://github.com/normal-computing/fuji-web/assets/1001890/1ef34e6d-b533-4656-a302-80f71ba2d95a

## How does it work?

**Please read [our blog post](https://blog.normalcomputing.ai/posts/2024-05-22-introducing-fuji-web/fuji-web.html) for a demo video, benchmarks and deep-dive technical overview!**

## Installing and Running

### Download and Install the extension in your browser

1. Go to the [releases page](https://github.com/normal-computing/fuji-web/releases), find the latest version of the extension and download "fuji-extension.zip".
2. Unzip the file.
3. Load your extension on Chrome by doing the following:
   1. Navigate to `chrome://extensions/`
   2. Toggle `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the unzipped folder

### Use the extension

*Please note that you may need to refresh the page for the extension to work.*

1. Find the Fuji icon in the top right corner of your browser and click on it to open the sidepanel.
2. Create or access an existing [OpenAI API Key](https://platform.openai.com/account/api-keys) and paste it in the provided box. This key will be stored in your browser, and will not be uploaded to a third party.
3. Finally, navigate to a webpage you want Fuji-Web and type in the task you want it to perform.

_Note: all prompts (text and image) are sent directly to the API of your selection. Fuji-Web does not attempt to collect any information from you._

### Build the extension

If you want to build the extension from source, follow these instructions:

1. Ensure you have [Node.js](https://nodejs.org/). The development was done on Node v20 but it should work with some lower versions.
2. Clone this repository
3. Install `pnpm` globally: `npm install -g pnpm`
4. Run `pnpm install` 
5. Run `pnpm dev` to start the development server, or `pnpm build` to build the extension.

When loading the extension, you will need to load the `dist` folder created by the build process.

## Roadmap

- Expose API for easy integration with browser automation frameworks (e.g. Puppeteer, Playwright, Selenium)
- Add support for more complex & cross-tab workflows
- Add support for more browsing behaviors (select from dropdown, extract content from entire page etc.)
- Add support for saving workflows
- Add support for sharing workflows & instructions with others
- Create wikipedia-like knowledge base where users can work together to create knowledge that can improve the Fuji-Web's performance

## Troubleshooting

Check out our [Troubleshooting Guide](TROUBLESHOOTING.md) for help with common problems.

## Contributing

Interested in contributing to Fuji-Web? We'd love your help! Check out our [Contribution Guide](CONTRIBUTING.md) for guidelines on how to contribute, report bugs, suggest enhancements, and more. 

We also have set up a dedicated channel for Fuji-Web feedback on Discord at https://discord.gg/yfMjZ8udb5.

## Credits

- Fuji-Web's image annotation method was inspired by Microsoft's [UFO paper](https://arxiv.org/abs/2402.07939).
- Fuji as a tool that lives in the browser sidepanel was inspired by [TaxyAI's browser extension](https://github.com/TaxyAI/browser-extension). We also used some of its UI code.
- The Chrome extension set-up leveraged an awesome boilerplate project [Jonghakseo/chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite).
- The Fuji logo is from [Toss Face](https://emojipedia.org/toss-face) Emoji design set.
