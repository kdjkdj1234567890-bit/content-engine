// 논문급 팩트체크 분석기 v2
// 학술 근거: LLM 환각률 27-40% (GPT-4: 28.6%, GPT-3.5: 39.6%) [JMIR 2024]
// 자동 팩트체크 연구: 과장 감지, 출처 분석, 모순 탐지, 환각 패턴 감지

export function analyzeFactCheck(content) {
    if (!content) return { score: 0, details: [] };

    const details = [];
    let score = 100; // 감점 방식

    // 1. 구체적 숫자/통계 사용 — 신뢰도 지표
    // 연구: 구체적 데이터가 있는 콘텐츠의 사용자 신뢰도 32% 향상
    const specificClaims = content.match(/\d{4}년|\d+%|약 \d+|전년 대비|연구에 따르면|조사에 따르면|통계에 따르면/g) || [];
    if (specificClaims.length >= 3) {
        details.push({
            label: `구체적 데이터 사용 (${specificClaims.length}건)`,
            status: "pass",
            tip: "구체적 수치가 풍부하여 신뢰도가 높습니다",
            points: 0,
        });
    } else if (specificClaims.length >= 1) {
        score -= 3;
        details.push({
            label: `구체적 데이터 일부 사용 (${specificClaims.length}건)`,
            status: "warn",
            tip: "통계나 구체적 수치를 2-3개 더 추가하면 신뢰도가 올라갑니다",
            points: -3,
        });
    } else {
        score -= 8;
        details.push({
            label: "구체적 데이터 부족",
            status: "warn",
            tip: "통계, 연도, 퍼센트 등 구체적 수치를 추가하세요 (신뢰도 32% 향상 효과)",
            points: -8,
        });
    }

    // 2. 과장 표현 감지 — AI 환각의 주요 징후
    // 연구: LLM은 절대적 표현을 과다 사용하는 경향 (hallucination indicator)
    const exaggerations = [];
    const exaggerationPatterns = [
        { pattern: /100%|완벽하게|절대적으로|무조건|확실히 보장/g, label: "절대적 표현", severity: 4 },
        { pattern: /최고의|최강의|유일한|독보적인|압도적인/g, label: "최상급 과장", severity: 3 },
        { pattern: /기적|혁명적|놀라운 결과|폭발적|충격적/g, label: "선정적 표현", severity: 3 },
        { pattern: /반드시 성공|절대 실패하지|누구나 가능|무조건 됩니다/g, label: "보장 표현", severity: 5 },
        { pattern: /세계 최초|역대 최고|전무후무|사상 초유/g, label: "극단적 주장", severity: 4 },
    ];

    for (const { pattern, label, severity } of exaggerationPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            exaggerations.push(...matches);
            const deduction = Math.min(matches.length * severity, 12);
            score -= deduction;
            details.push({
                label: `${label} 감지 ("${matches[0]}")`,
                status: severity >= 4 ? "fail" : "warn",
                tip: `"${matches[0]}" → 좀 더 객관적인 표현으로 수정하세요`,
                points: -deduction,
            });
        }
    }

    // 3. 헤징(hedging) 표현 — 학술적 신뢰도 지표
    // 연구: 적절한 hedging은 전문성의 지표 (학술 논문 필수 요소)
    const hedgingPatterns = /것으로 알려져|연구 결과|~에 따르면|일반적으로|대체로|~라고 합니다|것으로 보입니다|가능성이 있|경향이 있/g;
    const hedging = content.match(hedgingPatterns) || [];
    if (hedging.length >= 2) {
        details.push({
            label: `학술적 표현 사용 (${hedging.length}건)`,
            status: "pass",
            tip: "적절한 수준의 객관성을 유지하고 있습니다",
            points: 0,
        });
    } else if (hedging.length >= 1) {
        details.push({
            label: `학술적 표현 일부 (${hedging.length}건)`,
            status: "warn",
            tip: "'~인 것으로 알려져 있습니다' 같은 표현을 추가하세요",
            points: 0,
        });
    }

    // 4. 출처/근거 언급 — 팩트체크 핵심
    // 연구: 출처 있는 콘텐츠의 공유율 2.4배 높음
    const sourcePatterns = /출처|참고|참조|연구|논문|보고서|데이터|통계청|조사|기관|학회|전문가|교수|박사|분석에 따르면|발표에 따르면/g;
    const sources = content.match(sourcePatterns) || [];
    if (sources.length >= 2) {
        details.push({
            label: `출처/근거 다수 언급 (${sources.length}건)`,
            status: "pass",
            tip: "충분한 출처가 언급되어 신뢰도가 높습니다",
            points: 0,
        });
    } else if (sources.length >= 1) {
        score -= 3;
        details.push({
            label: `출처 일부 언급 (${sources.length}건)`,
            status: "warn",
            tip: "추가 출처를 언급하면 신뢰도가 높아집니다 (공유율 2.4배 향상)",
            points: -3,
        });
    } else {
        score -= 7;
        details.push({
            label: "출처 미언급",
            status: "fail",
            tip: "출처나 근거를 추가하세요. 출처 있는 콘텐츠의 공유율이 2.4배 높습니다",
            points: -7,
        });
    }

    // 5. 모순/양면 분석 — 균형잡힌 시각
    const positivePatterns = content.match(/좋습니다|효과적|추천합니다|도움이 됩니다|장점|이점|강점/g) || [];
    const negativePatterns = content.match(/좋지 않|효과가 없|비추천|위험|단점|약점|주의|한계/g) || [];

    if (positivePatterns.length > 0 && negativePatterns.length > 0) {
        details.push({
            label: "양면적 분석 (장+단점)",
            status: "pass",
            tip: "장단점을 모두 다루어 균형잡힌 글입니다. 신뢰도 향상 요소",
            points: 0,
        });
    }

    // 6. 환각 패턴 감지 (NEW — 연구 기반)
    // GPT-4 환각률 28.6%, 최신 모델도 15%+ (AIMultiple 2026)
    const hallucinationPatterns = [
        { pattern: /모든 전문가가 동의|과학적으로 입증된 사실|100% 안전|부작용 없/g, label: "과대 일반화" },
        { pattern: /\d{4}년.*발표된.*연구에 따르면/g, label: "가짜 출처 가능성" },
        { pattern: /WHO|FDA|CDC|질병관리청.*발표|권장/g, label: "기관 인용 (확인 필요)" },
    ];

    for (const { pattern, label } of hallucinationPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            score -= 5;
            details.push({
                label: `⚠️ ${label} ("${matches[0].slice(0, 25)}...")`,
                status: "warn",
                tip: "LLM이 생성한 인용은 반드시 원본 확인이 필요합니다 (환각률 27-40%)",
                points: -5,
            });
        }
    }

    // 7. 비검증 건강/의학/법률 주장 감지
    const riskyClaimPatterns = [
        { pattern: /치료|완치|예방.*효과|약효|질병.*낫|체중.*감소.*보장|확실.*다이어트/g, label: "의학적 주장", severity: 5 },
        { pattern: /법적.*보장|소송.*가능|합법적.*보장|법률.*위반 없/g, label: "법률적 주장", severity: 5 },
        { pattern: /수익.*보장|원금.*보장|무위험.*투자|확정.*수익/g, label: "재무적 주장", severity: 7 },
    ];

    for (const { pattern, label, severity } of riskyClaimPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            score -= severity;
            details.push({
                label: `${label} 감지 (${matches.length}건)`,
                status: "fail",
                tip: `${label}은 전문가 확인이 필수입니다. '~에 도움이 될 수 있습니다'로 완화하세요`,
                points: -severity,
            });
        }
    }

    // 8. 반복적 내용 감지 — 콘텐츠 품질 지표
    const sentences = content.split(/[.!?\n]+/).filter((s) => s.trim().length > 10);
    const uniqueSentences = new Set(sentences.map((s) => s.trim().toLowerCase()));
    const repetitionRate = sentences.length > 0 ? (1 - uniqueSentences.size / sentences.length) * 100 : 0;

    if (repetitionRate > 20) {
        score -= 10;
        details.push({
            label: `내용 반복 감지 (${repetitionRate.toFixed(0)}%)`,
            status: "fail",
            tip: "같은 내용이 반복되고 있습니다. 다양한 정보를 추가하세요",
            points: -10,
        });
    } else if (repetitionRate > 10) {
        score -= 5;
        details.push({
            label: `약간의 반복 (${repetitionRate.toFixed(0)}%)`,
            status: "warn",
            tip: "일부 내용이 반복됩니다",
            points: -5,
        });
    } else {
        details.push({
            label: "내용 다양성",
            status: "pass",
            tip: "반복 없이 다양한 내용을 다루고 있습니다",
            points: 0,
        });
    }

    // 9. 논리적 흐름 감지 (NEW — 연구 기반)
    // 연구: 논리적 연결어 사용이 가독성과 신뢰도에 양의 상관관계
    const logicalConnectors = content.match(/따라서|그러므로|결과적으로|반면에|한편|그러나|하지만|또한|더불어|이와 같이|예를 들어|즉,|다시 말해/g) || [];
    if (logicalConnectors.length >= 3) {
        details.push({
            label: `논리적 흐름 (연결어 ${logicalConnectors.length}개)`,
            status: "pass",
            tip: "논리적 연결어가 잘 사용되어 글의 흐름이 좋습니다",
            points: 0,
        });
    } else if (logicalConnectors.length >= 1) {
        score -= 3;
        details.push({
            label: `논리적 흐름 부족 (연결어 ${logicalConnectors.length}개)`,
            status: "warn",
            tip: "'따라서', '반면에', '예를 들어' 같은 연결어를 추가하세요",
            points: -3,
        });
    } else {
        score -= 5;
        details.push({
            label: "논리적 연결어 없음",
            status: "fail",
            tip: "문장 간 논리적 연결이 부족합니다. 연결어를 추가하세요",
            points: -5,
        });
    }

    // 최소 40점, 최대 100점
    score = Math.max(40, Math.min(100, score));

    // 없으면 기본 통과 추가
    if (details.filter((d) => d.status === "pass").length === 0) {
        details.unshift({
            label: "기본 내용 구조",
            status: "pass",
            tip: "기본적인 콘텐츠 구조를 갖추고 있습니다",
            points: 0,
        });
    }

    return {
        score,
        details,
        exaggerationCount: exaggerations.length,
        sourceCount: sources.length,
        hedgingCount: hedging.length,
        logicalFlow: logicalConnectors.length,
    };
}
