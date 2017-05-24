window.addEventListener('viewRender', () => {
    chrome.runtime.sendMessage({
        'message': 'sidebarRender',
        'height': document.body.scrollHeight
    });
    console.log(">> Sidebar resized");
});
