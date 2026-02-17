"use client";
import Link from "next/link";
import styles from "./pricing.module.css";

const PLANS = [
    {
        id: "free",
        icon: "🎁",
        name: "무료 체험",
        desc: "AI 콘텐츠의 힘을 직접 경험하세요",
        price: "0",
        period: "",
        popular: false,
        btnText: "무료로 시작하기",
        btnStyle: "btnSecondary",
        link: "/generate",
        features: [
            { text: "하루 3회 콘텐츠 생성", included: true },
            { text: "블로그/SNS/광고 5가지 타입", included: true },
            { text: "기본 SEO 점수", included: true },
            { text: "기본 팩트체크", included: true },
            { text: "성과 예측 (S~D 등급)", included: true },
            { text: "무제한 생성", included: false },
            { text: "상세 분석 리포트", included: false },
            { text: "API 접근", included: false },
        ],
    },
    {
        id: "pro",
        icon: "⚡",
        name: "Pro",
        desc: "마케터 & 프리랜서를 위한 무제한 플랜",
        price: "29,900",
        period: "/월",
        popular: true,
        btnText: "Pro 시작하기",
        btnStyle: "btnPrimary",
        link: "https://buy.stripe.com/test_eVqdR846R3FB82n8Oa9Zm00",
        features: [
            { text: "무제한 콘텐츠 생성", included: true },
            { text: "블로그/SNS/광고 5가지 타입", included: true },
            { text: "상세 SEO 분석 (10가지 기준)", included: true },
            { text: "실시간 팩트체크 (9가지 기준)", included: true },
            { text: "성과 예측 + 개선 팁", included: true },
            { text: "톤 커스터마이징 5가지", included: true },
            { text: "콘텐츠 히스토리 저장", included: true },
            { text: "API 접근", included: false },
        ],
    },
    {
        id: "business",
        icon: "🏢",
        name: "Business",
        desc: "에이전시 & 팀을 위한 프리미엄",
        price: "79,900",
        period: "/월",
        popular: false,
        btnText: "문의하기",
        btnStyle: "btnSecondary",
        link: "https://buy.stripe.com/test_4gMdR8avf2Bxaav6G29Zm01",
        features: [
            { text: "Pro의 모든 기능", included: true },
            { text: "API 접근 (자동화)", included: true },
            { text: "팀 멤버 5명", included: true },
            { text: "브랜드 보이스 설정", included: true },
            { text: "우선 고객 지원", included: true },
            { text: "대량 생성 (벌크)", included: true },
            { text: "커스텀 템플릿", included: true },
            { text: "전담 매니저", included: true },
        ],
    },
];

