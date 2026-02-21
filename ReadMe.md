<img width="735" height="443" alt="image" src="https://github.com/user-attachments/assets/6ca40564-18d6-4516-9b57-14b734230b6d" />

# FinePrint
Unmask the fine print. Know your risks before you click.
## Inspiration
We believe that privacy shouldn't be hidden behind 50 pages of legal jargon. This project was born from the need to make Terms & Conditions readable. Powered by Google Gemini, our tool analyzes fine print to reveal risk levels and data-sharing practices, putting the power back into the hands of the user.

## What it does
Our project uses a specialized Chrome Extension to bridge the gap between complex legal documents and user understanding. By feeding the active page's content into the Google Gemini API, the tool performs a real-time audit of the agreement. It returns a numeric risk and privacy score alongside a breakdown of high-priority concerns and specific rights the user is asked to waive.

## How we built FinePrint
1. Browser Interface (JavaScript): We developed a Chrome Extension using a JavaScript-based sidepanel for the user interface.
2. Content Extraction (Content Scripts): When triggered, a Content Script programmatically scrapes the active website's Terms & Conditions text, ensuring we capture the exact legal language the user is agreeing to.
3. Backend Processing (Python/Flask - Deployed on Railway): The extension sends this data to our Flask API. This layer acts as the "brain," managing the communication between the browser and the AI.
4. AI Analysis (Google Gemini API): The Flask app constructs a specialized prompt containing the T&C text and sends it to Google Gemini. The model is instructed to perform a legal audit, specifically looking for privacy risks and rights-forfeiture.
5. Data Feedback Loop: Gemini returns a structured analysis, which the Flask app parses and sends back to the Chrome Extension to display the final Numeric Risk Score and key feedback to the user.

## Challenges we ran into
1. Connecting a Chrome Extension to a local Flask server often triggers Cross-Origin Resource Sharing (CORS) issues. We had to configure the Flask backend specifically to accept requests from the unique chrome-extension:// ID, ensuring secure communication without the browser blocking our data.

2. "Scraping" a website sounds easy until you hit a 50-page Terms & Conditions document. We had to refine our Content Scripts to ignore site navigation, ads, and footer clutter, focusing strictly on the legal text to ensure we didn't waste Gemini's context window on irrelevant data. We also had to take into account the multiple of ways these terms are formatted including HTML scirpts, and pdfs.

3. Prompt Engineering for Consistency
Getting an AI to return a specific numeric score alongside valuable text feedback was a challenge, especially when the numeric score can be subjective in terms of what a user defines as "risky." We spent significant time learning how to pre-process data for Gemini prompts to ensure the model consistently formatted its output as a structured response for our Flask app. 

4. Deployment to Railway
deploying our flask app was challenging as we had to connect the port.



## Accomplishments that we're proud of
We managed to boost the accuracy of our Gemini model by refining our prompt as well as adding specific parameters for the model to look for in specific high risk terms. Additionally we have successfully deployed our Chrome extension through Railway and no longer need to rely on a local host to run the extension and create the API calls. Lastly, we were able to allow users to have safety preferences and allow them to highlight and mark off the risks they care the most about to allow the Gemini API to dive deeper in the specified risks.

## What we learned
Building this tool was a deep dive into the complexities of full-stack AI integration. We learned that prompt engineering is a very important skill for the future, simply asking an AI to "summarize" isn't enough when dealing with dense legal contracts. As well as testing many Gemini Models before landing on Gemini 2.5 Flash to handle our prompts. We had to learn how to structure data, specifically using JSON responses to ensure our Flask backend could reliably parse the AI's feedback. On the frontend, we gained a much deeper understanding of the Chrome Extension lifecycle, particularly how to manage asynchronous communication between content scripts and the popup. Most importantly, we learned the value of secure backend architecture. By deploying to Railway, we practiced moving from a development environment to a production ready state, ensuring our Gemini API keys remained protected on the server side while providing an "always-on" experience for the user.

## What's next for FinePrint
We would like to submit our extension to the Google store for approval. We also want to implement Automated URL Detection, allowing the extension to proactively notify users the moment they land on a "High Risk" page without needing to manually click the popup. Finally, we aim to build a Community Risk Database, where anonymized scores are cached on our backend so that the community can see a "Crowdsourced Safety Rating" for popular websites instantly, reducing the number of redundant API calls and speeding up the user experience.


To do list: 
    - Output: score 
    - Risks - most important 
    - specific deal-breakters

Your Specific "Deal-Breakers"
What are you most afraid of? Common concerns include:

Hidden Costs: Automatic renewals or "gotcha" fees.

Ownership: Who owns the work you create or the data you provide?

Exit Strategy: How hard is it to cancel or terminate the agreement?

Liability: If something goes wrong, are you the only one responsible for the bill?


Mandatory Arbitration	Language that strips away your right to sue in court or join a class action.
Indemnification	Provisions that require you to pay for their legal mistakes.
Broad IP Grants	Terms stating they own anything you "upload" or "create" while using the service.
Auto-Renewal	"Evergreen" clauses that lock you into another year unless you cancel in a tiny 3-day window.

Unilateral Modifications & Termination: Clauses allowing the company to change, suspend, or terminate the contract or price without notice or consent while not granting similar rights to the consumer.
Limitation of Liability: Terms that exempt, mitigate, or entirely remove the supplier's liability for defective products, services, or personal injury.
Waiver of Consumer Rights: Provisions that force consumers to waive their legal rights to refunds, legal redress, or statutory guarantees.
Hidden Fees & Interest: Clauses imposing excessive, undisclosed penalties, compound interest, or disproportionate fees for late payments.
Forced Jurisdiction/Arbitration: Requiring consumers to resolve disputes in a distant, unknown, or unfair forum, restricting access to local courts.
Data Retention & Misuse: Clauses allowing companies to retain data indefinitely after the contract ends or restricting the consumer’s ability to manage their own information.
Unfair Automatic Renewal: Contracts that automatically renew without proper notice or with excessive penalties for cancellation.

Rate as high risk if goes against const. rights 


What we need to do: 

1. Tweak prompt - take in information of usr - more user context 
    - Fix the output to make it concise and not too wordy, right not it is giving the raw output from gemini.
2. Should be able to read pdfs 
3. Expand text when spanding side panel
4. Checklist for types of risks usr is concerned about 
5. UI better - loading maginifying glass 
7. See if there is a way to bold specific parts of the text 
8. Documentation 
9. Make UI pretty 
10. Make a demo video 
11. deploy Railyway for flask app 
12. Chat for users to ask about terms and conditions
