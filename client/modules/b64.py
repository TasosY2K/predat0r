import base64

class b64():
    def encrypt(self, text):
        return base64.b64encode(text.encode("utf-8")).decode("utf-8")

    def decrypt(self, text):
        return base64.b64decode(text.encode("utf-8")).decode("utf-8")
