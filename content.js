const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.bottom = "10px"; // 'top' 대신 'bottom' 사용
overlay.style.left = "10px";   // 'right' 대신 'left' 사용
overlay.style.right = "unset"; // 기존 'right' 속성 영향 제거
overlay.style.zIndex = "99999";
overlay.style.background = "rgba(0,0,0,0.6)";
overlay.style.color = "#0f0";
overlay.style.fontSize = "12px";
overlay.style.fontFamily = "monospace";
overlay.style.padding = "10px 14px";
overlay.style.borderRadius = "8px";
// overlay.style.pointerEvents = "none"; // 사용자가 주석 처리한 것을 존중 (또는 삭제)
overlay.style.boxShadow = "0 0 5px rgba(0,0,0,0.5)";
document.body.appendChild(overlay);

// X 버튼 클릭 이벤트 리스너 (이벤트 위임 방식)
overlay.addEventListener('click', function(event) {
    if (event.target.id === 'apm_close_btn') {
        overlay.style.display = 'none';
    }
});

let ttfb = 0;
let domReady = 0;
// let totalSize = 0; // Removed
// let realtimeSize = 0; // Removed
// let totalResourcesSize = 0; // Removed
// let realtimeResourcesSize = 0; // Removed
let finishTime = 0; // Page load completion time (seconds)
// let fcpTime = "N/A"; // Removed
// let lcpTime = "N/A"; // Removed
// numRequests variable is completely removed as instructed.
// const seenUrls = new Set(); // Removed

// The following PerformanceObserver for general resources is no longer needed
// and has been removed as per instructions.
// // PerformanceObserver is defined and starts observing at the global scope.
// // Its callback will be modified for FCP/LCP later.
// const observer = new PerformanceObserver((list) => {
//     list.getEntries().forEach((entry, index) => {
//         // Content removed as per instruction to empty the callback for now.
//         // FCP/LCP logic will be added here in next steps.
//         // Relevant console.logs are also removed.
//     });
// });
// observer.observe({ type: "resource", buffered: true }); // This will be updated later for FCP/LCP

// FCP 전용 Observer - Removed
// const fcpObserver = new PerformanceObserver(...); // Removed
// try { fcpObserver.observe(...); } catch (e) { ... } // Removed

// LCP 전용 Observer - Removed
// const lcpObserver = new PerformanceObserver(...); // Removed
// try { lcpObserver.observe(...); } catch (e) { ... } // Removed

//     img: 80 * 1024, // Removed
//     script: 40 * 1024, // Removed
//     css: 10 * 1024, // Removed
//     font: 50 * 1024, // Removed
//     other: 25 * 1024 // Removed
// }; // Removed

const updateOverlay = () => {
    const formatSize = (size) =>
        size > 1024 * 1024
            ? (size / (1024 * 1024)).toFixed(2) + " MB"
            : (size / 1024).toFixed(1) + " KB";

    overlay.innerHTML = `🚀 TTFB: ${ttfb} ms | ⚙️ DOM Ready: ${domReady} ms | ⌛ Load: ${finishTime} s <span id="apm_close_btn" style="cursor:pointer; margin-left:15px; font-weight:bold; user-select:none;">&times;</span>`;
    // Removed lines for:
    // 🎨 <b>FCP:</b> ${fcpTime} ms<br/>
    // 🖼️ <b>LCP:</b> ${lcpTime} ms<br/>
    // 📊 <b>요청:</b> ${seenUrls.size} 건<br/>
    // 📤 <b>전송됨:</b> ${formatSize(realtimeSize)}<br/> 
    // 📥 <b>리소스:</b> ${formatSize(realtimeResourcesSize)}
};

// const accumulateSize = (entry) => { ... }; // Entire function removed.

