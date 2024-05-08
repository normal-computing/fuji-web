import os
import json
import time
import pyautogui
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Load the .env file
load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')

# Hard-coded coordinates to open web-wand side panel
extensions_pos = (1070, 110)
web_wand_pos = (900, 280)

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

def check_task_status(driver):
    # Function to check task status
    status = "running"  # Initial assumption
    while status == "running":
        dispatch_event(driver, 'GetTaskStatus', {})
        # Capture the status from the global variable updated by the content script
        status = driver.execute_script("return window.lastReceivedStatus;")
        time.sleep(2)  # Wait for some time before the next check
    print("Task completed")

def run_webwand_task(driver, url, task_description):
    driver.get(url)
    # Simulate click to open side panel
    pyautogui.click(extensions_pos)
    pyautogui.click(web_wand_pos) 

    set_api_event = {"value": api_key}
    dispatch_event(driver, 'SetAPIKey', set_api_event)

    set_task_event = {"value": task_description}
    dispatch_event(driver, 'SetTask', set_task_event)

    run_task_event = {}
    dispatch_event(driver, 'RunTask', run_task_event)
    
    check_task_status(driver)
    time.sleep(5)

def main():
    driver = setup_driver()

    with open('tasks_test.jsonl', 'r') as file:
        for line in file:
            task = json.loads(line)
            run_webwand_task(driver, task['web'], task['ques'])
    driver.quit()

if __name__ == "__main__":
    main()
