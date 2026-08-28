export type SegmentType = 'prose' | 'heading' | 'equation' | 'code' | 'table' | 'figure';
export type ReviewStatus = 'needs-review' | 'approved' | 'revised';

export interface ReviewIssue {
  id: string;
  text: string;
  checked: boolean;
}

export interface GuideSegment {
  id: string;
  type: SegmentType;
  label: string;
  source: string;
  narration: string;
  suggestedNarration: string;
  issues: ReviewIssue[];
  status: ReviewStatus;
}

export interface SavedGuide {
  source: string;
  segments: GuideSegment[];
  savedAt: number;
}
