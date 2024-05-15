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
from selenium.common.exceptions import WebDriverException

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')

# Place to store task execution results
results_dir = 'results'
os.makedirs(results_dir, exist_ok=True)

def setup_driver():
    chrome_options = Options()
    # Load the unpacked webwand chrome extension
    chrome_options.add_argument("--load-extension=./dist")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    # Set script timeout to 240 seconds
    driver.set_script_timeout(240)
    return driver

def dispatch_event(driver, event_name, event):
    script = f"""
    var event = new CustomEvent('{event_name}', {{ detail: {json.dumps(event)} }});
    document.dispatchEvent(event);
    """
    driver.execute_script(script)

def add_task_listener(driver, task_id, max_retries=3):
    print('add_task_listener', task_id)
    """
    Add event listeners for task history and screenshot events. Both events include task status.
    Then process those events as they are captured.
    """

    script = f"""
    var callback = arguments[0];
    var eventListener = function (e) {{
        if (e.detail.type == 'history') {{
            console.log("event listener received history event");
            if (e.detail.status === 'success' || e.detail.status === 'error') {{
                callback({{status: e.detail.status, type: 'history', data: e.detail.data}});
                document.removeEventListener('TaskUpdate', eventListener);
                console.log("event listener removed");
            }}
            // Does not do anything when the status is 'running' or 'idle'. 
            // The status 'interrupted' will never be triggered automatically.
        }} else if (e.detail.type == 'screenshot') {{
            console.log("event listener received screenshot event");
            callback({{status: e.detail.status, type: 'screenshot', data: e.detail.data}});
            document.removeEventListener('TaskUpdate', eventListener);
            console.log("event listener removed");
        }} else {{
            throw new Error("Invalid event type received: " + e.detail.type);
        }}
    }};

    document.addEventListener('TaskUpdate', eventListener);
    console.log("added event listener");
    """

    completed = {'status': None}
    attempts = 0

    def handle_event(event_data):
        nonlocal attempts
        if not event_data:
            print("no event data")
            return
        if event_data['type'] == 'history':
            # Record history when task stops
            completed['status'] = event_data['status']
            write_history(task_id, event_data['data'])
            return
        if event_data['type'] == 'screenshot':
            write_screenshots(task_id, event_data['data'])
            # Task is still running. Continue to listen for events
            handle_event(driver.execute_async_script(script))
        else:
            raise ValueError(f"Unhandled event data type: {event_data['type']}")
        attempts = 0
        print("reset attempts to zero")

    while attempts < max_retries:
        try:
            handle_event(driver.execute_async_script(script))
            break
        except WebDriverException as e:
            if "javascript error: document unloaded while waiting for result" in str(e):
                print(f"Document unloaded error: {e}")
                attempts += 1
                print(f"Attempt {attempts}: Document unloaded error. Retrying...")
                if attempts == max_retries:
                    print("Maximum retry attempts reached. Cannot recover from document unloaded error.")
            else:
                print(f"Other WebDriver error: {e}")
                break
        except Exception as e:
            print(f"Error while listening for updates: {e}")
            break
        
    print("completed['status']", completed['status'])
    return completed['status']

def write_history(task_id, task_history):
    print('write_history', task_id)
    task_dir = os.path.join(results_dir, f"test{task_id}")
    os.makedirs(task_dir, exist_ok=True)
    file_path = os.path.join(task_dir, 'interact_messages.json')
    
    with open(file_path, 'w') as file:
        json.dump(task_history, file, indent=4)

def write_screenshots(task_id, image_data):
    print('write_screenshots', task_id)
    image_bytes = base64.b64decode(image_data)
    task_dir = os.path.join(results_dir, f"test{task_id}")
    os.makedirs(task_dir, exist_ok=True)
    timestamp = int(time.time())
    file_path = os.path.join(task_dir, f'screenshot_{timestamp}.png')
    with open(file_path, 'wb') as file:
        file.write(image_bytes)

def run_webwand_task(driver, task_id, task_description):
    print('run_webwand_task', task_id, task_description)
    dispatch_event(driver, 'SetAPIKey', {"value": api_key})
    dispatch_event(driver, 'SetTask', {"value": task_description})
    dispatch_event(driver, 'RunTask', {})
    task_status = add_task_listener(driver, task_id)
    return task_status

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

    with open('tasks_test.jsonl', 'r') as file:
        for line in file:
            task = json.loads(line)
            task_id = task["id"]
            driver.get(task['web'])

            if initial_load:
                click_extensions_icon(driver)
                initial_load = False

            task_status = run_webwand_task(driver, task_id, task['ques'])
            while task_status not in ['success', 'error']:
                print("wait task_status", task_status)
                time.sleep(3)  # Wait for 3 seconds till the current task completes
    driver.quit()

if __name__ == "__main__":
    main()