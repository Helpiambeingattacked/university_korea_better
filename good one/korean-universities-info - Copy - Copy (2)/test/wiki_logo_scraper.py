import requests
from bs4 import BeautifulSoup

def get_wikipedia_logo(university_name):
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

    # Try to find the infobox logo image
    infobox = soup.find('table', class_='infobox')
    if not infobox:
        print(f"No infobox found for {university_name}")
        return None
    img = infobox.find('img')
    if not img:
        print(f"No logo image found for {university_name}")
        return None
    img_src = img['src']
    # If src is a direct image, return it
    if img_src.startswith('//upload.wikimedia.org/'):
        img_url = 'https:' + img_src
        print(f"{university_name}: {img_url}")
        return img_url
    # If not, try to follow the parent <a> to the File: page
    parent_a = img.find_parent('a')
    if parent_a and parent_a['href'].startswith('/wiki/File:'):
        file_page_url = 'https://en.wikipedia.org' + parent_a['href']
        file_resp = requests.get(file_page_url)
        file_soup = BeautifulSoup(file_resp.text, 'html.parser')
        full_img = file_soup.select_one('.fullImageLink img')
        if full_img and full_img['src'].startswith('//upload.wikimedia.org/'):
            img_url = 'https:' + full_img['src']
            print(f"{university_name}: {img_url}")
            return img_url
    print(f"Could not resolve direct image for {university_name}")
    return None

# Example usage:
universities = [
    "Seoul National University",
    "Yonsei University",
    "Korea Advanced Institute of Science and Technology",
    "Pohang University of Science and Technology",
    "Chonnam National University",
    "Sungkyunkwan University",
    "Hanyang University",
    "Inha University",
    "Konkuk University"
]

for uni in universities:
    get_wikipedia_logo(uni)