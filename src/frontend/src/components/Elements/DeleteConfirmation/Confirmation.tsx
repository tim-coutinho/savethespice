import { Button, Group, Modal, Text } from "@mantine/core";
import { cloneElement, MouseEvent, ReactElement, useEffect, useState } from "react";

interface ConfirmationProps {
  title: string;
  message?: string;
  active: boolean;
  triggerButton: ReactElement;
  confirmButton: ReactElement;
}

export function Confirmation({
  title,
  message,
  triggerButton,
  confirmButton,
  active,
}: ConfirmationProps): ReactElement {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    !active && setVisible(false);
  }, [active]);

  return (
    <>
      {cloneElement(triggerButton, {
        onClick: (e: MouseEvent) => {
          e.stopPropagation();
          setVisible(true);
        },
      })}
      <Modal title={title} opened={visible} onClose={() => setVisible(false)}>
        {message && <Text size="sm">{message}</Text>}
        <Group position="right" mt="md">
          <Button
            variant="default"
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setVisible(false);
            }}
          >
            Cancel
          </Button>
          {confirmButton}
        </Group>
      </Modal>
    </>
  );
}
