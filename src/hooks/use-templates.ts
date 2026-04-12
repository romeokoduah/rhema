import { useCallback, useEffect, useRef } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useTemplateStore } from "@/stores/template-store"
import type { Template, Backdrop, NewTemplate, NewBackdrop } from "@/types/template"

export function useTemplates() {
  const store = useTemplateStore()
  const seeded = useRef(false)

  const refreshTemplates = useCallback(async () => {
    const templates = (await invoke("list_templates")) as Template[]
    store.setTemplates(templates)
    return templates
  }, [store])

  const refreshBackdrops = useCallback(async () => {
    const backdrops = (await invoke("list_backdrops")) as Backdrop[]
    store.setBackdrops(backdrops)
    return backdrops
  }, [store])

  const refresh = useCallback(async () => {
    await Promise.all([refreshTemplates(), refreshBackdrops()])
  }, [refreshTemplates, refreshBackdrops])

  useEffect(() => {
    const init = async () => {
      const templates = await refreshTemplates()
      await refreshBackdrops()

      if (templates.length === 0 && !seeded.current) {
        seeded.current = true
        const { BUILTIN_TEMPLATES } = await import("@/lib/builtin-templates")
        for (const tpl of BUILTIN_TEMPLATES) {
          await invoke("create_template", { template: tpl })
        }
        await refreshTemplates()
      }
    }
    init().catch(console.error)
  }, [refreshTemplates, refreshBackdrops])

  const getTemplate = useCallback(async (id: number) => {
    return (await invoke("get_template", { id })) as Template
  }, [])

  const createTemplate = useCallback(async (template: NewTemplate) => {
    const id = (await invoke("create_template", { template })) as number
    await refreshTemplates()
    return id
  }, [refreshTemplates])

  const updateTemplate = useCallback(async (id: number, template: NewTemplate) => {
    await invoke("update_template", { id, template })
    await refreshTemplates()
  }, [refreshTemplates])

  const removeTemplate = useCallback(async (id: number) => {
    await invoke("delete_template", { id })
    await refreshTemplates()
  }, [refreshTemplates])

  const createBackdrop = useCallback(async (backdrop: NewBackdrop) => {
    const id = (await invoke("create_backdrop", { backdrop })) as number
    await refreshBackdrops()
    return id
  }, [refreshBackdrops])

  const removeBackdrop = useCallback(async (id: number) => {
    await invoke("delete_backdrop", { id })
    await refreshBackdrops()
  }, [refreshBackdrops])

  return {
    ...store,
    refresh,
    getTemplate,
    createTemplate,
    updateTemplate,
    removeTemplate,
    createBackdrop,
    removeBackdrop,
  }
}
