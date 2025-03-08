import { SmileIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";

interface EmojiPickerProps {
  onChange: (emoji: string) => void;
}

interface Emoji{
    native:string
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { theme } = useTheme();

  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <SmileIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <Picker
            emojiSize={18}
            data={data}
            maxFrequentRows={1}
            theme={theme === "dark" ? "dark" : "light"}
            onEmojiSelect={(emoji: Emoji) => onChange(emoji.native)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
