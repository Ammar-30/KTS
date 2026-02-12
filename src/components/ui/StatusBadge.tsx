type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

type TripStatus = 'Requested' | 'ManagerApproved' | 'AdminApproved' | 'Assigned' | 'Completed' | 'Cancelled';
type MaintenanceStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
type TadaStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type VehicleCategory = 'FLEET' | 'PERSONAL' | 'ENTITLED';
type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'TRANSPORT';

interface StatusBadgeProps {
    status: TripStatus | MaintenanceStatus | TadaStatus | VehicleCategory | UserRole | string;
    type?: 'trip' | 'maintenance' | 'tada' | 'vehicle' | 'role';
    className?: string;
}

const getVariant = (status: string, type?: string): BadgeVariant => {
    // Trip statuses
    if (type === 'trip') {
        if (status.includes('Approved') || status === 'Assigned' || status === 'Completed') return 'success';
        if (status === 'Requested') return 'warning';
        if (status === 'Cancelled') return 'danger';
    }

    // Maintenance statuses
    if (type === 'maintenance') {
        if (status === 'COMPLETED') return 'success';
        if (status === 'IN_PROGRESS') return 'info';
        if (status === 'APPROVED') return 'success';
        if (status === 'PENDING') return 'warning';
        if (status === 'REJECTED') return 'danger';
    }

    // TADA statuses
    if (type === 'tada') {
        if (status === 'APPROVED') return 'success';
        if (status === 'PENDING') return 'warning';
        if (status === 'REJECTED') return 'danger';
    }

    // Vehicle categories
    if (type === 'vehicle') {
        if (status === 'FLEET') return 'info';
        if (status === 'PERSONAL') return 'warning';
        if (status === 'ENTITLED') return 'success';
    }

    // User roles
    if (type === 'role') {
        if (status === 'ADMIN') return 'danger';
        if (status === 'MANAGER') return 'info';
        if (status === 'EMPLOYEE') return 'success';
        if (status === 'TRANSPORT') return 'warning';
    }

    // Default fallback
    return 'default';
};

const formatStatus = (status: string): string => {
    // Convert snake_case or SCREAMING_SNAKE_CASE to Title Case
    return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function StatusBadge({ status, type, className = '' }: StatusBadgeProps) {
    const variant = getVariant(status, type);
    const displayText = formatStatus(status);

    const variantClass = variant === 'default' ? 'badge' : `badge badge-${variant}`;

    return (
        <span className={`${variantClass} ${className}`.trim()}>
            {displayText}
        </span>
    );
}
