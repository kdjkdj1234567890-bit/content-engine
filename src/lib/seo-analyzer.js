// 논문급 SEO 점수 분석기 v2
// 학술 근거:
// - Google Search Quality Guidelines (E-E-A-T)
// - Backlinko: 1페이지 평균 1,890단어 (한국어 기준 약 1,500자+)
// - Moz: 키워드 밀도 1-3%가 최적
// - HubSpot: 소제목 3개 이상 = SEO 점수 향상

// 긴 키워드에서 핵심 키워드를 추출
function extractKeywords(keyword) {
    const tokens = keyword.toLowerCase().split(/[\s,]+/).filter(t => t.length >= 2);
    const meaningful = tokens.filter(t => !/^\d+$/.test(t));

    const keywords = new Set();
    for (const t of meaningful) keywords.add(t);
    for (let i = 0; i < meaningful.length - 1; i++) {
        keywords.add(meaningful[i] + " " + meaningful[i + 1]);
        keywords.add(meaningful[i] + meaningful[i + 1]);
    }
    return [...keywords];
}

export function analyzeSEO(content, title, keyword) {
    if (!content || !keyword) return { score: 0, details: [] };

    const details = [];
    let score = 0;
    const keywords = extractKeywords(keyword);
    const primaryKeyword = keywords[0] || keyword.toLowerCase();
    const contentLower = content.toLowerCase();
    const titleLower = (title || "").toLowerCase();

    // 1. 제목에 키워드 포함 (15점)
    // 연구: 제목에 키워드 있으면 CTR 20% 향상 (Moz)
    const titleHasKeyword = keywords.some(k => titleLower.includes(k));
    if (titleHasKeyword) {
        score += 15;
        details.push({ label: "제목에 키워드 포함 ✓", status: "pass", points: 15 });
    } else {
        details.push({ label: "제목에 키워드 없음", status: "fail", points: 0, tip: `제목에 "${primaryKeyword}" 포함 시 CTR 20% 향상` });
    }

    // 2. 콘텐츠 길이 (15점)
    // Backlinko: 구글 1페이지 평균 1,890 단어 ≈ 한국어 1,500자+
    const length = content.length;
    if (length >= 2000) {
        score += 15;
        details.push({ label: `콘텐츠 길이 (${length.toLocaleString()}자) — 심층`, status: "pass", points: 15 });
    } else if (length >= 1500) {
        score += 13;
        details.push({ label: `콘텐츠 길이 (${length.toLocaleString()}자)`, status: "pass", points: 13 });
    } else if (length >= 800) {
        score += 8;
        details.push({ label: `콘텐츠 길이 (${length.toLocaleString()}자)`, status: "warn", points: 8, tip: "구글 1페이지 평균: 1,500자+" });
    } else if (length >= 400) {
        score += 4;
        details.push({ label: `콘텐츠 길이 (${length.toLocaleString()}자) — 짧음`, status: "warn", points: 4, tip: "최소 800자 이상 작성하세요" });
    } else {
        details.push({ label: `콘텐츠 길이 (${length}자) — 매우 짧음`, status: "fail", points: 0, tip: "콘텐츠가 너무 짧습니다" });
    }

    // 3. 키워드 밀도 (15점)
    // Moz: 최적 밀도 1-3%, 과도한 밀도는 패널티
    let totalKeywordCount = 0;
    for (const k of keywords) {
        const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        totalKeywordCount += (contentLower.match(new RegExp(escaped, "g")) || []).length;
    }
    const density = length > 0 ? (totalKeywordCount * primaryKeyword.length / length) * 100 : 0;

    if (totalKeywordCount >= 3 && density <= 5) {
        score += 15;
        details.push({ label: `키워드 밀도 (${totalKeywordCount}회, ${density.toFixed(1)}%)`, status: "pass", points: 15 });
    } else if (totalKeywordCount >= 1) {
        score += 8;
        details.push({ label: `키워드 밀도 (${totalKeywordCount}회)`, status: "warn", points: 8, tip: "최적 밀도: 키워드 3회+ 자연 포함" });
    } else {
        score += 3;
        details.push({ label: `키워드 미포함`, status: "warn", points: 3, tip: "키워드를 자연스럽게 3회 이상 포함하세요" });
    }

    // 4. 소제목(H2/H3) 구조 (12점)
    // HubSpot: 소제목 3개+ = SEO 향상 + 체류 시간 증가
    const headings = (content.match(/^#{2,3}\s+.+/gm) || []);
    if (headings.length >= 4) {
        score += 12;
        details.push({ label: `소제목 구조 (${headings.length}개) — 우수`, status: "pass", points: 12 });
    } else if (headings.length >= 2) {
        score += 8;
        details.push({ label: `소제목 구조 (${headings.length}개)`, status: "warn", points: 8, tip: "소제목 4개+ 사용 시 체류 시간 증가" });
    } else if (headings.length >= 1) {
        score += 4;
        details.push({ label: `소제목 구조 (${headings.length}개) — 부족`, status: "warn", points: 4, tip: "소제목을 3개 이상 사용하세요" });
    } else {
        details.push({ label: "소제목 없음", status: "fail", points: 0, tip: "## 소제목을 추가하세요" });
    }

    // 5. 단락 구분 (8점)
    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 20);
    if (paragraphs.length >= 5) {
        score += 8;
        details.push({ label: `단락 구분 (${paragraphs.length}개) — 우수`, status: "pass", points: 8 });
    } else if (paragraphs.length >= 3) {
        score += 5;
        details.push({ label: `단락 구분 (${paragraphs.length}개)`, status: "warn", points: 5, tip: "5개 이상 단락으로 나누세요" });
    } else {
        score += 2;
        details.push({ label: `단락 구분 (${paragraphs.length}개) — 부족`, status: "warn", points: 2, tip: "내용을 더 많은 단락으로 나누세요" });
    }

    // 6. 리스트/목록 사용 (8점)
    // 연구: 목록 사용 시 스캐너빌리티 47% 향상
    const lists = (content.match(/^[-*•✅❌]\s+.+/gm) || []);
    const numberedLists = (content.match(/^\d+[.)]\s+.+/gm) || []);
    const totalLists = lists.length + numberedLists.length;
    if (totalLists >= 4) {
        score += 8;
        details.push({ label: `목록 사용 (${totalLists}개) — 우수`, status: "pass", points: 8 });
    } else if (totalLists >= 2) {
        score += 5;
        details.push({ label: `목록 사용 (${totalLists}개)`, status: "warn", points: 5, tip: "목록 4개+ 사용 시 스캐너빌리티 47% 향상" });
    } else if (totalLists >= 1) {
        score += 3;
        details.push({ label: `목록 사용 (${totalLists}개)`, status: "warn", points: 3, tip: "목록을 더 활용하세요" });
    } else {
        details.push({ label: "목록 미사용", status: "fail", points: 0, tip: "포인트를 목록으로 정리하세요" });
    }

    // 7. 소제목에 키워드 (8점)
    const headingsWithKeyword = headings.filter((h) => {
        const hLower = h.toLowerCase();
        return keywords.some(k => hLower.includes(k));
    });
    if (headingsWithKeyword.length >= 2) {
        score += 8;
        details.push({ label: `소제목에 키워드 (${headingsWithKeyword.length}개)`, status: "pass", points: 8 });
    } else if (headingsWithKeyword.length >= 1) {
        score += 5;
        details.push({ label: "소제목에 키워드 1개", status: "warn", points: 5, tip: "소제목 2개 이상에 키워드를 넣으세요" });
    } else {
        details.push({ label: "소제목에 키워드 없음", status: "fail", points: 0, tip: "소제목에도 키워드를 넣으세요" });
    }

    // 8. 서론/결론 구조 (7점) — E-E-A-T 신호
    const hasIntro = contentLower.includes("서론") || contentLower.includes("소개") || content.split("\n\n")[0]?.length > 50;
    const hasConclusion = contentLower.includes("결론") || contentLower.includes("마무리") || contentLower.includes("정리") || contentLower.includes("요약");
    if (hasIntro && hasConclusion) {
        score += 7;
        details.push({ label: "서론/결론 구조 ✓", status: "pass", points: 7 });
    } else if (hasIntro || hasConclusion) {
        score += 4;
        details.push({ label: "서론/결론 일부", status: "warn", points: 4, tip: "서론과 결론을 모두 포함하세요 (E-E-A-T 신호)" });
    } else {
        details.push({ label: "서론/결론 없음", status: "fail", points: 0, tip: "서론과 결론을 추가하세요" });
    }

    // 9. 첫 100자에 키워드 (5점) NEW — 연구 기반
    // Google: 첫 100자 내 키워드 = 검색 엔진 인식률 향상
    const first100 = contentLower.slice(0, 100);
    const keywordInOpening = keywords.some(k => first100.includes(k));
    if (keywordInOpening) {
        score += 5;
        details.push({ label: "첫 100자에 키워드 ✓", status: "pass", points: 5 });
    } else {
        details.push({ label: "첫 100자에 키워드 없음", status: "warn", points: 0, tip: "콘텐츠 시작 부분에 키워드를 넣으세요" });
    }

    // 10. 내부/외부 링크 시그널 (2점) NEW
    const linkSignals = content.match(/참고|자세히|더 알아|관련 글|링크|클릭/g) || [];
    if (linkSignals.length >= 1) {
        score += 2;
        details.push({ label: `링크 시그널 (${linkSignals.length}건)`, status: "pass", points: 2 });
    }

    return {
        score: Math.min(score, 100),
        details,
        wordCount: length,
        keywordCount: totalKeywordCount,
        headingCount: headings.length,
        density: density.toFixed(2),
    };
}
