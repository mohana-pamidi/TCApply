
import google.generativeai as genai
import os 
from dotenv import load_dotenv
import time
from google.api_core import exceptions

class GeminiClient:

    def __init__(self): 
        load_dotenv()

        API_KEY = os.getenv("API_KEY")
        genai.configure(api_key=API_KEY)

        for model in genai.list_models():
            print(model.name)
      
        self.model = genai.GenerativeModel("gemini-2.5-flash") # change to gemini-2.5-pro later for actual impelemntation
        self.prompt = None 
        self.response = None

    def load_prompt(self):
        with open("prompt.txt", "r", encoding="utf-8") as f:
            self.prompt = f.read()
        
    def makeAPICall(self):
        #we must send append prom
        self.response = self.model.generate_content(self.prompt)
        return self.response.text
        # try:
        #     self.response = self.model.generate_content(self.prompt)
        #     return self.response.text
        # except exceptions.ResourceExhausted:
        #     print("Quota hit! Sleeping for 60 seconds...")
        #     time.sleep(60)
        #     return self.makeAPICall() # Try again





