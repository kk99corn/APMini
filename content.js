const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = "10px";
overlay.style.right = "10px";
overlay.style.zIndex = "99999";
overlay.style.background = "rgba(0,0,0,0.6)";
overlay.style.color = "#0f0";
overlay.style.fontSize = "12px";
overlay.style.fontFamily = "monospace";
overlay.style.padding = "10px 14px";
overlay.style.borderRadius = "8px";
overlay.style.pointerEvents = "none";
overlay.style.boxShadow = "0 0 5px rgba(0,0,0,0.5)";
document.body.appendChild(overlay);

let ttfb = 0;
let domReady = 0;
let totalSize = 0;
let realtimeSize = 0;
let estimatedSize = 0;
const seenUrls = new Set();
const skippedResources = [];

const estimateByType = {
    img: 80 * 1024,
    script: 40 * 1024,
    css: 10 * 1024,
    font: 50 * 1024,
    other: 25 * 1024
};

const updateOverlay = () => {
    const formatSize = (size) =>
        size > 1024 * 1024
            ? (size / (1024 * 1024)).toFixed(2) + " MB"
            : (size / 1024).toFixed(1) + " KB";

    overlay.innerHTML = `
    🚀 <b>TTFB:</b> ${ttfb} ms<br/>
    ⚙️ <b>DOM Ready:</b> ${domReady} ms<br/>
    📦 <b>Total:</b> ${formatSize(totalSize)}<br/>
    🔄 <b>실시간:</b> ${formatSize(realtimeSize)}<br/>
    ⚠️ <b>추정치 포함:</b> +${formatSize(estimatedSize)} (${skippedResources.length}개)
  `;
};

const accumulateSize = (entry) => {
    if (seenUrls.has(entry.name)) return;
    seenUrls.add(entry.name);

    let size = 0;
    if ('encodedBodySize' in entry && entry.encodedBodySize > 0) {
        size = entry.encodedBodySize;
    } else if ('transferSize' in entry && entry.transferSize > 0) {
        size = entry.transferSize;
    } else if ('decodedBodySize' in entry && entry.decodedBodySize > 0) {
        size = entry.decodedBodySize;
    } else {
        const type = entry.initiatorType || 'other';
        const estimate = estimateByType[type] || estimateByType.other;
        estimatedSize += estimate;
        skippedResources.push({ name: entry.name, estimated: estimate });
        return 0;
    }

    totalSize += size;
    return size;
};

window.addEventListener("load", () => {
    try {
        const nav = performance.getEntriesByType("navigation")[0];
        if (nav) {
            ttfb = Math.round(nav.responseStart - nav.requestStart);
            domReady = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
        }
    } catch {
        const t = performance.timing;
        ttfb = Math.max(0, t.responseStart - t.requestStart);
        domReady = Math.max(0, t.domContentLoadedEventEnd - t.navigationStart);
    }

    const resources = performance.getEntriesByType("resource");
    resources.forEach((r) => accumulateSize(r));
    updateOverlay();
});

const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        const addedSize = accumulateSize(entry);
        if (addedSize > 0) {
            realtimeSize += addedSize;
        }
        updateOverlay();
    });
});

observer.observe({ type: "resource", buffered: true });