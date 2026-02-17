import "./globals.css";

export const metadata = {
  title: "ContentEngine AI — 키워드 하나로 일주일치 콘텐츠를 만드는 AI 엔진",
  description: "블로그, SNS, 광고 카피, 이메일 뉴스레터까지. 키워드 하나 입력하면 AI가 완벽한 콘텐츠 패키지를 자동 생성합니다. 팩트체크 검증, 감정 톤 조절, 성과 예측까지.",
  keywords: "AI 콘텐츠, 자동 글쓰기, AI 카피라이터, 블로그 자동 생성, SNS 콘텐츠, 마케팅 자동화",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
