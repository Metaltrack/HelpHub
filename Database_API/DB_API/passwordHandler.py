from tokenize import String
import bcrypt

class password_manager():
    salt :bytes
    def __init__(self):
        salt = bcrypt.gensalt() #literal salt (as in conceptually)

    def hash_password(self, pwd):
        return bcrypt.hashpw(pwd, self.salt)
    
    def check_password(self, og_pass, pwd) -> bool:
        return True if(bcrypt.checkpw(pwd, og_pass)) else False
