import { describe, it, expect } from "vitest"
import { fillTemplateSlots } from "./fill-template-slots"

describe("fillTemplateSlots", () => {
  const canvasJson = JSON.stringify({
    version: "6.0.0",
    objects: [
      { type: "Rect", id: "bg", left: 0, top: 0, width: 1920, height: 1080, fill: "#000" },
      { type: "Textbox", id: "title", left: 80, top: 100, text: "{{title}}", fontSize: 40 },
      { type: "Textbox", id: "body", left: 80, top: 200, text: "{{body}}", fontSize: 28 },
    ],
  })

  const slotsJson = JSON.stringify([
    { name: "title", layer_id: "title", type: "text" },
    { name: "body", layer_id: "body", type: "text" },
  ])

  it("replaces slot text with provided values", () => {
    const result = fillTemplateSlots(canvasJson, slotsJson, {
      title: "Hello World",
      body: "This is the body text",
    })
    const parsed = JSON.parse(result)
    expect(parsed.objects[1].text).toBe("Hello World")
    expect(parsed.objects[2].text).toBe("This is the body text")
  })

  it("leaves unfilled slots unchanged", () => {
    const result = fillTemplateSlots(canvasJson, slotsJson, {
      title: "Only Title",
    })
    const parsed = JSON.parse(result)
    expect(parsed.objects[1].text).toBe("Only Title")
    expect(parsed.objects[2].text).toBe("{{body}}")
  })

  it("returns unchanged canvas if slotsJson is null", () => {
    const result = fillTemplateSlots(canvasJson, null, { title: "Ignored" })
    expect(result).toBe(canvasJson)
  })
})
