import os
import time
import requests
import base64

API_URL = "http://localhost:4000"
CONFIG_PATH = "config.txt"

class b64():
    def encrypt(self, text):
        return base64.b64encode(text.encode('ascii')).decode('ascii')

    def decrypt(self, text):
        return base64.b64decode(text.encode('ascii')).decode('ascii')

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
        
    def check_account(self, identifier):
        r = requests.get(f"{self.api_url}/bots/check/{identifier}")
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
        f = open(self.config_path, 'r').read().split(":")
        return [f[0], f[1]]

def main():
    api = ApiController()
    fsc = FileController()

    if api.check_connection():
        if fsc.check_file(CONFIG_PATH):
            bot_data = fsc.get_creds()
            bot_identifier = b64().decrypt(bot_data[0])
            bot_token = b64().encrypt(bot_data[1])

            if api.check_account(bot_identifier):
                print(1)
            else:
                print(0)
        else:
            bot_data = api.register_account()
            fsc.save_creds(b64().encrypt(bot_data[0]), b64().encrypt(bot_data[1]))
            main()
    else:
        time.sleep(30)
        main()

if __name__ == "__main__":
    main()