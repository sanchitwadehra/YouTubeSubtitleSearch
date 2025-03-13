function formatTimestamp(seconds) {
    // For videos under 1 hour, use MM:SS format
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

function parseTimeInput(timeStr) {
    if (!timeStr) return null;
    const [min, sec] = timeStr.split(':').map(Number);
    return min * 60 + (sec || 0);
}

function navigateToTimestamp(timestamp) {
    const video = document.querySelector('video');
    const time = parseFloat(timestamp);
    if (video && !isNaN(time)) {
        video.currentTime = time;
        video.play();
    }
} 