#!/usr/bin/env python3

"""
Adds a sample hosted search page to the public folder for Cypress tests. 
Used for validating that the lastest Atomic build works with the hosted 
search pages.
"""

import os
import requests
from bs4 import BeautifulSoup as Soup

SEARCH_URL = 'https://search.cloud.coveo.com'
ORG_ID = 'coveointernaltesting1'
PAGE_ID = '24b0c504-00d5-4afd-90cb-1b3e7e44040f'
PUBLIC_FOLDER = '../../www/'
BASE_URL = f'{SEARCH_URL}/rest/organizations/{ORG_ID}/searchinterfaces/{PAGE_ID}/'


def set_cwd():
    """Set current working directory to file location
    (allows script to be run from anywhere)"""

    abspath = os.path.abspath(__file__)
    dname = os.path.dirname(abspath)
    os.chdir(dname)


def replace_atomic_version(soup):
    """Modifies the page to use the local version of Atomic"""

    css_link = soup.select_one('link[href$="themes/coveo.css"]')
    js_script = soup.select_one('script[src$="atomic.esm.js"]')
    css_link['href'] = '/themes/coveo.css'
    js_script['src'] = '/build/atomic.esm.js'
    return(soup)


def replace_init_script(soup):
    """Replaces the page init script to skip authentication"""

    init_script = soup.select_one('#bootstrap')
    init_script.string = '''
      (async () => {
        await customElements.whenDefined('atomic-search-interface')
        searchInterface = document.querySelector('atomic-search-interface')
        await searchInterface.initialize({
          accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
          organizationId: 'searchuisamples'
        });
        searchInterface.executeFirstSearch()
      })()
    '''
    return(soup)


def add_css_and_js():
    """Copies the css and js dependencies to the public folder"""

    links = [
        'lib/styleguide/css/CoveoStyleGuide.css',
        'css/main.css',
        'js/SearchInterfaces.Dependencies.min.js',
        'js/SearchInterfaces.bundle.min.js'
    ]
    for link in links:
        response = requests.get(BASE_URL + link)
        path = PUBLIC_FOLDER + link
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w') as file:
            file.write(response.text)


set_cwd()
response = requests.get(BASE_URL + 'html')
soup = Soup(response.text, features='html.parser')
soup = replace_atomic_version(soup)
soup = replace_init_script(soup)
add_css_and_js()
with open(PUBLIC_FOLDER + 'hosted.html', 'w') as file:
    file.write(str(soup))
