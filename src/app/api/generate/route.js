import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callGroq(systemPrompt, userPrompt) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "your_groq_api_key_here") return null;

    try {
        const res = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 4000,
            }),
        });
        if (!res.ok) {
            console.error("Groq API error:", res.status);
            return null;
        }
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.error("Groq fetch error:", err);
        return null;
    }
}

// 한국어 조사 처리
function particle(word, withBatchim, withoutBatchim) {
    if (!word) return withBatchim;
    const lastChar = word.charCodeAt(word.length - 1);
    if (lastChar < 0xac00 || lastChar > 0xd7a3) return withBatchim;
    return (lastChar - 0xac00) % 28 !== 0 ? withBatchim : withoutBatchim;
}

function addParticle(word, type) {
    const map = { "은는": ["은", "는"], "이가": ["이", "가"], "을를": ["을", "를"], "으로": ["으로", "로"], "이란": ["이란", "란"] };
    const [b, nb] = map[type] || ["", ""];
    return word + particle(word, b, nb);
}

// 중국어→한국어 자동 변환 사전
const CJK_TO_KOREAN = {
    "介绍": "소개", "紹介": "소개", "增加": "증가", "減少": "감소", "减少": "감소",
    "重要": "중요", "必要": "필요", "可能": "가능", "不可能": "불가능",
    "开始": "시작", "結果": "결과", "结果": "결과", "方法": "방법",
    "問題": "문제", "问题": "문제", "解決": "해결", "解决": "해결",
    "影響": "영향", "影响": "영향", "提供": "제공", "利用": "활용",
    "確認": "확인", "确认": "확인", "變化": "변화", "变化": "변화",
    "發展": "발전", "发展": "발전", "經驗": "경험", "经验": "경험",
    "管理": "관리", "改善": "개선", "維持": "유지", "维持": "유지",
    "選擇": "선택", "选择": "선택", "推薦": "추천", "推荐": "추천",
    "蔬菜": "채소", "野菜": "야채", "水果": "과일", "蛋白質": "단백질", "蛋白质": "단백질",
    "脂肪": "지방", "運動": "운동", "健康": "건강", "食品": "식품", "營養": "영양", "营养": "영양",
    "飲料": "음료", "饮料": "음료", "牛奶": "우유", "雞肉": "닭고기", "鸡肉": "닭고기",
    "豬肉": "돼지고기", "猪肉": "돼지고기", "牛肉": "소고기", "魚": "생선",
    "米飯": "밥", "米饭": "밥", "沙拉": "샐러드",
    "體重": "체중", "体重": "체중", "糖": "당", "鈣": "칼슘", "钙": "칼슘",
    "顧客": "고객", "顾客": "고객", "市場": "시장", "市场": "시장",
    "產品": "제품", "产品": "제품", "服務": "서비스", "服务": "서비스",
    "價格": "가격", "价格": "가격", "品質": "품질", "品质": "품질",
    "戰略": "전략", "战略": "전략", "計劃": "계획", "计划": "계획",
    "分析": "분석", "報告": "보고", "报告": "보고",
    "成功": "성공", "失敗": "실패", "失败": "실패",
    "內容": "내용", "内容": "내용", "技術": "기술", "技术": "기술",
};

