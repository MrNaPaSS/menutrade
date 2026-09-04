import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Всплывающие уведомления.
 *
 * Сверху, а не снизу: внизу у нас всегда живёт главное действие экрана
 * («Следующий график», «Пройти тест»), и уведомление его закрывало.
 * Отступ считает системную строку и полосу кнопок Telegram, иначе
 * уведомление уезжает под «Закрыть».
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    position="top-center"
    offset="calc(env(safe-area-inset-top, 0px) + var(--tg-content-top, 0px) + 8px)"
    duration={2600}
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast !rounded-2xl !border-white/[0.08] !bg-[hsl(140_26%_9%)]/95 " +
          "!backdrop-blur-xl !text-foreground !shadow-[0_16px_40px_-16px_hsl(0_0%_0%/0.9)] " +
          "!text-[13.5px] !py-3",
        description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[12px]",
        actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        success: "group-[.toaster]:!text-foreground",
        error: "group-[.toaster]:!text-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster, toast };
