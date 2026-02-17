"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./generate.module.css";

const CONTENT_TYPES = [
    { id: "blog", icon: "📝", label: "블로그 (SEO)", desc: "검색 최적화된 블로그 포스트" },
    { id: "instagram", icon: "📱", label: "인스타그램", desc: "해시태그 포함 SNS 포스트" },
    { id: "youtube", icon: "📺", label: "유튜브 대본", desc: "영상 스크립트 + 썸네일 문구" },
    { id: "email", icon: "💌", label: "이메일", desc: "뉴스레터 / 마케팅 이메일" },
    { id: "ad", icon: "🎯", label: "광고 카피", desc: "네이버/구글 광고 문구" },
];

const TONES = [
    { id: "professional", label: "전문적", emoji: "🏢" },
    { id: "friendly", label: "친근한", emoji: "😊" },
    { id: "humorous", label: "유머러스", emoji: "😄" },
    { id: "urgent", label: "긴급한", emoji: "⚡" },
    { id: "luxurious", label: "프리미엄", emoji: "✨" },
];

const INDUSTRIES = [
    "카페/레스토랑", "뷰티/화장품", "패션/의류", "IT/테크", "교육/학원",
    "부동산", "건강/피트니스", "여행/관광", "금융/보험", "기타",
];

export default function GeneratePage() {
    const [step, setStep] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState(["blog"]);
    const [tone, setTone] = useState("friendly");
    const [industry, setIndustry] = useState("");
    const [targetAudience, setTargetAudience] = useState("");
    const [generating, setGenerating] = useState(false);
    const [results, setResults] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [poweredBy, setPoweredBy] = useState("");
    const [expandedScore, setExpandedScore] = useState(null);
    const [usageCount, setUsageCount] = useState(0);

    const FREE_DAILY_LIMIT = 3;

    // 사용량 추적 (localStorage 기반)
    const getUsageToday = () => {
        if (typeof window === "undefined") return 0;
        const data = localStorage.getItem("ce_usage");
        if (!data) return 0;
        try {
            const parsed = JSON.parse(data);
            const today = new Date().toISOString().slice(0, 10);
            if (parsed.date !== today) return 0;
            return parsed.count || 0;
        } catch { return 0; }
    };

    const incrementUsage = () => {
        if (typeof window === "undefined") return;
        const today = new Date().toISOString().slice(0, 10);
        const current = getUsageToday();
        localStorage.setItem("ce_usage", JSON.stringify({ date: today, count: current + 1 }));
        setUsageCount(current + 1);
    };

    // 초기 로드 시 사용량 확인
    useState(() => {
        setUsageCount(getUsageToday());
    });

    const toggleType = (id) => {
        setSelectedTypes((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!keyword.trim()) return;

        // 무료 사용량 체크
        const currentUsage = getUsageToday();
        if (currentUsage >= FREE_DAILY_LIMIT) {
            if (window.confirm(`오늘의 무료 사용량(${FREE_DAILY_LIMIT}회)을 모두 사용했습니다.\n\nPro 플랜으로 업그레이드하면 무제한으로 생성할 수 있습니다.\n\n가격 페이지로 이동하시겠습니까?`)) {
                window.location.href = "/pricing";
            }
            return;
        }

        setGenerating(true);
        setResults(null);
        setAnalysis(null);
        setPoweredBy("");
        setExpandedScore(null);
        setStep(4);

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword, types: selectedTypes, tone, industry, targetAudience }),
            });

            let data;
            try {
                data = await res.json();
            } catch (parseErr) {
                console.error("JSON parse error:", parseErr);
                alert("서버 응답을 처리할 수 없습니다. 다시 시도해주세요.");
                return;
            }

            if (data.error) {
                console.warn("API error:", data.error);
            }

            setResults(data.results || {});
            setAnalysis({
                factCheck: data.factCheck || { score: 0, details: [] },
                performance: data.performance || { score: 0, grade: "N/A", gradeLabel: "오류", details: [] },
                seo: data.seo || null,
            });
            setPoweredBy(data.poweredBy || "");
            incrementUsage();
        } catch (err) {
            console.error("Generation error:", err);
            alert("콘텐츠 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setGenerating(false);
        }
    };

    const resetAll = () => {
        setStep(1);
        setResults(null);
        setAnalysis(null);
        setExpandedScore(null);
    };

    const remainingUses = FREE_DAILY_LIMIT - getUsageToday();

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>← 홈으로</Link>
                <div className={styles.headerLogo}>
                    <span>⚡</span>
                    <span className="gradient-text" style={{ fontWeight: 800 }}>ContentEngine</span>
                </div>
                <Link href="/pricing" style={{
                    fontSize: "0.8rem",
                    color: remainingUses <= 1 ? "var(--warning)" : "var(--text-muted)",
                    display: "flex", alignItems: "center", gap: "4px",
                    padding: "6px 14px",
                    background: remainingUses <= 1 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                    borderRadius: "100px",
                    border: `1px solid ${remainingUses <= 1 ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
                    transition: "all 250ms",
                }}>
                    {remainingUses > 0 ? `오늘 ${remainingUses}회 남음` : "🔒 업그레이드"}
                </Link>
            </header>

            <div className={styles.content}>
                {/* Progress Bar */}
                <div className={styles.progress}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`${styles.progressStep} ${step >= s ? styles.progressActive : ""}`}>
                            <div className={styles.progressDot}>{step > s ? "✓" : s}</div>
                            <span>{["키워드", "옵션", "생성"][s - 1]}</span>
                        </div>
                    ))}
                    <div className={styles.progressLine}>
                        <div className={styles.progressFill} style={{ width: `${((step - 1) / 2) * 100}%` }} />
                    </div>
                </div>

                {/* Step 1: Keyword */}
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                            <h1>어떤 <span className="gradient-text">키워드</span>로 콘텐츠를 만들까요?</h1>
                            <p>주제, 키워드, 또는 문장을 자유롭게 입력하세요</p>
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                className={`input ${styles.bigInput}`}
                                placeholder="예: 카페 창업 마케팅, 다이어트 식단, AI 트렌드..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && keyword.trim() && setStep(2)}
                                autoFocus
                            />
                            <button
                                className="btn btn-primary btn-large"
                                disabled={!keyword.trim()}
                                onClick={() => setStep(2)}
                                style={{ marginTop: "var(--space-md)" }}
                            >
                                다음 단계 →
                            </button>
                        </div>
                        <div className={styles.suggestions}>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>추천 키워드:</span>
                            {["카페 창업", "다이어트 식단", "주식 투자 입문", "코딩 독학"].map((s) => (
                                <button key={s} className={styles.suggestionBtn} onClick={() => { setKeyword(s); setStep(2); }}>{s}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Options */}
                {step === 2 && (
                    <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                            <h1><span className="gradient-text">"{keyword}"</span> 맞춤 설정</h1>
                            <p>콘텐츠 유형, 톤, 업종을 선택하세요</p>
                        </div>

                        <div className={styles.optionSection}>
                            <h3 className={styles.optionLabel}>📋 콘텐츠 유형 (복수 선택)</h3>
                            <div className={styles.typeGrid}>
                                {CONTENT_TYPES.map((t) => (
                                    <button key={t.id} className={`${styles.typeCard} ${selectedTypes.includes(t.id) ? styles.typeActive : ""}`} onClick={() => toggleType(t.id)}>
                                        <span className={styles.typeIcon}>{t.icon}</span>
                                        <span className={styles.typeLabel}>{t.label}</span>
                                        <span className={styles.typeDesc}>{t.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.optionSection}>
                            <h3 className={styles.optionLabel}>🎚️ 감정 톤</h3>
                            <div className={styles.toneGrid}>
                                {TONES.map((t) => (
                                    <button key={t.id} className={`${styles.toneBtn} ${tone === t.id ? styles.toneActive : ""}`} onClick={() => setTone(t.id)}>
                                        <span>{t.emoji}</span><span>{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.optionSection}>
                            <h3 className={styles.optionLabel}>🏢 업종</h3>
                            <select className={`input ${styles.selectInput}`} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                                <option value="">업종 선택 (선택사항)</option>
                                {INDUSTRIES.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
                            </select>
                        </div>

                        <div className={styles.optionSection}>
                            <h3 className={styles.optionLabel}>👥 타겟 고객</h3>
                            <input type="text" className="input" placeholder="예: 20-30대 여성, 소상공인, 대학생..." value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
                        </div>

                        <div className={styles.stepActions}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>← 이전</button>
                            <button className="btn btn-primary btn-large" onClick={handleGenerate}>
                                ⚡ {selectedTypes.length}개 콘텐츠 생성하기
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3/4: Generating / Results */}
                {step >= 3 && (
                    <div className={styles.stepContent}>
                        {generating ? (
                            <div className={styles.generatingScreen}>
                                <div className={styles.genSpinner}>
                                    <div className={styles.spinnerRing} />
                                </div>
                                <h2>AI가 콘텐츠를 생성하고 있어요</h2>
                                <div className={styles.genSteps}>
                                    {["키워드 분석 중...", "업종 트렌드 조사 중...", "콘텐츠 생성 중...", "팩트체크 검증 중...", "톤 조정 중..."].map((s, i) => (
                                        <div key={i} className={styles.genStep} style={{ animationDelay: `${i * 1.5}s` }}>
                                            <div className="loading-spinner" /> <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : results ? (
                            <div className={styles.resultsContainer}>
                                <div className={styles.resultsHeader}>
                                    <div>
                                        <h1>✨ 콘텐츠가 완성되었어요!</h1>
                                        <p>"{keyword}" 키워드로 {Object.keys(results).length}개 콘텐츠 생성</p>
                                        {poweredBy && (
                                            <p style={{ fontSize: "0.8rem", color: "var(--accent-2)", marginTop: "4px" }}>
                                                🤖 {poweredBy}
                                            </p>
                                        )}
                                    </div>
                                    <button className="btn btn-secondary" onClick={resetAll}>+ 새로 만들기</button>
                                </div>

                                {/* Score Cards — 진짜 분석 결과 */}
                                {analysis && (
                                    <div className={styles.scoreCards}>
                                        {/* 팩트체크 */}
                                        <div
                                            className={`${styles.scoreCard} ${styles.scoreGreen} ${expandedScore === "factCheck" ? styles.scoreExpanded : ""}`}
                                            onClick={() => setExpandedScore(expandedScore === "factCheck" ? null : "factCheck")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span className={styles.scoreLabel}>✅ 팩트체크 점수</span>
                                            <span className={styles.scoreValue}>{analysis.factCheck.score}%</span>
                                            <span className={styles.scoreDesc}>
                                                {analysis.factCheck.score >= 85 ? "신뢰도 높음" : analysis.factCheck.score >= 70 ? "양호" : "개선 필요"}
                                                {" · 클릭하여 상세보기"}
                                            </span>
                                            {expandedScore === "factCheck" && (
                                                <div className={styles.scoreDetails}>
                                                    {analysis.factCheck.details.map((d, i) => (
                                                        <div key={i} className={`${styles.detailItem} ${styles[`detail_${d.status}`]}`}>
                                                            <span>{d.status === "pass" ? "✅" : d.status === "warn" ? "⚠️" : "❌"} {d.label}</span>
                                                            {d.tip && <span className={styles.detailTip}>{d.tip}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* 성과 예측 */}
                                        <div
                                            className={`${styles.scoreCard} ${styles.scorePurple} ${expandedScore === "performance" ? styles.scoreExpanded : ""}`}
                                            onClick={() => setExpandedScore(expandedScore === "performance" ? null : "performance")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span className={styles.scoreLabel}>📊 성과 예측</span>
                                            <span className={styles.scoreValue}>
                                                {analysis.performance.grade} · {analysis.performance.score}점
                                            </span>
                                            <span className={styles.scoreDesc}>
                                                {analysis.performance.gradeLabel}
                                                {" · 클릭하여 상세보기"}
                                            </span>
                                            {expandedScore === "performance" && (
                                                <div className={styles.scoreDetails}>
                                                    {analysis.performance.details.map((d, i) => (
                                                        <div key={i} className={`${styles.detailItem} ${styles[`detail_${d.status}`]}`}>
                                                            <span>{d.status === "pass" ? "✅" : d.status === "warn" ? "⚠️" : "❌"} {d.label}</span>
                                                            <span className={styles.detailPoints}>{d.points}/{d.max}</span>
                                                            {d.tip && <span className={styles.detailTip}>{d.tip}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* SEO 점수 (블로그 있을 때만) */}
                                        {analysis.seo && (
                                            <div
                                                className={`${styles.scoreCard} ${styles.scoreBlue} ${expandedScore === "seo" ? styles.scoreExpanded : ""}`}
                                                onClick={() => setExpandedScore(expandedScore === "seo" ? null : "seo")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <span className={styles.scoreLabel}>🔍 SEO 점수</span>
                                                <span className={styles.scoreValue}>{analysis.seo.score}/100</span>
                                                <span className={styles.scoreDesc}>
                                                    {analysis.seo.score >= 80 ? "최적화 우수" : analysis.seo.score >= 60 ? "양호" : "개선 필요"}
                                                    {" · 클릭하여 상세보기"}
                                                </span>
                                                {expandedScore === "seo" && (
                                                    <div className={styles.scoreDetails}>
                                                        {analysis.seo.details.map((d, i) => (
                                                            <div key={i} className={`${styles.detailItem} ${styles[`detail_${d.status}`]}`}>
                                                                <span>{d.status === "pass" ? "✅" : d.status === "warn" ? "⚠️" : "❌"} {d.label}</span>
                                                                <span className={styles.detailPoints}>{d.points}점</span>
                                                                {d.tip && <span className={styles.detailTip}>{d.tip}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content Results */}
                                <div className={styles.resultsList}>
                                    {results.blog && (
                                        <ResultCard icon="📝" title="블로그 (SEO 최적화)" content={results.blog.content} heading={results.blog.title} />
                                    )}
                                    {results.instagram && (
                                        <ResultCard icon="📱" title="인스타그램 포스트" content={results.instagram.content} />
                                    )}
                                    {results.youtube && (
                                        <ResultCard icon="📺" title="유튜브 대본" content={results.youtube.script} heading={results.youtube.title} extra={results.youtube.thumbnailText ? <div className={styles.thumbText}>📸 썸네일: {results.youtube.thumbnailText}</div> : null} />
                                    )}
                                    {results.email && (
                                        <ResultCard icon="💌" title="이메일" content={results.email.content} heading={`제목: ${results.email.subject}`} />
                                    )}
                                    {results.ad && (
                                        <ResultCard icon="🎯" title="광고 카피" content={results.ad.headlines.map((h, i) => `헤드라인 ${i + 1}: ${h}`).join("\n") + "\n\n" + results.ad.descriptions.map((d, i) => `설명 ${i + 1}: ${d}`).join("\n")} />
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}

function ResultCard({ icon, title, content, heading, extra }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(heading ? `${heading}\n\n${content}` : content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.resultCard}>
            <div className={styles.resultCardHeader}>
                <span className={styles.resultIcon}>{icon}</span>
                <h3>{title}</h3>
                <button className={`btn btn-secondary ${styles.copyBtn}`} onClick={handleCopy}>
                    {copied ? "✅ 복사됨!" : "📋 복사"}
                </button>
            </div>
            {heading && <div className={styles.resultHeading}>{heading}</div>}
            <div className={styles.resultContent}>
                <pre>{content}</pre>
            </div>
            {extra}
        </div>
    );
}
