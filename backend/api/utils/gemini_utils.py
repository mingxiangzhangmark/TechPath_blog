from decouple import config
import google.generativeai as genai

api_key = config('GOOGLE_API_KEY')
genai.configure(api_key=api_key)
print(f"GOOGLE_API_KEY: {api_key}")

def generate_blog_text(prompt: str, wordcount: int) -> str:

    system_prompt = f"""
You are a blog content writer.
Please write a blog-style article of approximately {wordcount} words.
The topic is: {prompt}
The tone should be friendly, informative, and helpful.
Output ONLY valid HTML code for the article content, using tags like <h2>, <h3>, <p>, <ul>, <li>, <pre>, <code>, <strong>, etc.
DO NOT include <!DOCTYPE html>, <html>, <head>, <title>, or <body> tags. Do not include ```html and ``` markers.
Return ONLY the article content HTML.
Do NOT use Markdown.
"""
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(system_prompt)
    text = response.text.strip()

    if text.startswith("```html"):
        text = text[len("```html"):].lstrip("\n")
    if text.endswith("```"):
        text = text[:-3].rstrip()
    return text
