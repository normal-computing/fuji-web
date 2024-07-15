import re

def process_log_file(log_file_path):
    with open(log_file_path, 'r') as file:
        log_data = file.readlines()

    task_status_pattern = re.compile(r"Task ([\w\s-]+--\d+) status: (script-error|success|error|fail|doc-unload-max-retry|js-script-timeout|webdriver-error|python-script-error)")
    tasks = []

    for line in log_data:
        match = task_status_pattern.search(line)
        if match:
            task_id = match.group(1)
            status = match.group(2)
            tasks.append((task_id, status))

    return tasks

def write_task_status(tasks):
    header = "Task_id\tTask_status"
    rows = [f"{task_id}\t{status}" for task_id, status in tasks]
    return header + "\n" + "\n".join(rows)

log_file_path = 'webwand_test_log.txt'
tasks = process_log_file(log_file_path)
formatted_output = write_task_status(tasks)

output_file_path = 'tasks_status.txt'
with open(output_file_path, 'w') as output_file:
    output_file.write(formatted_output)

print(f"Tasks results are saved to {output_file_path}")
