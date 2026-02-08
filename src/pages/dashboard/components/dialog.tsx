import { useState, type ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

interface DialogProps {
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  trigger?: ReactNode;
  children: ReactNode;
}

export default function Dialog({
  title = "",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onClose: controlledOnClose,
  trigger,
  children,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined && (controlledOnOpenChange !== undefined || controlledOnClose !== undefined);
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled
    ? (next: boolean) => { controlledOnOpenChange?.(next); if (!next) controlledOnClose?.(); }
    : setInternalOpen;

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger !== undefined ? (
        <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      ) : null}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/50" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-week-first bg-white p-0 shadow-xl dark:bg-gray-900 outline-none">
          {title ? (
            <div className="px-4 py-3 border-b border-week-first">
              <RadixDialog.Title className="text-lg font-semibold text-calendar-ring">
                {title}
              </RadixDialog.Title>
            </div>
          ) : (
            <RadixDialog.Title className="sr-only">Dialog</RadixDialog.Title>
          )}
          <div className="px-4 py-4">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
