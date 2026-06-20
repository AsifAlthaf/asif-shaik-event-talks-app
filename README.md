# BigQuery Release Insights 🚀

A sleek, modern web application dashboard that fetches, structures, and presents Google Cloud BigQuery release notes dynamically, with built-in social sharing integration to publish updates straight to X (formerly Twitter).

## 🌟 Key Features

- **Granular Update Parsing**: Splits multi-topic release notes entries (e.g., combined under a single date) into distinct, categorized items: `Feature`, `Announcement`, `Change`, `Issue`, or `Breaking`.
- **Dynamic Category Filtering**: Clickable sidebar filters to instantly view specific types of updates along with dynamic item counters.
- **Real-Time Search**: Fast, client-side keyword matching across dates, update types, and description contents.
- **Interactive Selection**: Clicking a release note highlights the card and loads it directly into the Tweet Composer.
- **X/Twitter Composer Integration**:
  - Automatically wraps and formats your tweet with a header (`🚀 BigQuery [Type] (Date):`) and hashtags (`#BigQuery #GCP`).
  - Implements a character tracker that accounts for Twitter's 23-character URL shortening limit.
  - Quick-tweet action directly from each card.
- **Polished Glassmorphism UI**: Beautiful, premium dark-mode interface with subtle glow animations, custom color badges, and fully responsive layouts.

## 🛠️ Tech Stack

- **Backend**: Python Flask 3.0, `feedparser`, `requests`
- **Frontend**: Vanilla HTML5, Vanilla JavaScript, Vanilla CSS3 (curated HSL palettes, glassmorphism, responsive grid)
- **External Resources**: Font Awesome Icons, Google Fonts (Outfit)

## 🚀 Getting Started

### Prerequisites

Ensure you have Python 3 installed. This application was built using Python 3.9+.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/AsifAlthaf/asif-shaik-event-talks-app.git
   cd asif-shaik-event-talks-app
   ```
2. Install the backend dependencies:
   ```bash
   pip install flask feedparser requests
   ```

### Running the App

Start the development server:
```bash
python app.py
```

Open your browser and navigate to:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**
