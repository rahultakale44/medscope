export default function Button({
  children,
  variant = "primary",
  size = "base",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== "base" ? `btn-${size}` : "";
  const classes = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}
