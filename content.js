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
// overlay.style.pointerEvents = "none";
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
let finishTime = 0; // Page load completion time (seconds)

const updateOverlay = () => {
    const formatSize = (size) =>
        size > 1024 * 1024
            ? (size / (1024 * 1024)).toFixed(2) + " MB"
            : (size / 1024).toFixed(1) + " KB";

    overlay.innerHTML = `🚀 TTFB: ${ttfb} ms | ⚙️ DOM Ready: ${domReady} ms | ⌛ Load: ${finishTime} s <span id="apm_close_btn" style="cursor:pointer; margin-left:15px; font-weight:bold; user-select:none;">&times;</span>`;
};

window.addEventListener("load", () => {
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
        ttfb = "N/A";
        domReady = "N/A";
    }

    try {
        // try 내부, finishTime 계산 로직 시작 전
        const nav = performance.getEntriesByType("navigation")[0];
        if (nav && nav.duration > 0) {
            let calculatedTime = nav.duration / 1000;
            finishTime = calculatedTime.toFixed(2);
        } else {
            const t = performance.timing;
            if (!t) {
                finishTime = "N/A";
            } else {
                if (t.domComplete > 0 && t.domComplete > t.navigationStart) { // 조건 변경
                    let calculatedTime = (t.domComplete - t.navigationStart) / 1000; // 계산식 변경
                    finishTime = calculatedTime.toFixed(2);
                } else {
                    finishTime = "N/A";
                }
            }
        }
        if (isNaN(parseFloat(finishTime)) || parseFloat(finishTime) < 0 || finishTime === "0.00") { // 0.00초도 유효하지 않다고 간주
            finishTime = "N/A";
        }
    } catch (e) {
        finishTime = "N/A"; // 예외 발생 시
    }

    updateOverlay();

}); // window.load 이벤트 리스너 끝

// 단축키(Ctrl+Q)로 오버레이 토글 기능
document.addEventListener('keydown', function(event) {
    // event.key가 'q' 또는 'Q' 이고, event.ctrlKey가 true일 때
    if (event.key.toLowerCase() === 'q' && event.ctrlKey) {
        // 오버레이의 현재 display 상태 확인
        if (overlay.style.display === 'none') {
            overlay.style.display = ''; // 기본값으로 되돌리거나 'block' 등으로 명시적 설정
            // 초기 스타일 설정 시 display를 명시하지 않았으므로 ''로 하면 기본값(block 등)으로 복원됨
        } else {
            overlay.style.display = 'none';
        }
        // 기본 브라우저 단축키 동작 방지 (예: Ctrl+Q가 브라우저 종료 등)
        event.preventDefault();
    }
});