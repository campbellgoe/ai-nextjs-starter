import { Dices } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'


export function DiceButton(props: ButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Randomise"
      {...props}
    >
      <Dices className="h-4 w-4" />
    </Button>
  )
}
