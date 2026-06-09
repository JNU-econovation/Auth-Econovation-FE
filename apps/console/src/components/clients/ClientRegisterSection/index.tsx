import { useState, type FormEvent } from "react";
import {
  DefaultButton,
  Spacing,
  Text,
  TextFieldLayout,
} from "@auth-econovation/ui";
import usePostClient from "@/hooks/features/query/mutations/usePostClient";
import { resolveApiErrorMessage } from "@/lib/resolveApiError";

/**
 * OAuth 클라이언트 등록 섹션.
 *
 * 클라이언트 이름 + 최초 redirect URI 1건으로 등록하고, 성공 시 발급된 clientId를 표시합니다.
 * (추가 redirect URI는 "클라이언트 관리" 섹션에서 등록 후 관리)
 */
const ClientRegisterSection = () => {
  const [clientName, setClientName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const mutation = usePostClient();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCreatedId("");

    if (clientName.trim() === "") {
      setError("클라이언트 이름을 입력해주세요.");
      return;
    }
    if (redirectUri.trim() === "") {
      setError("redirect URI를 입력해주세요.");
      return;
    }

    mutation.mutate(
      { clientName: clientName.trim(), redirectUris: [redirectUri.trim()] },
      {
        onSuccess: ({ clientId }) => {
          setCreatedId(clientId);
          setClientName("");
          setRedirectUri("");
        },
        onError: (err) => setError(resolveApiErrorMessage(err)),
      },
    );
  };

  return (
    <section>
      <Text size="3">새 클라이언트 등록</Text>
      <Spacing size={16} />
      <form onSubmit={handleSubmit}>
        <TextFieldLayout
          id="client-name"
          label="클라이언트 이름"
          placeholder="예: ECONO SPA"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <Spacing size={16} />
        <TextFieldLayout
          id="register-redirect-uri"
          label="redirect URI"
          placeholder="https://app.econo.com/callback"
          value={redirectUri}
          onChange={(e) => setRedirectUri(e.target.value)}
          helperText={error || undefined}
          helperTextColor="error"
        />
        <Spacing size={16} />
        <DefaultButton
          type="submit"
          fullWidth
          disabled={mutation.isPending}
          title={mutation.isPending ? "등록 중..." : "클라이언트 등록"}
        />
      </form>
      {createdId && (
        <>
          <Spacing size={16} />
          <div className="rounded-lg border border-input-border-gray bg-input-bg-gray p-4">
            <Text size="7" color="gray1">
              발급된 clientId
            </Text>
            <Spacing size={4} />
            <Text size="6" color="info">
              {createdId}
            </Text>
          </div>
        </>
      )}
    </section>
  );
};

export default ClientRegisterSection;
