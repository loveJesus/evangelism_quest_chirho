
"use client"

import { useToastChirho } from "@/hooks/use-toast-chirho" // Updated import
import {
  Toast, 
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast" 

export function ToasterChirho() { 
  const { toastsChirho, dismissChirho } = useToastChirho(); 

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
