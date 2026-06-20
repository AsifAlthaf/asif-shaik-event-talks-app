// State variables
let allNotes = [];
let filteredNotes = [];
let selectedNote = null;
let activeFilter = 'all';
let searchQuery = '';

// DOM Elements
const loaderContainer = document.getElementById('loader-container');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');
const notesFeed = document.getElementById('notes-feed');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search-input');
const filterItems = document.querySelectorAll('.filter-item');

// Tweet Composer Elements
const tweetComposerArea = document.getElementById('tweet-composer-area');
const tweetPlaceholder = document.getElementById('tweet-placeholder');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCounter = document.getElementById('char-counter');
const tweetLenWarning = document.getElementById('tweet-len-warning');
const tweetNowBtn = document.getElementById('tweet-now-btn');
const clearSelectionBtn = document.getElementById('clear-selection');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchReleaseNotes();
    
    // Event Listeners
    refreshBtn.addEventListener('click', fetchReleaseNotes);
    retryBtn.addEventListener('click', fetchReleaseNotes);
    searchInput.addEventListener('input', handleSearch);
    clearSelectionBtn.addEventListener('click', clearSelection);
    tweetTextarea.addEventListener('input', updateTweetCharCount);
    tweetNowBtn.addEventListener('click', postTweet);
    
    filterItems.forEach(item => {
        item.addEventListener('click', () => {
            filterItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            activeFilter = item.getAttribute('data-filter');
            applyFiltersAndSearch();
        });
    });
});

// Fetch Release Notes from API
async function fetchReleaseNotes() {
    showLoader();
    try {
        const response = await fetch('/api/release-notes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allNotes = await response.json();
        
        if (allNotes.error) {
            throw new Error(allNotes.error);
        }
        
        updateCategoryCounts();
        applyFiltersAndSearch();
        clearSelection();
    } catch (error) {
        console.error("Error fetching release notes:", error);
        showError(error.message);
    }
}

// Show/Hide States
function showLoader() {
    loaderContainer.classList.remove('hidden');
    errorContainer.classList.add('hidden');
    notesFeed.classList.add('hidden');
    noResults.classList.add('hidden');
    refreshIcon.classList.add('spinning');
    refreshBtn.disabled = true;
}

function showError(msg) {
    loaderContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    notesFeed.classList.add('hidden');
    noResults.classList.add('hidden');
    errorMessage.textContent = msg;
    refreshIcon.classList.remove('spinning');
    refreshBtn.disabled = false;
}

function showFeed() {
    loaderContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
    refreshIcon.classList.remove('spinning');
    refreshBtn.disabled = false;
    
    if (filteredNotes.length === 0) {
        notesFeed.classList.add('hidden');
        noResults.classList.remove('hidden');
    } else {
        notesFeed.classList.remove('hidden');
        noResults.classList.add('hidden');
        renderNotes();
    }
}

// Render Notes to UI
function renderNotes() {
    notesFeed.innerHTML = '';
    
    filteredNotes.forEach(note => {
        const isSelected = selectedNote && selectedNote.id === note.id;
        
        const card = document.createElement('div');
        card.className = `note-card ${isSelected ? 'selected' : ''}`;
        card.setAttribute('data-id', note.id);
        
        // Define badge style
        let badgeClass = 'badge-type-feature';
        if (note.type === 'Announcement') badgeClass = 'badge-type-announcement';
        if (note.type === 'Change') badgeClass = 'badge-type-change';
        if (note.type === 'Issue') badgeClass = 'badge-type-issue';
        if (note.type === 'Breaking') badgeClass = 'badge-type-breaking';
        
        card.innerHTML = `
            <div class="card-header">
                <span class="badge-type ${badgeClass}">${note.type}</span>
                <span class="date-text">${note.date}</span>
            </div>
            <div class="card-body">
                ${note.description}
            </div>
            <div class="card-footer">
                <button class="card-btn card-btn-tweet" onclick="event.stopPropagation(); quickTweet('${note.id}')">
                    <i class="fa-brands fa-x-twitter"></i> Tweet
                </button>
                <a href="${note.link}" target="_blank" class="card-btn card-btn-link" onclick="event.stopPropagation();">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Docs
                </a>
            </div>
        `;
        
        // Click to select
        card.addEventListener('click', () => selectNote(note));
        
        notesFeed.appendChild(card);
    });
}

// Category Counts Update
function updateCategoryCounts() {
    const counts = {
        all: allNotes.length,
        Feature: 0,
        Announcement: 0,
        Change: 0,
        Issue: 0,
        Breaking: 0
    };
    
    allNotes.forEach(note => {
        if (counts[note.type] !== undefined) {
            counts[note.type]++;
        }
    });
    
    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-feature').textContent = counts.Feature;
    document.getElementById('count-announcement').textContent = counts.Announcement;
    document.getElementById('count-change').textContent = counts.Change;
    document.getElementById('count-issue').textContent = counts.Issue;
    document.getElementById('count-breaking').textContent = counts.Breaking;
}

// Filtering and Searching
function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase().strip ? e.target.value.toLowerCase().trim() : e.target.value.toLowerCase();
    applyFiltersAndSearch();
}

