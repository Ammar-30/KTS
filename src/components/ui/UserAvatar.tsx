"use client";

interface UserAvatarProps {
    name: string;
    size?: number;
}

export default function UserAvatar({ name, size = 40 }: UserAvatarProps) {
    // Extract initials from name (e.g., "Ali Hassan" -> "AH", "Muhammad Babar" -> "MB")
    const getInitials = (fullName: string): string => {
        const names = fullName.trim().split(/\s+/);
        if (names.length === 1) {
            // Single name: take first 2 letters
            return names[0].substring(0, 2).toUpperCase();
        }
        // Multiple names: take first letter of first and last name
        const firstInitial = names[0].charAt(0).toUpperCase();
        const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
        return firstInitial + lastInitial;
    };

    // Generate consistent color based on name
    const getColorFromName = (fullName: string): string => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Teal
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Light
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Rose
        ];

        // Use name's char codes to pick a color
        const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const initials = getInitials(name);
    const background = getColorFromName(name);

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: size * 0.4,
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                flexShrink: 0,
            }}
            title={name}
        >
            {initials}
        </div>
    );
}
