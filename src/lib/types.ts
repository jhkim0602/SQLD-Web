export type Subject = 1 | 2;
export type QuestionType = "mc" | "ox";
export type QuestionSource = "self" | "mit-ref";
export type Frequency = "high" | "medium" | "low";

export type Question = {
  id: string;
  subject: Subject;
  category: string;
  type: QuestionType;
  question: string;
  questionHtml?: string;
  codeBlock?: string;
  codeBlockHtml?: string;
  choices?: string[];
  answer: number | boolean;
  explanation: string;
  explanationHtml?: string;
  concepts: string[];
  tags: string[];
  source: QuestionSource;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  frequency?: Frequency;
  frequencyNote?: string;
};

export type QuestionMeta = Pick<
  Question,
  "id" | "subject" | "category" | "type" | "tags" | "difficulty" | "frequency"
> & {
  preview: string;
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  high: "빈출",
  medium: "보통",
  low: "드묾",
};

export type Concept = {
  slug: string;
  title: string;
  subject: Subject;
  category: string;
  order: number;
  description?: string;
  relatedQuestions: string[];
  body: string;
  bodyHtml?: string;
};

export type ConceptMeta = Omit<Concept, "body" | "bodyHtml">;

export type ArticleLevel = "beginner" | "intermediate" | "advanced";

export type Article = {
  slug: string;
  title: string;
  subtitle?: string;
  topic: string;
  level: ArticleLevel;
  readingMinutes: number;
  description?: string;
  relatedConcepts?: string[];
  relatedQuestions?: string[];
  body: string;
  bodyHtml?: string;
};

export type ArticleMeta = Omit<Article, "body" | "bodyHtml"> & {
  preview: string;
};

export const ARTICLE_LEVEL_LABELS: Record<ArticleLevel, string> = {
  beginner: "입문",
  intermediate: "중급",
  advanced: "심화",
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  1: "데이터 모델링의 이해",
  2: "SQL 기본 및 활용",
};

export const SUBJECT_QUESTION_COUNTS: Record<Subject, number> = {
  1: 10,
  2: 40,
};

export const SUBJECT_POINTS: Record<Subject, number> = {
  1: 20,
  2: 80,
};

export const SUBJECT_CATEGORIES: Record<Subject, string[]> = {
  1: ["엔터티", "속성", "관계", "식별자", "정규화", "트랜잭션", "모델링 종합"],
  2: [
    "SELECT/WHERE",
    "함수",
    "JOIN",
    "그룹함수",
    "서브쿼리",
    "집합연산",
    "계층/순환",
    "윈도우함수",
    "DDL/DML/DCL",
    "트랜잭션/PL-SQL",
  ],
};

export const TYPE_LABELS: Record<QuestionType, string> = {
  mc: "객관식",
  ox: "OX",
};
