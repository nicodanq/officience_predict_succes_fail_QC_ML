import { toast as sonnerToast } from "sonner"

type ToastOptions = {
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    switch (variant) {
      case "success":
        sonnerToast.success(title ?? description ?? "")
        break
      case "error":
        sonnerToast.error(title ?? description ?? "")
        break
      case "warning":
        sonnerToast.warning(title ?? description ?? "")
        break
      default:
        sonnerToast(title ?? description ?? "")
        break
    }
  }

  return { toast }
}
