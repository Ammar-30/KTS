"use client";

interface SkeletonLoaderProps {
    width?: string | number;
    height?: string | number;
    className?: string;
    rounded?: boolean;
    count?: number;
}

export default function SkeletonLoader({
    width = "100%",
    height = "20px",
    className = "",
    rounded = false,
    count = 1,
}: SkeletonLoaderProps) {
    const skeletonStyle: React.CSSProperties = {
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: rounded ? "var(--radius-full)" : "var(--radius-sm)",
    };

    if (count > 1) {
        return (
            <div className={className}>
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className="skeleton"
                        style={{
                            ...skeletonStyle,
                            marginBottom: i < count - 1 ? "8px" : 0,
                        }}
                    />
                ))}
            </div>
        );
    }

    return <div className={`skeleton ${className}`} style={skeletonStyle} />;
}




