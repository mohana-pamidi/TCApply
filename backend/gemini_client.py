
import google.generativeai as genai
import os 
from dotenv import load_dotenv

class gemini_client:

    def __init__(self): 
        load_dotenv()

        API_KEY = os.getenv("API_KEY")
        genai.configure(api_key=API_KEY)
        
        self.model = genai.GenerativeModel("gemini-3.1-pro")
        self.prompt = None 
        self.response = None

    def load_prompt(self, prompt):
        with open("yourfile.txt", "r", encoding="utf-8") as f:
            self.prompt = f.read()
        
    def makeAPICall(self, prompt):
        #we must send append prom
        self.response = self.model.generate_content(prompt)



