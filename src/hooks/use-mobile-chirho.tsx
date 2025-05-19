
import * as React from "react"

const MOBILE_BREAKPOINT_CHIRHO = 768

export function useIsMobileChirho() {
  const [isMobileChirho, setIsMobileChirho] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mqlChirho = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_CHIRHO - 1}px)`)
    const onChangeChirho = () => {
      setIsMobileChirho(window.innerWidth < MOBILE_BREAKPOINT_CHIRHO)
    }
    mqlChirho.addEventListener("change", onChangeChirho)
    setIsMobileChirho(window.innerWidth < MOBILE_BREAKPOINT_CHIRHO)
    return () => mqlChirho.removeEventListener("change", onChangeChirho)
  }, [])

  return !!isMobileChirho
}
