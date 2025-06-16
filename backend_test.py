
import requests
import unittest
import json
import time
from datetime import datetime

class KoreanUniversitiesHubTest(unittest.TestCase):
    """Test suite for the Korean Universities Hub website"""
    
    def setUp(self):
        """Set up test environment(you may need to adjust it based on which port it decides to open it on. I chose default but it might still not work.)"""
        self.base_url = "http://localhost:5500"
        
    def test_homepage_accessibility(self):
        """Test if the homepage is accessible"""
        try:
            response = requests.get(self.base_url, timeout=5)
            self.assertEqual(response.status_code, 200)
            print("✅ Homepage is accessible")
        except requests.exceptions.RequestException as e:
            self.fail(f"❌ Homepage is not accessible: {str(e)}")
    
    def test_universities_data_loading(self):
        """Test if the universities data is loading correctly"""
        try:
            response = requests.get(f"{self.base_url}/src/data/universities_auto.json", timeout=5)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIsInstance(data, list)
            self.assertGreater(len(data), 0)
            print(f"✅ Universities data loaded successfully with {len(data)} universities")
        except requests.exceptions.RequestException as e:
            self.fail(f"❌ Failed to load universities data: {str(e)}")
    
    def test_css_loading(self):
        """Test if the CSS file is loading correctly"""
        try:
            response = requests.get(f"{self.base_url}/src/css/main.css", timeout=5)
            self.assertEqual(response.status_code, 200)
            print("✅ CSS file loaded successfully")
        except requests.exceptions.RequestException as e:
            self.fail(f"❌ Failed to load CSS file: {str(e)}")
    
    def test_js_loading(self):
        """Test if the JavaScript files are loading correctly"""
        js_files = [
            "/src/js/app.js",
            "/src/js/university-manager.js",
            "/src/js/ui-manager.js",
            "/src/js/user-manager.js",
            "/src/js/search-manager.js",
            "/src/js/theme-manager.js"
        ]
        
        for js_file in js_files:
            try:
                response = requests.get(f"{self.base_url}{js_file}", timeout=5)
                self.assertEqual(response.status_code, 200)
                print(f"✅ JavaScript file {js_file} loaded successfully")
            except requests.exceptions.RequestException as e:
                self.fail(f"❌ Failed to load JavaScript file {js_file}: {str(e)}")

def run_tests():
    """Run all tests"""
    print("🔍 Starting Korean Universities Hub Tests")
    print("=" * 50)
    
    test_suite = unittest.TestLoader().loadTestsFromTestCase(KoreanUniversitiesHubTest)
    test_result = unittest.TextTestRunner(verbosity=2).run(test_suite)
    
    print("=" * 50)
    print(f"✅ Tests Passed: {test_result.testsRun - len(test_result.errors) - len(test_result.failures)}")
    print(f"❌ Tests Failed: {len(test_result.failures) + len(test_result.errors)}")
    
    return test_result.wasSuccessful()

if __name__ == "__main__":
    run_tests()
