import requests
from bs4 import BeautifulSoup
import json
import time
import os

def get_wikipedia_info(university_name):
    """Scrape Wikipedia for logo, region, type, and website."""
    search_url = f"https://en.wikipedia.org/w/index.php?search={university_name.replace(' ', '+')}"
    resp = requests.get(search_url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    # Try to find the first search result link
    first_link = soup.select_one('.mw-search-result-heading a')
    if first_link:
        page_url = "https://en.wikipedia.org" + first_link['href']
        resp = requests.get(page_url)
        soup = BeautifulSoup(resp.text, 'html.parser')
    # else: we are already on the article page

    infobox = soup.find('table', class_='infobox')
    image = None
    region = None
    type_ = None
    website = None
    if infobox:
        # Logo
        img = infobox.find('img')
        if img and img['src'].startswith('//upload.wikimedia.org/'):
            image = 'https:' + img['src']
        # Website
        for a in infobox.find_all('a', href=True):
            if a['href'].startswith('http') and 'official' in a.get_text(strip=True).lower():
                website = a['href']
                break
        if not website:
            ext_link = infobox.find('a', href=True, class_='external text')
            if ext_link:
                website = ext_link['href']
        # Region (city) and type
        for row in infobox.find_all('tr'):
            th = row.find('th')
            td = row.find('td')
            if not th or not td:
                continue
            label = th.get_text(strip=True).lower()
            value = td.get_text(strip=True)
            if not region and ('location' in label or 'city' in label):
                region = value.split(',')[0]
            if not type_ and ('type' in label or 'institution' in label):
                type_ = value

    # Fallbacks if infobox is missing or incomplete
    if not image:
        # Google search for logo
        image = f"https://www.google.com/search?tbm=isch&q={university_name.replace(' ', '+')}+logo+png"
    if not region:
        region = "N/A"
    if not type_:
        type_ = "N/A"
    if not website:
        website = ""
    # Fallback for description: Google search for university description
    description = f"https://www.google.com/search?q={university_name.replace(' ', '+')}+university+description"

    return image, region, type_, website, description

# Scrape all columns from the table
url = "https://perso.utinam.cnrs.fr/~lages/datasets/WRWU17/list_univ_of_KR.html"
resp = requests.get(url)
soup = BeautifulSoup(resp.text, "html.parser")

universities = []
table = soup.find("table")
if table:
    headers = [th.get_text(strip=True) for th in table.find_all("th")]
    print("Headers:", headers)
    rows = table.find_all("tr")[1:]  # skip header
    for row in rows:
        cols = row.find_all("td")
        if len(cols) >= 5:
            # Always get the last column as the university name
            name = cols[-1].get_text(strip=True)
            print(f"Processing: {name}")
            image, region, type_, website, description = get_wikipedia_info(name)
            university = {
                "rank": cols[0].get_text(strip=True),
                "name": name,
                "region": region,
                "type": type_,
                "description": description,
                "image": image,
                "website": website
            }
            universities.append(university)
            time.sleep(1)  # Be polite to Wikipedia
    print("First row:", [td.get_text(strip=True) for td in table.find_all("tr")[1].find_all("td")])

output_dir = "../src/data"
os.makedirs(output_dir, exist_ok=True)

# Overwrite the original file
with open(os.path.join(output_dir, "universities_auto.json"), "w", encoding="utf-8") as f:
    json.dump(universities, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(universities)} universities with correct fields for frontend.")