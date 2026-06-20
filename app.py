from flask import Flask, jsonify, render_template
import feedparser
import re
import html

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def strip_html(html_str):
    # Remove HTML tags
    text = re.sub(r'<[^<]+?>', '', html_str)
    # Decode HTML entities
    text = html.unescape(text)
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/release-notes')
def get_release_notes():
    try:
        feed = feedparser.parse(FEED_URL)
        release_notes = []
        
        for entry_index, entry in enumerate(feed.entries):
            date = entry.title
            link = entry.link
            content_val = ""
            
            if 'content' in entry:
                content_val = entry.content[0].value
            elif 'summary' in entry:
                content_val = entry.summary
                
            # Split content by <h3> tags to parse individual updates
            parts = content_val.split("<h3>")
            update_idx = 0
            for part in parts:
                if not part.strip():
                    continue
                subparts = part.split("</h3>", 1)
                if len(subparts) == 2:
                    update_type = subparts[0].strip()
                    update_desc = subparts[1].strip()
                    raw_text = strip_html(update_desc)
                    
                    release_notes.append({
                        "id": f"{entry_index}_{update_idx}",
                        "date": date,
                        "type": update_type,
                        "description": update_desc,
                        "raw_text": raw_text,
                        "link": link
                    })
                    update_idx += 1
                    
        return jsonify(release_notes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
