
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast" 

const TOAST_LIMIT_CHIRHO = 1
const TOAST_REMOVE_DELAY_CHIRHO = 1000000

type ToasterToastChirho = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypesChirho = {
  ADD_TOAST: "ADD_TOAST_CHIRHO",
  UPDATE_TOAST: "UPDATE_TOAST_CHIRHO",
  DISMISS_TOAST: "DISMISS_TOAST_CHIRHO",
  REMOVE_TOAST: "REMOVE_TOAST_CHIRHO",
} as const

let countChirho = 0

function genIdChirho() {
  countChirho = (countChirho + 1) % Number.MAX_SAFE_INTEGER
  return countChirho.toString()
}

type ActionTypeChirho = typeof actionTypesChirho

type ActionChirho =
  | {
      type: ActionTypeChirho["ADD_TOAST"]
      toastChirho: ToasterToastChirho
    }
  | {
      type: ActionTypeChirho["UPDATE_TOAST"]
      toastChirho: Partial<ToasterToastChirho>
    }
  | {
      type: ActionTypeChirho["DISMISS_TOAST"]
      toastIdChirho?: ToasterToastChirho["id"]
    }
  | {
      type: ActionTypeChirho["REMOVE_TOAST"]
      toastIdChirho?: ToasterToastChirho["id"]
    }

interface StateChirho {
  toastsChirho: ToasterToastChirho[]
}

const toastTimeoutsChirho = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueueChirho = (toastIdChirho: string) => {
  if (toastTimeoutsChirho.has(toastIdChirho)) {
    return
  }

  const timeoutChirho = setTimeout(() => {
    toastTimeoutsChirho.delete(toastIdChirho)
    dispatchChirho({
      type: "REMOVE_TOAST_CHIRHO",
      toastIdChirho: toastIdChirho,
    })
  }, TOAST_REMOVE_DELAY_CHIRHO)

  toastTimeoutsChirho.set(toastIdChirho, timeoutChirho)
}

export const reducerChirho = (stateChirho: StateChirho, actionChirho: ActionChirho): StateChirho => {
  switch (actionChirho.type) {
    case "ADD_TOAST_CHIRHO":
      return {
        ...stateChirho,
        toastsChirho: [actionChirho.toastChirho, ...stateChirho.toastsChirho].slice(0, TOAST_LIMIT_CHIRHO),
      }

    case "UPDATE_TOAST_CHIRHO":
      return {
        ...stateChirho,
        toastsChirho: stateChirho.toastsChirho.map((tChirho) =>
          tChirho.id === actionChirho.toastChirho.id ? { ...tChirho, ...actionChirho.toastChirho } : tChirho
        ),
      }

    case "DISMISS_TOAST_CHIRHO": {
      const { toastIdChirho } = actionChirho

      if (toastIdChirho) {
        addToRemoveQueueChirho(toastIdChirho)
      } else {
        stateChirho.toastsChirho.forEach((toastChirho) => {
          addToRemoveQueueChirho(toastChirho.id)
        })
      }

      return {
        ...stateChirho,
        toastsChirho: stateChirho.toastsChirho.map((tChirho) =>
          tChirho.id === toastIdChirho || toastIdChirho === undefined
            ? {
                ...tChirho,
                open: false,
              }
            : tChirho
        ),
      }
    }
    case "REMOVE_TOAST_CHIRHO":
      if (actionChirho.toastIdChirho === undefined) {
        return {
          ...stateChirho,
          toastsChirho: [],
        }
      }
      return {
        ...stateChirho,
        toastsChirho: stateChirho.toastsChirho.filter((tChirho) => tChirho.id !== actionChirho.toastIdChirho),
      }
  }
}

const listenersChirho: Array<(stateChirho: StateChirho) => void> = []

let memoryStateChirho: StateChirho = { toastsChirho: [] }

function dispatchChirho(actionChirho: ActionChirho) {
  memoryStateChirho = reducerChirho(memoryStateChirho, actionChirho)
  listenersChirho.forEach((listenerChirho) => {
    listenerChirho(memoryStateChirho)
  })
}

type ToastTypeChirho = Omit<ToasterToastChirho, "id">;

function toastChirho({ ...props }: ToastTypeChirho) {
  const idChirho = genIdChirho()

  const updateChirho = (propsChirho: ToasterToastChirho) =>
    dispatchChirho({
      type: "UPDATE_TOAST_CHIRHO",
      toastChirho: { ...propsChirho, id: idChirho },
    })
  const dismissChirho = () => dispatchChirho({ type: "DISMISS_TOAST_CHIRHO", toastIdChirho: idChirho })

  dispatchChirho({
    type: "ADD_TOAST_CHIRHO",
    toastChirho: {
      ...props,
      id: idChirho,
      open: true,
      onOpenChange: (openChirho) => {
        if (!openChirho) dismissChirho()
      },
    },
  })

  return {
    idChirho: idChirho,
    dismissChirho,
    updateChirho,
  }
}

function useToastChirho() {
  const [stateChirho, setStateChirho] = React.useState<StateChirho>(memoryStateChirho)

  React.useEffect(() => {
    listenersChirho.push(setStateChirho)
    return () => {
      const indexChirho = listenersChirho.indexOf(setStateChirho)
      if (indexChirho > -1) {
        listenersChirho.splice(indexChirho, 1)
      }
    }
  }, [stateChirho])

  return {
    ...stateChirho,
    toastChirho,
    dismissChirho: (toastIdChirho?: string) => dispatchChirho({ type: "DISMISS_TOAST_CHIRHO", toastIdChirho }),
  }
}

export { useToastChirho, toastChirho }
