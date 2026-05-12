import './Skeleton.css';

interface SkeletonProps {
  count?: number;
}

/* Random widths cho title/sub để tránh lặp lại đều */
const TITLE_WIDTHS = ['65%', '75%', '55%', '80%', '60%', '70%', '50%', '72%'];
const SUB_WIDTHS = ['40%', '35%', '45%', '30%', '38%', '42%', '33%', '48%'];

export function Skeleton({ count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card" style={{ animationDelay: `${idx * 80}ms` }}>
          <div className="skeleton-card-header">
            <div className="skeleton-avatar" />
          </div>
          <div className="skeleton-card-body">
            <div
              className="skeleton-line title"
              style={{ width: TITLE_WIDTHS[idx % TITLE_WIDTHS.length] }}
            />
            <div
              className="skeleton-line sub"
              style={{ width: SUB_WIDTHS[idx % SUB_WIDTHS.length] }}
            />
          </div>
          <div className="skeleton-card-footer">
            <div className="skeleton-line short" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </>
  );
}
