
import { useEffect } from "react";

export type MessageType = "success" | "error" | "warning" | "info";

interface MessageModalProps {
    isOpen: boolean;
    type: MessageType;
    message: string;
    title?: string;
    onClose: () => void;
}

const modalConfig: Record<
    MessageType,
    { title: string; icon: string; color: string; background: string }
> = {
    success: {
        title: "Success",
        icon: "✓",
        color: "text-green-600",
        background: "bg-green-50",
    },
    error: {
        title: "Error",
        icon: "✕",
        color: "text-red-600",
        background: "bg-red-50",
    },
    warning: {
        title: "Warning",
        icon: "!",
        color: "text-amber-600",
        background: "bg-amber-50",
    },
    info: {
        title: "Information",
        icon: "i",
        color: "text-blue-600",
        background: "bg-blue-50",
    },
};

function MessageModal({
    isOpen,
    type,
    message,
    title,
    onClose,
}: MessageModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const config = modalConfig[type];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="message-modal-title"
                aria-describedby="message-modal-description"
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-7 py-8 shadow-2xl"
            >
                <div className="flex flex-col items-center text-center">
                    <span
                        aria-hidden="true"
                        className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl font-semibold ${config.color} ${config.background}`}
                    >
                        {config.icon}
                    </span>

                    <h2
                        id="message-modal-title"
                        className="mt-4 text-xl font-semibold tracking-tight text-slate-800"
                    >
                        {title || config.title}
                    </h2>
                </div>

                <p
                    id="message-modal-description"
                    className="mt-5 text-center font-sans text-[15px] font-medium leading-7 tracking-[0.01em] text-slate-800"
                >
                    {message}
                </p>

                <div className="mt-7 flex justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        autoFocus
                        className="min-w-24 rounded-md bg-[#1D0200] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#350600] focus:outline-none focus:ring-2 focus:ring-[#1D0200] focus:ring-offset-2"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MessageModal;
