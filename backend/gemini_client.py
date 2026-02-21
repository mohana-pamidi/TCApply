import json
import google.generativeai as genai
import os 
import re
from dotenv import load_dotenv
import time
from google.api_core import exceptions

class GeminiClient:

    def __init__(self): 
        load_dotenv()

        API_KEY = os.getenv("API_KEY")
        genai.configure(api_key=API_KEY)

        # for model in genai.list_models():
        #     print(model.name)
      
        self.model = genai.GenerativeModel("gemini-2.5-flash") # change to gemini-2.5-pro later for actual impelemntation
        self.prompt = None 
        self.response = None

    def load_prompt(self):
        path = os.path.join(os.path.dirname(__file__), "prompt.txt")
        with open(path, "r", encoding="utf-8") as f:
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
    # def update_prompt(self, tandc):

    #     load_dotenv()

    #     # Your T&C text (this would eventually come from the Chrome extension)
    #     tos_text = tandc
    #     # Read the current file
    #     with open("prompt.txt", "r", encoding="utf-8") as f:
    #         content = f.read()

    #     # Find the positions of the triple quotes
    #     start = content.find('"""') + 3
    #     end = content.rfind('"""')

    #     # Replace whatever is between them with the new text
    #     new_content = content[:start] + "\n" + tos_text + "\n" + content[end:]

    #     # Write it back to the file
    #     with open("prompt.txt", "w", encoding="utf-8") as f:
    #         f.write(new_content)

    #     print("Written to prompt.txt successfully")       
    #     self.load_prompt()
    #     raw = self.makeAPICall()

    #     return json.loads(raw)  
    def update_prompt(self, tos_text, service_type="General", jurisdiction="United States", user_concerns="None provided"):
        # Read the template prompt file (path relative to this file so it works from any cwd)
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt.txt")
        with open(prompt_path, "r", encoding="utf-8") as f:
            template = f.read()

        # Find the """ markers and insert the T&C text
        start = template.find('"""') + 3
        end = template.rfind('"""')
        template_with_tos = template[:start] + "\n" + tos_text[:12000] + "\n" + template[end:]

        # Now fill in the other placeholders
        filled_prompt = template_with_tos.replace("{service_type}", service_type)
        filled_prompt = filled_prompt.replace("{jurisdiction}", jurisdiction)
        filled_prompt = filled_prompt.replace("{user_concerns}", user_concerns)

        # Set it as the active prompt
        self.prompt = filled_prompt

        print("Prompt fully built, calling Gemini...")

        # Call Gemini and parse the response
        raw = self.makeAPICall()
        cleaned = re.sub(r"```json|```", "", raw).strip()
        return json.loads(cleaned)





