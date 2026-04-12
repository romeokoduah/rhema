import { useState } from "react"
import { BellIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAlertStore } from "@/stores/alert-store"

export function AlertSendButton() {
  const [open, setOpen] = useState(false)
  const [icon, setIcon] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [timeout, setTimeout_] = useState("10")

  const handleSend = () => {
    if (!title.trim()) return
    useAlertStore.getState().sendAlert({
      templateId: null,
      icon: icon || "🔔",
      title: title.trim(),
      body: body.trim(),
      timeoutSeconds: Math.max(1, parseInt(timeout) || 10),
    })
    setTitle("")
    setBody("")
    setIcon("")
    setTimeout_("10")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Send Alert">
          <BellIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Send Alert</div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="w-16">
                <Label className="text-xs text-muted-foreground">Icon</Label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🔔"
                  className="h-8 text-center text-sm"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Alert title"
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Body</Label>
              <Input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Optional message..."
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="w-20">
                <Label className="text-xs text-muted-foreground">Timeout (s)</Label>
                <Input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout_(e.target.value)}
                  min={1}
                  max={300}
                  className="h-8 text-sm"
                />
              </div>
              <Button size="sm" className="ml-auto h-8" onClick={handleSend}>
                Send Alert
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
