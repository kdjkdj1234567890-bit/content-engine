"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./generate.module.css";

export default function GeneratePage() {
    // Shared Brain State
    const [brandVoice, setBrandVoice] = useState("");
    const [globalRules, setGlobalRules] = useState("");
    const [showBrain, setShowBrain] = useState(false);

    // Agent State
    const [selectedTeam, setSelectedTeam] = useState("content"); // 'content' or 'sales'

    // Content Generation State
    const [keyword, setKeyword] = useState("");
    const [contentType, setContentType] = useState("blog");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [usageCount, setUsageCount] = useState(0);

    // Team Definitions
    const TEAMS = {
        content: {
            name: "콘텐츠 미디어팀",
            desc: "블로그, SNS, 유튜브 등 유입과 인지도를 위한 콘텐츠",
            icon: "🎨",
            types: [
                { id: "blog", name: "📝 블로그 (SEO 최적화)" },
                { id: "instagram", name: "📷 인스타그램 캡션" },
                { id: "youtube", name: "🎥 유튜브 대본" },
            ]
        },
        sales: {
            name: "세일즈 전략팀",
            desc: "매출 전환, 광고, 이메일 등 직접적인 성과를 위한 콘텐츠",
            icon: "💰",
            types: [
                { id: "email", name: "💌 콜드 메일 / 뉴스레터" },
                { id: "ad", name: "🎯 페이스북/인스타 광고 카피" },
            ]
        }
    };

    useEffect(() => {
        // Check usage limit
        const today = new Date().toISOString().split("T")[0];
        const storedUsage = localStorage.getItem("usage_" + today);
        const count = storedUsage ? parseInt(storedUsage) : 0;
        setUsageCount(count);
    }, []);

    const handleGenerate = async () => {
        if (!keyword) {
            setError("키워드를 입력해주세요");
            return;
        }

        if (usageCount >= 3) {
            alert("오늘의 무료 사용량을 모두 소진했습니다. 무제한 생성을 위해 업그레이드하세요!");
            window.location.href = "/pricing";
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    keyword,
                    type: contentType,
                    details: {
                        brandVoice,  // Shared Brain
                        globalRules, // Shared Brain
                        team: selectedTeam // Agent Context
                    }
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "생성 실패");
            }

            setResult(data);

            // Increment usage count
            const today = new Date().toISOString().split("T")[0];
            const newCount = usageCount + 1;
            setUsageCount(newCount);
            localStorage.setItem("usage_" + today, newCount.toString());

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update content type when team changes to first available type
    useEffect(() => {
        const firstType = TEAMS[selectedTeam].types[0].id;
        setContentType(firstType);
    }, [selectedTeam]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Link href="/">⚡ ContentEngine</Link>
                </div>
                <div className={styles.usage}>
                    오늘 {3 - usageCount}회 남음
                    <Link href="/pricing" className={styles.upgradeBtn}>Pro 업그레이드</Link>
                </div>
            </header>

            <main className={styles.main}>
                <h1 className={styles.title}>AI 직원에게 업무 지시</h1>

                {/* Shared Brain Section */}
                <div className={styles.brainSection}>
                    <button
                        className={styles.brainToggle}
                        onClick={() => setShowBrain(!showBrain)}
                    >
                        🧠 <span style={{ fontWeight: "bold" }}>공유 두뇌 (Shared Brain)</span> 설정 {showBrain ? "▲" : "▼"}
                    </button>

                    {showBrain && (
                        <div className={styles.brainContent}>
                            <div className={styles.inputGroup}>
                                <label>브랜드 보이스 (말투/톤)</label>
                                <textarea
                                    placeholder="예: 전문적이지만 친근하게, 이모지 자주 사용, 20대 여성 타겟"
                                    value={brandVoice}
                                    onChange={(e) => setBrandVoice(e.target.value)}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>전사 공통 규칙 (금지어/필수 포함)</label>
                                <textarea
                                    placeholder="예: 과장된 표현 금지, 경쟁사 언급 절대 금지, '혁신적인' 단어 사용 금지"
                                    value={globalRules}
                                    onChange={(e) => setGlobalRules(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.grid}>
                    {/* Left: Input Panel */}
                    <div className={styles.panel}>
                        {/* Team Selection */}
                        <div className={styles.sectionTitle}>1. 담당 부서 선택</div>
                        <div className={styles.teamSelector}>
                            {Object.entries(TEAMS).map(([key, team]) => (
                                <div
                                    key={key}
                                    className={`${styles.teamCard} ${selectedTeam === key ? styles.selectedTeam : ""}`}
                                    onClick={() => setSelectedTeam(key)}
                                >
                                    <div className={styles.teamIcon}>{team.icon}</div>
                                    <div className={styles.teamInfo}>
                                        <div className={styles.teamName}>{team.name}</div>
                                        <div className={styles.teamDesc}>{team.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Content Type Selection (Dynamic based on team) */}
                        <div className={styles.sectionTitle} style={{ marginTop: "20px" }}>2. 작업 유형 선택</div>
                        <div className={styles.typeGrid}>
                            {TEAMS[selectedTeam].types.map((t) => (
                                <button
                                    key={t.id}
                                    className={`${styles.typeBtn} ${contentType === t.id ? styles.activeType : ""}`}
                                    onClick={() => setContentType(t.id)}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>

                        <div className={styles.sectionTitle} style={{ marginTop: "20px" }}>3. 주제 입력</div>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="어떤 주제로 콘텐츠를 만들까요? (예: 여름 다이어트 식단)"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                            />
                            <button
                                className={styles.generateBtn}
                                onClick={handleGenerate}
                                disabled={loading}
                            >
                                {loading ? "작업 중..." : "지시하기 ✨"}
                            </button>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                    </div>

                    {/* Right: Output Panel */}
                    <div className={styles.previewPanel}>
                        {!result ? (
                            <div className={styles.placeholder}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
                                <p>왼쪽에서 담당 부서와 주제를 선택하고<br />업무를 지시해주세요.</p>
                                <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "10px" }}>
                                    공유 두뇌 설정을 통해<br />우리 브랜드만의 톤앤매너를 학습시킬 수 있습니다.
                                </p>
                            </div>
                        ) : (
                            <div className={styles.resultContainer}>
                                <div className={styles.resultHeader}>
                                    <div className={styles.resultTitle}>
                                        {result.quality && <span className={styles.scoreBadge} style={{
                                            backgroundColor: result.quality.grade.color
                                        }}>{result.quality.grade.grade}등급</span>}
                                        <span>완료된 업무 보고</span>
                                    </div>
                                    <button
                                        className={styles.copyBtn}
                                        onClick={() => navigator.clipboard.writeText(result.content)}
                                    >
                                        📋 복사
                                    </button>
                                </div>

                                {/* Quality Score Analysis */}
                                {result.quality && (
                                    <div className={styles.qualityAnalysis}>
                                        <div className={styles.qualityRow}>
                                            <span className={styles.qualityLabel}>✅ 팩트체크</span>
                                            <span className={styles.qualityValue}>{result.factCheck?.trustScore}% 신뢰도</span>
                                        </div>
                                        <div className={styles.qualityRow}>
                                            <span className={styles.qualityLabel}>📊 성과예측</span>
                                            <span className={styles.qualityValue}>{result.performance?.totalScore}점 ({result.performance?.grade})</span>
                                        </div>
                                        <div className={styles.qualityRow}>
                                            <span className={styles.qualityLabel}>🔍 SEO</span>
                                            <span className={styles.qualityValue}>{result.seo?.score}점</span>
                                        </div>

                                        {/* Improvement Suggestions */}
                                        {result.quality.improvements && result.quality.improvements.length > 0 && (
                                            <div className={styles.improvements}>
                                                <div className={styles.impTitle}>💡 개선 제안</div>
                                                <ul>
                                                    {result.quality.improvements.slice(0, 3).map((imp, i) => (
                                                        <li key={i}>{imp}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={styles.contentBox}>
                                    <pre>{result.content}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
