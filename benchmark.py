import base64
import os
import json
import time
import pyautogui
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')

# Hard-coded coordinates to open web-wand side panel
extensions_pos = (1060, 110)
web_wand_pos = (900, 280)

# Place to store task execution results
results_dir = 'results'
os.makedirs(results_dir, exist_ok=True)

def setup_driver():
    chrome_options = Options()
    # Load the unpacked webwand chrome extension
    chrome_options.add_argument("--load-extension=./dist")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def dispatch_event(driver, event_name, event):
    script = f"""
    var event = new CustomEvent('{event_name}', {{ detail: {json.dumps(event)} }});
    document.dispatchEvent(event);
    """
    driver.execute_script(script)

def add_task_listener(driver, task_id):
    # Async script to add event listeners for taskStatus, taskHistory, and screenshot events
    script = """
    var callback = arguments[0];
    var keepListening = true;
    var historyData = null;

    var statusListener = function (e) {
        if (e.detail.status !== 'running' && e.detail.status !== 'idle') {
            keepListening = false;
            document.removeEventListener('TaskStatusUpdate', statusListener);
            document.removeEventListener('ScreenshotUpdate', screenshotListener);
            document.removeEventListener('TaskHistoryUpdate', historyListener);
            callback({type: 'status', data: 'stopped', history: historyData});
        }
    };

    var screenshotListener = function (e) {
        callback({type: 'screenshot', data: e.detail.imgData});
    };

    var historyListener = function (e) {
        historyData = e.detail.history;
    };

    document.addEventListener('TaskStatusUpdate', statusListener);
    document.addEventListener('ScreenshotUpdate', screenshotListener);
    document.addEventListener('TaskHistoryUpdate', historyListener);

    // To keep the async script alive
    var checkInterval = setInterval(function () {
        if (!keepListening) {
            clearInterval(checkInterval);
        }
    }, 1000);
    """

    try:
        while True:
            event_data = driver.execute_async_script(script)
            if event_data:
                if event_data['type'] == 'screenshot':
                    write_screenshots(task_id, event_data['data'])
                elif event_data['type'] == 'status' and event_data['data'] == 'stopped':
                    if event_data.get('history'):
                        write_history(task_id, event_data['history'])
                    break
    except Exception as e:
        print(f"Error while listening for updates: {e}")

def write_history(task_id, task_history):
    task_dir = os.path.join(results_dir, f"test{task_id}")
    os.makedirs(task_dir, exist_ok=True)
    file_path = os.path.join(task_dir, 'interact_messages.json')
    
    with open(file_path, 'w') as file:
        json.dump(task_history, file, indent=4)

def write_screenshots(task_id, image_data):
    image_bytes = base64.b64decode(image_data)

    task_dir = os.path.join(results_dir, f"test{task_id}")
    os.makedirs(task_dir, exist_ok=True)
    timestamp = int(time.time())
    file_path = os.path.join(task_dir, f'screenshot_{timestamp}.png')
    
    with open(file_path, 'wb') as file:
        file.write(image_bytes)

def run_webwand_task(driver, task_id, task_description):
    dispatch_event(driver, 'SetAPIKey', {"value": api_key})
    dispatch_event(driver, 'SetTask', {"value": task_description})
    dispatch_event(driver, 'RunTask', {})
    add_task_listener(driver, task_id)

def main():
    driver = setup_driver()
    initial_load = True

    with open('tasks_test.jsonl', 'r') as file:
        for line in file:
            task = json.loads(line)
            task_id = task["id"]
            driver.get(task['web'])

            if initial_load:
                # Simulate click to open side panel
                pyautogui.click(extensions_pos)
                pyautogui.click(web_wand_pos)
                initial_load = False

            run_webwand_task(driver, task_id, task['ques'])
    driver.quit()

if __name__ == "__main__":
    main()