
"use client"

import { useToastChirho } from "@/hooks/use-toast"
import {
  Toast, // Assuming ShadCN component, not changing name
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast" // Assuming ShadCN component, not changing name

export function ToasterChirho() { // Renamed component
  const { toastsChirho, dismissChirho } = useToastChirho(); // Renamed hook and destructured items

  return (
    <ToastProvider>
      {toastsChirho.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
