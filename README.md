# WebWand: Vision based Full Browser Automation 🪄

[Demo](https://twitter.com/mengdi_en/status/1721965940680565166)

WebWand uses [GPT-4 with vision](https://platform.openai.com/docs/guides/vision) to control your browser and perform repetitive actions on your behalf. Currently it allows you to define ad-hoc instructions. In the future it will also support saved and scheduled workflows.

WebWand's current status is **research preview**. Many workflows fail or confuse the agent. If you'd like to hack on WebWand to make it better or test it on your own workflows, follow the instructions below to run it locally.

You will need your own [OpenAI API Key](https://platform.openai.com/account/api-keys) to use WebWand.

WebWand only sends data to OpenAI's API. It does not send any data to third parties.

## Installing and Running

Currently this extension is only available through this GitHub repo. To build and install the extension locally on your machine, follow the instructions below.

### Installing the extension

1. Ensure you have [Node.js](https://nodejs.org/). The developement was done on Node v20 but it should work with some lower versions.
2. Clone this repository
3. Install `pnpm` globally: `npm install -g pnpm` (check your node version >= 16.6, recommended >= 18)
4. Run `pnpm install` 

### Running in your browser

1. Run on terminal:
    - Dev: `pnpm dev` or `npm run dev`
    - Prod: `pnpm build` or `npm run build`
2. Load your extension on Chrome by doing the following:
   1. Navigate to `chrome://extensions/`
   2. Toggle `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `dist` folder
3. The browser plugin will be available as a side panel.
4. The next thing you need to do is create or access an existing [OpenAI API Key](https://platform.openai.com/account/api-keys) and paste it in the provided box. This key will be stored securely in your browser, and will not be uploaded to a third party.
5. Finally, navigate to a webpage you want WebWand and type in the task you want it to perform. For example, if you want to search for a movie on Google, you can type `Search for the movie Oblivion`. Then press `Enter` or click `Run` to execute the task.

## How it Works

TBA

## Credits

WebWand was inspired by and built on top of [TaxyAI's browser extension](https://github.com/TaxyAI/browser-extension), and reuses its UI and part of its action execution cycle code. 

The Chrome extension set-up leveraged an awesome boilerplate project [Jonghakseo/chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite).
