Import("env")
import os
import configparser

config = configparser.ConfigParser()
config.read("../platformio_secrets.ini")

for key, value in config["secret"].items():
    os.environ[key.upper()] = value