function cleanText(text) {
    if (!text) return text;
    let result = text;

    // 1단계: 알려진 중국어 단어를 한국어로 변환
    for (const [cn, kr] of Object.entries(CJK_TO_KOREAN)) {
        result = result.replaceAll(cn, kr);
    }

    // 2단계: 남은 CJK 한자 제거
    result = result.replace(/[\u4E00-\u9FFF]/g, "");

    // 3단계: 베트남어 문자 제거
    result = result.replace(/[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/gi, "");

    // 4단계: 깨진 문장 정리
    result = result
        .replace(/,\s*,/g, ",")
        .replace(/\.\s*\./g, ".")
        .replace(/와를/g, "와 함께")
        .replace(/인에도/g, "인 면에도")
        .replace(/을합니다/g, "을 합니다")
        .replace(/를합니다/g, "를 합니다")
        .replace(/이합니다/g, "이 합니다")
        .replace(/\s{2,}/g, " ")
        .trim();

    return result;
}

const TONE_MAP = {
    professional: "전문적이고 권위있는 톤으로 작성하세요. 격식체를 사용하세요. 데이터와 통계를 인용하세요.",
    friendly: "친근하고 따뜻한 톤으로 작성하세요. 존댓말을 사용하되 부드럽게 작성하세요. 독자에게 말하듯이 작성하세요.",
    humorous: "유머러스하고 재미있는 톤으로 작성하세요. 비유, 은유, 재치있는 표현을 사용하세요.",
    urgent: "긴급하고 행동을 촉구하는 톤으로 작성하세요. 숫자와 구체적 데이터를 강조하세요. '지금', '바로', '한정' 같은 긴급 표현을 사용하세요.",
    luxurious: "고급스럽고 프리미엄한 톤으로 작성하세요. 세련된 어휘를 사용하세요. 독점적이고 특별한 느낌을 주세요.",
};

function buildSystemPrompt(tone) {
    return `당신은 한국어 콘텐츠 전문 작가이자 마케팅 전략가입니다.

절대 규칙:
1. 100% 한국어로만 작성하세요. 중국어 한자, 일본어, 베트남어, 영어를 절대 사용하지 마세요.
2. 한국어 조사(은/는, 이/가, 을/를)를 정확하게 사용하세요.
3. ${TONE_MAP[tone] || TONE_MAP.friendly}
4. JSON으로 응답하지 마세요. 아래에 지정된 구분자 형식을 정확히 따르세요.

콘텐츠 품질 규칙 (학술 연구 기반):
- 구체적 수치/통계를 2개 이상 포함하세요 (신뢰도 32% 향상)
- '~인 것으로 알려져 있습니다', '연구에 따르면' 같은 학술적 표현을 사용하세요
- '따라서', '반면에', '예를 들어' 같은 논리적 연결어를 사용하세요
- 과장 표현('최고', '100%', '무조건')을 피하세요 (AI 환각 신호)
- 공감, 격려, 스토리텔링 요소를 넣으세요 (한국 소비자 감성비 원칙)
- 명확한 행동 유도(CTA)를 포함하세요 (전환율 127% 향상 연구)
- 장단점을 균형있게 다루세요 (신뢰도 향상)`;
}

// ===== 콘텐츠 유형별 프롬프트 =====

function buildPrompt(keyword, type, industry, targetAudience) {
    const ctx = [
        targetAudience ? `타겟: ${targetAudience}` : "",
        industry ? `업종: ${industry}` : "",
    ].filter(Boolean).join(", ");

    const prompts = {
        blog: `키워드: ${keyword}${ctx ? ` (${ctx})` : ""}

위 키워드에 대한 SEO 최적화 블로그 글을 작성해주세요.

필수 요소 (연구 기반):
- 매력적인 제목 (숫자 포함 시 CTR 36% 향상)
- 첫 100자 안에 키워드 포함 (검색 엔진 최적화)
- 서론, 본론(3-5개 섹션 + ## 소제목), 결론 구조
- 마크다운 형식 (##, ###, **굵게**, 목록)
- 구체적 수치/통계 2개 이상
- 논리적 연결어 사용 (따라서, 반면에, 예를 들어)
- 행동 유도 문구 포함
- 1500자 이상 (구글 1페이지 평균 기준)

반드시 아래 형식으로만 응답하세요:
---TITLE---
여기에 블로그 제목
---CONTENT---
여기에 마크다운 본문`,

        instagram: `키워드: ${keyword}${ctx ? ` (${ctx})` : ""}

위 키워드에 대한 인스타그램 포스트를 작성해주세요.

필수 요소 (연구 기반):
- 첫 줄에 감정적 후킹 문구 (공감/질문/놀라움 중 택1)
- 실질적인 팁 3-5개 (번호 매기기)
- 이모지 적극 활용 (줄마다 1-2개)
- 스토리텔링 요소 포함 (경험/사례)
- 명확한 행동 유도 문구 ('저장하세요', '댓글로 알려주세요')
- 관련 해시태그 8-12개

반드시 아래 형식으로만 응답하세요:
---CONTENT---
여기에 인스타그램 전체 글 (해시태그 포함)`,

        youtube: `키워드: ${keyword}${ctx ? ` (${ctx})` : ""}

위 키워드에 대한 유튜브 영상 대본을 작성해주세요.

필수 요소 (연구 기반):
- 인트로(0:00~0:30): 질문/충격적 사실로 시작 (첫 3초 이탈률 55%)
- 본론(3개 파트): 구체적 정보 + 사례/통계
- 아웃트로: 구독/좋아요 유도 + 다음 영상 예고
- 구어체(말하듯이 자연스럽게)
- 숫자 포함 제목 (CTR 36% 향상)
- 4-5분 분량

반드시 아래 형식으로만 응답하세요:
---TITLE---
여기에 영상 제목
---SCRIPT---
여기에 대본 전체
---THUMBNAIL---
여기에 썸네일 텍스트`,

        email: `키워드: ${keyword}${ctx ? ` (${ctx})` : ""}

위 키워드에 대한 마케팅 이메일을 작성해주세요.

필수 요소 (연구 기반):
- 열어보고 싶은 제목 (숫자/질문 포함 → 개봉률 향상)
- 첫 문장에 독자 이름 또는 공감 문구
- 실질적 가치 제공 (핵심 포인트 3개)
- 사회적 증거 포함 ('1,000명 이상이 사용')
- 명확한 CTA 1개 (전환율 127% 향상)

반드시 아래 형식으로만 응답하세요:
---SUBJECT---
여기에 이메일 제목
---CONTENT---
여기에 이메일 본문`,

        ad: `키워드: ${keyword}${ctx ? ` (${ctx})` : ""}

위 키워드에 대한 검색 광고 카피를 작성해주세요.

필수 요소 (CRO 연구 기반):
- 헤드라인에 숫자/혜택 포함 (CTR 36% 향상)
- 긴급성/희소성 표현 포함 ('지금', '한정', '마감 임박')
- 사회적 증거 포함 ('10,000명 선택', '리뷰 4.8점')
- 혜택 중심 설명 (기능이 아닌 가치)
- 파워 워드 사용 ('무료', '보장', '즉시', '검증된')

반드시 아래 형식으로만 응답하세요:
---HEADLINE1---
첫 번째 헤드라인 (30자 이내)
---HEADLINE2---
두 번째 헤드라인 (30자 이내)
---HEADLINE3---
세 번째 헤드라인 (30자 이내)
---HEADLINE4---
네 번째 헤드라인 (30자 이내)
---DESC1---
첫 번째 설명문 (80자 이내)
---DESC2---
두 번째 설명문 (80자 이내)`,
    };

    return prompts[type] || prompts.blog;
}

// ===== 구분자 기반 파싱 =====

function extractSection(text, marker) {
    const pattern = new RegExp(`---${marker}---\\s*\\n?([\\s\\S]*?)(?=---[A-Z]+---|$)`);
    const match = text.match(pattern);
    return match ? cleanText(match[1].trim()) : null;
}

function parseResponse(text, type) {
    if (!text) return null;

    switch (type) {
        case "blog": {
            const title = extractSection(text, "TITLE");
            const content = extractSection(text, "CONTENT");
            if (title && content) {
                return { title, content };
            }
            // 폴백: 전체 텍스트를 콘텐츠로
            const clean = cleanText(text);
            const firstLine = clean.split("\n")[0]?.replace(/^#+\s*/, "");
            return { title: firstLine || "블로그 글", content: clean };
        }
        case "instagram": {
            const content = extractSection(text, "CONTENT");
            if (content) {
                return { content, hashtags: (content.match(/#/g) || []).length };
            }
            return { content: cleanText(text), hashtags: (text.match(/#/g) || []).length };
        }
        case "youtube": {
            const title = extractSection(text, "TITLE");
            const script = extractSection(text, "SCRIPT");
            const thumbnail = extractSection(text, "THUMBNAIL");
            if (title && script) {
                return { title, script, thumbnailText: thumbnail || "" };
            }
            return { title: "유튜브 대본", script: cleanText(text), thumbnailText: "" };
        }
        case "email": {
            const subject = extractSection(text, "SUBJECT");
            const content = extractSection(text, "CONTENT");
            if (subject && content) {
                return { subject, content };
            }
            return { subject: "이메일", content: cleanText(text) };
        }
        case "ad": {
            const h1 = extractSection(text, "HEADLINE1");
            const h2 = extractSection(text, "HEADLINE2");
            const h3 = extractSection(text, "HEADLINE3");
            const h4 = extractSection(text, "HEADLINE4");
            const d1 = extractSection(text, "DESC1");
            const d2 = extractSection(text, "DESC2");
            if (h1) {
                return {
                    headlines: [h1, h2, h3, h4].filter(Boolean),
                    descriptions: [d1, d2].filter(Boolean),
                };
            }
            return { headlines: ["광고 카피"], descriptions: [cleanText(text)] };
        }
        default:
            return { content: cleanText(text) };
    }
}

// ===== Demo fallback =====

function generateDemoContent(keyword, type, industry, targetAudience) {
    const k = keyword;
    const kRan = addParticle(k, "이란");
    const kEun = addParticle(k, "은는");
    const kEul = addParticle(k, "을를");

    const demos = {
        blog: {
            title: `${k} 완벽 가이드: 2026년 최신 트렌드와 실전 전략`,
            content: `## ${kRan}?\n\n${kEun} 최근 많은 사람들이 관심을 갖는 분야입니다.${targetAudience ? ` 특히 ${targetAudience} 사이에서 큰 인기를 얻고 있습니다.` : ""}${industry ? ` ${industry} 분야에서 특히 주목받고 있죠.` : ""}\n\n## 왜 ${k}에 관심을 가져야 할까?\n\n${kEul} 시작하려는 분들이 해마다 늘고 있습니다.\n\n1. **진입 장벽이 낮아졌습니다**\n2. **정보 접근성이 높아졌습니다**\n3. **실질적인 성과가 검증되었습니다**\n\n## ${k} 시작하기: 3단계\n\n### 1단계: 기초 다지기\n핵심 개념을 먼저 이해하세요.\n\n### 2단계: 실전 적용\n작은 것부터 직접 실행에 옮겨보세요.\n\n### 3단계: 꾸준한 개선\n데이터 기반으로 지속 개선하세요.\n\n## 결론\n\n${kEun} 올바른 방향과 꾸준한 노력이면 누구나 성과를 낼 수 있습니다!`,
            seoScore: Math.floor(Math.random() * 10) + 82,
            wordCount: 500,
        },
        instagram: {
            content: `🔥 ${k}, 이렇게 하면 달라져요!\n\n${targetAudience ? `${targetAudience}분들 주목!` : "여러분 주목!"}\n${kEul} 제대로 시작하고 싶다면 👇\n\n✅ 핵심만 먼저 파악하기\n✅ 작은 것부터 바로 실행\n✅ 매일 조금씩 꾸준히\n✅ 데이터로 점검하기\n\n작게 시작해서 꾸준히 하는 게 가장 빠른 길입니다 💪\n\n#${k.replace(/\s/g, "")} #${k.split(" ")[0]} #꿀팁 #추천 #2026`,
            hashtags: 5,
        },
        youtube: {
            title: `${k} 시작 전 꼭 알아야 할 것들`,
            script: `[인트로 - 0:00~0:30]\n안녕하세요! 오늘은 ${k}에 대해 핵심만 알려드리겠습니다.\n\n[파트 1 - 0:30~2:00]\n${kRan} 무엇인가? 쉽게 설명드릴게요.\n\n[파트 2 - 2:00~3:30]\n초보자가 가장 많이 하는 실수를 정리했습니다.\n\n[파트 3 - 3:30~4:30]\n바로 시작할 수 있는 실전 방법!\n\n[아웃트로 - 4:30~5:00]\n좋아요와 구독 부탁드려요! 🙏`,
            thumbnailText: `${k}\n이것만 알면 끝! ✅`,
        },
        email: {
            subject: `[${k}] 지금 시작하면 달라지는 3가지`,
            content: `안녕하세요,\n\n${k}에 관심을 가져주셔서 감사합니다.\n\n📌 핵심 3가지:\n\n1️⃣ 기초부터 탄탄하게\n2️⃣ 작게 시작, 꾸준히 실행\n3️⃣ 결과를 측정하고 개선\n\n감사합니다.\nContentEngine 팀`,
        },
        ad: {
            headlines: [`${k} 완벽 가이드`, `2026 ${k} 트렌드`, `${k} 핵심 비법`, `${k} 시작하기`],
            descriptions: [`${kEul} 제대로 시작하세요. 전문가 가이드 무료 제공.`, `초보자도 쉽게 따라하는 ${k} 실전 가이드.`],
        },
    };

    return demos[type] || demos.blog;
}

// ===== API 핸들러 =====

import { analyzeSEO } from "@/lib/seo-analyzer";
import { analyzeFactCheck } from "@/lib/fact-checker";
import { predictPerformance } from "@/lib/performance-predictor";
import { calculateOverallQuality } from "@/lib/quality-scorer";

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { keyword, types, tone, industry, targetAudience } = body;

    if (!keyword || !types || !Array.isArray(types) || types.length === 0) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {

        const systemPrompt = buildSystemPrompt(tone);
        const results = {};
        let usedAI = false;

        for (const type of types) {
            const userPrompt = buildPrompt(keyword, type, industry, targetAudience);
            const aiResponse = await callGroq(systemPrompt, userPrompt);

            if (aiResponse) {
                usedAI = true;
                const parsed = parseResponse(aiResponse, type);
                results[type] = parsed;
            } else {
                results[type] = generateDemoContent(keyword, type, industry, targetAudience);
            }
        }

        // 진짜 분석 실행 — 블로그 콘텐츠를 우선 분석, 없으면 첫 번째 콘텐츠
        const primaryType = results.blog ? "blog" : types[0];
        const primaryContent = results[primaryType];
        const contentText = primaryContent?.content || primaryContent?.script || "";
        const titleText = primaryContent?.title || primaryContent?.subject || "";

        // SEO 분석 (블로그 전용)
        let seoResult = null;
        if (results.blog) {
            seoResult = analyzeSEO(results.blog.content || "", results.blog.title || "", keyword);
            results.blog.seoScore = seoResult.score;
            results.blog.wordCount = seoResult.wordCount;
        }

        // 팩트체크 분석
        const factCheckResult = analyzeFactCheck(contentText);

        // 성과 예측 분석
        const performanceResult = predictPerformance(contentText, titleText, primaryType, tone);

        // 종합 품질 점수
        const overallQuality = calculateOverallQuality(seoResult, factCheckResult, performanceResult);

        return NextResponse.json({
            results,
            factCheck: {
                score: factCheckResult.score,
                details: factCheckResult.details,
            },
            performance: {
                score: performanceResult.score,
                grade: performanceResult.grade,
                gradeLabel: performanceResult.gradeLabel,
                details: performanceResult.details,
            },
            seo: seoResult ? {
                score: seoResult.score,
                details: seoResult.details,
            } : null,
            overallQuality,
            generatedAt: new Date().toISOString(),
            keyword,
            poweredBy: usedAI ? "Groq AI (Llama 3.3 70B)" : "Demo Mode",
        });
    } catch (err) {
        console.error("API handler error:", err);
        return NextResponse.json({
            error: "서버 오류가 발생했습니다",
            results: {},
            factCheck: { score: 0, details: [] },
            performance: { score: 0, grade: "N/A", gradeLabel: "오류", details: [] },
            seo: null,
            poweredBy: "Error",
        }, { status: 200 });
    }
}
