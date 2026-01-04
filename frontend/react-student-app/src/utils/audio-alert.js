// src/utils/audio-alert.js (Used in React/Angular components)

const audioCache = {};

export function playSystemAlert(eventKey, schoolId) {
    // 1. Determine the API endpoint based on your structure
    const soundUrlEndpoint = `/api/sounds/get_url/?event_key=${eventKey}&school_id=${schoolId}`;
    
    // Check if the URL is already cached (saves unnecessary API calls)
    if (audioCache[eventKey]) {
        new Audio(audioCache[eventKey]).play();
        return;
    }
    
    // 2. Fetch the URL (this will hit the get_alert_sound logic on the Django backend)
    fetch(soundUrlEndpoint)
        .then(res => res.json())
        .then(data => {
            if (data.url) {
                audioCache[eventKey] = data.url; // Cache the URL
                new Audio(data.url).play();
            }
        })
        .catch(err => console.warn("Failed to play system sound.", err));
}