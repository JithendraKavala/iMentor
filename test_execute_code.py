import requests
import json
import time

BASE_URL = "http://localhost:2001"

def test_languages():
    print("\n--- Testing /languages ---")
    try:
        res = requests.get(f"{BASE_URL}/languages")
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            langs = res.json()
            print(f"Found {len(langs)} languages.")
            # Print first 3
            print(f"Examples: {langs[:3]}")
            return langs
        else:
            print(f"Error: {res.text}")
    except Exception as e:
        print(f"Failed: {e}")
    return []

def test_execute_python():
    print("\n--- Testing /execute_code (Python) ---")
    payload = {
        "code": "print('Hello Judge0')",
        "language": "python",
        "testCases": [{"input": "", "expectedOutput": "Hello Judge0"}]
    }
    try:
        res = requests.post(f"{BASE_URL}/execute_code", json=payload)
        print(f"Status: {res.status_code}")
        print(json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Failed: {e}")

def test_execute_node():
    print("\n--- Testing /execute_code (Node.js) ---")
    payload = {
        "code": "console.log('Hello Node');",
        "language": "javascript",
        "testCases": [{"input": "", "expectedOutput": "Hello Node"}]
    }
    try:
        res = requests.post(f"{BASE_URL}/execute_code", json=payload)
        print(f"Status: {res.status_code}")
        print(json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    print("Waiting for services to stabilize...")
    # time.sleep(5) 
    test_languages()
    test_execute_python()
    test_execute_node()
