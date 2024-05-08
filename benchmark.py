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
import requests

# Load the .env file
load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')

# Hard-coded coordinates to open web-wand side panel
extensions_pos = (1050, 110)
web_wand_pos = (900, 280)

app = Flask(__name__)
CORS(app)

task_status = "idle"
task_history = []

results_dir = 'result'
os.makedirs(results_dir, exist_ok=True)

@app.route('/status', methods=['POST'])
def status():
    global task_status
    task_status = request.json.get('status', 'idle')
    return jsonify({"message": "Got status"}), 200

@app.route('/history', methods=['POST'])
def history():
    global task_history
    task_history = request.json.get('history', [])

    file_name = f"{results_dir}/task_history_{int(time.time())}.txt"

    with open(file_name, 'w') as file:
        json.dump(task_history, file, indent=4)
    return jsonify({"message": "Got history"}), 200

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
        time.sleep(5)
    print(task_status)

def run_webwand_task(driver, url, task_description):
    driver.get(url)
    # Simulate click to open side panel
    pyautogui.click(extensions_pos)
    pyautogui.click(web_wand_pos) 

    dispatch_event(driver, 'SetAPIKey', {"value": api_key})
    dispatch_event(driver, 'SetTask', {"value": task_description})
    dispatch_event(driver, 'RunTask', {})

    check_task_status(driver)
    dispatch_event(driver, 'GetTaskHistory', {})
    
    time.sleep(30)

def main():
    driver = setup_driver()

    with open('tasks_test.jsonl', 'r') as file:
        for line in file:
            task = json.loads(line)
            run_webwand_task(driver, task['web'], task['ques'])
    driver.quit()

if __name__ == "__main__":
    # Start the Flask server in a new thread
    server_thread = threading.Thread(target=run_server)
    server_thread.start()   

    main()
    server_thread.join()
