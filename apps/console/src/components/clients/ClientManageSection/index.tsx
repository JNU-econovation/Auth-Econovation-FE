import { useState, type FormEvent } from "react";
import {
  DefaultButton,
  Spacing,
  Text,
  TextFieldLayout,
} from "@auth-econovation/ui";
import useAdminClientQuery from "@/hooks/features/query/querys/useAdminClientQuery";
import usePostClientRedirectUri from "@/hooks/features/query/mutations/usePostClientRedirectUri";
import useDeleteClientRedirectUri from "@/hooks/features/query/mutations/useDeleteClientRedirectUri";
import { resolveApiErrorMessage } from "@/lib/resolveApiError";

/**
 * 클라이언트 관리 섹션.
 *
 * clientId로 클라이언트를 조회한 뒤 redirect URI를 추가/삭제합니다.
 * (목록 조회 엔드포인트는 백엔드 계약에 없어 단건 조회 기반으로 동작 — deployment 문서의 TBD 참고)
 */
const ClientManageSection = () => {
  const [inputId, setInputId] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [newUri, setNewUri] = useState("");
  const [addError, setAddError] = useState("");
  const [removeError, setRemoveError] = useState("");

  const query = useAdminClientQuery({
    clientId: lookupId,
    enabled: lookupId.length > 0,
  });
  const addUri = usePostClientRedirectUri();
  const removeUri = useDeleteClientRedirectUri();

  const handleLookup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddError("");
    setRemoveError("");
    setLookupId(inputId.trim());
  };

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddError("");
    if (newUri.trim() === "") {
      setAddError("추가할 redirect URI를 입력해주세요.");
      return;
    }
    addUri.mutate(
      { clientId: lookupId, uri: newUri.trim() },
      {
        onSuccess: () => setNewUri(""),
        onError: (err) => setAddError(resolveApiErrorMessage(err)),
      },
    );
  };

  const handleRemove = (uri: string) => {
    setRemoveError("");
    removeUri.mutate(
      { clientId: lookupId, uri },
      { onError: (err) => setRemoveError(resolveApiErrorMessage(err)) },
    );
  };

  const client = query.data;

  return (
    <section>
      <Text size="3">클라이언트 관리</Text>
      <Spacing size={16} />
      <form onSubmit={handleLookup}>
        <TextFieldLayout
          id="lookup-client-id"
          label="clientId로 조회"
          placeholder="a1b2c3d4-1234-5678-9abc-def012345678"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <Spacing size={12} />
        <DefaultButton type="submit" title="조회" />
      </form>

      {query.isError && lookupId.length > 0 && (
        <>
          <Spacing size={12} />
          <Text size="7" color="error">
            {resolveApiErrorMessage(query.error, "클라이언트를 찾을 수 없습니다.")}
          </Text>
        </>
      )}

      {client && (
        <>
          <Spacing size={24} />
          <Text size="5">{client.clientName}</Text>
          <Spacing size={4} />
          <Text size="8" color="gray1">
            {client.clientId}
          </Text>
          <Spacing size={16} />
          <Text size="6">redirect URIs</Text>
          <Spacing size={8} />
          <ul className="flex flex-col gap-2">
            {client.redirectUris.map((uri) => (
              <li
                key={uri}
                className="flex items-center justify-between gap-2 rounded-lg border border-input-border-gray bg-input-bg-gray px-3 py-2"
              >
                <Text size="7">{uri}</Text>
                <button
                  type="button"
                  onClick={() => handleRemove(uri)}
                  disabled={removeUri.isPending}
                  className="text-error text-sm font-medium disabled:opacity-50"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
          {removeError && (
            <>
              <Spacing size={8} />
              <Text size="7" color="error">
                {removeError}
              </Text>
            </>
          )}
          <Spacing size={16} />
          <form onSubmit={handleAdd}>
            <TextFieldLayout
              id="add-redirect-uri"
              label="redirect URI 추가"
              placeholder="https://app.econo.com/callback2"
              value={newUri}
              onChange={(e) => setNewUri(e.target.value)}
              helperText={addError || undefined}
              helperTextColor="error"
            />
            <Spacing size={12} />
            <DefaultButton
              type="submit"
              disabled={addUri.isPending}
              title={addUri.isPending ? "추가 중..." : "URI 추가"}
            />
          </form>
        </>
      )}
    </section>
  );
};

export default ClientManageSection;
