import os

class FileController():
    def __init__(self, config_path):
        self.config_path = config_path

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