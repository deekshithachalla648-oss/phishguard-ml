"""
PhishGuard - Automated Test Suite
Run with: pytest tests/test_api.py or python -m unittest tests/test_api.py
"""

import unittest
import json
import sys
import os

# Add parent directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app, init_db

class TestPhishGuardAPI(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        init_db()

    def test_health_check(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('status', data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('model_loaded', data)

    def test_empty_message_validation(self):
        payload = {'message': '   '}
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_non_json_request(self):
        response = self.client.post('/api/analyze',
                                   data='plain text message',
                                   content_type='text/plain')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_invalid_type_message(self):
        payload = {'message': 12345}
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_normal_legitimate_message(self):
        payload = {
            'message': 'Hi Professor, please find the algorithm lab homework attached. See you in class tomorrow.'
        }
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('prediction', data)
        self.assertIn('disclaimer', data)
        self.assertIn('rule_indicators', data)

    def test_phishing_message_with_shortener_and_urgency(self):
        payload = {
            'message': 'URGENT: Your bank account will be suspended within 24 hours. Verify your password now: http://bit.ly/bank-auth'
        }
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['prediction'], 'Potentially Phishing')
        self.assertGreater(len(data['rule_indicators']), 0)

    def test_overly_long_message_rejection(self):
        payload = {'message': 'A' * 15000}
        response = self.client.post('/api/analyze',
                                   data=json.dumps(payload),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('exceeds maximum', data['error'])

if __name__ == '__main__':
    unittest.main()
