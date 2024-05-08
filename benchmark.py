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
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS

# Load the .env file
load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')

# Hard-coded coordinates to open web-wand side panel
extensions_pos = (1060, 110)
web_wand_pos = (900, 280)

app = Flask(__name__)
CORS(app)

task_status = "idle"
task_history = []
task_id = ""

results_dir = 'results'
os.makedirs(results_dir, exist_ok=True)

@app.route('/status', methods=['POST'])
def status():
    global task_status
    task_status = request.json.get('status', 'idle')
    return jsonify({"message": "Got status"}), 200

@app.route('/history', methods=['POST'])
def history():
    global task_history
    global task_id
    task_history = request.json.get('history', [])

    task_dir = os.path.join(results_dir, f"test{task_id}")
    os.makedirs(task_dir, exist_ok=True)
    file_path = os.path.join(task_dir, 'interact_messages.json')
    
    with open(file_path, 'w') as file:
        json.dump(task_history, file, indent=4)
    return jsonify({"message": "Got history"}), 200

@app.route('/screenshot/', methods=['POST'])
def save_screenshot():
    global task_id
    # Decode the image data
    image_data = request.json.get('value', '')
    image_bytes = base64.b64decode(image_data)

    # Ensure the directory exists
    task_dir = os.path.join(results_dir, f"test{task_id}")
    os.makedirs(task_dir, exist_ok=True)

    # Create a unique filename for each screenshot
    timestamp = int(time.time())
    file_path = os.path.join(task_dir, f'screenshot_{timestamp}.png')
    
    # Save the screenshot to the file
    with open(file_path, 'wb') as file:
        file.write(image_bytes)
    
    return jsonify({"message": f"Screenshot saved to {file_path}"}), 200

def run_server():
    app.run(port=5000, debug=False, use_reloader=False)

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
    while task_status == "idle" or task_status == "running":
        dispatch_event(driver, 'GetTaskStatus', {})
        time.sleep(3)
    print(task_status)

def run_webwand_task(driver, task_description):
    dispatch_event(driver, 'SetAPIKey', {"value": api_key})
    dispatch_event(driver, 'SetTask', {"value": task_description})
    dispatch_event(driver, 'RunTask', {})

    check_task_status(driver)
    dispatch_event(driver, 'GetTaskHistory', {})
    time.sleep(1)

def main():
    driver = setup_driver()

    first_time = True

    with open('tasks_test.jsonl', 'r') as file:
        global task_id
        global task_status
        global task_history
        for line in file:
            task = json.loads(line)
            task_id = task["id"]
            task_status = "idle"
            task_history = []
            driver.get(task['web'])

            if first_time:
                # Simulate click to open side panel
                pyautogui.click(extensions_pos)
                pyautogui.click(web_wand_pos)
                first_time = False

            run_webwand_task(driver, task['ques'])
    driver.quit()

if __name__ == "__main__":
    # Start the Flask server in a new thread
    server_thread = threading.Thread(target=run_server)
    server_thread.start()   

    main()
    server_thread.join()