function applyFiltersAndSearch() {
    filteredNotes = allNotes.filter(note => {
        const matchesFilter = activeFilter === 'all' || note.type === activeFilter;
        const matchesSearch = note.raw_text.toLowerCase().includes(searchQuery) || 
                              note.type.toLowerCase().includes(searchQuery) ||
                              note.date.toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
    });
    
    showFeed();
}

// Selection Logic
function selectNote(note) {
    selectedNote = note;
    
    // Highlight active card
    document.querySelectorAll('.note-card').forEach(card => {
        if (card.getAttribute('data-id') === note.id) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
    
    // Populate Composer
    tweetPlaceholder.classList.add('hidden');
    tweetComposerArea.classList.remove('hidden');
    
    // Pre-populate tweet text
    // Format: 🚀 BigQuery [Feature] (June 17, 2026): Autonomous embedding generation generally available! #BigQuery #GoogleCloud [link]
    const header = `🚀 BigQuery [${note.type}] (${note.date}): `;
    const tags = ` #BigQuery #GCP`;
    
    // Calculate space for link + tags + header
    // Twitter link is always 23 chars
    const reservedChars = header.length + tags.length + 25; // 25 to be safe with newlines
    const maxTextLen = 280 - reservedChars;
    
    let textBody = note.raw_text;
    if (textBody.length > maxTextLen) {
        textBody = textBody.substring(0, maxTextLen - 3) + '...';
    }
    
    tweetTextarea.value = `${header}${textBody}\n\n${note.link}${tags}`;
    updateTweetCharCount();
}

function clearSelection() {
    selectedNote = null;
    document.querySelectorAll('.note-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    tweetPlaceholder.classList.remove('hidden');
    tweetComposerArea.classList.add('hidden');
    tweetTextarea.value = '';
}

// Character Counting
function updateTweetCharCount() {
    const text = tweetTextarea.value;
    
    // Twitter parses urls as 23 characters. Let's do a basic regex replacement to calculate twitter length
    const urlRegex = /https?:\/\/[^\s]+/g;
    let urlMatches = text.match(urlRegex) || [];
    let textWithoutUrls = text.replace(urlRegex, '');
    
    let computedLength = textWithoutUrls.length + (urlMatches.length * 23);
    
    charCounter.textContent = `${computedLength} / 280`;
    
    if (computedLength > 280) {
        charCounter.style.color = 'var(--color-issue)';
        tweetLenWarning.classList.remove('hidden');
        tweetNowBtn.disabled = true;
        tweetNowBtn.style.opacity = '0.5';
        tweetNowBtn.style.cursor = 'not-allowed';
    } else {
        charCounter.style.color = 'var(--text-muted)';
        tweetLenWarning.classList.add('hidden');
        tweetNowBtn.disabled = false;
        tweetNowBtn.style.opacity = '1';
        tweetNowBtn.style.cursor = 'pointer';
    }
}

// Tweet Functions
function quickTweet(noteId) {
    const note = allNotes.find(n => n.id === noteId);
    if (!note) return;
    
    const header = `🚀 BigQuery [${note.type}] (${note.date}): `;
    const tags = ` #BigQuery #GCP`;
    const reservedChars = header.length + tags.length + 25;
    const maxTextLen = 280 - reservedChars;
    
    let textBody = note.raw_text;
    if (textBody.length > maxTextLen) {
        textBody = textBody.substring(0, maxTextLen - 3) + '...';
    }
    
    const fullText = `${header}${textBody}\n\n${note.link}${tags}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
    window.open(twitterUrl, '_blank');
}

function postTweet() {
    const text = tweetTextarea.value;
    if (!text.trim()) return;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
}
