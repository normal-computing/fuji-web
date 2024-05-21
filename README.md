<img src="public/icon-128.png" alt="Fuji-web Logo" width="100"/>

# Fuji-Web: Vision based Full Browser Automation 🪄

[Demo](https://twitter.com/mengdi_en/status/1721965940680565166)

Fuji-Web is a tool that redefines web interaction, making complex online tasks as simple as uttering a single command.

Crafted on top of the innovative fusion of multi-modal Large Language Models (GPT-4V), Fuji-Web embodies a sophisticated Web AI Partner. Imagine having an intelligent companion that not only grasps your intent but also possesses a broad awareness of website content, enabling it to autonomously execute tasks on your behalf and augment your workflow. With Fuji-Web, this vision becomes reality.

## How does it work?

Fuji-Web leverages the power of multi-modal Large Language Model, DOM state awareness, and semantic understanding of HTML to focus on essential webpage elements while filtering out noise. 

Here is an example of Fuji-Web annotating the website to better understand the environment.
<img src="media/web-annotation.png" alt="Screenshot of annotated website" width="50%" style="display: block; margin: 0 auto"/>


It also features a unique "Prior Knowledge Augmentation" system that allows Fuji-Web to navigate websites with the wisdom of collective past experiences, crowdsourced from Fuji-Web users. 

We do NOT collect your screenshots, browsing information or your prompts. It lives in your browser and is directly sent to the LLM API of your choice.

## Installing and Running

### Download and Install the extension in your browser

1. Go to the [releases page](https://github.com/normal-computing/fuji-web/releases), find the latest version of the extension and download "Fuji-Web.zip".
2. Unzip the file.
3. Load your extension on Chrome by doing the following:
   1. Navigate to `chrome://extensions/`
   2. Toggle `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the unzipped folder

### Use the extension

*Please note that you might need to refresh the page for the extension to work.*

1. Find the Fuji-Web icon in the top right corner of your browser and click on it to open the sidepanel.
2. The next thing you need to do is create or access an existing [OpenAI API Key](https://platform.openai.com/account/api-keys) and paste it in the provided box. This key will be stored securely in your browser, and will not be uploaded to a third party.
3. Finally, navigate to a webpage you want Fuji-Web and type in the task you want it to perform.

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
- Evaluate the performance of the Fuji-Web in real-world scenarios
- Add support for more complex & cross-tab workflows
- Add support for more AI Models
- Add support for more browsing behaviors (select from dropdown, extract text etc.)
- Add support for saving workflows
- Add support for sharing workflows & knowledge with others
- Create wikipedia-like knowledge base where users can work together to create knowledge that can improve the Fuji-Web's performance

## Troubleshooting

Check out our [Troubleshooting Guide](TROUBLESHOOTING.md) for help with common problems.

## Contributing

Interested in contributing to Fuji-Web? We'd love your help! Check out our [Contribution Guide](CONTRIBUTING.md) for guidelines on how to contribute, report bugs, suggest enhancements, and more. 

We also encourage everyone in the community to add new knowledge to the "Prior Knowledge Augmentation" system to make Fuji-Web even smarter. For detailed instructions on what kind of knowledge we're looking for and how to test and submit it, please see our [Contributing Knowledge Guide](CONTRIBUTING_KNOWLEDGE.md).

## Credits

- Fuji-Web's image annotation method was inspired by Microsoft's [UFO paper](https://arxiv.org/abs/2402.07939).
- Web Agent as a tool that lives in the browser sidepanel was inspired by [TaxyAI's browser extension](https://github.com/TaxyAI/browser-extension). We also used some of its UI code.
- The Chrome extension set-up leveraged an awesome boilerplate project [Jonghakseo/chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite).
- The Fuji logo is from [Toss Face](https://emojipedia.org/toss-face) Emoji design set.
