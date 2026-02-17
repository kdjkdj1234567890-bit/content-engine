// 논문급 콘텐츠 품질 종합 채점기
// 3개 분석기 결과를 종합하여 전체 콘텐츠 품질 등급 산출
// 학술 근거: 다차원 텍스트 품질 평가 프레임워크 (Linguistic Constructs of Text Readability, 2024)

/**
 * 3개 분석 결과를 종합하여 전체 콘텐츠 품질 등급을 산출
 * @param {Object} seo - SEO 분석 결과
 * @param {Object} factCheck - 팩트체크 분석 결과  
 * @param {Object} performance - 성과 예측 결과
 * @returns {Object} 종합 품질 평가
 */
export function calculateOverallQuality(seo, factCheck, performance) {
    // 가중 평균 (연구 기반 가중치)
    // SEO 30%, 팩트체크 35%, 성과 예측 35%
    // 팩트체크 가중치가 높은 이유: 환각률 27-40% 대응이 핵심 차별화
    const weights = {
        seo: 0.30,
        factCheck: 0.35,
        performance: 0.35,
    };

    const seoScore = seo?.score || 0;
    const factScore = factCheck?.score || 0;
    const perfScore = performance?.score || 0;

    const weightedScore = Math.round(
        seoScore * weights.seo +
        factScore * weights.factCheck +
        perfScore * weights.performance
    );

    // 등급 산출
    let grade, gradeLabel, gradeEmoji;
    if (weightedScore >= 85) {
        grade = "S"; gradeLabel = "최상급 콘텐츠"; gradeEmoji = "🏆";
    } else if (weightedScore >= 75) {
        grade = "A"; gradeLabel = "우수 콘텐츠"; gradeEmoji = "⭐";
    } else if (weightedScore >= 60) {
        grade = "B"; gradeLabel = "양호 콘텐츠"; gradeEmoji = "👍";
    } else if (weightedScore >= 45) {
        grade = "C"; gradeLabel = "보통 콘텐츠"; gradeEmoji = "📝";
    } else {
        grade = "D"; gradeLabel = "개선 필요"; gradeEmoji = "⚠️";
    }

    // 주요 이슈/강점 요약
    const strengths = [];
    const issues = [];

    // SEO 분석
    if (seoScore >= 70) strengths.push("SEO 최적화 우수");
    else if (seoScore < 50) issues.push("SEO 점수 개선 필요");

    // 팩트체크 분석
    if (factScore >= 85) strengths.push("높은 신뢰도");
    else if (factScore < 70) issues.push("과장 표현 또는 출처 부족");

    // 성과 예측
    if (perfScore >= 70) strengths.push("높은 참여율 예상");
    else if (perfScore < 50) issues.push("후킹/CTA 강화 필요");

    // 가져오기 어려운 조합 분석
    if (factScore >= 80 && perfScore >= 70) {
        strengths.push("신뢰도 + 참여율 동시 달성 (상위 15% 수준)");
    }

    // 개선 제안 (가장 낮은 점수 기준)
    const lowestArea = [
        { area: "SEO", score: seoScore },
        { area: "신뢰도", score: factScore },
        { area: "성과 예측", score: perfScore },
    ].sort((a, b) => a.score - b.score)[0];

    const suggestions = {
        "SEO": "키워드 밀도, 소제목 구조, 콘텐츠 길이를 개선하세요",
        "신뢰도": "출처 추가, 과장 표현 제거, 논리적 연결어를 사용하세요",
        "성과 예측": "후킹 문구, CTA, 감정적 요소를 강화하세요",
    };

    return {
        score: weightedScore,
        grade,
        gradeLabel: `${gradeEmoji} ${gradeLabel}`,
        breakdown: {
            seo: seoScore,
            factCheck: factScore,
            performance: perfScore,
        },
        strengths,
        issues,
        topSuggestion: lowestArea.score < 70
            ? `${lowestArea.area} 점수가 가장 낮습니다. ${suggestions[lowestArea.area]}`
            : null,
    };
}
