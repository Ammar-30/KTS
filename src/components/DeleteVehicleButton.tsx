"use client";

interface DeleteVehicleButtonProps {
    vehicleId: string;
}

export default function DeleteVehicleButton({ vehicleId }: DeleteVehicleButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!confirm("Are you sure you want to remove this assignment?")) {
            e.preventDefault();
        }
    };

    return (
        <form action="/api/admin/remove-entitled-vehicle" method="post" style={{ display: "inline-block" }}>
            <input type="hidden" name="id" value={vehicleId} />
            <button
                type="submit"
                className="btn"
                style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    background: "var(--danger-bg)",
                    color: "var(--danger-text)",
                    border: "1px solid var(--danger-border)",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                }}
                onClick={handleClick}
            >
                Remove
            </button>
        </form>
    );
}


