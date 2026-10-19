import { SampleMessage } from '../types';

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'sample-phish-bank-sms',
    title: 'Urgent Bank Alert (SMS)',
    category: 'phishing',
    type: 'SMS',
    preview: 'CHASE-ALERT: Suspicious transaction of $842.19 detected. Verify immediately...',
    text: 'CHASE-ALERT: Unusual transaction of $842.19 was flagged on your debit card. If this was not you, please verify your identity immediately to prevent permanent account suspension: https://bit.ly/chase-auth-security',
    keySignals: ['Shortened link (bit.ly)', 'Urgent account suspension threat', 'Unsolicited security alert pretext']
  },
  {
    id: 'sample-phish-netflix-email',
    title: 'Subscription Suspended (Email)',
    category: 'phishing',
    type: 'Email',
    preview: 'Netflix: Your membership payment declined. Update billing in 24 hours...',
    text: 'Dear Customer,\n\nWe were unable to process your monthly subscription payment. Your Netflix membership has been placed on hold and will be terminated within 24 hours unless you update your payment method.\n\nPlease log in to confirm your credit card and billing credentials at http://netflix-billing-update.xyz/login\n\nThank you,\nNetflix Customer Support Team',
    keySignals: ['24-hour termination pressure', 'Suspicious .xyz domain', 'Credential harvesting prompt', 'Unencrypted HTTP URL']
  },
  {
    id: 'sample-phish-m365-pass',
    title: 'Microsoft 365 Password Expiry (Email)',
    category: 'phishing',
    type: 'Email',
    preview: 'IT Security Alert: Your work email password expires today. Keep current password...',
    text: 'From: IT Helpdesk Support <admin-security@corp-mail-service.cam>\nSubject: Action Required: Your Office365 password expires today\n\nYour organization email password is scheduled to expire in 2 hours. To keep your current password and prevent email lockout, click below to verify your login credentials immediately:\n\nhttps://portal-office365-verify.top/re-authenticate\n\nIT Support Services',
    keySignals: ['Fake IT authority impersonation', '2-hour lockout deadline', 'Dangerous .top / .cam domain', 'Login password harvest']
  },
  {
    id: 'sample-phish-parcel-sms',
    title: 'Postal Delivery Fee (SMS)',
    category: 'phishing',
    type: 'SMS',
    preview: 'USPS: Package cannot be delivered due to missing house number. Pay redelivery fee...',
    text: 'USPS Notice: Your package US-8947291 could not be delivered due to an incomplete address. Immediate action required. Update your shipping details and pay $1.99 redelivery fee within 12 hours: http://192.168.10.45/usps/track',
    keySignals: ['Direct numeric IP address in URL', 'Small payment hook ($1.99)', '12-hour urgency tactic', 'SMS smishing pattern']
  },
  {
    id: 'sample-legit-campus-email',
    title: 'University CS Course Update (Email)',
    category: 'legitimate',
    type: 'Email',
    preview: 'CS204: Algorithms & Data Structures - Lecture Slides and Lab 3 Schedule...',
    text: 'Hi class,\n\nThe lecture slides for Module 4 (Graph Traversal & Dijkstra\'s Algorithm) have been uploaded to the university portal. Remember that Lab 3 is due this Friday by 11:59 PM. Professor Miller will hold office hours in Room 302 on Thursday afternoon for anyone with questions on the programming assignment.\n\nBest regards,\nTeaching Assistant Sarah',
    keySignals: ['Academic terminology', 'Office hours and campus room details', 'Normal schedule information', 'No external links or urgency']
  },
  {
    id: 'sample-legit-github-email',
    title: 'GitHub Pull Request Review (Email)',
    category: 'legitimate',
    type: 'Email',
    preview: 'GitHub: [project/phishguard] Pull request #14 opened: Added TF-IDF tests...',
    text: 'Hey team,\n\nI just opened Pull Request #14 on the repo "dev-team/phishguard":\n"Added unit tests for TF-IDF vectorizer and updated README documentation."\n\nPlease review the diff and run the test suite when you have time before tomorrow\'s sync meeting. Thanks for your feedback!\n\nCheers,\nAlex',
    keySignals: ['Software collaboration context', 'No requests for credentials', 'Normal peer discussion tone', 'Factual project references']
  },
  {
    id: 'sample-legit-coffee-sms',
    title: 'Friend Lunch / Coffee (SMS)',
    category: 'legitimate',
    type: 'SMS',
    preview: 'Hey! Are we still on for coffee after the database lecture tomorrow?...',
    text: 'Hey! Are we still on for lunch or coffee after the database systems lecture tomorrow? Let me know if 1:30 PM at the campus library café works for you!',
    keySignals: ['Casual interpersonal communication', 'Zero links or attachments', 'Campus context', 'Zero coercion']
  },
  {
    id: 'sample-legit-receipt-email',
    title: 'Bookstore Order Receipt (Email)',
    category: 'legitimate',
    type: 'Email',
    preview: 'Order Confirmation #88392 - Campus Bookstore textbook order...',
    text: 'Thank you for your order!\n\nOrder Number: BK-994821\nItem: Introduction to Algorithms (4th Edition)\nTotal: $68.50\nEstimated delivery date: Wednesday, October 21\n\nYour order is currently being prepared for shipment. You will receive another notification once it has been dispatched with standard carrier tracking details.\n\nCampus Bookstore Customer Care',
    keySignals: ['Factual purchase receipt', 'No urgent verification demands', 'Expected e-commerce confirmation']
  }
];
