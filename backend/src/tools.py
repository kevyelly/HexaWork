import os
import requests
import base64
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
from langchain_core.tools import tool
import zipfile
import io

load_dotenv()

# Firecrawl Web Scraper Tool
# MAO NI MUCHECK SA LIVE LINK SA WEBSITE
@tool
def web_scraper_tool(url: str) -> str:
    """Scrapes a live website URL and returns its content in clean markdown format."""
    try:
        app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
        result = app.scrape_url(url, params={'formats': ['markdown']})
        
        markdown_text = result.get('markdown', '')
        if not markdown_text:
            return "Successfully scraped the site, but no markdown content was returned."
            
        # Truncate to save tokens if the site is massive
        return f"Website Content:\n{markdown_text[:5000]}"
    except Exception as e:
        return f"Error scraping website {url}: {str(e)}"
        
# Custom GitHub Fetcher Tool
# MAO NI MUCHECK SA GITHUB REPO
@tool
def fetch_github_code(repo_url: str) -> str:
    """Fetches key smart contract and frontend files from a GitHub repository."""
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"} if token else {}
    
    try:
        parts = repo_url.rstrip("/").split("/")
        owner, repo = parts[-2], parts[-1]
        api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1"
        
        response = requests.get(api_url, headers=headers)
        if response.status_code != 200:
            return f"Failed to fetch repo. Status: {response.status_code}"
            
        tree = response.json().get("tree", [])
        extensions = ('.sol', '.js', '.ts', '.py', 'README.md')
        
        extracted_code = ""
        file_count = 0
        
        for item in tree:
            if item["type"] == "blob" and item["path"].endswith(extensions):
                file_data = requests.get(item["url"], headers=headers).json()
                if "content" in file_data:
                    content = base64.b64decode(file_data["content"]).decode('utf-8')
                    extracted_code += f"\n--- FILE: {item['path']} ---\n{content[:2000]}\n" # Truncated for safety
                    file_count += 1
                if file_count >= 10: # Limit to 10 key files to save tokens
                    break
                    
        return extracted_code if extracted_code else "No relevant code files found."
    except Exception as e:
        return f"Error fetching GitHub repo: {str(e)}"

# Simple Link Validator Tool
@tool
def check_link_status(url: str) -> str:
    """Verifies if a URL is active and accessible."""
    try:
        r = requests.head(url, timeout=5)
        return f"Link {url} is Active (Status: {r.status_code})" if r.status_code < 400 else f"Link is Broken (Status: {r.status_code})"
    except:
        return "Link is Unreachable"


def extract_code_from_zip(file_bytes: bytes) -> str:
    """Reads a zip file from memory and extracts relevant code files."""
    extracted_code = ""
    extensions = (
            # Web Frontend & UI
            '.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
            # Web3 & Smart Contracts
            '.sol', '.rs', '.move', '.vy',
            # Backend & Systems
            '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rb', '.php',
            # Mobile
            '.swift', '.kt', '.dart',
            # Docs & Configs
            'README.md', '.json', '.yaml', '.toml'
        )
    
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
            for filename in z.namelist():
                # Ignore macOS hidden files and node_modules
                if filename.startswith('__MACOSX') or 'node_modules/' in filename or '.git/' in filename:
                    continue
                    
                if filename.endswith(extensions):
                    try:
                        # Read the file content
                        content = z.read(filename).decode('utf-8')
                        # Truncate to 2000 chars per file to save tokens (optional)
                        extracted_code += f"\n--- ZIP FILE: {filename} ---\n{content[:2000]}\n"
                    except UnicodeDecodeError:
                        pass # Skip if it's accidentally a binary file
                        
        return extracted_code if extracted_code else "No relevant code files found in the ZIP."
    except zipfile.BadZipFile:
        return "Error: The uploaded file is not a valid ZIP archive."