window.addEventListener("load", () => {
    // Keep existing ttfb and domReady calculations
    try {
        const nav = performance.getEntriesByType("navigation")[0];
        const t = performance.timing;

        if (nav) {
            ttfb = Math.round(nav.responseStart - nav.requestStart);
            domReady = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
        } else {
            ttfb = (t.responseStart > 0 && t.requestStart > 0) ? Math.max(0, t.responseStart - t.requestStart) : "N/A";
            domReady = (t.domContentLoadedEventEnd > 0 && t.navigationStart > 0) ? Math.max(0, t.domContentLoadedEventEnd - t.navigationStart) : "N/A";
        }
    } catch (e) {
        console.error("Error calculating TTFB/DOM Ready:", e);
        ttfb = "N/A";
        domReady = "N/A";
    }

    // Updated finishTime calculation logic as per instruction
    try {
        // try 내부, finishTime 계산 로직 시작 전
        // console.log("Calculating finishTime. nav object:", JSON.stringify(performance.getEntriesByType("navigation")[0]));
        // console.log("Calculating finishTime. performance.timing object:", JSON.stringify(performance.timing));
        
        const nav = performance.getEntriesByType("navigation")[0];
        if (nav && nav.duration > 0) {
            // console.log("Using nav.duration:", nav.duration);
            let calculatedTime = nav.duration / 1000;
            // console.log("Calculated finishTime (before toFixed):", calculatedTime);
            finishTime = calculatedTime.toFixed(2);
        } else {
            const t = performance.timing;
            if (!t) {
                // console.log("performance.timing object is not available.");
                finishTime = "N/A";
            } else {
                // t.loadEventEnd 대신 t.domComplete를 사용하도록 로그 및 로직 수정
                // console.log("Using performance.timing. t.domComplete:", t.domComplete, "t.navigationStart:", t.navigationStart); 
                if (t.domComplete > 0 && t.domComplete > t.navigationStart) { // 조건 변경
                    let calculatedTime = (t.domComplete - t.navigationStart) / 1000; // 계산식 변경
                    // console.log("Calculated finishTime (fallback using domComplete, before toFixed):", calculatedTime);
                    finishTime = calculatedTime.toFixed(2);
                } else {
                    // 조건이 domComplete 기준으로 실패했을 때의 로그
                    // console.log("performance.timing fallback using domComplete conditions not met. domComplete:", t.domComplete, "navigationStart:", t.navigationStart);
                    finishTime = "N/A";
                }
            }
        }
        // console.log("finishTime (before validation):", finishTime);
        if (isNaN(parseFloat(finishTime)) || parseFloat(finishTime) < 0 || finishTime === "0.00") { // 0.00초도 유효하지 않다고 간주
            // console.log("finishTime validation failed. Original value:", finishTime);
            finishTime = "N/A";
        }
        // console.log("Final finishTime:", finishTime);
    } catch (e) {
        console.error("Error calculating finishTime:", e);
        finishTime = "N/A"; // 예외 발생 시
    }

    // The initialResources.forEach loop is removed.
    // PerformanceObserver (now global) will handle all resource accumulation.
    
    // realtimeSize and realtimeResourcesSize will reflect values accumulated by the global observer.
    // numRequests is not set here as it's removed. seenUrls.size is used in updateOverlay.

    updateOverlay(); // Update overlay with TTFB, DOM Ready, Finish Time, and whatever resources observer has caught so far.

}); // window.load 이벤트 리스너 끝

// PerformanceObserver is now defined and started at the global scope (moved to the top).

// 단축키(Ctrl+Q)로 오버레이 토글 기능
document.addEventListener('keydown', function(event) {
    // event.key가 'q' 또는 'Q' 이고, event.ctrlKey가 true일 때
    if (event.key.toLowerCase() === 'q' && event.ctrlKey) {
        // 오버레이의 현재 display 상태 확인
        if (overlay.style.display === 'none') {
            overlay.style.display = ''; // 기본값으로 되돌리거나 'block' 등으로 명시적 설정
                                     // 초기 스타일 설정 시 display를 명시하지 않았으므로 ''로 하면 기본값(block 등)으로 복원됨
            // console.log("Overlay display ON by shortcut Ctrl+Q"); // 디버깅 로그
        } else {
            overlay.style.display = 'none';
            // console.log("Overlay display OFF by shortcut Ctrl+Q"); // 디버깅 로그
        }
        // 기본 브라우저 단축키 동작 방지 (예: Ctrl+Q가 브라우저 종료 등)
        event.preventDefault(); 
    }
});