import base64
import os
import json
import time
import pyautogui
import logging
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import WebDriverException

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')

dataset = 'tasks_test.jsonl'

# Place to store task execution results
results_dir = 'results'
os.makedirs(results_dir, exist_ok=True)

# Setup logging
logs_path = 'webwand_test_log.txt'
logging.basicConfig(filename=logs_path, level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')

def setup_driver():
    chrome_options = Options()
    # Load the unpacked webwand chrome extension
    chrome_options.add_argument("--load-extension=./dist")
    chrome_options.add_argument("--window-size=1600,900")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    # Set script timeout to 120 seconds
    driver.set_script_timeout(120)
    return driver

def dispatch_event(driver, event_name, event):
    logging.info(f'Dispatched event {event_name}')
    script = f"""
    var event = new CustomEvent('{event_name}', {{ detail: {json.dumps(event)} }});
    document.dispatchEvent(event);
    """
    driver.execute_script(script)

def add_task_listener(driver, task_id, max_retries=3):
    logging.info(f'Adding task listeners for task {task_id}')
    """
    Add event listeners for task history and screenshot events. Both events include task status.
    Then process those events as they are captured.
    """

    script = f"""
    var callback = arguments[0];
    var eventListener = function (e) {{
        if (e.detail.type == 'history') {{
            if (e.detail.status === 'success' || e.detail.status === 'error') {{
                document.removeEventListener('TaskUpdate', eventListener);
                callback({{status: e.detail.status, type: 'history', data: e.detail.data}});
            }}
            // Does not do anything when the status is 'running' or 'idle'. 
            // The status 'interrupted' will never be triggered automatically.
        }} else if (e.detail.type == 'screenshot') {{
            document.removeEventListener('TaskUpdate', eventListener);
            callback({{status: e.detail.status, type: 'screenshot', data: e.detail.data}});
        }} else {{
            throw new Error("Invalid event type received: " + e.detail.type);
        }}
    }};

    document.addEventListener('TaskUpdate', eventListener);
    """

    attempts = 0
    result = ""

    def handle_event(event_data):
        nonlocal attempts
        nonlocal result
        if not event_data:
            logging.info("No event data received")
            return
        if event_data['type'] == 'history':
            # Record history when task stops
            result = event_data["status"]
            # Determine the last action status
            history =  event_data['data']
            last_action = history[-1]["action"]["operation"]["name"]
            if last_action == "finish":
                result = "success"
            else:
                result = "fail"
            write_history(task_id, history)
            attempts = 0
            return
        if event_data['type'] == 'screenshot':
            write_screenshots(task_id, event_data['data'])
            attempts = 0
            # Task is still running. Continue to listen for events
            handle_event(driver.execute_async_script(script))
        else:
            logging.error(f"Unhandled event data type: {event_data['type']}")
            result = "script-error"
            return

    while attempts < max_retries:
        try:
            handle_event(driver.execute_async_script(script))
            break
        except WebDriverException as e:
            if "javascript error: document unloaded while waiting for result" in str(e):
                attempts += 1
                logging.warning(f'Document unloaded error during task {task_id} attempt {attempts}: {str(e)}')
                if attempts == max_retries:
                    logging.error(f'Maximum retry attempts reached for task {task_id}.')
                    result = 'doc-unload-max-retry'
                    break
                else:
                    logging.info("Retrying...")
            elif "script timeout" in str(e):
                logging.error(f'Script timeout for task {task_id}: {str(e)}')
                result = 'js-script-timeout'
                break
            else:
                logging.error(f'WebDriver exception for task {task_id}: {str(e)}')
                result = 'webdriver-error'
                break
        except Exception as e:
            logging.error(f'Unhandled error for task {task_id}: {str(e)}')
            result = 'python-script-error'
            break
    return result

def write_history(task_id, task_history):
    task_dir = os.path.join(results_dir, f"test{task_id}")
    os.makedirs(task_dir, exist_ok=True)
    file_path = os.path.join(task_dir, 'interact_messages.json')
    
    with open(file_path, 'w') as file:
        json.dump(task_history, file, indent=4)
    logging.info(f'History saved for task {task_id}')

def write_screenshots(task_id, image_data):
    image_bytes = base64.b64decode(image_data)
    task_dir = os.path.join(results_dir, f"test{task_id}")
    os.makedirs(task_dir, exist_ok=True)
    timestamp = int(time.time())
    file_path = os.path.join(task_dir, f'screenshot_{timestamp}.png')
    with open(file_path, 'wb') as file:
        file.write(image_bytes)
    logging.info(f'Screenshot saved for task {task_id}')

def run_webwand_task(driver, task_id, task_description):
    logging.info(f'Start running task {task_id} {task_description}')
    start = time.time()
    dispatch_event(driver, 'SetAPIKey', {"value": api_key})
    dispatch_event(driver, 'SetTask', {"value": task_description})
    dispatch_event(driver, 'RunTask', {})
    result = add_task_listener(driver, task_id)
    end = time.time()
    logging.info(f'Task {task_id} took {end - start} seconds to complete.')
    return result

def click_extensions_icon(driver):
    # Simulate click to open side panel
    window_position = driver.get_window_rect()
    top = window_position['y']
    right = window_position['x'] + window_position['width']
    # click Extensions icon
    pyautogui.click(right - 150, top + 50)
    # click webwand
    pyautogui.click(right - 300, top + 210)

def main():
    driver = setup_driver()
    initial_load = True

    with open(dataset, 'r') as file:
        for line in file:
            logging.info(f'-------------------------------------')
            task = json.loads(line)
            task_id = task["id"]
            driver.get(task['web'])

            if initial_load:
                click_extensions_icon(driver)
                initial_load = False

            result = run_webwand_task(driver, task_id, task['ques'])
            logging.info(f'Task {task_id} status: {result}')
            # Optional: if the previous task timed out, reset the driver after each task to ensure proper state for the next task
            # if result == "js-script-timeout":
            #     driver.quit()
            #     driver = setup_driver()
            #     initial_load = True
    driver.quit()

if __name__ == "__main__":
    main()