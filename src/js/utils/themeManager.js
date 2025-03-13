export function getThemeColors() {
    // Try multiple methods to detect theme
    const html = document.documentElement;
    const isDark = document.querySelector('html[dark]') !== null || 
                  getComputedStyle(html).getPropertyValue('--yt-spec-base-background').trim() === '#0f0f0f' ||
                  window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
        // Search box colors
        searchBackground: isDark ? '#272727' : '#ffffff',
        searchText: isDark ? '#ffffff' : '#000000',
        searchBorder: isDark ? '1px solid #3f3f3f' : '1px solid #dadce0',
        searchPlaceholder: isDark ? '#999999' : '#5f6368',
        
        // Results colors
        resultBackground: isDark ? '#272727' : '#ffffff',
        resultText: isDark ? '#ffffff' : '#000000',
        resultBorder: isDark ? '#3f3f3f' : '#dadce0',
        resultHover: isDark ? '#3a3a3a' : '#f5f5f5',
        resultSelected: isDark ? '#3f3f3f' : '#e6f3ff',
        resultSelectedBorder: isDark ? '#4f4f4f' : '#1a73e8',
        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.1)'
    };
} 