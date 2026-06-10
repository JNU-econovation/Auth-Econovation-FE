import { useRef } from "react";
import { Banner, Button, IdChip, Modal, useToast } from "@auth-econovation/ui";
import useDeleteClientRedirectUri from "@/hooks/features/query/mutations/useDeleteClientRedirectUri";
import { resolveApiErrorMessage } from "@/lib/resolveApiError";

interface DeleteUriModalProps {
  clientId: string;
  /** 삭제 대상 redirect URI */
  uri: string;
  onClose: () => void;
  /** 삭제 성공 시 호출(부모가 모달 닫기·토스트 처리) */
  onDeleted: () => void;
}

/**
 * redirect URI 단건 삭제 확인 모달. 삭제는 즉시 로그인 차단으로 이어지므로 파괴적 동작으로 다룹니다.
 */
const DeleteUriModal = ({
  clientId,
  uri,
  onClose,
  onDeleted,
}: DeleteUriModalProps) => {
  const toast = useToast();
  const deleteUri = useDeleteClientRedirectUri();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = () => {
    deleteUri.mutate(
      { clientId, uri },
      {
        onSuccess: onDeleted,
        onError: (err) =>
          toast(
            "error",
            "URI를 삭제하지 못했습니다.",
            resolveApiErrorMessage(err),
          ),
      },
    );
  };

  return (
    <Modal
      title="redirect URI 삭제"
      onClose={onClose}
      busy={deleteUri.isPending}
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={deleteUri.isPending}
            ref={cancelRef}
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={confirm}
            loading={deleteUri.isPending}
          >
            URI 삭제
          </Button>
        </>
      }
    >
      <Banner kind="warning">
        삭제 즉시 이 URI로 향하는 로그인이 차단됩니다.
      </Banner>
      <IdChip value={uri} copy={false} />
    </Modal>
  );
};

export default DeleteUriModal;
