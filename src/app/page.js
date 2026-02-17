"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [visibleSections, setVisibleSections] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const animClass = (id) => (visibleSections[id] ? styles.visible : "");

  return (
    <main className={styles.main}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className="gradient-text" style={{ fontWeight: 800, fontSize: "1.2rem" }}>
              ContentEngine
            </span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">기능</a>
            <Link href="/pricing">가격</Link>
            <a href="#comparison">비교</a>
            <Link href="/generate" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroOrb3} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <span className="badge">🔥 경쟁사 20가지 단점 전부 개선</span>
          </div>
          <h1 className={styles.heroTitle}>
            키워드 <span className="gradient-text">하나</span>로
            <br />
            일주일치 콘텐츠 완성
          </h1>
          <p className={styles.heroDesc}>
            블로그 · SNS · 광고 카피 · 이메일 뉴스레터까지.
            <br />
            AI가 <strong>팩트체크</strong>하고, <strong>톤 조절</strong>하고, <strong>성과 예측</strong>까지.
          </p>
          <div className={styles.heroCTA}>
            <Link href="/generate" className="btn btn-primary btn-large">
              ⚡ 30초 만에 체험하기
            </Link>
            <a href="#features" className="btn btn-secondary btn-large">
              기능 살펴보기 →
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>95%</span>
              <span className={styles.statLabel}>마진율</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>$29</span>
              <span className={styles.statLabel}>/월</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>30초</span>
              <span className={styles.statLabel}>생성 속도</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className={styles.demoSection}>
        <div className="container">
          <div className={styles.demoCard}>
            <div className={styles.demoHeader}>
              <div className={styles.demoDots}>
                <span style={{ background: "#ef4444" }} />
                <span style={{ background: "#f59e0b" }} />
                <span style={{ background: "#10b981" }} />
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>ContentEngine AI</span>
            </div>
            <div className={styles.demoBody}>
              <div className={styles.demoInput}>
                <span style={{ color: "var(--text-muted)" }}>키워드 입력 →</span>
                <span className={styles.demoTyping}>카페 창업 마케팅</span>
              </div>
              <div className={styles.demoOutputs}>
                {["📝 블로그 (SEO)", "📱 인스타그램", "📺 유튜브 대본", "💌 이메일", "🎯 광고 카피"].map(
                  (item, i) => (
                    <div key={i} className={styles.demoOutputItem} style={{ animationDelay: `${i * 0.15}s` }}>
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Killer Features */}
      <section id="features" className={styles.features} data-animate>
        <div className={`container ${animClass("features")}`}>
          <div className={styles.sectionHeader}>
            <span className="badge">🏆 경쟁사에 없는 기능</span>
            <h2 className={styles.sectionTitle}>
              대체불가능한 <span className="gradient-text">킬러 기능</span>
            </h2>
            <p className={styles.sectionDesc}>Jasper, Copy.ai, 뤼튼에서는 찾을 수 없는 혁신</p>
          </div>

          <div className={styles.featuresGrid}>
            {[
              {
                icon: "✅",
                title: "팩트체크 자동 검증",
                desc: "AI가 쓴 글의 사실 여부를 웹 검색으로 자동 교차 확인. 환각(hallucination) 걱정 끝.",
                tag: "경쟁사 無",
              },
              {
                icon: "🎚️",
                title: "감정 톤 슬라이더",
                desc: "전문적 ↔ 친근한 ↔ 유머러스. 슬라이더 하나로 글의 감정 톤을 실시간 조절.",
                tag: "경쟁사 無",
              },
              {
                icon: "👥",
                title: "페르소나별 N개 버전",
                desc: "같은 주제, 다른 고객층. 20대 여성/40대 직장인 등 타겟별로 자동 변환.",
                tag: "경쟁사 無",
              },
              {
                icon: "📊",
                title: "성과 예측 AI 점수",
                desc: "이 글이 얼마나 반응을 얻을지 발행 전에 미리 점수화. SEO 점수도 실시간 표시.",
                tag: "경쟁사 無",
              },
              {
                icon: "🔄",
                title: "3단계 자동 리뷰",
                desc: "생성 → 교정 → 톤 조정. 3단 리뷰를 거쳐 바로 발행 가능한 품질로 제공.",
                tag: "바로 발행",
              },
              {
                icon: "🎯",
                title: "가이드형 입력",
                desc: "프롬프트 작성법 몰라도 OK. 질문에 답하기만 하면 완벽한 콘텐츠 완성.",
                tag: "초보 친화",
              },
            ].map((f, i) => (
              <div key={i} className={`card ${styles.featureCard}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTag}>{f.tag}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparison" className={styles.comparison} data-animate>
        <div className={`container ${animClass("comparison")}`}>
          <div className={styles.sectionHeader}>
            <span className="badge">📊 비교 분석</span>
            <h2 className={styles.sectionTitle}>왜 ContentEngine인가?</h2>
          </div>
          <div className={styles.compTable}>
            <table>
              <thead>
                <tr>
                  <th>기능</th>
                  <th>Jasper ($49)</th>
                  <th>Copy.ai ($36)</th>
                  <th>뤼튼 (무료)</th>
                  <th className={styles.compHighlight}>ContentEngine ($29)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["팩트체크 자동 검증", "❌", "❌", "❌", "✅"],
                  ["감정 톤 슬라이더", "❌", "❌", "❌", "✅"],
                  ["성과 예측 점수", "❌", "❌", "❌", "✅"],
                  ["페르소나별 N버전", "❌", "❌", "❌", "✅"],
                  ["한국어 최적화", "△", "△", "✅", "✅"],
                  ["브랜드 보이스", "✅", "✅", "❌", "✅"],
                  ["SEO 통합", "✅", "△", "△", "✅"],
                  ["무료 플랜", "❌", "제한적", "✅", "✅"],
                  ["원클릭 해지", "❌", "❌", "N/A", "✅"],
                  ["가이드형 입력", "❌", "❌", "❌", "✅"],
                ].map(([feat, j, c, w, us], i) => (
                  <tr key={i}>
                    <td>{feat}</td>
                    <td>{j}</td>
                    <td>{c}</td>
                    <td>{w}</td>
                    <td className={styles.compHighlight}>{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.pricing} data-animate>
        <div className={`container ${animClass("pricing")}`}>
          <div className={styles.sectionHeader}>
            <span className="badge">💰 투명한 가격</span>
            <h2 className={styles.sectionTitle}>
              경쟁사 대비 <span className="gradient-text">50% 저렴</span>
            </h2>
            <p className={styles.sectionDesc}>숨겨진 비용 없음. 크레딧 제한 없음. 원클릭 해지.</p>
          </div>

          <div className={styles.pricingGrid}>
            {[
              {
                name: "Free",
                price: "$0",
                period: "영원히 무료",
                features: ["주 3회 생성", "기본 톤 설정", "블로그 + SNS", "SEO 점수 표시"],
                cta: "무료로 시작",
                popular: false,
              },
              {
                name: "Pro",
                price: "$29",
                period: "/월",
                features: [
                  "무제한 생성",
                  "팩트체크 검증",
                  "감정 톤 슬라이더",
                  "성과 예측 점수",
                  "페르소나 N버전",
                  "브랜드 보이스",
                  "모든 채널 지원",
                ],
                cta: "Pro 시작하기",
                popular: true,
              },
              {
                name: "Business",
                price: "$79",
                period: "/월",
                features: [
                  "Pro 전체 기능",
                  "팀 계정 (5명)",
                  "API 액세스",
                  "예약 발행",
                  "우선 고객 지원",
                  "커스텀 템플릿",
                  "분석 대시보드",
                ],
                cta: "Business 시작",
                popular: false,
              },
            ].map((plan, i) => (
              <div key={i} className={`${styles.pricingCard} ${plan.popular ? styles.pricingPopular : ""}`}>
                {plan.popular && <div className={styles.popularBadge}>MOST POPULAR</div>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.priceAmount}>{plan.price}</span>
                  <span className={styles.pricePeriod}>{plan.period}</span>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, j) => (
                    <li key={j}>
                      <span className={styles.checkIcon}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/generate"
                  className={`btn ${plan.popular ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "100%" }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.finalCTA}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className={styles.sectionTitle}>
            지금 <span className="gradient-text">30초</span>만에
            <br />
            첫 콘텐츠를 만들어보세요
          </h2>
          <p className={styles.sectionDesc} style={{ marginBottom: "var(--space-xl)" }}>
            회원가입 없이 바로 체험. 카드 정보 불필요.
          </p>
          <Link href="/generate" className="btn btn-primary btn-large">
            ⚡ 무료로 시작하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerLogo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className="gradient-text" style={{ fontWeight: 700 }}>ContentEngine</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            © 2026 ContentEngine. 대체불가능한 AI 콘텐츠 엔진.
          </p>
        </div>
      </footer>
    </main>
  );
}
