
from dotenv import load_dotenv
import json
import gemini_client

def update_prompt():

    load_dotenv()

    # Your T&C text (this would eventually come from the Chrome extension)
    tos_text = """ """
    # Read the current file
    with open("prompt.txt", "r", encoding="utf-8") as f:
        content = f.read()

    # Find the positions of the triple quotes
    start = content.find('"""') + 3
    end = content.rfind('"""')

    # Replace whatever is between them with the new text
    new_content = content[:start] + "\n" + tos_text + "\n" + content[end:]

    # Write it back to the file
    with open("prompt.txt", "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Written to prompt.txt successfully")

if __name__ == '__main__':
    
    update_prompt()

    my_client = gemini_client.GeminiClient()

    my_client.load_prompt()
    print(my_client.makeAPICall())
    
   
    
