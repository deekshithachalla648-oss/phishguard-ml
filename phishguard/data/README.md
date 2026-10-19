# PhishGuard Dataset Directory

This directory contains the training data for the phishing detection system.

## Dataset Format
The dataset is in CSV format with two required columns:
- **`text`**: The raw email body, subject, or SMS message text.
- **`label`**: Class identifier.
  - \`1\` or \`phishing\` for fraudulent / phishing messages.
  - \`0\` or \`legitimate\` for normal, safe messages.

## Expanding the Dataset
You can supplement this dataset with open-access benchmark corpora:
1. **SMS Spam Collection Dataset** (UCI Machine Learning Repository):
   - Useful for mobile smishing baseline patterns. Note: SMS spam is not identical to targeted phishing.
2. **Nazario Phishing Corpus**:
   - Real-world fraudulent emails with spoofed headers and phishing links.
3. **Enron Email Dataset**:
   - Authentic legitimate corporate communication benchmark.
4. **Kaggle Phishing Email Dataset**:
   - Multi-source labeled corpus of phishing and benign emails.

When adding new data, ensure:
- No duplicate records.
- UTF-8 encoding.
- Labels normalized to \`0\` and \`1\`.
