from tokenize import String
import bcrypt

class password_manager():
    salt :bytes
    def __init__(self):
        pass

    def hash_password(self, pwd):
        salt = bcrypt.gensalt() #literal salt (as in conceptually)
        return bcrypt.hashpw(pwd.encode("utf-8"), salt)
    
    def check_password(self, og_pass, pwd) -> bool:
        return True if(bcrypt.checkpw(pwd.encode("utf-8"), og_pass.encode("utf-8"))) else False
