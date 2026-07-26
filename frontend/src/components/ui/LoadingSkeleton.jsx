export default function LoadingSkeleton({ type = "text", width, height, className = "" }) {
  const typeClass = type === "card" ? "skeleton-card" : type === "title" ? "skeleton-title" : "skeleton-text";
  
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return <div className={`skeleton ${typeClass} ${className}`} style={style} />;
}
