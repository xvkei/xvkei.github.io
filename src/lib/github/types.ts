/** Normalised public repository — the only shape UI components see. */
export type Repo = {
  id: number;
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  /** GitHub's updated_at — last update, NOT the creation date. */
  updatedAt: string | null;
  isFork: boolean;
  isArchived: boolean;
};

export type GitHubErrorKind = 'config' | 'not-found' | 'rate-limit' | 'network' | 'http' | 'parse';

export class GitHubError extends Error {
  readonly kind: GitHubErrorKind;
  readonly resetAt: Date | null;

  constructor(kind: GitHubErrorKind, message: string, resetAt: Date | null = null) {
    super(message);
    this.name = 'GitHubError';
    this.kind = kind;
    this.resetAt = resetAt;
  }
}