export default function PricingPage() {
    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>← 홈으로</Link>
                <div className={styles.headerLogo}>
                    <span>⚡</span>
                    <span className="gradient-text" style={{ fontWeight: 800 }}>ContentEngine</span>
                </div>
                <Link href="/generate" className="btn btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                    무료 체험 →
                </Link>
            </header>

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroBg}>
                    <div className={styles.heroOrb1} />
                    <div className={styles.heroOrb2} />
                </div>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        경쟁사의 <span className="gradient-text">1/3 가격</span>으로<br />
                        더 강력한 AI 콘텐츠
                    </h1>
                    <p className={styles.heroDesc}>
                        Jasper ($49~99/월), Copy.ai ($49~249/월) 대비<br />
                        <strong>한국어 전용 + 실시간 분석</strong>까지 포함
                    </p>
                    <div className={styles.heroStat}>
                        📊 AI 콘텐츠 마케팅 평균 ROI: 740%
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className={styles.pricingSection}>
                <div className={styles.pricingGrid}>
                    {PLANS.map((plan) => (
                        <div key={plan.id} className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ""}`}>
                            {plan.popular && <div className={styles.popularBadge}>🔥 가장 인기</div>}
                            <div className={styles.planIcon}>{plan.icon}</div>
                            <div className={styles.planName}>{plan.name}</div>
                            <div className={styles.planDesc}>{plan.desc}</div>
                            <div className={styles.priceRow}>
                                {plan.price === "0" ? (
                                    <span className={styles.priceAmount}>무료</span>
                                ) : (
                                    <>
                                        <span className={styles.priceCurrency}>₩</span>
                                        <span className={styles.priceAmount}>{plan.price}</span>
                                        <span className={styles.pricePeriod}>{plan.period}</span>
                                    </>
                                )}
                            </div>
                            <ul className={styles.planFeatures}>
                                {plan.features.map((f, i) => (
                                    <li key={i}>
                                        <span className={f.included ? styles.featureCheck : styles.featureLock}>
                                            {f.included ? "✓" : "—"}
                                        </span>
                                        {f.text}
                                    </li>
                                ))}
                            </ul>
                            <Link href={plan.link} className={`${styles.planBtn} ${styles[plan.btnStyle]}`}>
                                {plan.btnText}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Us — Research-backed */}
            <section className={styles.whySection}>
                <h2 className={styles.whyTitle}>
                    왜 <span className="gradient-text">ContentEngine</span>인가?
                </h2>
                <div className={styles.whyGrid}>
                    <div className={styles.whyCard}>
                        <div className={styles.whyIcon}>🎯</div>
                        <div className={styles.whyLabel}>AI 환각 방지</div>
                        <div className={styles.whyDesc}>
                            최신 LLM도 <span className={styles.whyStat}>27~40%</span> 환각 발생.
                            우리의 7가지 팩트체크가 자동으로 걸러냅니다.
                        </div>
                    </div>
                    <div className={styles.whyCard}>
                        <div className={styles.whyIcon}>🇰🇷</div>
                        <div className={styles.whyLabel}>한국어 전용 엔진</div>
                        <div className={styles.whyDesc}>
                            한국어 교착어 형태론, 조사 처리, CJK 자동 정리.
                            <span className={styles.whyStat}> 60+</span> 단어 자동 번역 사전 내장.
                        </div>
                    </div>
                    <div className={styles.whyCard}>
                        <div className={styles.whyIcon}>📈</div>
                        <div className={styles.whyLabel}>검증된 ROI</div>
                        <div className={styles.whyDesc}>
                            AI 콘텐츠 마케팅 평균 <span className={styles.whyStat}>ROI 740%</span>,
                            상위 기업은 1,670% 달성. 전환율 127% 향상 사례.
                        </div>
                    </div>
                    <div className={styles.whyCard}>
                        <div className={styles.whyIcon}>⏱️</div>
                        <div className={styles.whyLabel}>시간 절약</div>
                        <div className={styles.whyDesc}>
                            마케터 평균 <span className={styles.whyStat}>하루 2.5시간</span> 절약.
                            콘텐츠당 비용 <span className={styles.whyStat}>4.7배</span> 저렴.
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className={styles.compSection}>
                <h2 className={styles.compTitle}>경쟁사 비교</h2>
                <table className={styles.compTable}>
                    <thead>
                        <tr>
                            <th>기능</th>
                            <th className={styles.compHighlight}>ContentEngine</th>
                            <th>Jasper AI</th>
                            <th>Copy.ai</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>월 가격</td>
                            <td className={styles.compHighlight}>₩29,900</td>
                            <td>$49~99 (6~13만원)</td>
                            <td>$49~249 (6~33만원)</td>
                        </tr>
                        <tr>
                            <td>한국어 최적화</td>
                            <td className={styles.compHighlight}>✅ 전용 엔진</td>
                            <td>⚠️ 25개 언어 중 하나</td>
                            <td>⚠️ 95개 언어 중 하나</td>
                        </tr>
                        <tr>
                            <td>실시간 SEO 분석</td>
                            <td className={styles.compHighlight}>✅ 8가지 기준</td>
                            <td>⚠️ 별도 도구 필요</td>
                            <td>❌ 없음</td>
                        </tr>
                        <tr>
                            <td>팩트체크</td>
                            <td className={styles.compHighlight}>✅ 7가지 자동 검증</td>
                            <td>❌ 수동 확인</td>
                            <td>❌ 수동 확인</td>
                        </tr>
                        <tr>
                            <td>성과 예측</td>
                            <td className={styles.compHighlight}>✅ S~D 등급</td>
                            <td>❌ 없음</td>
                            <td>❌ 없음</td>
                        </tr>
                        <tr>
                            <td>콘텐츠 타입</td>
                            <td className={styles.compHighlight}>5가지</td>
                            <td>50+ 템플릿</td>
                            <td>90+ 템플릿</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ROI Section */}
            <section className={styles.roiSection}>
                <h2 className={styles.roiTitle}>
                    💰 <span className="gradient-text">투자 대비 수익</span>
                </h2>
                <p className={styles.roiDesc}>
                    AI 콘텐츠 마케팅에 $1 투자하면 평균 $5.20 수익.<br />
                    ContentEngine Pro(₩29,900/월)로 매월 무제한 콘텐츠 생성.
                </p>
                <div className={styles.roiStats}>
                    <div className={styles.roiStatCard}>
                        <div className={styles.roiNum}>740%</div>
                        <div className={styles.roiLabel}>평균 ROI</div>
                    </div>
                    <div className={styles.roiStatCard}>
                        <div className={styles.roiNum}>127%</div>
                        <div className={styles.roiLabel}>전환율 향상</div>
                    </div>
                    <div className={styles.roiStatCard}>
                        <div className={styles.roiNum}>2.5h</div>
                        <div className={styles.roiLabel}>일일 절약</div>
                    </div>
                    <div className={styles.roiStatCard}>
                        <div className={styles.roiNum}>4.7x</div>
                        <div className={styles.roiLabel}>비용 절감</div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className={styles.ctaSection}>
                <h2 className={styles.ctaTitle}>지금 시작하세요</h2>
                <p className={styles.ctaDesc}>
                    무료로 3회 체험하고, 마음에 들면 Pro로 업그레이드
                </p>
                <Link href="/generate" className={styles.ctaBtn}>
                    ⚡ 무료로 콘텐츠 만들기
                </Link>
            </section>
        </div>
    );
}
